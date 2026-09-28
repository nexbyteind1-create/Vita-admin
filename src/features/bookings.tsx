"use client";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, CheckCircle, Clock, Eye, FileUp, FileText, IndianRupee, XCircle } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, openFile, useLoad } from "@/lib/data/hooks";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

/**
 * Every booking made in the app — doctor consults, lab tests and scans.
 * Status and payment changes go through admin_update_appointment() (app users
 * can't update appointments directly); documents go to the
 * appointment-documents bucket under the patient's folder, which is where
 * the app reads them from.
 */

type BookingType = "consult" | "lab" | "diagnostic";
type Status = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  user_id: string;
  booking_code: string;
  booking_type: BookingType;
  title: string;
  provider_name: string | null;
  location_text: string | null;
  status: Status;
  scheduled_at: string;
  fee: number | null;
  payment_status: "unpaid" | "paid";
  payment_method: "vita" | "hospital" | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  collection_type: "home" | "centre" | null;
  collection_address: string | null;
  slot_id: string | null;
  centre_slot_id: string | null;
  created_at: string;
  patient: { relation: string; display_name: string | null } | null;
  doctor: { full_name: string } | null;
  test: { name: string } | null;
  centre: { name: string } | null;
  documents: { id: string; kind: string; name: string | null; path: string; created_at: string }[];
}

interface Account {
  id: string;
  full_name: string | null;
  phone: string | null;
}

const SELECT = `
  id, user_id, booking_code, booking_type, title, provider_name, location_text, status, scheduled_at,
  fee, payment_status, payment_method, paid_at, cancelled_at, cancel_reason,
  collection_type, collection_address, slot_id, centre_slot_id, created_at,
  patient:family_members(relation, display_name),
  doctor:doctors(full_name),
  test:tests(name),
  centre:test_centres(name),
  documents:appointment_documents(id, kind, name, path, created_at)
`;

const TYPE_LABEL: Record<BookingType, string> = { consult: "Consult", lab: "Lab test", diagnostic: "Scan" };
const DOC_KINDS = [
  { value: "prescription", label: "Prescription" },
  { value: "visit_summary", label: "Visit summary" },
  { value: "report", label: "Report" },
];
const DOC_LABEL: Record<string, string> = { upload: "Uploaded by patient", prescription: "Prescription", visit_summary: "Visit summary", report: "Report" };

/** `upcoming` rows in the past read as due for completion, as in the app. */
const effectiveStatus = (b: Booking): Status | "due" =>
  b.status === "upcoming" && new Date(b.scheduled_at).getTime() < Date.now() ? "due" : b.status;

