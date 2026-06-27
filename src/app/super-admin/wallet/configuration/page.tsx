"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { walletConfig, cashbackRules } from "@/lib/mock-data/wallet";
import type { WalletConfig } from "@/lib/types/wallet";
import { Save, Info, Wallet, Percent, Calendar, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

// Trigger new build
export default function WalletConfigurationPage() {
  const [config, setConfig] = useState<WalletConfig>(walletConfig);
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
      <TopHeader title="Wallet & Credits Configuration" subtitle="Configure wallet module, credit percentages, sources and policies" role="super-admin"
        actions={<Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>{saved ? "Saved!" : "Save Configuration"}</Button>}
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Module Toggle */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-400" /> Wallet Module</h3>
          <ToggleSwitch enabled={config.moduleEnabled} onChange={v => setConfig(c => ({ ...c, moduleEnabled: v }))} label="Enable Wallet Module" description="If disabled, users will not be able to earn or view Wallet Credits" />
        </div>

        {/* Credit Percentage */}
        <div className={`glass-card p-6 space-y-4 ${!config.moduleEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Percent className="w-4 h-4 text-emerald-400" /> Credit Percentage Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Credit Percentage (%)", key: "creditPercentage", type: "number", step: 0.1 },
              { label: "Minimum Bill Amount (₹)", key: "minBillAmount", type: "number" },
              { label: "Max Credits Per Transaction", key: "maxCreditsPerTransaction", type: "number" },
              { label: "Max Credits Per Day", key: "maxCreditsPerDay", type: "number" },
              { label: "Max Credits Per Month", key: "maxCreditsPerMonth", type: "number" },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">{field.label}</label>
                <input
                  type={field.type}
                  step={field.step}
                  value={config[field.key as keyof WalletConfig] as number}
                  onChange={e => setConfig(c => ({ ...c, [field.key as keyof WalletConfig]: Number(e.target.value) }))}
                  className="vita-input"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Effective Date</label>
              <input type="date" value={config.effectiveDate} onChange={e => setConfig(c => ({ ...c, effectiveDate: e.target.value }))} className="vita-input" />
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
            💡 Example: {config.creditPercentage}% credit on ₹2,000 bill = {Math.round(2000 * config.creditPercentage / 100)} Credits earned
          </div>
        </div>

        {/* Credit Sources */}
        <div className={`glass-card p-6 space-y-4 ${!config.moduleEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-400" /> Eligible Credit Sources</h3>
          {config.creditSources.map((src, i) => (
            <div key={src.source} className="flex items-center justify-between py-2 border-b border-[#1f2d45] last:border-0">
              <div>
                <div className="text-sm font-medium text-slate-200">{src.label}</div>
                <div className="text-xs text-slate-500">{src.source.replace(/_/g, " ")}</div>
              </div>
              <ToggleSwitch enabled={src.enabled} onChange={v => setConfig(c => ({ ...c, creditSources: c.creditSources.map((s, j) => i === j ? { ...s, enabled: v } : s) }))} size="sm" />
            </div>
          ))}
        </div>

        {/* Credit Expiry */}
        <div className={`glass-card p-6 space-y-4 ${!config.moduleEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-400" /> Credit Expiry Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Credit Expiry Duration (days)</label>
              <input type="number" value={config.creditExpiryDays} onChange={e => setConfig(c => ({ ...c, creditExpiryDays: Number(e.target.value) }))} className="vita-input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Notification Period Before Expiry (days)</label>
              <input type="number" value={config.expiryNotificationDays} onChange={e => setConfig(c => ({ ...c, expiryNotificationDays: Number(e.target.value) }))} className="vita-input" />
            </div>
          </div>
          <ToggleSwitch enabled={config.autoExpiryEnabled} onChange={v => setConfig(c => ({ ...c, autoExpiryEnabled: v }))} label="Auto Expiry" description="Automatically expire credits after the configured duration" />
        </div>

        {/* Redemption (Phase 1 - Disabled) */}
        <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300 mb-1">Credit Redemption — Phase 2</h3>
              <p className="text-xs text-amber-400/80">Credit redemption is disabled in Phase 1. Users can only earn and view credits. Redemption options (appointments, lab discounts, membership discounts, cashback) will be configurable in Phase 2.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
