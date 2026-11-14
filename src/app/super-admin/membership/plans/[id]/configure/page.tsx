"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { DoctorPlanFeesEditor } from "@/components/membership/DoctorPlanFeesEditor";
import { errorText, useLoad } from "@/lib/data/hooks";
import { fetchMembershipPlan, fetchPlanDoctorPricing, savePlanFeatures } from "@/lib/membership/plan-catalog";
import { hospitalDiscountConfigs } from "@/lib/mock-data/hospital-discounts";
import type { MembershipFeature } from "@/lib/types/membership";
import { Save, RotateCcw, Info } from "lucide-react";
import Link from "next/link";
import { SaveSuccessAlert } from "@/components/ui/SaveSuccessAlert";

const categoryColors: Record<string, string> = {
  Appointments: "text-red-600",
  Discounts: "text-emerald-600",
  Financial: "text-amber-600",
  Insurance: "text-purple-600",
  Digital: "text-cyan-600",
  Emergency: "text-red-600",
  Checkups: "text-pink-600",
  Rewards: "text-orange-600",
};

function FeatureRow({ feature, onChange }: { feature: MembershipFeature; onChange: (f: MembershipFeature) => void }) {
  return (
    <div className={`grid grid-cols-12 gap-3 items-center py-4 px-4 min-w-[640px] border-b border-slate-200 last:border-0 hover:bg-slate-100 transition-colors ${!feature.enabled ? "opacity-60" : ""}`}>
      <div className="col-span-1 flex justify-center">
        <ToggleSwitch enabled={feature.enabled} onChange={v => onChange({ ...feature, enabled: v })} size="sm" />
      </div>
      <div className="col-span-4">
        <div className="text-sm font-medium text-slate-900">{feature.name}</div>
        <div className={`text-xs ${categoryColors[feature.category] ?? "text-slate-500"}`}>{feature.category}</div>
      </div>
      <div className="col-span-2">
        <input type="number" disabled={!feature.enabled} value={feature.limit ?? ""} onChange={e => onChange({ ...feature, limit: e.target.value ? Number(e.target.value) : undefined })} placeholder="Limit" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <input type="number" disabled={!feature.enabled} value={feature.percentage ?? ""} onChange={e => onChange({ ...feature, percentage: e.target.value ? Number(e.target.value) : undefined })} placeholder="%" className="vita-input py-1.5 text-xs pr-6 disabled:opacity-40" />
          {feature.percentage !== undefined && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>}
        </div>
      </div>
      <div className="col-span-2">
        <input type="number" disabled={!feature.enabled} value={feature.quantity ?? ""} onChange={e => onChange({ ...feature, quantity: e.target.value ? Number(e.target.value) : undefined })} placeholder="Qty" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
      <div className="col-span-1">
        <input type="number" disabled={!feature.enabled} value={feature.validityDays ?? ""} onChange={e => onChange({ ...feature, validityDays: e.target.value ? Number(e.target.value) : undefined })} placeholder="Days" className="vita-input py-1.5 text-xs disabled:opacity-40" />
      </div>
    </div>
  );
}

