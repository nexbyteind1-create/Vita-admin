"use client";

import { useEffect, useRef } from "react";
import { useLoad } from "@/lib/data/hooks";
import { fetchActivePlanOptions } from "@/lib/membership/plan-catalog";
import { fetchDoctorPlanMemberFees } from "@/lib/membership/doctor-plan-fees";
import { formatCurrency } from "@/lib/utils/format";
import { Crown } from "lucide-react";

export type PlanFeeMap = Record<string, number | null>;

export const PLAN_FEES_FORM_KEY = "__planFees";

const tierAccent: Record<string, string> = {
  silver: "text-slate-600",
  gold: "text-amber-600",
  platinum: "text-purple-600",
  custom: "text-red-600",
};

export function DoctorPlanFeesFields({
  doctorId,
  consultationFee,
  fees,
  onChange,
}: {
  doctorId?: string | null;
  consultationFee: number | null;
  fees: PlanFeeMap;
  onChange: (fees: PlanFeeMap) => void;
}) {
  const hydratedFor = useRef<string | null>(null);
  const { data: plans, loading: plansLoading, error: plansError } = useLoad(() => fetchActivePlanOptions(), []);
  const { data: existing, loading: feesLoading } = useLoad(
    () => (doctorId ? fetchDoctorPlanMemberFees(doctorId) : Promise.resolve({} as PlanFeeMap)),
    [doctorId],
  );

  useEffect(() => {
    if (!doctorId || feesLoading || !existing) return;
    if (hydratedFor.current === doctorId) return;
    hydratedFor.current = doctorId;
    onChange(existing);
  }, [doctorId, existing, feesLoading, onChange]);

  useEffect(() => {
    if (!doctorId) hydratedFor.current = null;
  }, [doctorId]);

  if (plansLoading) {
    return <p className="text-xs text-slate-400 sm:col-span-2">Loading membership plans…</p>;
  }

  if (plansError || !plans?.length) {
    return (
      <div className="sm:col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        No membership plans found. Run <code>Vita-admin/sql/membership_plans.sql</code> in Supabase, or create plans under Membership → Plans.
      </div>
    );
  }

  return (
    <div className="sm:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <Crown className="w-4 h-4 text-amber-500" />
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Consultation fee by membership plan</h4>
      </div>
      <p className="text-xs text-slate-500">
        Standard consultation (without a plan) is set above
        {consultationFee != null ? ` — currently ${formatCurrency(consultationFee)}` : ""}. Enter the consultation fee for patients on each
        membership plan.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plans.map(p => {
          const tier = p.slug.replace(/^plan-/, "");
          const raw = fees[p.id];
          return (
            <div key={p.id}>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">
                <span className={tierAccent[tier] ?? "text-slate-600"}>{p.name}</span> plan consultation fee (₹)
              </label>
              <input
                type="number"
                min={0}
                className="vita-input"
                placeholder="e.g. 200"
                value={raw != null ? String(raw) : ""}
                onChange={e => {
                  const next = { ...fees };
                  if (e.target.value === "") delete next[p.id];
                  else next[p.id] = Number(e.target.value);
                  onChange(next);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}