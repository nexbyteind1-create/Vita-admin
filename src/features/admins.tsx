"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase/client";
import { audit, useLoad } from "@/lib/data/hooks";
import { ADMIN_COLUMNS, ROLE_LABEL, useSession, type AdminProfile, type AdminRole } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/utils/format";

/**
 * Console accounts (public.admin_users). People request access from the
 * sign-in page; a super admin approves them here, picks their role and, for
 * partners, the hospital, doctor or centre they run.
 */

const ROLES = Object.keys(ROLE_LABEL) as AdminRole[];

/** Which record a partner role is tied to. */
const LINK: Partial<Record<AdminRole, "hospital_id" | "doctor_id" | "centre_id">> = {
  hospital: "hospital_id",
  doctor: "doctor_id",
  lab: "centre_id",
  diagnostic: "centre_id",
};

interface Option {
  id: string;
  name: string;
  kind?: string;
}

function AccessModal({
  row,
  options,
  onClose,
  onSave,
}: {
  row: AdminRow;
  options: { hospital_id: Option[]; doctor_id: Option[]; centre_id: Option[] };
  onClose: () => void;
  onSave: (patch: Partial<AdminProfile>) => Promise<void>;
}) {
  const [role, setRole] = useState<AdminRole>(row.role);
  const [linkId, setLinkId] = useState<string>((LINK[row.role] && row[LINK[row.role]!]) || "");
  const [busy, setBusy] = useState(false);
  const link = LINK[role];
  const choices = !link
    ? []
    : link === "centre_id"
      ? options.centre_id.filter(c => c.kind === "both" || c.kind === role)
      : options[link];

  const save = async () => {
    if (link && !linkId) return alert("Pick what this account runs.");
    setBusy(true);
    await onSave({
      role,
      is_active: true,
      hospital_id: link === "hospital_id" ? linkId : null,
      doctor_id: link === "doctor_id" ? linkId : null,
      centre_id: link === "centre_id" ? linkId : null,
    });
    setBusy(false);
  };

  return (
    <Modal open onClose={onClose} title={`Access for ${row.full_name || row.email}`} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Role</label>
          <select
            className="vita-input"
            value={role}
            onChange={e => {
              setRole(e.target.value as AdminRole);
              setLinkId("");
            }}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        {link && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{ROLE_LABEL[role]}</label>
            <select className="vita-input" value={linkId} onChange={e => setLinkId(e.target.value)}>
              <option value="">Choose…</option>
              {choices.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">They only see bookings, slots and the profile for this {ROLE_LABEL[role].toLowerCase()}.</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" loading={busy} onClick={save}>
            {row.is_active ? "Save" : "Approve"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

type AdminRow = AdminProfile & { id: string; created_at: string };

interface LogRow {
  id: string;
  admin_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  created_at: string;
}

export function AdminsPage() {
  const { admin: me } = useSession();
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState<AdminRow | null>(null);

  const { data, loading, error, reload } = useLoad(async () => {
    const { data, error } = await supabase().from("admin_users").select(`${ADMIN_COLUMNS}, created_at`).order("created_at");
    if (error) throw new Error(error.message);
    return (data as (AdminProfile & { created_at: string })[]).map(a => ({ ...a, id: a.user_id }));
  });

  const { data: options } = useLoad(async () => {
    const [h, d, c] = await Promise.all([
      supabase().from("hospitals").select("id, name").order("name"),
      supabase().from("doctors").select("id, name:full_name").order("full_name"),
      supabase().from("test_centres").select("id, name, kind").order("name"),
    ]);
    for (const res of [h, d, c]) if (res.error) throw new Error(res.error.message);
    return { hospital_id: h.data as Option[], doctor_id: d.data as Option[], centre_id: c.data as Option[] };
  });

  const linkedName = (a: AdminRow) => {
    const link = LINK[a.role];
    if (!link || !options) return null;
    return options[link].find(o => o.id === a[link])?.name ?? "—";
  };

  const change = async (row: AdminRow, patch: Partial<AdminProfile>, action: string) => {
    setBusy(row.id + action);
    const { error } = await supabase()
      .from("admin_users")
      .update({ ...patch, ...(patch.is_active ? { approved_by: me?.user_id } : {}) })
      .eq("user_id", row.user_id);
    setBusy("");
    if (error) return alert(error.message);
    await audit(action, "admin_users", row.user_id, patch);
    reload();
  };

  const remove = async (row: AdminRow) => {
    if (!confirm(`Remove ${row.email} from the console? Their sign-in stays but they lose access.`)) return;
    const { error } = await supabase().from("admin_users").delete().eq("user_id", row.user_id);
    if (error) return alert(error.message);
    await audit("delete", "admin_users", row.user_id);
    reload();
  };

  const rows = data ?? [];
  const columns: Column<AdminRow>[] = [
    {
      key: "email",
      header: "Admin",
      render: a => (
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {a.full_name || "—"} {a.user_id === me?.user_id && <span className="text-xs text-slate-400">(you)</span>}
          </div>
          <div className="text-xs text-slate-500">{a.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: a => (
        <div>
          <Badge variant={a.role === "super_admin" ? "platinum" : a.role === "admin" ? "silver" : "gold"} label={ROLE_LABEL[a.role]} />
          {LINK[a.role] && <div className="text-xs text-slate-500 mt-1">{linkedName(a)}</div>}
        </div>
      ),
    },
    { key: "is_active", header: "Access", render: a => <Badge variant={a.is_active ? "active" : "pending"} label={a.is_active ? "Active" : "Awaiting approval"} /> },
    { key: "created_at", header: "Requested", render: a => formatDate(a.created_at) },
    {
      key: "__actions",
      header: "Actions",
      render: a =>
        a.user_id === me?.user_id ? null : (
          <div className="flex gap-1.5 flex-wrap">
            {a.is_active ? (
              <Button size="xs" variant="warning" loading={busy === a.id + "suspend"} onClick={() => change(a, { is_active: false }, "suspend")}>
                Suspend
              </Button>
            ) : (
              <Button size="xs" variant="success" onClick={() => setEditing(a)}>
                Approve
              </Button>
            )}
            <Button size="xs" variant="ghost" onClick={() => setEditing(a)}>
              Change role
            </Button>
            <Button size="xs" variant="danger" onClick={() => remove(a)}>
              Remove
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="min-h-screen">
      <TopHeader title="Admins" subtitle="Who can sign in to VitaAdmin, and with what role" role="super-admin" />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="glass-card p-4 flex items-start gap-3 text-sm text-slate-600">
          <UserPlus className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p>
            To add someone, ask them to open the sign-in page and choose <strong>Request access</strong>. They appear here as
            “Awaiting approval”. <strong>Super admins</strong> manage everything, including who has access;{" "}
            <strong>admins</strong> run operations. <strong>Hospital</strong>, <strong>doctor</strong>, <strong>lab</strong> and{" "}
            <strong>diagnostic centre</strong> accounts only see their own bookings, slots, reviews and profile.
          </p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable columns={columns} data={rows} loading={loading} emptyMessage="No admins." />
      </div>
      {editing && options && (
        <AccessModal
          row={editing}
          options={options}
          onClose={() => setEditing(null)}
          onSave={async patch => {
            await change(editing, patch, editing.is_active ? "role" : "approve");
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export function AuditLogPage() {
  const { data, loading, error } = useLoad(async () => {
    const { data, error } = await supabase()
      .from("admin_audit_log")
      .select("id, admin_email, action, entity, entity_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data as LogRow[]).map(r => ({ ...r, id: String(r.id) }));
  });

  const columns: Column<LogRow>[] = [
    { key: "created_at", header: "When", render: r => <span className="text-sm">{formatDateTime(r.created_at)}</span> },
    { key: "admin_email", header: "Admin", render: r => <span className="text-sm">{r.admin_email ?? "—"}</span> },
    { key: "action", header: "Action", render: r => <span className="text-sm font-medium capitalize">{r.action.replace(/_/g, " ")}</span> },
    { key: "entity", header: "What", render: r => <code className="text-xs">{r.entity}</code> },
    { key: "entity_id", header: "Record", render: r => <code className="text-xs text-slate-400">{r.entity_id?.slice(0, 8) ?? "—"}</code> },
  ];

  return (
    <div className="min-h-screen">
      <TopHeader title="Audit log" subtitle="Every change made from the console" role="super-admin" />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable columns={columns} data={data ?? []} loading={loading} emptyMessage={loading ? "Loading…" : "Nothing logged yet."} pageSize={25} />
      </div>
    </div>
  );
}

