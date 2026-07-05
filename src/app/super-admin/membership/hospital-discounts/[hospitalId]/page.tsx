"use client";
import { Suspense, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { hospitals } from "@/lib/mock-data/entities";
import { membershipPlans } from "@/lib/mock-data/membership";
import { hospitalDiscountConfigs } from "@/lib/mock-data/hospital-discounts";
import type { HospitalDiscountOverride } from "@/lib/types/membership";
import { Save, RotateCcw, Info } from "lucide-react";

function defaultsFromPlan(planId: string): HospitalDiscountOverride[] {
  const plan = membershipPlans.find(p => p.id === planId);
  if (!plan) return [];
  return plan.features
    .filter(f => f.category === "Discounts" && f.enabled)
    .map(f => ({ featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 }));
}

function ConfigureHospitalDiscounts() {
  const params = useParams<{ hospitalId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const hospital = hospitals.find(h => h.id === params.hospitalId) ?? hospitals[0];
  const existingForHospital = hospitalDiscountConfigs.filter(c => c.hospitalId === hospital.id);
  const planId = searchParams.get("planId") ?? existingForHospital[0]?.planId ?? membershipPlans[0].id;
  const plan = membershipPlans.find(p => p.id === planId) ?? membershipPlans[0];
  const existingConfig = existingForHospital.find(c => c.planId === planId);

  const [overrides, setOverrides] = useState<HospitalDiscountOverride[]>(existingConfig?.overrides ?? defaultsFromPlan(planId));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const planDefaults = defaultsFromPlan(planId);
  const currentVersion = existingConfig?.currentVersion ?? 0;

  const handlePlanChange = (newPlanId: string) => {
    router.push(`/super-admin/membership/hospital-discounts/${hospital.id}?planId=${newPlanId}`);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <TopHeader
        title={`Discount Overrides — ${hospital.name}`}
        subtitle={existingConfig ? `v${currentVersion} on ${plan.name} plan · Saving creates a new version automatically` : `Configuring for the first time on the ${plan.name} plan`}
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setOverrides(planDefaults)}>Reset to Plan Defaults</Button>
            <Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>
              {saved ? "Saved!" : `Save & Create v${currentVersion + 1}`}
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-[1000px]">
        {/* Summary */}
        <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Hospital:</span>
            <span className="font-bold text-slate-900">{hospital.name}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Plan:</span>
            <select value={planId} onChange={e => handlePlanChange(e.target.value)} className="vita-input py-1 text-sm w-auto">
              {membershipPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Current Version:</span>
            <span className="font-semibold text-red-600">{existingConfig ? `v${currentVersion}` : "Not yet configured"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          These percentages apply only to {hospital.name} for members on the {plan.name} plan. Every other hospital keeps the plan&apos;s default discount percentages shown below.
        </div>

        {/* Discount Table */}
        <div className="glass-card overflow-x-auto">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 min-w-[520px] bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-6">Discount Category</div>
            <div className="col-span-3">Plan Default</div>
            <div className="col-span-3">Hospital Override</div>
          </div>
          {overrides.map(o => {
            const fallback = planDefaults.find(d => d.featureId === o.featureId)?.percentage ?? 0;
            return (
              <div key={o.featureId} className="grid grid-cols-12 gap-3 items-center py-4 px-4 min-w-[520px] border-b border-slate-200 last:border-0 hover:bg-slate-100 transition-colors">
                <div className="col-span-6 text-sm font-medium text-slate-900">{o.name}</div>
                <div className="col-span-3 text-sm text-slate-500">{fallback}%</div>
                <div className="col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={o.percentage}
                      onChange={e => setOverrides(prev => prev.map(x => x.featureId === o.featureId ? { ...x, percentage: Number(e.target.value) } : x))}
                      className="vita-input py-1.5 text-xs pr-6"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {existingConfig && existingConfig.versions.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Version History</h3>
            <div className="space-y-3">
              {existingConfig.versions.map(v => (
                <div key={v.version} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-700 rounded-full border border-red-200">v{v.version}</span>
                  <div>
                    <p className="text-sm text-slate-900">{v.changes}</p>
                    <p className="text-xs text-slate-500 mt-0.5">By {v.modifiedBy} · {v.modifiedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfigureHospitalDiscountsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <ConfigureHospitalDiscounts />
    </Suspense>
  );
}
