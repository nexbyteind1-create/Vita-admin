"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ShieldCheck, Plus, Sparkles, Check, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CustomFeature {
  name: string;
  category: string;
  enabled: boolean;
  limit?: number;
  percentage?: number;
}

const defaultFeatures: CustomFeature[] = [
  { name: "Free Doctor Appointments", category: "Appointments", enabled: true, limit: 12 },
  { name: "Laboratory Discounts", category: "Discounts", enabled: true, percentage: 20 },
  { name: "Diagnostic Discounts", category: "Discounts", enabled: true, percentage: 20 },
  { name: "Pharmacy Discounts", category: "Discounts", enabled: true, percentage: 15 },
  { name: "AI Health Assistant", category: "Digital", enabled: true, limit: 30 },
  { name: "Wallet Credits Earned", category: "Financial", enabled: true, percentage: 3 },
];

export default function CreateMembershipPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [planDetails, setPlanDetails] = useState({
    name: "",
    tier: "custom",
    price: 1999,
    validityDays: 365,
    maxFamilyMembers: 4,
  });
  const [features, setFeatures] = useState<CustomFeature[]>(defaultFeatures);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push("/super-admin/membership/plans");
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Create Custom Plan" subtitle="Design and launch a custom membership tier" role="super-admin" />
      <div className="p-4 sm:p-6 max-w-4xl space-y-6">
        {/* Wizard Steps indicator */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 max-w-md">
          <div className={cn("flex-1 w-full py-2 text-center rounded-lg text-xs font-bold transition-all", step === 1 ? "bg-red-600 text-white" : "text-slate-500")}>1. Plan Details</div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90 sm:rotate-0" />
          <div className={cn("flex-1 w-full py-2 text-center rounded-lg text-xs font-bold transition-all", step === 2 ? "bg-red-600 text-white" : "text-slate-500")}>2. Feature Config</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Plan Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Plan Name</label>
                  <input value={planDetails.name} onChange={e => setPlanDetails(p => ({ ...p, name: e.target.value }))} className="vita-input" placeholder="Gold Premium" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Tier</label>
                  <select value={planDetails.tier} onChange={e => setPlanDetails(p => ({ ...p, tier: e.target.value }))} className="vita-input">
                    <option value="custom">Custom Tier</option>
                    <option value="silver">Silver Tier</option>
                    <option value="gold">Gold Tier</option>
                    <option value="platinum">Platinum Tier</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Annual Price (₹)</label>
                  <input type="number" value={planDetails.price} onChange={e => setPlanDetails(p => ({ ...p, price: Number(e.target.value) }))} className="vita-input" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Validity (days)</label>
                  <input type="number" value={planDetails.validityDays} onChange={e => setPlanDetails(p => ({ ...p, validityDays: Number(e.target.value) }))} className="vita-input" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Max Family Members</label>
                  <input type="number" value={planDetails.maxFamilyMembers} onChange={e => setPlanDetails(p => ({ ...p, maxFamilyMembers: Number(e.target.value) }))} className="vita-input" required />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button type="submit" iconRight={<ChevronRight className="w-4 h-4" />}>Configure Features</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Features List */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Enable Plan Features</h3>
                  <Button type="button" size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setFeatures(prev => [...prev, { name: "Custom Benefit", category: "Discounts", enabled: true, percentage: 10 }])}>Add Custom Feature</Button>
                </div>

                <div className="space-y-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <input value={feature.name} onChange={e => setFeatures(fs => fs.map((x, j) => i === j ? { ...x, name: e.target.value } : x))} className="vita-input py-1 text-sm bg-transparent border-0 focus:ring-0 max-w-xs font-medium text-slate-700" />
                        <div className="text-xs text-slate-500 px-2 mt-0.5">{feature.category}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {feature.limit !== undefined && (
                          <input type="number" value={feature.limit} onChange={e => setFeatures(fs => fs.map((x, j) => i === j ? { ...x, limit: Number(e.target.value) } : x))} className="vita-input w-20 py-1 text-xs text-center" placeholder="Limit" />
                        )}
                        {feature.percentage !== undefined && (
                          <div className="relative">
                            <input type="number" value={feature.percentage} onChange={e => setFeatures(fs => fs.map((x, j) => i === j ? { ...x, percentage: Number(e.target.value) } : x))} className="vita-input w-20 py-1 text-xs text-center pr-5" placeholder="%" />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">%</span>
                          </div>
                        )}
                        <ToggleSwitch enabled={feature.enabled} onChange={v => setFeatures(fs => fs.map((x, j) => i === j ? { ...x, enabled: v } : x))} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" loading={loading} icon={<Check className="w-4 h-4" />}>Launch Membership Plan</Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
