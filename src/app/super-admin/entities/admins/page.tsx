"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { admins } from "@/lib/mock-data/entities";
import { formatDate } from "@/lib/utils/format";
import type { Admin } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { UserCog, Plus, Eye, Key, Shield } from "lucide-react";

const columns: Column<Admin>[] = [
  { key: "name", header: "Admin", sortable: true, render: a => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 border border-purple-200">
        {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>
      <div><div className="text-sm font-semibold text-slate-900">{a.name}</div><div className="text-xs text-slate-500">{a.email}</div></div>
    </div>
  )},
  { key: "role", header: "Role", render: a => <Badge variant={a.role === "super_admin" ? "platinum" : "gold"} label={a.role === "super_admin" ? "Super Admin" : "Admin"} dot={false} /> },
  { key: "permissions", header: "Permissions", render: a => <span className="text-slate-500 text-xs">{a.permissions.length} assigned</span> },
  { key: "status", header: "Status", render: a => <Badge variant={a.status} /> },
  { key: "lastLogin", header: "Last Login", render: a => <span className="text-slate-500 text-sm">{a.lastLogin ? formatDate(a.lastLogin) : "Never"}</span> },
];

const allPermissions = ["view_users", "manage_users", "view_hospitals", "manage_hospitals", "view_memberships", "manage_memberships", "manage_reports", "manage_wallet", "manage_admins"];

export default function EntityAdminsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Admin | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const filtered = admins.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen">
      <TopHeader title="Admin Management" subtitle="Create, manage and assign roles to admin users" role="super-admin"
        actions={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModal(true)}>Create Admin</Button>}
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Admins" value={admins.length} icon={<UserCog className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={admins.filter(a => a.status === "active").length} icon={<Shield className="w-full h-full" />} color="emerald" />
          <StatCard label="Suspended" value={admins.filter(a => a.status === "suspended").length} icon={<UserCog className="w-full h-full" />} color="amber" />
          <StatCard label="Super Admins" value={admins.filter(a => a.role === "super_admin").length} icon={<Shield className="w-full h-full" />} color="purple" />
        </div>
        <SearchInput placeholder="Search admins by name or email..." onSearch={setQuery} className="max-w-lg" />
        <DataTable
          columns={[...columns, { key: "id", header: "Actions", render: a => (
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(a)}>View</Button>
              <Button size="xs" variant="outline" icon={<Key className="w-3 h-3" />}>Reset PW</Button>
              <Button size="xs" variant={a.status === "active" ? "warning" : "success"}>{a.status === "active" ? "Suspend" : "Activate"}</Button>
            </div>
          )}]}
          data={filtered} pageSize={8}
        />
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.email} size="md">
          {selected && <div className="space-y-4">
            <div className="flex items-center gap-2"><Badge variant={selected.role === "super_admin" ? "platinum" : "gold"} label={selected.role} dot={false} /><Badge variant={selected.status} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned Permissions</p>
              <div className="flex flex-wrap gap-2">
                {selected.permissions.map(p => <span key={p} className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-1">{p.replace(/_/g, " ")}</span>)}
              </div>
            </div>
            {[["Assigned By", selected.assignedBy], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900">{v}</span></div>
            ))}
          </div>}
        </Modal>
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Admin" subtitle="Assign role and permissions for the new admin" size="md">
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Full Name</label><input className="vita-input" placeholder="Admin name" /></div>
            <div><label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Email Address</label><input type="email" className="vita-input" placeholder="admin@vita.health" /></div>
            <div><label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Role</label>
              <select className="vita-input"><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select>
            </div>
            <div><label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allPermissions.map(p => <label key={p} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer"><input type="checkbox" className="accent-red-600" />{p.replace(/_/g, " ")}</label>)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-slate-200 mt-4">
            <Button className="flex-1" icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModal(false)}>Create Admin</Button>
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