function StatusPill({ booking }: { booking: Booking }) {
  const s = effectiveStatus(booking);
  const map = {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    due: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const label = { upcoming: "Upcoming", due: "Awaiting completion", completed: "Completed", cancelled: "Cancelled" };
  return <span className={cn("inline-flex px-2.5 py-1 text-xs font-medium border rounded-full", map[s])}>{label[s]}</span>;
}

function PaymentPill({ booking }: { booking: Booking }) {
  if (booking.fee == null) return <span className="text-xs text-slate-400">No fee</span>;
  return booking.payment_status === "paid" ? (
    <span className="text-xs font-medium text-emerald-600">Paid · {booking.payment_method === "vita" ? "Vita" : "Hospital"}</span>
  ) : (
    <span className="text-xs font-medium text-amber-600">Unpaid</span>
  );
}

const patientLabel = (b: Booking, accounts: Map<string, Account>) => {
  const account = accounts.get(b.user_id);
  if (b.patient) return `${b.patient.display_name || b.patient.relation} (${b.patient.relation})`;
  return `${account?.full_name || "Account holder"} (Self)`;
};

function DetailModal({
  booking,
  account,
  onClose,
  onChanged,
}: {
  booking: Booking;
  account: Account | undefined;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [fee, setFee] = useState(booking.fee == null ? "" : String(booking.fee));
  const [docKind, setDocKind] = useState(booking.booking_type === "consult" ? "prescription" : "report");
  const fileInput = useRef<HTMLInputElement>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError("");
    try {
      await fn();
      onChanged();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  };

  const update = (args: Record<string, unknown>) =>
    run(Object.keys(args).join(","), async () => {
      const { error } = await supabase().rpc("admin_update_appointment", { p_appointment_id: booking.id, ...args });
      if (error) throw new Error(error.message);
    });

  const upload = (file: File) =>
    run("upload", async () => {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";
      const path = `${booking.user_id}/${booking.id}/${docKind}-${Date.now()}.${ext}`;
      const up = await supabase().storage.from("appointment-documents").upload(path, file, { contentType: file.type || "application/pdf" });
      if (up.error) throw new Error(up.error.message);
      const { error } = await supabase().from("appointment_documents").insert({
        appointment_id: booking.id,
        user_id: booking.user_id,
        kind: docKind,
        path,
        name: file.name,
        size: file.size,
        mime_type: file.type || null,
      });
      if (error) {
        await supabase().storage.from("appointment-documents").remove([path]);
        throw new Error(error.message);
      }
      await audit("upload", "appointment_documents", booking.id, { kind: docKind, name: file.name });
    });

  const removeDoc = (doc: Booking["documents"][number]) =>
    run(`doc-${doc.id}`, async () => {
      if (!confirm(`Remove ${doc.name ?? "this document"}? The patient will no longer see it.`)) return;
      const { error } = await supabase().from("appointment_documents").delete().eq("id", doc.id);
      if (error) throw new Error(error.message);
      await supabase().storage.from("appointment-documents").remove([doc.path]);
      await audit("delete", "appointment_documents", doc.id);
    });

  const rows: [string, React.ReactNode][] = [
    ["Booking ID", booking.booking_code],
    ["Type", TYPE_LABEL[booking.booking_type]],
    ["With", booking.doctor?.full_name ?? booking.test?.name ?? booking.title],
    ["Where", booking.centre?.name ?? booking.provider_name ?? "—"],
    ["When", formatDateTime(booking.scheduled_at)],
    ["Patient", patientLabel(booking, new Map(account ? [[account.id, account]] : []))],
    ["Account", `${account?.full_name ?? "—"} · ${account?.phone ?? "no phone"}`],
    ...(booking.collection_type
      ? ([["Collection", booking.collection_type === "home" ? `Home — ${booking.collection_address ?? ""}` : "At the centre"]] as [string, React.ReactNode][])
      : []),
    ["Status", <StatusPill key="s" booking={booking} />],
    ["Payment", <PaymentPill key="p" booking={booking} />],
    ...(booking.cancel_reason ? ([["Cancel reason", booking.cancel_reason]] as [string, React.ReactNode][]) : []),
  ];

  const open = booking.status !== "cancelled";

  return (
    <Modal open onClose={onClose} title={booking.title} subtitle={booking.booking_code} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-200 text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-900 text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {open && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Status</h3>
              <div className="flex flex-wrap gap-2">
                {booking.status !== "completed" && (
                  <Button size="sm" variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />} loading={busy === "p_status"} onClick={() => update({ p_status: "completed" })}>
                    Mark completed
                  </Button>
                )}
                {booking.status === "completed" && (
                  <Button size="sm" variant="secondary" loading={busy === "p_status"} onClick={() => update({ p_status: "upcoming" })}>
                    Reopen as upcoming
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <input className="vita-input text-sm" placeholder="Cancel reason (shown to the patient)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
                <Button
                  size="sm"
                  variant="danger"
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  loading={busy === "p_status,p_cancel_reason"}
                  onClick={() => confirm("Cancel this booking and free its slot?") && update({ p_status: "cancelled", p_cancel_reason: cancelReason })}
                >
                  Cancel
                </Button>
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">Payment</h3>
            <div className="flex flex-wrap gap-2 items-center">
              {booking.payment_status !== "paid" ? (
                <>
                  <Button size="sm" variant="success" loading={busy === "p_payment_status,p_payment_method"} onClick={() => update({ p_payment_status: "paid", p_payment_method: "hospital" })}>
                    Paid at hospital / lab
                  </Button>
                  <Button size="sm" variant="success" loading={busy === "p_payment_status,p_payment_method"} onClick={() => update({ p_payment_status: "paid", p_payment_method: "vita" })}>
                    Paid via Vita
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="warning" loading={busy === "p_payment_status"} onClick={() => update({ p_payment_status: "unpaid" })}>
                  Mark unpaid
                </Button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-500">Fee ₹</span>
              <input type="number" min={0} className="vita-input w-32 text-sm" value={fee} onChange={e => setFee(e.target.value)} />
              <Button size="sm" variant="secondary" disabled={fee === "" || Number(fee) === booking.fee} loading={busy === "p_fee"} onClick={() => update({ p_fee: Number(fee) })}>
                Save fee
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase">Documents</h3>
            {booking.documents.length === 0 && <p className="text-sm text-slate-400">None yet.</p>}
            {booking.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{doc.name ?? "Document"}</div>
                    <div className="text-xs text-slate-400">{DOC_LABEL[doc.kind] ?? doc.kind}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => openFile("appointment-documents", doc.path).catch(e => setError(errorText(e)))}>
                    Open
                  </Button>
                  <Button size="xs" variant="danger" loading={busy === `doc-${doc.id}`} onClick={() => removeDoc(doc)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex gap-2 items-center pt-1">
              <select className="vita-input text-sm w-44" value={docKind} onChange={e => setDocKind(e.target.value)}>
                {DOC_KINDS.map(k => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
              <Button size="sm" icon={<FileUp className="w-3.5 h-3.5" />} loading={busy === "upload"} onClick={() => fileInput.current?.click()}>
                Upload
              </Button>
            </div>
            <p className="text-xs text-slate-400">Prescriptions and reports appear on the patient’s booking and power “View report / prescriptions”.</p>
          </section>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}

export default function BookingsPage() {
  const params = useSearchParams();
  const { portal: role, doctorId, centreId } = usePortal();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<BookingType | "all">("all");
  const [status, setStatus] = useState<Status | "due" | "all">("all");
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const slotFilter = params.get("slot");

  const { data, error, loading, reload } = useLoad(async () => {
    // RLS already limits partners to their bookings; this also drops any the
    // account made as an app patient itself.
    let q = supabase().from("appointments").select(SELECT);
    if (role === "hospital") q = q.not("doctor_id", "is", null);
    if (role === "doctor") q = q.eq("doctor_id", doctorId!);
    if (role === "centre") q = q.eq("centre_id", centreId!);
    const res = await q.order("scheduled_at", { ascending: false }).limit(1000);
    if (res.error) throw new Error(res.error.message);
    const bookings = res.data as unknown as Booking[];
    const ids = [...new Set(bookings.map(b => b.user_id))];
    const accounts = new Map<string, Account>();
    if (ids.length) {
      const users = await supabase().from("users").select("id, full_name, phone").in("id", ids);
      if (users.error) throw new Error(users.error.message);
      for (const u of users.data as Account[]) accounts.set(u.id, u);
    }
    return { bookings, accounts };
  }, [role, doctorId, centreId]);

  const bookings = useMemo(() => data?.bookings ?? [], [data]);
  const accounts = useMemo(() => data?.accounts ?? new Map<string, Account>(), [data]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return bookings.filter(b => {
      if (slotFilter && b.centre_slot_id !== slotFilter && b.slot_id !== slotFilter) return false;
      if (type !== "all" && b.booking_type !== type) return false;
      if (status !== "all" && effectiveStatus(b) !== status) return false;
      if (!term) return true;
      const account = accounts.get(b.user_id);
      return [b.booking_code, b.title, b.provider_name, b.doctor?.full_name, b.test?.name, account?.full_name, account?.phone, b.patient?.display_name]
        .some(v => v?.toLowerCase().includes(term));
    });
  }, [bookings, accounts, query, type, status, slotFilter]);

  const open = bookings.find(b => b.id === openId) ?? null;

  const columns: Column<Booking>[] = [
    {
      key: "booking_code",
      header: "Booking",
      render: b => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{b.doctor?.full_name ?? b.test?.name ?? b.title}</div>
          <div className="text-xs text-slate-500">
            {b.booking_code} · {TYPE_LABEL[b.booking_type]}
            {b.collection_type === "home" ? " · Home collection" : ""}
          </div>
        </div>
      ),
    },
    { key: "scheduled_at", header: "When", sortable: true, render: b => <span className="text-sm">{formatDateTime(b.scheduled_at)}</span> },
    { key: "patient", header: "Patient", render: b => <span className="text-sm text-slate-600">{patientLabel(b, accounts)}</span> },
    { key: "provider_name", header: "Where", render: b => <span className="text-sm text-slate-500">{b.centre?.name ?? b.provider_name ?? "—"}</span> },
    { key: "fee", header: "Fee", align: "right", render: b => (b.fee != null ? <div className="text-right"><div className="font-semibold">{formatCurrency(b.fee)}</div><PaymentPill booking={b} /></div> : "—") },
    { key: "status", header: "Status", render: b => <StatusPill booking={b} /> },
    {
      key: "documents",
      header: "Docs",
      align: "center",
      render: b => <span className="text-sm text-slate-500">{b.documents.length || "—"}</span>,
    },
    {
      key: "__open",
      header: "",
      render: b => (
        <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setOpenId(b.id)}>
          Manage
        </Button>
      ),
    },
  ];

  const count = (s: ReturnType<typeof effectiveStatus>) => bookings.filter(b => effectiveStatus(b) === s).length;
  const selectClass = "vita-input w-auto text-sm py-2";

  return (
    <div className="min-h-screen">
      <TopHeader title="Bookings" subtitle="Doctor consults, lab tests and scans booked in the app" role={role} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Upcoming" value={count("upcoming")} icon={<CalendarCheck className="w-full h-full" />} color="blue" onClick={() => setStatus("upcoming")} />
          <StatCard label="Awaiting completion" value={count("due")} icon={<Clock className="w-full h-full" />} color="amber" onClick={() => setStatus("due")} subValue="Past, still marked upcoming" />
          <StatCard label="Completed" value={count("completed")} icon={<CheckCircle className="w-full h-full" />} color="emerald" onClick={() => setStatus("completed")} />
          <StatCard
            label="Unpaid (not cancelled)"
            value={bookings.filter(b => b.fee != null && b.payment_status === "unpaid" && b.status !== "cancelled").length}
            icon={<IndianRupee className="w-full h-full" />}
            color="red"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput placeholder="Search booking ID, patient, phone, doctor or test…" onSearch={setQuery} className="max-w-md flex-1" />
          <select className={selectClass} value={type} onChange={e => setType(e.target.value as BookingType | "all")}>
            <option value="all">All types</option>
            <option value="consult">Consults</option>
            <option value="lab">Lab tests</option>
            <option value="diagnostic">Scans</option>
          </select>
          <select className={selectClass} value={status} onChange={e => setStatus(e.target.value as Status | "due" | "all")}>
            <option value="all">Any status</option>
            <option value="upcoming">Upcoming</option>
            <option value="due">Awaiting completion</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {slotFilter && <span className="text-xs text-slate-500">Filtered to one slot</span>}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage={loading ? "Loading…" : "No bookings match."} pageSize={15} />
      </div>

      {open && (
        <DetailModal
          key={`${open.id}:${open.status}:${open.payment_status}:${open.fee}:${open.documents.length}`}
          booking={open}
          account={accounts.get(open.user_id)}
          onClose={() => setOpenId(null)}
          onChanged={reload}
        />
      )}
    </div>
  );
}
