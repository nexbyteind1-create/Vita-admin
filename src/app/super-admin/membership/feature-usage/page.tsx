"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { FilterBar } from "@/components/ui/FilterBar";
import { featureUsageData } from "@/lib/mock-data/membership";
import { BarChartComponent } from "@/components/charts/BarChart";
import { Activity, ShieldCheck } from "lucide-react";

export default function MembershipFeatureUsagePage() {
  const silverColor = "#94a3b8";
  const goldColor = "#f59e0b";
  const platinumColor = "#8b5cf6";

  const usageRates = featureUsageData.map(f => ({
    label: f.feature.replace(" Utilized", "").replace(" Appointments", " Apts"),
    value: Math.round((f.gold.used / f.gold.total) * 100),
  }));

  return (
    <div className="min-h-screen">
      <TopHeader title="Feature Usage Analytics" subtitle="Remaining and utilized benefits per membership tier" role="super-admin" actions={<ExportMenu reportName="Feature Usage Report" />} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <FilterBar filters={[
          { key: "tier", label: "All Tiers", value: "", options: [{ label: "Silver", value: "silver" }, { label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }] },
        ]} />

        {/* Detailed Feature Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Avg Benefits Per Member (as of this month)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Based on active member benefit consumption</p>
          </div>
          <div className="overflow-x-auto">
            <table className="vita-table w-full">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="text-center" style={{ color: silverColor }}>Silver — Used / Total</th>
                  <th className="text-center" style={{ color: goldColor }}>Gold — Used / Total</th>
                  <th className="text-center" style={{ color: platinumColor }}>Platinum — Used / Total</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {featureUsageData.map(f => {
                  const goldPct = Math.round((f.gold.used / f.gold.total) * 100);
                  return (
                    <tr key={f.feature}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="font-medium text-slate-900">{f.feature}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-900 font-semibold">{f.silver.used}</span>
                          <span className="text-slate-500">/ {f.silver.total}</span>
                        </div>
                        <div className="vita-progress mt-1.5 w-20 mx-auto">
                          <div className="vita-progress-fill" style={{ width: `${(f.silver.used / f.silver.total) * 100}%`, background: silverColor }} />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-900 font-semibold">{f.gold.used}</span>
                          <span className="text-slate-500">/ {f.gold.total}</span>
                        </div>
                        <div className="vita-progress mt-1.5 w-20 mx-auto">
                          <div className="vita-progress-fill" style={{ width: `${(f.gold.used / f.gold.total) * 100}%`, background: goldColor }} />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-900 font-semibold">{f.platinum.used}</span>
                          <span className="text-slate-500">/ {f.platinum.total}</span>
                        </div>
                        <div className="vita-progress mt-1.5 w-20 mx-auto">
                          <div className="vita-progress-fill" style={{ width: `${Math.min((f.platinum.used / f.platinum.total) * 100, 100)}%`, background: platinumColor }} />
                        </div>
                      </td>
                      <td>
                        <span className={`text-sm font-bold ${goldPct >= 70 ? "text-emerald-700" : goldPct >= 40 ? "text-amber-700" : "text-red-700"}`}>{goldPct}%</span>
                        <div className="text-xs text-slate-500">Gold utilization</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card p-6">
          <BarChartComponent data={usageRates} title="Feature Utilization Rate by Gold Members (%)" color="#f59e0b" formatValue={v => `${v}%`} />
        </div>
      </div>
    </div>
  );
}
