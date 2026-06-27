"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { membershipAuditLogs } from "@/lib/mock-data/membership";
import { membershipAnalytics } from "@/lib/mock-data/membership";
import { BarChartComponent } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { Users, TrendingUp, RefreshCw, Target, BarChart2, Shield } from "lucide-react";

const TIER_COLORS = { silver: "#94a3b8", gold: "#f59e0b", platinum: "#8b5cf6" };

export default function SuperAdminMembershipAnalytics() {
  const benefitUsageData = [
    { label: "Free Appointments", value: 72 },
    { label: "Follow-up Apts", value: 48 },
    { label: "Lab Discounts", value: 84 },
    { label: "Diagnostic Disc.", value: 64 },
    { label: "AI Assistant", value: 52 },
    { label: "Wallet Credits", value: 76 },
    { label: "Health Checkups", value: 38 },
    { label: "Pharmacy Disc.", value: 58 },
  ];

  const donutData = membershipAnalytics.map(a => ({
    name: a.tier.charAt(0).toUpperCase() + a.tier.slice(1),
    value: a.totalUsers,
    color: TIER_COLORS[a.tier as keyof typeof TIER_COLORS],
  }));

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Analytics" subtitle="Feature usage, adoption & conversion metrics" role="super-admin" actions={<ExportMenu reportName="Membership Analytics" />} />

      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <FilterBar filters={[
          { key: "tier", label: "All Tiers", value: "", options: [{ label: "Silver", value: "silver" }, { label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }] },
          { key: "hospital", label: "All Hospitals", value: "", options: [] },
          { key: "city", label: "All Cities", value: "", options: [] },
        ]} />

        {/* Per-Tier Stats */}
        {membershipAnalytics.map(a => (
          <section key={a.tier}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${a.tier === "gold" ? "text-amber-600" : a.tier === "platinum" ? "text-purple-600" : "text-slate-500"}`}>
              {a.tier.toUpperCase()} TIER
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total Users" value={a.totalUsers} icon={<Users className="w-full h-full" />} color={a.tier === "gold" ? "amber" : a.tier === "platinum" ? "purple" : "silver"} />
              <StatCard label="Active Members" value={a.activeMembers} icon={<Shield className="w-full h-full" />} color="emerald" />
              <StatCard label="Expired Members" value={a.expiredMembers} icon={<Users className="w-full h-full" />} color="red" />
              <StatCard label="Renewals" value={a.renewals} icon={<RefreshCw className="w-full h-full" />} color="blue" />
              <StatCard label="Renewal Rate" value={formatPercent(a.renewalRate)} icon={<Target className="w-full h-full" />} color="cyan" />
            </div>
          </section>
        ))}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <BarChartComponent data={benefitUsageData} title="Feature Adoption Rate (%)" color="#2563eb" formatValue={v => `${v}%`} />
          </div>
          <div className="glass-card p-6">
            <DonutChart data={donutData} title="Members by Tier" formatValue={formatNumber} />
          </div>
        </div>

        {/* Audit Log */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Audit Log</h2>
            <ExportMenu reportName="Membership Audit Log" />
          </div>
          <div className="glass-card px-6">
            {membershipAuditLogs.map(log => (
              <AuditLogRow key={log.id} id={log.id} action={log.action} entity={log.planName} modifiedBy={log.modifiedBy} modifiedAt={log.modifiedAt} remarks={log.remarks} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
