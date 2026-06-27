"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { membershipPlans } from "@/lib/mock-data/membership";
import type { MembershipFeature } from "@/lib/types/membership";
import { Save, RotateCcw, Info } from "lucide-react";

const categoryColors: Record<string, string> = {
  Appointments: "text-blue-400",
  Discounts: "text-emerald-400",
  Financial: "text-amber-400",
  Insurance: "text-purple-400",
  Digital: "text-cyan-400",
  Emergency: "text-red-400",
  Checkups: "text-pink-400",
  Rewards: "text-orange-400",
};

function FeatureRow({ feature, onChange }: { feature: MembershipFeature; onChange: (f: MembershipFeature) => void }) {
  return (
    <div className={`grid grid-cols-12 gap-3 items-center py-4 px-4 border-b border-[#1f2d45] last:border-0 hover:bg-white/[0.02] transition-colors ${!feature.enabled ? "opacity-60" : ""}`}>
      {/* Enable toggle */}
      <div className="col-span-1 flex justify-center">
        <ToggleSwitch enabled={feature.enabled} onChange={v => onChange({ ...feature, enabled: v })} size="sm" />
      </div>
      {/* Feature name */}
      <div className="col-span-4">
        <div className="text-sm font-medium text-slate-200">{feature.name}</div>
        <div className={`text-xs ${categoryColors[feature.category] ?? "text-slate-500"}`}>{feature.category}</div>
      </div>
      {/* Limit */}
      <div className="col-span-2">
        <input type="number" disabled={!feature.enabled} value={feature.limit ?? ""} onChange={e => onChange({ ...feature, limit: e.target.value ? Number(e.target.value) : undefined })} placeholder="Limit" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
      {/* Percentage */}
      <div className="col-span-2">
        <div className="relative">
          <input type="number" disabled={!feature.enabled} value={feature.percentage ?? ""} onChange={e => onChange({ ...feature, percentage: e.target.value ? Number(e.target.value) : undefined })} placeholder="%" className="vita-input py-1.5 text-xs pr-6 disabled:opacity-40" />
          {feature.percentage !== undefined && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>}
        </div>
      </div>
      {/* Quantity */}
      <div className="col-span-2">
        <input type="number" disabled={!feature.enabled} value={feature.quantity ?? ""} onChange={e => onChange({ ...feature, quantity: e.target.value ? Number(e.target.value) : undefined })} placeholder="Qty" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
      {/* Validity */}
      <div className="col-span-1">
        <input type="number" disabled={!feature.enabled} value={feature.validityDays ?? ""} onChange={e => onChange({ ...feature, validityDays: e.target.value ? Number(e.target.value) : undefined })} placeholder="Days" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
    </div>
  );
}

export default function ConfigurePlanPage() {
  const params = useParams();
  const plan = membershipPlans.find(p => p.id === params.id) ?? membershipPlans[1];
  const [features, setFeatures] = useState<MembershipFeature[]>(plan.features);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = features.filter(f => f.enabled).length;
  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="min-h-screen">
      <TopHeader
        title={`Configure — ${plan.name} Plan`}
        subtitle={`v${plan.currentVersion} · Saving creates a new version automatically`}
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setFeatures(plan.features)}>Reset</Button>
            <Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>
              {saved ? "Saved!" : "Save & Create v" + (plan.currentVersion + 1)}
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-[1200px]">
        {/* Summary */}
        <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Plan:</span>
            <span className="font-bold text-white">{plan.name}</span>
          </div>
          <div className="w-px h-4 bg-[#1f2d45]" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Current Version:</span>
            <span className="font-semibold text-blue-400">v{plan.currentVersion}</span>
          </div>
          <div className="w-px h-4 bg-[#1f2d45]" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Enabled Features:</span>
            <span className="font-bold text-emerald-400">{enabledCount}</span>
            <span className="text-slate-500">/ {features.length}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Saving will create v{plan.currentVersion + 1}. Existing subscribers keep v{plan.currentVersion} until renewal.
          </div>
        </div>

        {/* Feature Table */}
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#080d1a] border-b border-[#1f2d45] text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-1 text-center">On/Off</div>
            <div className="col-span-4">Feature</div>
            <div className="col-span-2">Limit</div>
            <div className="col-span-2">Percentage</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-1">Validity</div>
          </div>

          {/* Grouped by category */}
          {categories.map(cat => (
            <div key={cat}>
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest ${categoryColors[cat] ?? "text-slate-500"} bg-white/[0.02] border-b border-[#1f2d45]`}>
                {cat}
              </div>
              {features.filter(f => f.category === cat).map(f => (
                <FeatureRow key={f.id} feature={f} onChange={updated => setFeatures(prev => prev.map(x => x.id === updated.id ? updated : x))} />
              ))}
            </div>
          ))}
        </div>

        {/* Versioning Note */}
        <div className="glass-card p-5 border border-blue-500/20 bg-blue-500/5">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">📋 Membership Versioning Policy</h3>
          <div className="space-y-1.5 text-xs text-slate-400">
            <p>• When you save changes, a new plan version is automatically created (v{plan.currentVersion} → v{plan.currentVersion + 1})</p>
            <p>• Existing members on v{plan.currentVersion} continue receiving the old configuration until their membership expires or they renew</p>
            <p>• New subscriptions and renewals will receive v{plan.currentVersion + 1}</p>
            <p>• Version history is maintained in the audit log for complete traceability</p>
          </div>
        </div>
      </div>
    </div>
  );
}
