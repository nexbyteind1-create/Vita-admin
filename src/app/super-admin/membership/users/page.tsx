"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { userMemberships } from "@/lib/mock-data/membership";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { User, Calendar, TrendingUp, RefreshCw, Shield, ChevronRight } from "lucide-react";

export default function UserMembershipsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<typeof userMemberships[0] | null>(null);

  const filtered = userMemberships.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.uhid.toLowerCase().includes(query.toLowerCase()) ||
    u.mobile.includes(query)
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="User Memberships" subtitle="Search and view individual user membership details" role="super-admin" actions={<ExportMenu reportName="User Memberships" />} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <SearchInput placeholder="Search by UHID, Mobile Number or Name..." onSearch={setQuery} className="max-w-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map(u => (
              <div key={u.userId} onClick={() => setSelected(u)} className={`glass-card p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${selected?.userId === u.userId ? "border-red-500/50 shadow-sm" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.uhid} · {u.mobile}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={u.plan.tier as "gold" | "silver" | "platinum"} label={u.plan.name} dot={false} />
                    <Badge variant={u.status as "active" | "suspended" | "blocked"} size="sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Expires: {formatDate(u.expiryDate)}</span>
                  <span className="text-red-600">v{u.version}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">No users found. Try a different search.</div>
            )}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                    <p className="text-sm text-slate-500">{selected.uhid} · {selected.mobile}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selected.plan.tier as "gold" | "silver" | "platinum"} label={`${selected.plan.name} Plan`} dot={false} />
                    <span className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">v{selected.version}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Purchase Date", value: formatDate(selected.purchaseDate), icon: <Calendar className="w-4 h-4 text-red-600" /> },
                    { label: "Expiry Date", value: formatDate(selected.expiryDate), icon: <Calendar className="w-4 h-4 text-red-600" /> },
                    { label: "Status", value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1), icon: <Shield className="w-4 h-4 text-emerald-600" /> },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center gap-1.5 mb-1">{item.icon}<span className="text-xs text-slate-500">{item.label}</span></div>
                      <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Benefits Utilization</h3>
                <div className="space-y-3">
                  {Object.entries(selected.benefitsAvailable).map(([key, total]) => {
                    const used = selected.benefitsUtilized[key] ?? 0;
                    const pct = total > 0 ? Math.round((used / total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-slate-700">{used} / {total} <span className="text-slate-500">({pct}%)</span></span>
                        </div>
                        <div className="vita-progress">
                          <div className="vita-progress-fill bg-red-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upgrade History */}
              {selected.upgradeHistory.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-600" /> Upgrade History</h3>
                  {selected.upgradeHistory.map((h, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm py-2 border-b border-slate-200 last:border-0">
                      <span className="text-slate-500">{formatDate(h.date)}</span>
                      <span className="text-slate-700">{h.fromPlan} → {h.toPlan}</span>
                      <span className="text-emerald-600 font-semibold">{formatCurrency(h.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Renewal History */}
              {selected.renewalHistory.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-emerald-600" /> Renewal History</h3>
                  {selected.renewalHistory.map((h, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm py-2 border-b border-slate-200 last:border-0">
                      <span className="text-slate-500">{formatDate(h.date)}</span>
                      <span className="text-slate-700">{h.plan}</span>
                      <span className="text-slate-500">Exp: {formatDate(h.expiryDate)}</span>
                      <span className="text-emerald-600 font-semibold">{formatCurrency(h.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center glass-card min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Select a user to view membership details</p>
                <p className="text-slate-400 text-xs mt-1">Search by UHID, mobile number, or name</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
