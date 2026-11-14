"use client";
import Link from "next/link";
import { CalendarClock, CheckCircle, Stethoscope, Star } from "lucide-react";
import { ResourceManager, withoutFields, type ResourceConfig } from "@/components/data/ResourceManager";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { DoctorPlanFeesFields, PLAN_FEES_FORM_KEY, type PlanFeeMap } from "@/components/membership/DoctorPlanFeesFields";
import { supabase } from "@/lib/supabase/client";
import { audit, useLoad } from "@/lib/data/hooks";
import { fetchActivePlanOptions } from "@/lib/membership/plan-catalog";
import { fetchPlanFeesByDoctorIds, lowestPlanFee, saveDoctorPlanMemberFees } from "@/lib/membership/doctor-plan-fees";
import { formatCurrency } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";
import type { FormValues } from "@/components/data/FormField";

/** public.doctors — Consult Doctor list, doctor profile and slot booking. */
export interface DoctorRow {
  id: string;
  full_name: string;
  specialty: string | null;
  qualifications: string | null;
  years_experience: number | null;
  photo_url: string | null;
  hospital_id: string | null;
  hospital: { name: string } | null;
  rating: number | null;
  review_count: number;
  consultation_fee: number | null;
  member_fee: number | null;
  about: string | null;
  patients_count: number | null;
  consult_mode: string | null;
  available_days: string | null;
  treats: string[];
  languages: string[];
  education: string[];
  support_name: string | null;
  support_phone: string | null;
  sort_order: number;
  is_active: boolean;
}

function planFeesFromValues(values: FormValues): PlanFeeMap {
  return (values[PLAN_FEES_FORM_KEY] as PlanFeeMap) ?? {};
}

