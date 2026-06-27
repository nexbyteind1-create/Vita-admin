"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { users } from "@/lib/mock-data/entities";
import { entityAuditLogs } from "@/lib/mock-data/entities";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils/format";
import type { User } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Users, Activity, UserX, UserCheck, ShieldOff, Wallet, Eye, CheckCircle, Ban, RotateCcw } from "lucide-react";

const columns: Column<User>[] = [
  { key: "name", header: "User", sortable: true, render: u => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600/40 to-blue-900/40 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-500/20">
        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-200">{u.name}</div>
        <div className="text-xs text-slate-500">{u.uhid}</div>
      </div>
    </div>
  )},
  { key: "mobile", header: "Mobile", render: u => <span className="text-slate-400 text-sm">{u.mobile}</span> },
  { key: "city", header: "City", render: u => <span className="text-slate-400 text-sm">{u.city}, {u.state}</span> },
  { key: "membershipTier", header: "Membership", render: u => u.membershipTier ? <Badge variant={u.membershipTier.toLowerCase() as "gold" | "silver" | "platinum"} label={u.membershipTier} dot={false} /> : <span className="text-slate-600 text-xs">None</span> },
  { key: "totalSpend", header: "Total Spend", align: "right", render: u => <span className="font-semibold text-slate-200">{formatCurrency(u.totalSpend)}</span> },
  { key: "status", header: "Status", render: u => <Badge variant={u.status} /> },
];

export default function EntityUsersPage() {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{ action: string; user: User } | null>(null);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.uhid.toLowerCase().includes(query.toLowerCase()) ||
    u.mobile.includes(query) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="User Management" subtitle="View, manage and moderate all platform users" role="super-admin"
        actions={<ExportMenu reportName="Users Report" />}
      />
      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={users.length} icon={<Users className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={users.filter(u => u.status === "active").length} icon={<Activity className="w-full h-full" />} color="emerald" />
          <StatCard label="Suspended" value={users.filter(u => u.status === "suspended").length} icon={<UserX className="w-full h-full" />} color="amber" />
          <StatCard label="Blocked" value={users.filter(u => u.status === "blocked").length} icon={<ShieldOff className="w-full h-full" />} color="red" />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search by name, UHID, mobile, or email..." onSearch={setQuery} className="flex-1 max-w-lg" />
          <FilterBar filters={[
            { key: "status", label: "All Statuses", value: "", options: [{ label: "Active", value: "active" }, { label: "Suspended", value: "suspended" }, { label: "Blocked", value: "blocked" }] },
            { key: "membership", label: "All Plans", value: "", options: [{ label: "Silver", value: "silver" }, { label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }] },
          ]} />
        </div>

        <DataTable
          columns={[...columns, {
            key: "id", header: "Actions", render: u => (
              <div className="flex items-center gap-1.5">
                <Button size="xs" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedUser(u)}>View</Button>
                <Button size="xs" variant={u.status === "active" ? "warning" : "success"} onClick={() => setActionModal({ action: u.status === "active" ? "suspend" : "activate", user: u })}>
                  {u.status === "active" ? "Suspend" : "Activate"}
                </Button>
                <Button size="xs" variant="danger" onClick={() => setActionModal({ action: u.status === "blocked" ? "unblock" : "block", user: u })}>
                  {u.status === "blocked" ? "Unblock" : "Block"}
                </Button>
              </div>
            )
          }]}
          data={filtered}
          onRowClick={setSelectedUser}
          pageSize={8}
        />

        {/* User Detail Modal */}
        <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title={selectedUser?.name} subtitle={`${selectedUser?.uhid} · ${selectedUser?.email}`} size="lg">
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{formatCurrency(selectedUser.totalSpend)}</div><div className="text-xs text-slate-500 mt-1">Total Spend</div></div>
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{formatNumber(selectedUser.totalAppointments)}</div><div className="text-xs text-slate-500 mt-1">Appointments</div></div>
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-emerald-400">{formatCurrency(selectedUser.walletBalance)}</div><div className="text-xs text-slate-500 mt-1">Wallet Credits</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Mobile", selectedUser.mobile],
                  ["Email", selectedUser.email],
                  ["Age / Gender", `${selectedUser.age} yrs · ${selectedUser.gender}`],
                  ["Location", `${selectedUser.city}, ${selectedUser.state}`],
                  ["Membership", selectedUser.membershipTier ?? "None"],
                  ["Registered", formatDate(selectedUser.createdAt)],
                  ["Last Login", selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "N/A"],
                  ["Status", selectedUser.status],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[#1f2d45]">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-200 text-right">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="warning" icon={<UserX className="w-4 h-4" />}>Suspend</Button>
                <Button size="sm" variant="danger" icon={<Ban className="w-4 h-4" />}>Block</Button>
                <Button size="sm" variant="secondary" icon={<RotateCcw className="w-4 h-4" />}>Reset Account</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Action Confirm Modal */}
        <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={`Confirm: ${actionModal?.action} User`} size="sm">
          <p className="text-slate-300 text-sm mb-4">
            {actionModal?.action === "block" && "Blocking this user will immediately prevent access to the Vita platform."}
            {actionModal?.action === "suspend" && "Suspending this user will prevent them from performing transactions until reactivated."}
            {actionModal?.action === "activate" && "This will reactivate the user and restore their access."}
            {actionModal?.action === "unblock" && "This will remove the block and restore user access."}
          </p>
          <div className="flex gap-2">
            <Button variant={actionModal?.action === "block" || actionModal?.action === "suspend" ? "danger" : "success"} className="flex-1" onClick={() => setActionModal(null)}>
              Confirm {actionModal?.action}
            </Button>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
