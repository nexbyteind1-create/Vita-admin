"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { utilizationPolicies, monthlyUtilizationConfig } from "@/lib/mock-data/wallet";
import { formatDate } from "@/lib/utils/format";
import { Save, Info, Plus, Edit } from "lucide-react";

export default function WalletUtilizationPage() {
  const [config, setConfig] = useState({
    monthlyLimit: 500,
    maxCreditsPerTransaction: 100,
    minTransactionAmount: 500,
    maxRedemptionPercentage: 20,
    effectiveStartDate: "2025-01-01",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Credit Utilization Policy" subtitle="Configure monthly and per-transaction credit redemption limits" role="super-admin"
        actions={<Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>{saved ? "Saved!" : "Save Policy"}</Button>}
      />
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-start gap-2 p-4 glass-card border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Credit redemption is currently disabled (Phase 1). This configuration will take effect when redemption is enabled in Phase 2. Updated policies apply only from the effective date and do not affect completed transactions.</span>
        </div>

        {/* Monthly Limit */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Utilization Limit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Maximum Credits Per Month</label>
              <input type="number" value={config.monthlyLimit} onChange={e => setConfig(c => ({ ...c, monthlyLimit: Number(e.target.value) }))} className="vita-input" />
              <p className="text-xs text-slate-500 mt-1">Max wallet credits a user can redeem in one month</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Effective Start Date</label>
              <input type="date" value={config.effectiveStartDate} onChange={e => setConfig(c => ({ ...c, effectiveStartDate: e.target.value }))} className="vita-input" />
            </div>
          </div>
        </div>

        {/* Transaction Limit */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Transaction Utilization Limit</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Max Credits Per Transaction</label>
              <input type="number" value={config.maxCreditsPerTransaction} onChange={e => setConfig(c => ({ ...c, maxCreditsPerTransaction: Number(e.target.value) }))} className="vita-input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Minimum Transaction Amount (₹)</label>
              <input type="number" value={config.minTransactionAmount} onChange={e => setConfig(c => ({ ...c, minTransactionAmount: Number(e.target.value) }))} className="vita-input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Max Redemption Percentage (%)</label>
              <input type="number" value={config.maxRedemptionPercentage} onChange={e => setConfig(c => ({ ...c, maxRedemptionPercentage: Number(e.target.value) }))} className="vita-input" />
              <p className="text-xs text-slate-500 mt-1">Max % of bill that can be paid using credits</p>
            </div>
          </div>
        </div>

        {/* Monthly Config Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Monthly Configuration History</h3>
            <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add Month</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="vita-table w-full">
              <thead><tr><th>Month</th><th className="text-right">Monthly Limit</th><th>Effective Date</th><th className="text-center">Actions</th></tr></thead>
              <tbody>
                {monthlyUtilizationConfig.map(m => (
                  <tr key={m.month}>
                    <td className="font-medium text-slate-200">{m.month} {m.year}</td>
                    <td className="text-right font-bold text-emerald-400">{m.monthlyLimit} Credits</td>
                    <td className="text-slate-400">{formatDate(m.effectiveDate)}</td>
                    <td className="text-center"><Button size="xs" variant="ghost" icon={<Edit className="w-3 h-3" />}>Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Version History */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4">Policy Version History</h3>
          {utilizationPolicies.map((p, i) => (
            <div key={p.id} className="flex items-start gap-3 py-3 border-b border-[#1f2d45] last:border-0">
              <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 flex-shrink-0">v{utilizationPolicies.length - i}</span>
              <div className="flex-1">
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span>Monthly Limit: <strong>{p.monthlyLimit}</strong></span>
                  <span>Per Transaction: <strong>{p.maxCreditsPerTransaction}</strong></span>
                  <span>Max %: <strong>{p.maxRedemptionPercentage}%</strong></span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Effective from {formatDate(p.effectiveStartDate)} · By {p.createdBy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