export default function ConfigurePlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = String(params.id ?? "");

  const { data, loading, error, reload } = useLoad(
    async () => {
      const [plan, pricing] = await Promise.all([
        fetchMembershipPlan(planId),
        fetchPlanDoctorPricing(planId),
      ]);
      if (!plan) throw new Error("Plan not found. Run sql/membership_plans.sql if the catalog is empty.");
      if (!pricing) throw new Error("Could not load doctor pricing for this plan.");
      return { plan, pricing };
    },
    [planId],
  );

  const [features, setFeatures] = useState<MembershipFeature[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [version, setVersion] = useState<number | null>(null);
  const [success, setSuccess] = useState<{ title: string; description?: string } | null>(null);

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomedCreate = useRef(false);

  const notifySuccess = useCallback((title: string, description?: string) => {
    setSuccess({ title, description });
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(null), 8000);
  }, []);

  const plan = data?.plan;
  const pricing = data?.pricing;
  const activeFeatures = features.length > 0 ? features : (plan?.features ?? []);
  const currentVersion = version ?? plan?.currentVersion ?? 1;

  useEffect(() => {
    if (plan) setFeatures(plan.features);
  }, [plan]);

  useEffect(() => {
    if (welcomedCreate.current || searchParams.get("created") !== "1" || !plan) return;
    welcomedCreate.current = true;
    notifySuccess(
      `${plan.name} plan added successfully`,
      "Your new membership plan is live. Configure features and doctor pricing below.",
    );
    router.replace(`/super-admin/membership/plans/${planId}/configure`);
  }, [searchParams, plan, planId, router, notifySuccess]);

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    setSaveError("");
    try {
      const next = await savePlanFeatures(plan.id, activeFeatures, "Feature configuration updated from admin");
      setVersion(next);
      setSaved(true);
      notifySuccess(
        `${plan.name} plan saved successfully`,
        `Membership version v${next} is active. New subscribers and renewals get this configuration.`,
      );
      window.setTimeout(() => setSaved(false), 2500);
      reload();
    } catch (e) {
      setSaveError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = activeFeatures.filter(f => f.enabled).length;
  const categories = [...new Set(activeFeatures.map(f => f.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading plan configuration…
      </div>
    );
  }

  if (error || !plan || !pricing) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto space-y-3">
        <h1 className="text-lg font-bold text-slate-900">Plan configuration unavailable</h1>
        <p className="text-sm text-red-600">{error || "Plan not found"}</p>
        <p className="text-xs text-slate-500">
          Apply <code className="text-slate-700">Vita-admin/sql/membership_plans.sql</code> in the Supabase SQL editor, then refresh.
        </p>
        <Link href="/super-admin/membership/plans" className="text-sm text-red-600 underline">
          Back to plans
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopHeader
        title={`Configure — ${plan.name} Plan`}
        subtitle={`v${currentVersion} · Saving features creates a new version automatically`}
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => setFeatures(plan.features)}>
              Reset
            </Button>
            <Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>
              {saved ? "Saved!" : `Save & Create v${currentVersion + 1}`}
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-[1200px]">
        {success && (
          <SaveSuccessAlert
            title={success.title}
            description={success.description}
            backHref="/super-admin/membership/plans"
            onDismiss={() => setSuccess(null)}
          />
        )}
        {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>}

        <div className="glass-card p-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Plan:</span>
            <span className="font-bold text-slate-900">{plan.name}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Current Version:</span>
            <span className="font-semibold text-red-600">v{currentVersion}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Enabled Features:</span>
            <span className="font-bold text-emerald-600">{enabledCount}</span>
            <span className="text-slate-500">/ {activeFeatures.length}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Saving features creates v{currentVersion + 1}. Existing subscribers keep v{currentVersion} until renewal.
          </div>
        </div>

        <DoctorPlanFeesEditor
          planSlug={plan.id}
          planName={plan.name}
          initialPricing={pricing}
          onSaved={() => {
            notifySuccess(
              `${plan.name} plan — consultation fees saved successfully`,
              "Consultation fees for this membership plan are updated.",
            );
            reload();
          }}
        />

        <div className="glass-card overflow-x-auto">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 min-w-[640px] bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-1 text-center">On/Off</div>
            <div className="col-span-4">Feature</div>
            <div className="col-span-2">Limit</div>
            <div className="col-span-2">Percentage</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-1">Validity</div>
          </div>
          {categories.map(cat => (
            <div key={cat}>
              <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest min-w-[640px] ${categoryColors[cat] ?? "text-slate-500"} bg-slate-50 border-b border-slate-200`}>
                {cat}
              </div>
              {activeFeatures
                .filter(f => f.category === cat)
                .map(f => (
                  <FeatureRow key={f.id} feature={f} onChange={updated => setFeatures(prev => (prev ?? activeFeatures).map(x => (x.id === updated.id ? updated : x)))} />
                ))}
            </div>
          ))}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Hospital-Specific Discount Overrides</h3>
            <Link href="/super-admin/membership/hospital-discounts">
              <Button variant="ghost" size="xs">
                View All
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Hospital overrides (still mock data) use this plan&apos;s discount features as defaults.
          </p>
          {hospitalDiscountConfigs.filter(c => c.planId === plan.id).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No hospital-specific overrides configured for this plan yet.</p>
          ) : (
            <div className="space-y-2">
              {hospitalDiscountConfigs
                .filter(c => c.planId === plan.id)
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                    <div>
                      <span className="font-medium text-slate-900">{c.hospitalName}</span>
                      <span className="text-xs text-slate-500 ml-2">
                        v{c.currentVersion} · {c.overrides.map(o => `${o.name.replace(" Discounts", "")} ${o.percentage}%`).join(", ")}
                      </span>
                    </div>
                    <Link href={`/super-admin/membership/hospital-discounts/${c.hospitalId}?planId=${c.planId}`}>
                      <Button variant="ghost" size="xs">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}