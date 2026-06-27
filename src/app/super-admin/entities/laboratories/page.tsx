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
  const [selected, setSelected] = useState<Laboratory | null>(null);

  const filtered = laboratories.filter(l =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.licenseNumber.toLowerCase().includes(query.toLowerCase()) ||
    l.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="Laboratory Management" subtitle="Approve, suspend and manage all laboratories" role="super-admin" actions={<ExportMenu reportName="Laboratories Report" />} />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Labs" value={laboratories.length} icon={<FlaskConical className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={laboratories.filter(l => l.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Bookings" value={laboratories.reduce((s, l) => s + l.totalBookings, 0)} icon={<FlaskConical className="w-full h-full" />} color="purple" />
          <StatCard label="Pending Reports" value={laboratories.reduce((s, l) => s + l.pendingReports, 0)} icon={<AlertCircle className="w-full h-full" />} color="red" />
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
      </div>
    </div>
  );
}
