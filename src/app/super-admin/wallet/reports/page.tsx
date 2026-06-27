"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Wallet, TrendingUp, Users, BarChart2, RefreshCw } from "lucide-react";

const reports = [
  { title: "Credit Issuance Report", icon: Wallet, desc: "Total credits issued by source, period, and user segment", color: "blue" },
  { title: "Wallet Balance Report", icon: TrendingUp, desc: "Current wallet balance distribution across all users", color: "emerald" },
  { title: "Credit Expiry Report", icon: RefreshCw, desc: "Credits expiring in the next 30/60/90 days", color: "amber" },
  { title: "Top Earners Report", icon: Users, desc: "Top users by credits earned in a given period", color: "purple" },
  { title: "Credit Source Report", icon: BarChart2, desc: "Credits earned by source (bill upload, lab, membership, etc.)", color: "cyan" },
];

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-50 border-blue-200",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  cyan: "text-cyan-700 bg-cyan-50 border-cyan-200",
};

export default function WalletReportsPage() {
  return (
    <div className="min-h-screen">
      <TopHeader title="Wallet Reports" subtitle="Generate and export wallet analytics reports" role="super-admin" />
      <div className="p-4 sm:p-6 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="glass-card p-5 flex flex-col sm:flex-row items-start gap-4">
                <div className={`p-2.5 rounded-lg border ${colorMap[r.color]}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 mb-0.5">{r.title}</div>
                  <div className="text-xs text-slate-500">{r.desc}</div>
                </div>
                <ExportMenu reportName={r.title} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
