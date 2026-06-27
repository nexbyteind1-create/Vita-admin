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
    <div><div className="text-sm font-semibold text-slate-200">{d.name}</div><div className="text-xs text-slate-500">{d.licenseNumber}</div></div>
  )},
  { key: "specialty", header: "Specialty", render: d => <span className="text-slate-400 text-sm">{d.specialty}</span> },
  { key: "hospital", header: "Hospital", render: d => <span className="text-slate-400 text-sm">{d.hospital}</span> },
  { key: "totalAppointments", header: "Appointments", align: "right", render: d => <span className="font-semibold">{formatNumber(d.totalAppointments)}</span> },
  { key: "rating", header: "Rating", align: "center", render: d => <span className="text-amber-400 font-semibold">⭐ {d.rating}</span> },
  { key: "verificationStatus", header: "Verification", render: d => <Badge variant={d.verificationStatus as "verified" | "pending" | "rejected"} label={d.verificationStatus} /> },
  { key: "status", header: "Status", render: d => <Badge variant={d.status} /> },
];

export default function EntityDoctorsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [actionModal, setActionModal] = useState<{ action: string; entity: Doctor } | null>(null);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(query.toLowerCase()) ||
    d.specialty.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="Doctor Management" subtitle="Verify, suspend, and manage all doctors" role="super-admin" actions={<ExportMenu reportName="Doctors Report" />} />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Doctors" value={doctors.length} icon={<Stethoscope className="w-full h-full" />} color="blue" />
          <StatCard label="Verified" value={doctors.filter(d => d.verificationStatus === "verified").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Pending Verification" value={doctors.filter(d => d.verificationStatus === "pending").length} icon={<Eye className="w-full h-full" />} color="amber" />
          <StatCard label="Suspended" value={doctors.filter(d => d.status === "suspended").length} icon={<XCircle className="w-full h-full" />} color="red" />
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
                <div key={l} className="flex justify-between py-2 border-b border-[#1f2d45] text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-200">{v}</span></div>
              ))}
            </div>
          )}
        </Modal>
        <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={`Confirm: ${actionModal?.action}`} size="sm">
          <p className="text-slate-300 text-sm mb-4">Are you sure you want to <strong>{actionModal?.action}</strong> <strong>{actionModal?.entity.name}</strong>? {actionModal?.action === "suspend" && "Blocked doctors will not be available for appointment booking."}</p>
          <div className="flex gap-2">
            <Button variant={actionModal?.action === "suspend" ? "danger" : "success"} className="flex-1" onClick={() => setActionModal(null)}>Confirm</Button>
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
