"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Save, Info } from "lucide-react";

interface RuleConfig {
  autoRenewal: boolean;
  renewalGracePeriodDays: number;
  upgradeAllowed: boolean;
  downgradeAllowed: boolean;
  trialPlanEnabled: boolean;
  trialDurationDays: number;
  promotionalPlansEnabled: boolean;
  couponEligibility: boolean;
  referralBenefitsEnabled: boolean;
}

const defaultRules: RuleConfig = {
  autoRenewal: true,
  renewalGracePeriodDays: 7,
  upgradeAllowed: true,
  downgradeAllowed: false,
  trialPlanEnabled: false,
  trialDurationDays: 14,
  promotionalPlansEnabled: true,
  couponEligibility: true,
  referralBenefitsEnabled: true,
};

export default function MembershipRulesPage() {
  const [rules, setRules] = useState<RuleConfig>(defaultRules);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ruleSection = (title: string, items: { key: keyof RuleConfig; label: string; description: string; isToggle: boolean; unit?: string }[]) => (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-bold text-white border-b border-[#1f2d45] pb-3">{title}</h3>
      {items.map(item => (
        <div key={item.key} className="flex items-center justify-between gap-4 py-1">
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">{item.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
          </div>
          {item.isToggle ? (
            <ToggleSwitch enabled={rules[item.key] as boolean} onChange={v => setRules(r => ({ ...r, [item.key]: v }))} />
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" value={rules[item.key] as number} onChange={e => setRules(r => ({ ...r, [item.key]: Number(e.target.value) }))} className="vita-input w-20 py-1.5 text-center text-sm" />
              {item.unit && <span className="text-xs text-slate-500 w-8">{item.unit}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Rules & Configuration" subtitle="Configure renewal, upgrade, trial, and promotional policies" role="super-admin"
        actions={<Button loading={saving} icon={<Save className="w-4 h-4" />} onClick={handleSave}>{saved ? "Saved!" : "Save Rules"}</Button>}
      />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="flex items-start gap-2 p-4 glass-card border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Changes to membership rules apply to all new transactions immediately. Existing active memberships are not retroactively affected.</span>
        </div>

        {ruleSection("Renewal Settings", [
          { key: "autoRenewal", label: "Auto Renewal", description: "Automatically renew memberships upon expiry if payment is set up", isToggle: true },
          { key: "renewalGracePeriodDays", label: "Renewal Grace Period", description: "Days after expiry during which users can still renew without penalty", isToggle: false, unit: "days" },
        ])}

        {ruleSection("Upgrade & Downgrade", [
          { key: "upgradeAllowed", label: "Allow Plan Upgrades", description: "Users can upgrade to a higher tier plan during active membership", isToggle: true },
          { key: "downgradeAllowed", label: "Allow Plan Downgrades", description: "Users can downgrade to a lower tier plan (effective on next renewal)", isToggle: true },
        ])}

        {ruleSection("Trial & Promotions", [
          { key: "trialPlanEnabled", label: "Enable Trial Plans", description: "Allow new users to try a membership plan for a limited period", isToggle: true },
          { key: "trialDurationDays", label: "Trial Duration", description: "Number of days for the trial membership", isToggle: false, unit: "days" },
          { key: "promotionalPlansEnabled", label: "Enable Promotional Plans", description: "Allow time-limited promotional membership offers", isToggle: true },
        ])}

        {ruleSection("Coupons & Referrals", [
          { key: "couponEligibility", label: "Coupon Eligibility", description: "Allow users to apply coupon codes during membership purchase", isToggle: true },
          { key: "referralBenefitsEnabled", label: "Referral Benefits", description: "Reward both referrer and new user when a referral membership is purchased", isToggle: true },
        ])}
      </div>
    </div>
  );
}
