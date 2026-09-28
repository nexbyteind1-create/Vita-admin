"use client";
import { useMemo, useState } from "react";
import { Eye, FileText, IndianRupee, Receipt, Trash2 } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, openFile, useLoad } from "@/lib/data/hooks";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

/** Bills patients upload against a visit (Upload Bill in the app). Files live in the private `bills` bucket. */

interface Bill {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string | null;
  bill_date: string;
  created_at: string;
  appointment: { title: string; provider_name: string | null; scheduled_at: string } | null;
  member: { relation: string; display_name: string | null } | null;
  files: { id: string; path: string; name: string | null; mime_type: string | null; size: number | null }[];
}

const CATEGORY_LABEL: Record<string, string> = {
  consultation: "Hospital Consultation",
  lab_test: "Lab Test",
  diagnostics: "Diagnostics",
  pharmacy: "Pharmacy",
};

const CREDIT_RATE = 0.05;

export default function BillsPage() {
  const role = usePortal().portal;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Bill | null>(null);
  const [error, setError] = useState("");

  const { data, loading, error: loadError, reload } = useLoad(async () => {
    const res = await supabase()
      .from("bills")
      .select(
        "id, user_id, category, amount, description, bill_date, created_at, appointment:appointments(title, provider_name, scheduled_at), member:family_members(relation, display_name), files:bill_files(id, path, name, mime_type, size)",
      )
      .order("created_at", { ascending: false });
    if (res.error) throw new Error(res.error.message);
    const bills = res.data as unknown as Bill[];
    const ids = [...new Set(bills.map(b => b.user_id))];
    const users = ids.length ? await supabase().from("users").select("id, full_name, phone").in("id", ids) : { data: [], error: null };
    if (users.error) throw new Error(users.error.message);
    return { bills, users: new Map((users.data as { id: string; full_name: string | null; phone: string | null }[]).map(u => [u.id, u])) };
  });

  const bills = useMemo(() => data?.bills ?? [], [data]);
  const users = data?.users;
  const filtered = bills.filter(b => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    const u = users?.get(b.user_id);
    return [b.appointment?.provider_name, b.appointment?.title, CATEGORY_LABEL[b.category], u?.full_name, u?.phone, b.description].some(v => v?.toLowerCase().includes(term));
  });

  const remove = async (bill: Bill) => {
    if (!confirm("Delete this bill and its files? The patient loses the credits shown for it.")) return;
    setError("");
    try {
      const { error } = await supabase().from("bills").delete().eq("id", bill.id);
      if (error) throw new Error(error.message);
      if (bill.files.length) await supabase().storage.from("bills").remove(bill.files.map(f => f.path));
      await audit("delete", "bills", bill.id);
      setOpen(null);
      reload();
    } catch (e) {
      setError(errorText(e));
    }
  };

  const columns: Column<Bill>[] = [
    {
      key: "appointment",
      header: "Visit",
      render: b => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{b.appointment?.provider_name ?? "—"}</div>
          <div className="text-xs text-slate-500">{b.appointment?.title ?? ""}</div>
        </div>
      ),
    },
    {
      key: "user_id",
      header: "Uploaded by",
      render: b => {
        const u = users?.get(b.user_id);
        return (
          <div className="text-sm">
            <div>{u?.full_name ?? "—"}</div>
            <div className="text-xs text-slate-400">For {b.member ? b.member.display_name || b.member.relation : "Self"}</div>
          </div>
        );
      },
    },
    { key: "category", header: "Category", render: b => CATEGORY_LABEL[b.category] ?? b.category },
    { key: "amount", header: "Amount", align: "right", sortable: true, render: b => <span className="font-semibold">{formatCurrency(Number(b.amount))}</span> },
    { key: "bill_date", header: "Bill date", sortable: true, render: b => formatDate(b.bill_date) },
    { key: "files", header: "Files", align: "center", render: b => b.files.length },
    {
      key: "__actions",
      header: "",
      render: b => (
        <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setOpen(b)}>
          View
        </Button>
      ),
    },
  ];

  const total = bills.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div className="min-h-screen">
      <TopHeader title="Uploaded bills" subtitle="Bills patients upload for their visits; each earns 5% as Vita Credits" role={role} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Bills" value={bills.length} icon={<Receipt className="w-full h-full" />} color="blue" />
          <StatCard label="Total billed" value={formatCurrency(total)} icon={<IndianRupee className="w-full h-full" />} color="emerald" />
          <StatCard label="Credits earned" value={Math.floor(total * CREDIT_RATE).toLocaleString("en-IN")} icon={<FileText className="w-full h-full" />} color="amber" />
        </div>
        <SearchInput placeholder="Search hospital, patient or phone…" onSearch={setQuery} className="max-w-lg" />
        {(loadError || error) && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{loadError || error}</p>}
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage={loading ? "Loading…" : "No bills uploaded yet."} pageSize={15} />
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.appointment?.provider_name ?? "Bill"} subtitle={open ? `${CATEGORY_LABEL[open.category] ?? open.category} · ${formatCurrency(Number(open.amount))}` : ""} size="lg">
        {open && (
          <div className="space-y-4">
            {[
              ["Bill date", formatDate(open.bill_date)],
              ["Uploaded", formatDate(open.created_at)],
              ["Description", open.description ?? "—"],
              ["Credits", `${Math.floor(Number(open.amount) * CREDIT_RATE)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm">
                <span className="text-slate-500">{l}</span>
                <span className="font-medium text-slate-900">{v}</span>
              </div>
            ))}
            <div className="space-y-2">
              {open.files.map(f => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200">
                  <span className="text-sm truncate">{f.name ?? f.path.split("/").pop()}</span>
                  <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => openFile("bills", f.path).catch(e => setError(errorText(e)))}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => remove(open)}>
              Delete bill
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
