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
  const [userList, setUserList] = useState<User[]>(users);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{ action: string; user: User } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    mobile: "",
    email: "",
    age: 30,
    gender: "male",
    city: "",
    state: "",
    membershipTier: "",
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.mobile || !newUserData.email) return;

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: newUserData.name,
      uhid: `VITA${Math.floor(100000 + Math.random() * 900000)}`,
      mobile: newUserData.mobile,
      email: newUserData.email,
      age: Number(newUserData.age),
      gender: newUserData.gender as "male" | "female",
      city: newUserData.city || "Hyderabad",
      state: newUserData.state || "Telangana",
      status: "active",
      membershipTier: newUserData.membershipTier || undefined,
      totalSpend: 0,
      totalAppointments: 0,
      walletBalance: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUserList(prev => [newUser, ...prev]);
    setCreateModal(false);
    setNewUserData({ name: "", mobile: "", email: "", age: 30, gender: "male", city: "", state: "", membershipTier: "" });
  };

  const filtered = userList.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.uhid.toLowerCase().includes(query.toLowerCase()) ||
    u.mobile.includes(query) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader
        title="User Management"
        subtitle="View, manage and moderate all platform users"
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Users Report" />
            <Button onClick={() => setCreateModal(true)}>Add User</Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={userList.length} icon={<Users className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={userList.filter(u => u.status === "active").length} icon={<Activity className="w-full h-full" />} color="emerald" />
          <StatCard label="Suspended" value={userList.filter(u => u.status === "suspended").length} icon={<UserX className="w-full h-full" />} color="amber" />
          <StatCard label="Blocked" value={userList.filter(u => u.status === "blocked").length} icon={<ShieldOff className="w-full h-full" />} color="red" />
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

        {/* Add User Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add New User" subtitle="Register a new patient/user on the platform" size="md">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Full Name</label>
              <input value={newUserData.name} onChange={e => setNewUserData(u => ({ ...u, name: e.target.value }))} className="vita-input" placeholder="Lokesh Kumar" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Mobile Number</label>
                <input value={newUserData.mobile} onChange={e => setNewUserData(u => ({ ...u, mobile: e.target.value }))} className="vita-input" placeholder="9876543210" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Email Address</label>
                <input type="email" value={newUserData.email} onChange={e => setNewUserData(u => ({ ...u, email: e.target.value }))} className="vita-input" placeholder="lokesh@email.com" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Age</label>
                <input type="number" value={newUserData.age} onChange={e => setNewUserData(u => ({ ...u, age: Number(e.target.value) }))} className="vita-input" placeholder="30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Gender</label>
                <select value={newUserData.gender} onChange={e => setNewUserData(u => ({ ...u, gender: e.target.value }))} className="vita-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">City</label>
                <input value={newUserData.city} onChange={e => setNewUserData(u => ({ ...u, city: e.target.value }))} className="vita-input" placeholder="Hyderabad" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">State</label>
                <input value={newUserData.state} onChange={e => setNewUserData(u => ({ ...u, state: e.target.value }))} className="vita-input" placeholder="Telangana" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Membership Tier</label>
              <select value={newUserData.membershipTier} onChange={e => setNewUserData(u => ({ ...u, membershipTier: e.target.value }))} className="vita-input">
                <option value="">None</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4 border-t border-[#1f2d45]">
              <Button type="submit" className="flex-1">Create Account</Button>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