function buildDoctorConfig(
  hospitals: { id: string; name: string }[] | undefined,
  planNames: Map<string, string>,
  planFeesByDoctor: Map<string, PlanFeeMap>,
  base: string,
): ResourceConfig<DoctorRow> {
  return {
    table: "doctors",
    noun: "doctor",
    title: "Doctors",
    subtitle: "Doctor profiles, standard consultation fee, and consultation fee per membership plan",
    select: "*, hospital:hospitals(name)",
    order: { column: "sort_order" },
    searchKeys: ["full_name", "specialty", "qualifications"],
    activeKey: "is_active",
    modalSize: "xl",
    deleteWarning: "Their slots and reviews are deleted too; past appointments keep their history.",
    saveSuccessMessage: ({ row }) =>
      row ? "Doctor updated successfully" : "Doctor added successfully — plan consultation fees saved",
    columns: [
      {
        key: "full_name",
        header: "Doctor",
        sortable: true,
        render: d => (
          <div>
            <div className="text-sm font-semibold text-slate-900">{d.full_name}</div>
            <div className="text-xs text-slate-500">{[d.specialty, d.qualifications].filter(Boolean).join(" · ") || "—"}</div>
          </div>
        ),
      },
      { key: "hospital", header: "Hospital", render: d => <span className="text-sm text-slate-500">{d.hospital?.name ?? "—"}</span> },
      {
        key: "consultation_fee",
        header: "Consultation fees",
        align: "right",
        render: d => {
          const byPlan = planFeesByDoctor.get(d.id);
          const lines =
            byPlan && Object.keys(byPlan).length > 0
              ? Object.entries(byPlan)
                  .filter(([, fee]) => fee != null)
                  .map(([planId, fee]) => (
                    <div key={planId} className="text-xs text-emerald-600">
                      {planNames.get(planId) ?? "Plan"} plan {formatCurrency(fee!)}
                    </div>
                  ))
              : d.member_fee != null
                ? [<div key="legacy" className="text-xs text-emerald-600">Plan consult {formatCurrency(d.member_fee)}</div>]
                : [];
          return (
            <div className="text-right">
              <div className="font-semibold">{d.consultation_fee != null ? formatCurrency(d.consultation_fee) : "—"}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Standard (no plan)</div>
              {lines}
            </div>
          );
        },
      },
      {
        key: "rating",
        header: "Rating",
        align: "center",
        render: d => (d.rating != null ? `★ ${Number(d.rating).toFixed(1)} (${d.review_count})` : "—"),
      },
    ],
    fields: [
      { key: "full_name", label: "Full name", required: true, placeholder: "Dr. Aditi Rao" },
      { key: "specialty", label: "Specialty", placeholder: "Cardiologist" },
      { key: "qualifications", label: "Qualifications", placeholder: "MBBS, MD" },
      { key: "years_experience", label: "Years of experience", type: "number", min: 0 },
      {
        key: "hospital_id",
        label: "Hospital",
        type: "select",
        options: (hospitals ?? []).map(h => ({ value: h.id, label: h.name })),
      },
      { key: "consult_mode", label: "Consult mode", placeholder: "In-person consult" },
      {
        key: "consultation_fee",
        label: "Standard consultation fee (₹)",
        type: "number",
        min: 0,
        help: "Full fee without an active membership plan",
      },
      { key: "available_days", label: "Available days", placeholder: "Mon–Sat" },
      { key: "patients_count", label: "Patients treated", type: "number", min: 0 },
      { key: "rating", label: "Rating (0–5)", type: "decimal", min: 0, max: 5, help: "Updates automatically as patients rate visits" },
      { key: "review_count", label: "Review count", type: "number", min: 0 },
      { key: "about", label: "About", type: "textarea", wide: true },
      { key: "treats", label: "Treats", type: "tags", wide: true, placeholder: "Hypertension, Chest pain…" },
      { key: "education", label: "Education", type: "tags", wide: true, placeholder: "MD Cardiology — AIIMS Delhi" },
      { key: "languages", label: "Languages", type: "tags", placeholder: "English, Hindi" },
      { key: "photo_url", label: "Photo URL", type: "url" },
      { key: "support_name", label: "Support staff name", placeholder: "Priya Menon" },
      { key: "support_phone", label: "Support staff phone", type: "tel", placeholder: "+91 98765 43210" },
      { key: "sort_order", label: "Display order", type: "number" },
      { key: "is_active", label: "Visible in app", type: "toggle" },
    ],
    formExtrasInsertAfter: "consultation_fee",
    formExtras: ({ row, values, setValue }) => (
      <DoctorPlanFeesFields
        doctorId={row?.id}
        consultationFee={values.consultation_fee != null ? Number(values.consultation_fee) : null}
        fees={planFeesFromValues(values)}
        onChange={fees => setValue(PLAN_FEES_FORM_KEY, fees)}
      />
    ),
    afterSave: async ({ id, values }) => {
      const fees = planFeesFromValues(values);
      await saveDoctorPlanMemberFees(id, fees);
      const legacy = lowestPlanFee(fees);
      if (legacy != null) {
        await supabase().from("doctors").update({ member_fee: legacy }).eq("id", id);
      }
      await audit("update", "membership_plan_doctor_fees", id, fees);
    },
    fromForm: values => {
      const fees = planFeesFromValues(values);
      return {
        ...values,
        member_fee: lowestPlanFee(fees),
        review_count: values.review_count ?? 0,
        sort_order: values.sort_order ?? 0,
        treats: values.treats ?? [],
        languages: values.languages ?? [],
        education: values.education ?? [],
      };
    },
    rowActions: d => (
      <Link href={`${base}/schedules/doctor-slots?doctor=${d.id}`}>
        <Button size="xs" variant="ghost" icon={<CalendarClock className="w-3 h-3" />}>
          Slots
        </Button>
      </Link>
    ),
    summary: rows => (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Doctors" value={rows.length} icon={<Stethoscope className="w-full h-full" />} color="blue" />
        <StatCard label="Visible in app" value={rows.filter(d => d.is_active).length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
        <StatCard
          label="Average rating"
          value={
            rows.filter(d => d.rating != null).length
              ? (rows.reduce((s, d) => s + Number(d.rating ?? 0), 0) / rows.filter(d => d.rating != null).length).toFixed(1)
              : "—"
          }
          icon={<Star className="w-full h-full" />}
          color="amber"
        />
      </div>
    ),
  };
}

export default function DoctorsPage() {
  const { base, portal, hospitalId, doctorId } = usePortal();
  const { data: hospitals } = useLoad(async () => {
    const { data, error } = await supabase().from("hospitals").select("id, name").order("name");
    if (error) throw new Error(error.message);
    return data as { id: string; name: string }[];
  });

  const { data: doctors } = useLoad(async () => {
    const { data, error } = await supabase().from("doctors").select("id").order("sort_order");
    if (error) throw new Error(error.message);
    return data as { id: string }[];
  });

  const doctorIds = (doctors ?? []).map(d => d.id);

  const { data: planMeta } = useLoad(() => fetchActivePlanOptions().catch(() => []), []);
  const planNames = new Map((planMeta ?? []).map(p => [p.id, p.name]));

  const { data: planFeesByDoctor } = useLoad(
    () => fetchPlanFeesByDoctorIds(doctorIds).catch(() => new Map<string, PlanFeeMap>()),
    [doctorIds.join(",")],
  );

  const config = buildDoctorConfig(hospitals ?? undefined, planNames, planFeesByDoctor ?? new Map(), base);

  if (portal === "hospital") {
    return (
      <ResourceManager
        key={planFeesByDoctor?.size ?? 0}
        config={{
          ...withoutFields(config, ["hospital_id", "rating", "review_count", "sort_order"]),
          subtitle: "Doctors at your hospital — standard and membership-plan consultation fees",
          scope: q => q.eq("hospital_id", hospitalId),
          defaults: { hospital_id: hospitalId },
          columns: config.columns.filter(c => c.key !== "hospital"),
          rowActions: d => (
            <Link href={`${base}/schedules/doctor-slots?doctor=${d.id}`}>
              <Button size="xs" variant="ghost" icon={<CalendarClock className="w-3 h-3" />}>
                Slots
              </Button>
            </Link>
          ),
        }}
      />
    );
  }
  if (portal === "doctor") {
    return (
      <ResourceManager
        config={{
          ...withoutFields(config, ["hospital_id", "rating", "review_count", "sort_order", "is_active"]),
          title: "My profile",
          subtitle: "How you appear in Consult Doctor",
          scope: q => q.eq("id", doctorId),
          activeKey: undefined,
          canCreate: false,
          canDelete: false,
          summary: undefined,
        }}
      />
    );
  }
  return <ResourceManager key={planFeesByDoctor?.size ?? 0} config={config} />;
}