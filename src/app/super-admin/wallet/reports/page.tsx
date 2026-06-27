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
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

export default function WalletReportsPage() {
  return (
    <div className="min-h-screen">
      <TopHeader title="Wallet Reports" subtitle="Generate and export wallet analytics reports" role="super-admin" />
      <div className="p-6 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="glass-card p-5 flex items-start gap-4">
                <div className={`p-2.5 rounded-lg border ${colorMap[r.color]}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 mb-0.5">{r.title}</div>
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
