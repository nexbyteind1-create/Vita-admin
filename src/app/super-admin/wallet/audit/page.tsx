"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { walletAuditLogs } from "@/lib/mock-data/wallet";
import { useState } from "react";

export default function WalletAuditPage() {
  const [query, setQuery] = useState("");
  const filtered = walletAuditLogs.filter(l =>
    l.action.toLowerCase().includes(query.toLowerCase()) ||
    l.modifiedBy.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="Wallet Audit Log" subtitle="Complete history of all wallet configuration changes" role="super-admin" actions={<ExportMenu reportName="Wallet Audit Log" />} />
      <div className="p-6 space-y-4 max-w-[1200px]">
        <SearchInput placeholder="Search audit log..." onSearch={setQuery} className="max-w-md" />
        <div className="glass-card px-6">
          {filtered.map(log => (
            <AuditLogRow key={log.id} id={log.id} action={log.action} previousStatus={log.previousValue} updatedStatus={log.updatedValue} modifiedBy={log.modifiedBy} modifiedAt={log.modifiedAt} remarks={log.remarks} />
          ))}
        </div>
      </div>
    </div>
  );
}
