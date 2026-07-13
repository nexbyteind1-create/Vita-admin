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
import { BulkUploadModal, type BulkUploadColumn } from "@/components/ui/BulkUploadModal";
import { medicalStores } from "@/lib/mock-data/entities";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils/format";
import type { MedicalStore } from "@/lib/types/entity";
import type { Column } from "@/components/ui/DataTable";
import { Store, CheckCircle, Eye, Upload } from "lucide-react";

const bulkUploadColumns: BulkUploadColumn[] = [
  { key: "name", header: "Store Name", required: true, example: "MedLife Pharmacy" },
  { key: "licenseNumber", header: "License Number", required: true, example: "DL-TG-2026-8421" },
  { key: "city", header: "City", example: "Hyderabad" },
  { key: "state", header: "State", example: "Telangana" },
];

function parseMedicalStoreRow(raw: Record<string, string>, rowIndex: number): { data: MedicalStore } | { error: string } {
  const name = raw.name?.trim();
  const licenseNumber = raw.licenseNumber?.trim();
  if (!name) return { error: "Store Name is required." };
  if (!licenseNumber) return { error: "License Number is required." };

  return {
    data: {
      id: `ms-${Date.now()}-${rowIndex}`,
      name,
      licenseNumber,
      city: raw.city?.trim() || "Hyderabad",
      state: raw.state?.trim() || "Telangana",
      status: "active",
      totalBillsUploaded: 0,
      totalBillingAmount: 0,
      approvalStatus: "approved",
      createdAt: new Date().toISOString().split("T")[0],
    },
  };
}

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
  const [storeList, setStoreList] = useState<MedicalStore[]>(medicalStores);
  const [selected, setSelected] = useState<MedicalStore | null>(null);
  const [bulkModal, setBulkModal] = useState(false);
  const filtered = storeList.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.city.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen">
      <TopHeader title="Medical Store Management" subtitle="Approve and manage all medical stores" role="super-admin" actions={
        <div className="flex items-center gap-2">
          <ExportMenu reportName="Medical Stores Report" />
          <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => setBulkModal(true)}>Bulk Upload</Button>
        </div>
      } />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Stores" value={storeList.length} icon={<Store className="w-full h-full" />} color="blue" />
          <StatCard label="Active" value={storeList.filter(m => m.status === "active").length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Bills" value={storeList.reduce((s, m) => s + m.totalBillsUploaded, 0)} icon={<Store className="w-full h-full" />} color="purple" />
          <StatCard label="Total Billing" value={formatCurrency(storeList.reduce((s, m) => s + m.totalBillingAmount, 0))} icon={<Store className="w-full h-full" />} color="amber" />
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

        <BulkUploadModal<MedicalStore>
          open={bulkModal}
          onClose={() => setBulkModal(false)}
          title="Bulk Upload Medical Stores"
          subtitle="Register multiple medical stores at once via Excel"
          templateColumns={bulkUploadColumns}
          templateFileName="medical-stores-template.xlsx"
          parseRow={parseMedicalStoreRow}
          onConfirm={rows => setStoreList(prev => [...rows, ...prev])}
        />
      </div>
    </div>
  );
}
