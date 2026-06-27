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
import { medicalStores } from "@/lib/mock-data/entities";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils/format";
import type { MedicalStore } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Store, CheckCircle, Eye } from "lucide-react";

const columns: Column<MedicalStore>[] = [
  { key: "name", header: "Medical Store", sortable: true, render: m => <div><div className="text-sm font-semibold text-slate-900">{m.name}</div><div className="text-xs text-slate-500">{m.licenseNumber}</div></div> },
  { key: "city", header: "Location", render: m => <span className="text-slate-500 text-sm">{m.city}, {m.state}</span> },
  { key: "totalBillsUploaded", header: "Bills Uploaded", align: "right", render: m => <span className="font-semibold">{formatNumber(m.totalBillsUploaded)}</span> },
  { key: "totalBillingAmount", header: "Billing Amount", align: "right", render: m => <span className="font-semibold text-emerald-600">{formatCurrency(m.totalBillingAmount)}</span> },
  { key: "approvalStatus", header: "Approval", render: m => <Badge variant={m.approvalStatus as "approved" | "pending" | "rejected"} label={m.approvalStatus} /> },
  { key: "status", header: "Status", render: m => <Badge variant={m.status} /> },
];

export default function EntityMedicalStoresPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MedicalStore | null>(null);
  const filtered = medicalStores.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.city.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen">
      <TopHeader title="Medical Store Management" subtitle="Approve and manage all medical stores" role="super-admin" actions={<ExportMenu reportName="Medical Stores Report" />} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Stores" value={medicalStores.length} icon={<Store className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={medicalStores.filter(m => m.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Bills" value={medicalStores.reduce((s, m) => s + m.totalBillsUploaded, 0)} icon={<Store className="w-full h-full" />} color="purple" />
          <StatCard label="Total Billing" value={formatCurrency(medicalStores.reduce((s, m) => s + m.totalBillingAmount, 0))} icon={<Store className="w-full h-full" />} color="amber" />
        </div>
        <SearchInput placeholder="Search medical stores..." onSearch={setQuery} className="max-w-lg" />
        <DataTable
          columns={[...columns, { key: "id", header: "Actions", render: m => (
            <div className="flex gap-1.5">
              <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(m)}>View</Button>
              <Button size="xs" variant={m.status === "active" ? "warning" : "success"}>{m.status === "active" ? "Suspend" : "Activate"}</Button>
            </div>
          )}]}
          data={filtered} pageSize={8}
        />
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} subtitle={selected?.licenseNumber} size="md">
          {selected && <div className="space-y-3">
            {[["Location", `${selected.city}, ${selected.state}`], ["Bills Uploaded", formatNumber(selected.totalBillsUploaded)], ["Total Billing", formatCurrency(selected.totalBillingAmount)], ["Status", selected.status], ["Registered", formatDate(selected.createdAt)]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900">{v}</span></div>
            ))}
          </div>}
        </Modal>
      </div>
    </div>
  );
}
