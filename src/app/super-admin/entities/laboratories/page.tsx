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
import { laboratories } from "@/lib/mock-data/entities";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { Laboratory } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { FlaskConical, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";

const columns: Column<Laboratory>[] = [
  { key: "name", header: "Laboratory", sortable: true, render: l => <div><div className="text-sm font-semibold text-slate-200">{l.name}</div><div className="text-xs text-slate-500">{l.licenseNumber}</div></div> },
  { key: "city", header: "Location", render: l => <span className="text-slate-400 text-sm">{l.city}, {l.state}</span> },
  { key: "totalBookings", header: "Bookings", align: "right", render: l => <span className="font-semibold">{formatNumber(l.totalBookings)}</span> },
  { key: "pendingReports", header: "Pending", align: "center", render: l => <span className={`font-semibold ${l.pendingReports > 100 ? "text-red-400" : "text-amber-400"}`}>{l.pendingReports}</span> },
  { key: "approvalStatus", header: "Approval", render: l => <Badge variant={l.approvalStatus as "approved" | "pending" | "rejected"} label={l.approvalStatus} /> },
  { key: "status", header: "Status", render: l => <Badge variant={l.status} /> },
];

export default function EntityLaboratoriesPage() {
  const [query, setQuery] = useState("");
  const [labList, setLabList] = useState<Laboratory[]>(laboratories);
  const [selected, setSelected] = useState<Laboratory | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newLab, setNewLab] = useState({
    name: "",
    licenseNumber: "",
    city: "",
    state: "",
  });

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLab.name || !newLab.licenseNumber) return;

    const nLab: Laboratory = {
      id: `l-${Date.now()}`,
      name: newLab.name,
      licenseNumber: newLab.licenseNumber,
      city: newLab.city || "Hyderabad",
      state: newLab.state || "Telangana",
      status: "active",
      totalBookings: 0,
      pendingReports: 0,
      approvalStatus: "approved",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setLabList(prev => [nLab, ...prev]);
    setCreateModal(false);
    setNewLab({ name: "", licenseNumber: "", city: "", state: "" });
  };

  const filtered = labList.filter(l =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.licenseNumber.toLowerCase().includes(query.toLowerCase()) ||
    l.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Laboratory Management"
        subtitle="Approve, suspend and manage all laboratories"
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Laboratories Report" />
            <Button onClick={() => setCreateModal(true)}>Add Lab</Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Labs" value={labList.length} icon={<FlaskConical className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={labList.filter(l => l.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Bookings" value={labList.reduce((s, l) => s + l.totalBookings, 0)} icon={<FlaskConical className="w-full h-full" />} color="purple" />
          <StatCard label="Pending Reports" value={labList.reduce((s, l) => s + l.pendingReports, 0)} icon={<AlertCircle className="w-full h-full" />} color="red" />
        </div>
        <SearchInput placeholder="Search laboratories..." onSearch={setQuery} className="max-w-lg" />
        <DataTable
          columns={[...columns, { key: "id", header: "Actions", render: l => (
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(l)}>View</Button>
              <Button size="xs" variant={l.status === "active" ? "warning" : "success"}>{l.status === "active" ? "Suspend" : "Activate"}</Button>
            </div>
          )}]}
          data={filtered}
          pageSize={8}
        />
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.licenseNumber} size="md">
          {selected && <div className="space-y-3">
            {[["Location", `${selected.city}, ${selected.state}`], ["Total Bookings", formatNumber(selected.totalBookings)], ["Pending Reports", selected.pendingReports], ["Status", selected.status], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-[#1f2d45] text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-200">{String(v)}</span></div>
            ))}
          </div>}
        </Modal>

        {/* Add Lab Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add New Laboratory" subtitle="Register a new pathology laboratory" size="md">
          <form onSubmit={handleCreateLab} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Lab Name</label>
              <input value={newLab.name} onChange={e => setNewLab(l => ({ ...l, name: e.target.value }))} className="vita-input" placeholder="SRL Diagnostics" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">License Number</label>
              <input value={newLab.licenseNumber} onChange={e => setNewLab(l => ({ ...l, licenseNumber: e.target.value }))} className="vita-input" placeholder="LAB-TG-2026-8421" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">City</label>
                <input value={newLab.city} onChange={e => setNewLab(l => ({ ...l, city: e.target.value }))} className="vita-input" placeholder="Hyderabad" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">State</label>
                <input value={newLab.state} onChange={e => setNewLab(l => ({ ...l, state: e.target.value }))} className="vita-input" placeholder="Telangana" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-[#1f2d45]">
              <Button type="submit" className="flex-1">Add Laboratory</Button>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
