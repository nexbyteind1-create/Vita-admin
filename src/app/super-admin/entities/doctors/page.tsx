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
import { doctors } from "@/lib/mock-data/entities";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { Doctor } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Stethoscope, CheckCircle, XCircle, Eye, Star } from "lucide-react";

const columns: Column<Doctor>[] = [
  { key: "name", header: "Doctor", sortable: true, render: d => (
    <div><div className="text-sm font-semibold text-slate-900">{d.name}</div><div className="text-xs text-slate-500">{d.licenseNumber}</div></div>
  )},
  { key: "specialty", header: "Specialty", render: d => <span className="text-slate-500 text-sm">{d.specialty}</span> },
  { key: "hospital", header: "Hospital", render: d => <span className="text-slate-500 text-sm">{d.hospital}</span> },
  { key: "totalAppointments", header: "Appointments", align: "right", render: d => <span className="font-semibold">{formatNumber(d.totalAppointments)}</span> },
  { key: "rating", header: "Rating", align: "center", render: d => <span className="text-amber-600 font-semibold">⭐ {d.rating}</span> },
  { key: "verificationStatus", header: "Verification", render: d => <Badge variant={d.verificationStatus as "verified" | "pending" | "rejected"} label={d.verificationStatus} /> },
  { key: "status", header: "Status", render: d => <Badge variant={d.status} /> },
];

export default function EntityDoctorsPage() {
  const [query, setQuery] = useState("");
  const [doctorList, setDoctorList] = useState<Doctor[]>(doctors);
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [actionModal, setActionModal] = useState<{ action: string; entity: Doctor } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    licenseNumber: "",
    specialty: "",
    hospital: "",
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.licenseNumber || !newDoctor.specialty) return;

    const newDoc: Doctor = {
      id: `d-${Date.now()}`,
      name: newDoctor.name,
      licenseNumber: newDoctor.licenseNumber,
      specialty: newDoctor.specialty,
      hospital: newDoctor.hospital || "Apollo Hospitals",
      status: "active",
      totalAppointments: 0,
      rating: 5.0,
      verificationStatus: "verified",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setDoctorList(prev => [newDoc, ...prev]);
    setCreateModal(false);
    setNewDoctor({ name: "", licenseNumber: "", specialty: "", hospital: "" });
  };

  const filtered = doctorList.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(query.toLowerCase()) ||
    d.specialty.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Doctor Management"
        subtitle="Verify, suspend, and manage all doctors"
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Doctors Report" />
            <Button onClick={() => setCreateModal(true)}>Add Doctor</Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Doctors" value={doctorList.length} icon={<Stethoscope className="w-full h-full" />} color="blue" />
          <StatCard label="Verified" value={doctorList.filter(d => d.verificationStatus === "verified").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Pending Verification" value={doctorList.filter(d => d.verificationStatus === "pending").length} icon={<Eye className="w-full h-full" />} color="amber" />
          <StatCard label="Suspended" value={doctorList.filter(d => d.status === "suspended").length} icon={<XCircle className="w-full h-full" />} color="red" />
        </div>
        <SearchInput placeholder="Search by name, license, or specialty..." onSearch={setQuery} className="max-w-lg" />
        <DataTable
          columns={[...columns, { key: "id", header: "Actions", render: d => (
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(d)}>View</Button>
              <Button size="xs" variant={d.status === "active" ? "warning" : "success"} onClick={() => setActionModal({ action: d.status === "active" ? "suspend" : "activate", entity: d })}>
                {d.status === "active" ? "Suspend" : "Activate"}
              </Button>
            </div>
          )}]}
          data={filtered}
          pageSize={8}
        />
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.specialty} size="md">
          {selected && (
            <div className="space-y-3">
              {[["License", selected.licenseNumber], ["Hospital", selected.hospital], ["Appointments", formatNumber(selected.totalAppointments)], ["Rating", `⭐ ${selected.rating}`], ["Verification", selected.verificationStatus], ["Status", selected.status], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900">{v}</span></div>
              ))}
            </div>
          )}
        </Modal>
        <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={`Confirm: ${actionModal?.action}`} size="sm">
          <p className="text-slate-600 text-sm mb-4">Are you sure you want to <strong>{actionModal?.action}</strong> <strong>{actionModal?.entity.name}</strong>? {actionModal?.action === "suspend" && "Blocked doctors will not be available for appointment booking."}</p>
          <div className="flex gap-2">
            <Button variant={actionModal?.action === "suspend" ? "danger" : "success"} className="flex-1" onClick={() => setActionModal(null)}>Confirm</Button>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          </div>
        </Modal>

        {/* Add Doctor Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add New Doctor" subtitle="Register a new doctor on the system" size="md">
          <form onSubmit={handleCreateDoctor} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Doctor Name</label>
              <input value={newDoctor.name} onChange={e => setNewDoctor(d => ({ ...d, name: e.target.value }))} className="vita-input" placeholder="Dr. Arun Mehta" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">License Number</label>
              <input value={newDoctor.licenseNumber} onChange={e => setNewDoctor(d => ({ ...d, licenseNumber: e.target.value }))} className="vita-input" placeholder="LIC-TG-2026-9481" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Specialty</label>
                <input value={newDoctor.specialty} onChange={e => setNewDoctor(d => ({ ...d, specialty: e.target.value }))} className="vita-input" placeholder="Cardiology" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Hospital Partner</label>
                <input value={newDoctor.hospital} onChange={e => setNewDoctor(d => ({ ...d, hospital: e.target.value }))} className="vita-input" placeholder="Apollo Hospitals" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button type="submit" className="flex-1">Add Doctor</Button>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
