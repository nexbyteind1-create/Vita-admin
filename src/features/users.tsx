"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Eye, UserCheck, Users } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, useLoad } from "@/lib/data/hooks";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

/** App accounts (public.users) with their family, membership and booking history. */

interface AppUser {
  id: string;
  phone: string | null;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  default_address: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  relation: string;
  display_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
}

interface Membership {
  user_id: string;
  plan_name: string;
  saved_this_month: number;
  is_active: boolean;
}

interface Visit {
  id: string;
  user_id: string;
  booking_code: string;
  title: string;
  provider_name: string | null;
  scheduled_at: string;
  status: string;
  fee: number | null;
  payment_status: string;
}

const age = (dob: string | null) => {
  if (!dob) return null;
  const d = new Date(dob);
  const n = new Date();
  return n.getFullYear() - d.getFullYear() - (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
};

function UserModal({
  user,
  family,
  membership,
  visits,
  onClose,
  onChanged,
}: {
  user: AppUser;
  family: Member[];
  membership: Membership | undefined;
  visits: Visit[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const { base } = usePortal();
  const [form, setForm] = useState({ full_name: user.full_name ?? "", gender: user.gender ?? "", date_of_birth: user.date_of_birth ?? "" });
  const [plan, setPlan] = useState({ plan_name: membership?.plan_name ?? "Vita Plus", saved_this_month: membership?.saved_this_month ?? 0, is_active: membership?.is_active ?? false });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

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

  const saveProfile = () =>
    run("profile", async () => {
      const payload = { full_name: form.full_name.trim() || null, gender: form.gender || null, date_of_birth: form.date_of_birth || null };
      const { error } = await supabase().from("users").update(payload).eq("id", user.id);
      if (error) throw new Error(error.message);
      await audit("update", "users", user.id, payload);
    });

  const setActive = (active: boolean) =>
    run("active", async () => {
      const { error } = await supabase().from("users").update({ is_active: active }).eq("id", user.id);
      if (error) throw new Error(error.message);
      await audit(active ? "activate" : "deactivate", "users", user.id);
    });

  const saveMembership = () =>
    run("membership", async () => {
      const { error } = await supabase()
        .from("memberships")
        .upsert({ user_id: user.id, plan_name: plan.plan_name, saved_this_month: plan.saved_this_month, is_active: plan.is_active }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      await audit("update", "memberships", user.id, plan);
    });

  const label = "text-xs font-semibold text-slate-400 uppercase mb-2 block";

  return (
    <Modal open onClose={onClose} title={user.full_name || user.phone || "User"} subtitle={`${user.phone ?? "No phone"} · joined ${formatDate(user.created_at)}`} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Profile</h3>
          <div>
            <label className={label}>Full name</label>
            <input className="vita-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Gender</label>
              <select className="vita-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={label}>Date of birth</label>
              <input type="date" className="vita-input" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            </div>
          </div>
          <Button size="sm" loading={busy === "profile"} onClick={saveProfile}>
            Save profile
          </Button>
          <ToggleSwitch enabled={user.is_active} onChange={setActive} label="Account active" description="Inactive accounts are flagged for support" />

          <h3 className="text-sm font-bold text-slate-900 pt-3">Membership</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Plan</label>
              <input className="vita-input" value={plan.plan_name} onChange={e => setPlan(p => ({ ...p, plan_name: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Saved this month (₹)</label>
              <input type="number" min={0} className="vita-input" value={plan.saved_this_month} onChange={e => setPlan(p => ({ ...p, saved_this_month: Number(e.target.value) }))} />
            </div>
          </div>
          <ToggleSwitch enabled={plan.is_active} onChange={v => setPlan(p => ({ ...p, is_active: v }))} label="Membership active" description="Active members get member prices and the Vita Plus banner" />
          <Button size="sm" loading={busy === "membership"} onClick={saveMembership}>
            Save membership
          </Button>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Family members ({family.length})</h3>
            {family.length === 0 && <p className="text-sm text-slate-400">None added.</p>}
            {family.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-slate-200">
                {m.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100" />
                )}
                <div className="text-sm">
                  <div className="font-medium">
                    {m.display_name || m.relation} <span className="text-slate-400">· {m.relation}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {[m.gender, age(m.date_of_birth) != null ? `${age(m.date_of_birth)} yrs` : null, m.phone, m.email].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Bookings ({visits.length})</h3>
            {visits.slice(0, 8).map(v => (
              <Link key={v.id} href={`${base}/bookings?id=${v.id}`} className="flex justify-between py-2 border-b border-slate-200 text-sm hover:bg-slate-50">
                <span>
                  {v.title} <span className="text-slate-400">· {v.provider_name}</span>
                </span>
                <span className="text-slate-500">{formatDateTime(v.scheduled_at)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      {error && <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
    </Modal>
  );
}

export default function UsersPage() {
  const role = usePortal().portal;
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, loading, error, reload } = useLoad(async () => {
    const [users, family, memberships, visits] = await Promise.all([
      supabase().from("users").select("id, phone, full_name, gender, date_of_birth, default_address, is_active, last_login_at, created_at").order("created_at", { ascending: false }),
      supabase().from("family_members").select("id, user_id, relation, display_name, gender, date_of_birth, phone, email, photo_url").order("sort_order"),
      supabase().from("memberships").select("user_id, plan_name, saved_this_month, is_active"),
      supabase().from("appointments").select("id, user_id, booking_code, title, provider_name, scheduled_at, status, fee, payment_status").order("scheduled_at", { ascending: false }),
    ]);
    for (const r of [users, family, memberships, visits]) if (r.error) throw new Error(r.error.message);
    return {
      users: users.data as AppUser[],
      family: family.data as Member[],
      memberships: memberships.data as Membership[],
      visits: visits.data as Visit[],
    };
  });

  const users = useMemo(() => data?.users ?? [], [data]);
  const byUser = <T extends { user_id: string }>(rows: T[] | undefined, id: string) => (rows ?? []).filter(r => r.user_id === id);
  const membershipOf = (id: string) => data?.memberships.find(m => m.user_id === id);

  const filtered = users.filter(u => {
    const term = query.trim().toLowerCase();
    return !term || [u.full_name, u.phone].some(v => v?.toLowerCase().includes(term));
  });

  const columns: Column<AppUser>[] = [
    {
      key: "full_name",
      header: "User",
      sortable: true,
      render: u => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{u.full_name || "—"}</div>
          <div className="text-xs text-slate-500">{u.phone ?? "—"}</div>
        </div>
      ),
    },
    { key: "family", header: "Family", align: "center", render: u => byUser(data?.family, u.id).length },
    {
      key: "visits",
      header: "Bookings",
      align: "center",
      render: u => byUser(data?.visits, u.id).length,
    },
    {
      key: "spend",
      header: "Paid",
      align: "right",
      render: u =>
        formatCurrency(
          byUser(data?.visits, u.id)
            .filter(v => v.payment_status === "paid")
            .reduce((s, v) => s + (v.fee ?? 0), 0),
        ),
    },
    {
      key: "membership",
      header: "Membership",
      render: u => {
        const m = membershipOf(u.id);
        return m?.is_active ? <Badge variant="gold" label={m.plan_name} /> : <span className="text-xs text-slate-400">—</span>;
      },
    },
    { key: "last_login_at", header: "Last login", render: u => (u.last_login_at ? formatDate(u.last_login_at) : "—") },
    { key: "is_active", header: "Status", render: u => <Badge variant={u.is_active ? "active" : "inactive"} /> },
    {
      key: "__open",
      header: "",
      render: u => (
        <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setOpenId(u.id)}>
          Manage
        </Button>
      ),
    },
  ];

  const open = users.find(u => u.id === openId);

  return (
    <div className="min-h-screen">
      <TopHeader title="Users" subtitle="App accounts, their family, membership and bookings" role={role} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Accounts" value={users.length} icon={<Users className="w-full h-full" />} color="blue" />
          <StatCard label="Family members" value={data?.family.length ?? 0} icon={<UserCheck className="w-full h-full" />} color="emerald" />
          <StatCard label="Active members" value={data?.memberships.filter(m => m.is_active).length ?? 0} icon={<Crown className="w-full h-full" />} color="amber" />
        </div>
        <SearchInput placeholder="Search name or phone…" onSearch={setQuery} className="max-w-lg" />
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage={loading ? "Loading…" : "No users yet."} pageSize={15} />
      </div>
      {open && (
        <UserModal
          key={open.id}
          user={open}
          family={byUser(data?.family, open.id)}
          membership={membershipOf(open.id)}
          visits={byUser(data?.visits, open.id)}
          onClose={() => setOpenId(null)}
          onChanged={reload}
        />
      )}
    </div>
  );
}
