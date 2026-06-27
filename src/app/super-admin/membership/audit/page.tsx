"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { membershipAuditLogs } from "@/lib/mock-data/membership";
import { useState } from "react";

export default function MembershipAuditPage() {
  const [query, setQuery] = useState("");
  const filtered = membershipAuditLogs.filter(l =>
    l.planName.toLowerCase().includes(query.toLowerCase()) ||
    l.action.toLowerCase().includes(query.toLowerCase()) ||
    l.modifiedBy.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Audit Log" subtitle="Complete history of all membership configuration changes" role="super-admin" actions={<ExportMenu reportName="Membership Audit Log" />} />
      <div className="p-4 sm:p-6 space-y-4 max-w-[1200px]">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search by action, plan, or modified by..." onSearch={setQuery} className="max-w-md flex-1" />
          <FilterBar />
        </div>
        <div className="glass-card px-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No audit entries match your search.</div>
          ) : (
            filtered.map(log => (
              <AuditLogRow
                key={log.id}
                id={log.id}
                action={log.action}
                entity={`${log.planName} (v${log.version})`}
                modifiedBy={log.modifiedBy}
                modifiedAt={log.modifiedAt}
                remarks={log.remarks}
              />
            ))
          )}
        </div>
        <p className="text-xs text-slate-400 text-center">Showing {filtered.length} entries · Audit logs are retained for 5 years</p>
      </div>
    </div>
  );
}
