"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { membershipAuditLogs, membershipAnalytics } from "@/lib/mock-data/membership";
import { membershipGrowthData } from "@/lib/mock-data/dashboard";
import { AreaChartComponent } from "@/components/charts/AreaChart";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { ShieldCheck, TrendingUp, RefreshCw, Target, Users, XCircle } from "lucide-react";

export default function AdminMembershipDashboard() {
  const totalActive = membershipAnalytics.reduce((s, a) => s + a.activeMembers, 0);
  const totalRenewals = membershipAnalytics.reduce((s, a) => s + a.renewals, 0);
  const totalRevenue = membershipAnalytics.reduce((s, a) => s + a.revenue, 0);
  const totalExpired = membershipAnalytics.reduce((s, a) => s + a.expiredMembers, 0);

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Dashboard" subtitle="Membership performance and analytics" role="admin" actions={<ExportMenu reportName="Membership Dashboard" />} />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <FilterBar filters={[
          { key: "tier", label: "All Tiers", value: "", options: [{ label: "Silver", value: "silver" }, { label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }] },
        ]} />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Active Memberships" value={totalActive} icon={<ShieldCheck className="w-full h-full" />} color="blue" delta={6.8} />
          <StatCard label="Silver Members" value={membershipAnalytics[0].activeMembers} icon={<ShieldCheck className="w-full h-full" />} color="silver" />
          <StatCard label="Gold Members" value={membershipAnalytics[1].activeMembers} icon={<ShieldCheck className="w-full h-full" />} color="amber" />
          <StatCard label="Platinum Members" value={membershipAnalytics[2].activeMembers} icon={<ShieldCheck className="w-full h-full" />} color="purple" />
          <StatCard label="Membership Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp className="w-full h-full" />} color="emerald" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Renewals" value={totalRenewals} icon={<RefreshCw className="w-full h-full" />} color="blue" />
          <StatCard label="Expired Members" value={totalExpired} icon={<XCircle className="w-full h-full" />} color="red" />
          <StatCard label="Avg Renewal Rate" value={formatPercent(membershipAnalytics.reduce((s, a) => s + a.renewalRate, 0) / 3)} icon={<Target className="w-full h-full" />} color="emerald" />
          <StatCard label="Avg Conversion" value={formatPercent(membershipAnalytics.reduce((s, a) => s + a.conversionRate, 0) / 3)} icon={<Users className="w-full h-full" />} color="cyan" />
        </div>

        <div className="glass-card p-6">
          <AreaChartComponent data={membershipGrowthData} title="Monthly Membership Growth" valueLabel="Total Members" value2Label="Active Members" color="#f59e0b" color2="#10b981" />
        </div>

        <section>
          <h2 className="text-base font-bold text-white mb-4">Recent Changes</h2>
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
