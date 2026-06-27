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
import { diagnosticCenters } from "@/lib/mock-data/entities";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { DiagnosticCenter } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Scan, CheckCircle, AlertCircle, Eye } from "lucide-react";

const columns: Column<DiagnosticCenter>[] = [
  { key: "name", header: "Center", sortable: true, render: d => <div><div className="text-sm font-semibold text-slate-900">{d.name}</div><div className="text-xs text-slate-500">{d.licenseNumber}</div></div> },
  { key: "city", header: "Location", render: d => <span className="text-slate-500 text-sm">{d.city}, {d.state}</span> },
  { key: "totalBookings", header: "Bookings", align: "right", render: d => <span className="font-semibold">{formatNumber(d.totalBookings)}</span> },
  { key: "pendingReports", header: "Pending", align: "center", render: d => <span className={`font-semibold ${d.pendingReports > 40 ? "text-red-600" : "text-amber-600"}`}>{d.pendingReports}</span> },
  { key: "approvalStatus", header: "Approval", render: d => <Badge variant={d.approvalStatus as "approved" | "pending" | "rejected"} label={d.approvalStatus} /> },
  { key: "status", header: "Status", render: d => <Badge variant={d.status} /> },
];

export default function EntityDiagnosticsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DiagnosticCenter | null>(null);
  const filtered = diagnosticCenters.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.city.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen">
      <TopHeader title="Diagnostic Center Management" subtitle="Approve and manage all diagnostic centers" role="super-admin" actions={<ExportMenu reportName="Diagnostics Report" />} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Centers" value={diagnosticCenters.length} icon={<Scan className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={diagnosticCenters.filter(d => d.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Bookings" value={diagnosticCenters.reduce((s, d) => s + d.totalBookings, 0)} icon={<Scan className="w-full h-full" />} color="purple" />
          <StatCard label="Pending Reports" value={diagnosticCenters.reduce((s, d) => s + d.pendingReports, 0)} icon={<AlertCircle className="w-full h-full" />} color="red" />
        </div>
        <SearchInput placeholder="Search diagnostic centers..." onSearch={setQuery} className="max-w-lg" />
        <DataTable
          columns={[...columns, { key: "id", header: "Actions", render: d => (
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(d)}>View</Button>
              <Button size="xs" variant={d.status === "active" ? "warning" : "success"}>{d.status === "active" ? "Suspend" : "Activate"}</Button>
            </div>
          )}]}
          data={filtered} pageSize={8}
        />
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.licenseNumber} size="md">
          {selected && <div className="space-y-3">
            {[["Location", `${selected.city}, ${selected.state}`], ["Total Bookings", formatNumber(selected.totalBookings)], ["Pending Reports", selected.pendingReports], ["Status", selected.status], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900">{String(v)}</span></div>
            ))}
          </div>}
        </Modal>
      </div>
    </div>
  );
}
