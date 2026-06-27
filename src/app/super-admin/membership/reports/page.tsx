"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { FileText, BarChart2, Users, RefreshCw, XCircle, TrendingUp, Download, Check } from "lucide-react";

const reports = [
  { id: "revenue", title: "Membership Revenue Report", icon: TrendingUp, desc: "Total revenue by plan, period, and geography", color: "emerald" },
  { id: "growth", title: "Membership Growth Report", icon: BarChart2, desc: "New member acquisition and churn trends", color: "blue" },
  { id: "feature", title: "Feature Utilization Report", icon: Check, desc: "Usage rates for each membership benefit", color: "purple" },
  { id: "version", title: "Version History Report", icon: RefreshCw, desc: "All plan version changes with diffs", color: "cyan" },
  { id: "active-expired", title: "Active vs Expired Report", icon: Users, desc: "Membership status distribution over time", color: "amber" },
  { id: "comparison", title: "Plan Comparison Report", icon: BarChart2, desc: "Side-by-side feature and performance comparison", color: "blue" },
  { id: "renewal", title: "Renewal Report", icon: RefreshCw, desc: "Renewal rates, timing, and revenue impact", color: "emerald" },
  { id: "cancellation", title: "Cancellation Report", icon: XCircle, desc: "Cancellations by plan, reason, and period", color: "red" },
];

const colorMap: Record<string, string> = {
  blue: "text-red-700 bg-red-50 border-red-200",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
  purple: "text-purple-700 bg-purple-50 border-purple-200",
  cyan: "text-cyan-700 bg-cyan-50 border-cyan-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  red: "text-red-700 bg-red-50 border-red-200",
};

export default function MembershipReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const generate = async (id: string) => {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 1200));
    setGenerating(null); setDone(id);
    setTimeout(() => setDone(null), 2000);
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Reports" subtitle="Generate and export membership analytics reports" role="super-admin" />
      <div className="p-4 sm:p-6 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(r => {
            const Icon = r.icon;
            const isGenerating = generating === r.id;
            const isDone = done === r.id;
            return (
              <div key={r.id} className="glass-card p-5 flex items-start gap-4">
                <div className={`p-2.5 rounded-lg border ${colorMap[r.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
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
