"use client";

import { useMemo, useState } from "react";
import { useLoad } from "@/lib/data/hooks";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import {
  computePreviewMemberFee,
  type DoctorFeeMode,
  type PlanDoctorPricing,
} from "@/lib/membership/plan-catalog";
import { Button } from "@/components/ui/Button";
import { Stethoscope } from "lucide-react";

interface DoctorRow {
  id: string;
  full_name: string;
  specialty: string | null;
  consultation_fee: number | null;
  member_fee: number | null;
  hospital: { name: string } | null;
}

export function DoctorPlanFeesEditor({
  planSlug,
  planName,
  initialPricing,
  onSaved,
}: {
  planSlug: string;
  planName?: string;
  initialPricing: PlanDoctorPricing;
  onSaved?: () => void;
}) {
  const [mode, setMode] = useState<DoctorFeeMode>(initialPricing.doctorFeeMode);
  const [defaultFee, setDefaultFee] = useState<string>(
    initialPricing.doctorMemberFeeDefault != null ? String(initialPricing.doctorMemberFeeDefault) : "",
  );
  const [percent, setPercent] = useState<string>(
    initialPricing.doctorFeePercent != null ? String(initialPricing.doctorFeePercent) : "30",
  );
  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const o of initialPricing.doctorOverrides) {
      map[o.doctor_id] = String(o.member_fee);
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inlineSaved, setInlineSaved] = useState(false);

  const { data: doctors, loading } = useLoad(async () => {
    const { data, error: err } = await supabase()
      .from("doctors")
      .select("id, full_name, specialty, consultation_fee, member_fee, hospital:hospitals(name)")
      .eq("is_active", true)
      .order("sort_order");
    if (err) throw new Error(err.message);
    return (data ?? []) as unknown as DoctorRow[];
  });

  const pricingPreview = useMemo(
    (): Pick<PlanDoctorPricing, "doctorFeeMode" | "doctorMemberFeeDefault" | "doctorFeePercent"> => ({
      doctorFeeMode: mode,
      doctorMemberFeeDefault: defaultFee ? Number(defaultFee) : null,
      doctorFeePercent: percent ? Number(percent) : null,
    }),
    [mode, defaultFee, percent],
  );

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { savePlanDoctorPricing } = await import("@/lib/membership/plan-catalog");
      await savePlanDoctorPricing(planSlug, {
        ...pricingPreview,
        overrides: (doctors ?? []).map(d => ({
          doctorId: d.id,
          memberFee: overrides[d.id] !== undefined && overrides[d.id] !== "" ? Number(overrides[d.id]) : null,
        })),
      });
      setInlineSaved(true);
      window.setTimeout(() => setInlineSaved(false), 2500);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-red-600" />
        <h3 className="text-sm font-semibold text-slate-700">Consultation fee — this membership plan</h3>
      </div>
      <p className="text-xs text-slate-500">
        Default consultation fee for this plan when booking any doctor. Override individual doctors in the table below, or set
        plan-wide rules when overrides are empty.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Pricing rule</label>
          <select className="vita-input" value={mode} onChange={e => setMode(e.target.value as DoctorFeeMode)}>
            <option value="percent">% off standard consultation fee</option>
            <option value="fixed_default">Fixed plan consultation fee (all doctors)</option>
            <option value="doctor_default">Use each doctor&apos;s plan consultation fees</option>
          </select>
        </div>
        {mode === "percent" && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Discount %</label>
            <input
              type="number"
              min={0}
              max={100}
              className="vita-input"
              value={percent}
              onChange={e => setPercent(e.target.value)}
            />
          </div>
        )}
        {mode === "fixed_default" && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Plan consultation fee (₹)</label>
            <input
              type="number"
              min={0}
              className="vita-input"
              value={defaultFee}
              onChange={e => setDefaultFee(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading && <p className="text-xs text-slate-400">Loading doctors…</p>}

      {!loading && doctors && doctors.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 text-xs font-semibold uppercase text-slate-500 min-w-[720px]">
            <div className="col-span-4">Doctor</div>
            <div className="col-span-2 text-right">Standard consult</div>
            <div className="col-span-2 text-right">On doctor profile</div>
            <div className="col-span-2 text-right">This plan consult (₹)</div>
            <div className="col-span-2 text-right">Effective consult</div>
          </div>
          {doctors.map(d => {
            const override = overrides[d.id] !== undefined && overrides[d.id] !== "" ? Number(overrides[d.id]) : null;
            const effective = computePreviewMemberFee(d.consultation_fee, pricingPreview, d.member_fee, override);
            return (
              <div
                key={d.id}
                className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-slate-200 text-sm min-w-[720px] items-center"
              >
                <div className="col-span-4">
                  <div className="font-medium text-slate-900">{d.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {[d.specialty, d.hospital?.name].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <div className="col-span-2 text-right text-slate-600">
                  {d.consultation_fee != null ? formatCurrency(d.consultation_fee) : "—"}
                </div>
                <div className="col-span-2 text-right text-slate-500">
                  {d.member_fee != null ? formatCurrency(d.member_fee) : "—"}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="Auto"
                    className="vita-input py-1 text-xs text-right"
                    value={overrides[d.id] ?? ""}
                    onChange={e =>
                      setOverrides(prev => {
                        const next = { ...prev };
                        if (e.target.value === "") delete next[d.id];
                        else next[d.id] = e.target.value;
                        return next;
                      })
                    }
                  />
                </div>
                <div className="col-span-2 text-right font-semibold text-emerald-700">
                  {effective != null ? formatCurrency(effective) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {inlineSaved && (
          <span className="text-xs font-medium text-emerald-700">
            Saved — {planName ? `${planName} ` : ""}plan consultation fees updated
          </span>
        )}
        <Button size="sm" loading={saving} onClick={save}>
          {inlineSaved ? "Saved!" : "Save consultation fees"}
        </Button>
      </div>
    </div>
  );
}