"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { BarChartComponent } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { walletAnalytics, topCreditEarners } from "@/lib/mock-data/wallet";
import { formatCompact, formatNumber } from "@/lib/utils/format";
import { Wallet, TrendingUp, Users, BarChart2 } from "lucide-react";

const creditSourceData = [
  { label: "Bill Uploads", value: 42 },
  { label: "Lab Bills", value: 18 },
  { label: "Diagnostic Bills", value: 15 },
  { label: "Memberships", value: 14 },
  { label: "Referrals", value: 11 },
];

const creditSourceDonut = [
  { name: "Bill Uploads", value: 42, color: "#2563eb" },
  { name: "Lab Bills", value: 18, color: "#10b981" },
  { name: "Diagnostic Bills", value: 15, color: "#8b5cf6" },
  { name: "Memberships", value: 14, color: "#f59e0b" },
  { name: "Referrals", value: 11, color: "#06b6d4" },
];

export default function WalletAnalyticsPage() {
  const a = walletAnalytics;
  return (
    <div className="min-h-screen">
      <TopHeader title="Wallet Analytics" subtitle="Credits issued, earned, redeemed and expired" role="super-admin" actions={<ExportMenu reportName="Wallet Analytics" />} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Credits Issued" value={formatCompact(a.totalCreditsIssued)} icon={<Wallet className="w-full h-full" />} color="blue" delta={12.4} />
          <StatCard label="Total Credits Earned" value={formatCompact(a.totalCreditsEarned)} icon={<TrendingUp className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Credits Expired" value={formatCompact(a.totalCreditsExpired)} icon={<Wallet className="w-full h-full" />} color="red" />
          <StatCard label="Wallet Users" value={formatCompact(a.totalWalletUsers)} icon={<Users className="w-full h-full" />} color="purple" delta={8.1} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Avg Credits / User" value={formatNumber(a.averageCreditsPerUser)} icon={<BarChart2 className="w-full h-full" />} color="cyan" />
          <StatCard label="Credits Redeemed" value="₹0 (Phase 2)" icon={<Wallet className="w-full h-full" />} color="silver" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <BarChartComponent data={creditSourceData} title="Credit Distribution by Source (%)" color="#2563eb" formatValue={v => `${v}%`} />
          </div>
          <div className="glass-card p-6">
            <DonutChart data={creditSourceDonut} title="Credit Source Distribution" formatValue={v => `${v}%`} />
          </div>
        </div>

        {/* Top Earners */}
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-4">Top 5 Credit Earners</h2>
          <div className="glass-card overflow-hidden overflow-x-auto">
            <table className="vita-table w-full">
              <thead><tr><th>Rank</th><th>User</th><th>UHID</th><th>Plan</th><th className="text-right">Total Credits</th></tr></thead>
              <tbody>
                {topCreditEarners.map(e => (
                  <tr key={e.rank}>
                    <td><div className="w-7 h-7 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">{e.rank}</div></td>
                    <td className="font-medium text-slate-900">{e.name}</td>
                    <td className="text-slate-500">{e.uhid}</td>
                    <td><span className={`text-xs font-semibold ${e.plan === "Platinum" ? "text-purple-700" : e.plan === "Gold" ? "text-amber-700" : "text-slate-500"}`}>{e.plan}</span></td>
                    <td className="text-right font-bold text-emerald-700">{formatNumber(e.totalCredits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
