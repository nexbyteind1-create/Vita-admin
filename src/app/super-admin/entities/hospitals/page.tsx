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
import { hospitals } from "@/lib/mock-data/entities";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { Hospital } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Building2, CheckCircle, XCircle, Pause, Play, Ban, Eye, Users, Stethoscope, Calendar } from "lucide-react";

const columns: Column<Hospital>[] = [
  { key: "name", header: "Hospital", sortable: true, render: h => (
    <div>
      <div className="text-sm font-semibold text-slate-200">{h.name}</div>
      <div className="text-xs text-slate-500">{h.registrationId}</div>
    </div>
  )},
  { key: "city", header: "Location", render: h => <span className="text-slate-400 text-sm">{h.city}, {h.state}</span> },
  { key: "totalDoctors", header: "Doctors", align: "center", render: h => <span className="font-semibold text-slate-200">{h.totalDoctors}</span> },
  { key: "totalAppointments", header: "Appointments", align: "right", render: h => <span className="font-semibold">{formatNumber(h.totalAppointments)}</span> },
  { key: "approvalStatus", header: "Approval", render: h => <Badge variant={h.approvalStatus as "approved" | "pending" | "rejected"} label={h.approvalStatus} /> },
  { key: "status", header: "Status", render: h => <Badge variant={h.status} /> },
];

export default function EntityHospitalsPage() {
  const [query, setQuery] = useState("");
  const [hospitalList, setHospitalList] = useState<Hospital[]>(hospitals);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [actionModal, setActionModal] = useState<{ action: string; entity: Hospital } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: "",
    registrationId: "",
    city: "",
    state: "",
  });

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.name || !newHospital.registrationId) return;

    const newHosp: Hospital = {
      id: `h-${Date.now()}`,
      name: newHospital.name,
      registrationId: newHospital.registrationId,
      city: newHospital.city || "Hyderabad",
      state: newHospital.state || "Telangana",
      status: "active",
      totalDoctors: 0,
      totalPatients: 0,
      totalAppointments: 0,
      approvalStatus: "approved",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setHospitalList(prev => [newHosp, ...prev]);
    setCreateModal(false);
    setNewHospital({ name: "", registrationId: "", city: "", state: "" });
  };

  const filtered = hospitalList.filter(h =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.registrationId.toLowerCase().includes(query.toLowerCase()) ||
    h.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Hospital Management"
        subtitle="Approve, suspend, block and manage all hospital entities"
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Hospitals Report" />
            <Button onClick={() => setCreateModal(true)}>Add Hospital</Button>
          </div>
        }
      />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Hospitals" value={hospitalList.length} icon={<Building2 className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={hospitalList.filter(h => h.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Pending Approval" value={hospitalList.filter(h => h.approvalStatus === "pending").length} icon={<Pause className="w-full h-full" />} color="amber" />
          <StatCard label="Suspended" value={hospitalList.filter(h => h.status === "suspended").length} icon={<XCircle className="w-full h-full" />} color="red" />
        </div>

        <SearchInput placeholder="Search by name, registration ID, or city..." onSearch={setQuery} className="max-w-lg" />

        <DataTable
          columns={[...columns, {
            key: "id", header: "Actions", render: h => (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(h)}>View</Button>
                {h.approvalStatus === "pending" && <>
                  <Button size="xs" variant="success" onClick={() => setActionModal({ action: "approve", entity: h })}>Approve</Button>
                  <Button size="xs" variant="danger" onClick={() => setActionModal({ action: "reject", entity: h })}>Reject</Button>
                </>}
                {h.approvalStatus === "approved" && (
                  <Button size="xs" variant={h.status === "active" ? "warning" : "success"} onClick={() => setActionModal({ action: h.status === "active" ? "suspend" : "activate", entity: h })}>
                    {h.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                )}
              </div>
            )
          }]}
          data={filtered}
          pageSize={8}
        />

        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.registrationId} size="lg">
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{selected.totalDoctors}</div><div className="text-xs text-slate-500 mt-1">Doctors</div></div>
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{formatNumber(selected.totalPatients)}</div><div className="text-xs text-slate-500 mt-1">Patients</div></div>
                <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{formatNumber(selected.totalAppointments)}</div><div className="text-xs text-slate-500 mt-1">Appointments</div></div>
              </div>
              {[["Location", `${selected.city}, ${selected.state}`], ["Status", selected.status], ["Approval", selected.approvalStatus], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-[#1f2d45] text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-200">{v}</span></div>
              ))}
              {selected.status === "active" && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                  ⚠️ Blocking this hospital will automatically disable appointment booking, doctor availability, patient registrations, and hospital login.
                </div>
              )}
            </div>
          )}
        </Modal>

        <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={`Confirm: ${actionModal?.action} Hospital`} size="sm">
          <p className="text-slate-300 text-sm mb-4">
            Are you sure you want to <strong>{actionModal?.action}</strong> <strong>{actionModal?.entity.name}</strong>?
            {actionModal?.action === "block" && " This will prevent appointment booking, doctor availability, and patient registrations."}
          </p>
          <div className="flex gap-2">
            <Button variant={["reject", "block", "suspend"].includes(actionModal?.action ?? "") ? "danger" : "success"} className="flex-1" onClick={() => setActionModal(null)}>
              Confirm {actionModal?.action}
            </Button>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          </div>
        </Modal>

        {/* Add Hospital Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add New Hospital" subtitle="Register a new hospital partner on the network" size="md">
          <form onSubmit={handleCreateHospital} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Hospital Name</label>
              <input value={newHospital.name} onChange={e => setNewHospital(h => ({ ...h, name: e.target.value }))} className="vita-input" placeholder="Apollo Hospitals" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Registration / License ID</label>
              <input value={newHospital.registrationId} onChange={e => setNewHospital(h => ({ ...h, registrationId: e.target.value }))} className="vita-input" placeholder="REG-AP-2026-092" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">City</label>
                <input value={newHospital.city} onChange={e => setNewHospital(h => ({ ...h, city: e.target.value }))} className="vita-input" placeholder="Hyderabad" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">State</label>
                <input value={newHospital.state} onChange={e => setNewHospital(h => ({ ...h, state: e.target.value }))} className="vita-input" placeholder="Telangana" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-[#1f2d45]">
              <Button type="submit" className="flex-1">Register Hospital</Button>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
