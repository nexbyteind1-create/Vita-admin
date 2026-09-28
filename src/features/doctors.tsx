"use client";
import Link from "next/link";
import { CalendarClock, CheckCircle, Stethoscope, Star } from "lucide-react";
import { ResourceManager, withoutFields, type ResourceConfig } from "@/components/data/ResourceManager";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/lib/supabase/client";
import { useLoad } from "@/lib/data/hooks";
import { formatCurrency } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

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

export default function DoctorsPage() {
  const { base, portal, hospitalId, doctorId } = usePortal();
  const { data: hospitals } = useLoad(async () => {
    const { data, error } = await supabase().from("hospitals").select("id, name").order("name");
    if (error) throw new Error(error.message);
    return data as { id: string; name: string }[];
  });

  const config: ResourceConfig<DoctorRow> = {
    table: "doctors",
    noun: "doctor",
    title: "Doctors",
    subtitle: "Doctor profiles, fees and support contacts shown in Consult Doctor",
    select: "*, hospital:hospitals(name)",
    order: { column: "sort_order" },
    searchKeys: ["full_name", "specialty", "qualifications"],
    activeKey: "is_active",
    modalSize: "xl",
    deleteWarning: "Their slots and reviews are deleted too; past appointments keep their history.",
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
        header: "Fee",
        align: "right",
        render: d => (
          <div className="text-right">
            <div className="font-semibold">{d.consultation_fee != null ? formatCurrency(d.consultation_fee) : "—"}</div>
            {d.member_fee != null && <div className="text-xs text-emerald-600">Member {formatCurrency(d.member_fee)}</div>}
          </div>
        ),
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
      { key: "consultation_fee", label: "Consultation fee (₹)", type: "number", min: 0 },
      { key: "member_fee", label: "Member fee (₹)", type: "number", min: 0, help: "Leave empty if members pay the full fee" },
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
    fromForm: values => ({
      ...values,
      review_count: values.review_count ?? 0,
      sort_order: values.sort_order ?? 0,
      treats: values.treats ?? [],
      languages: values.languages ?? [],
      education: values.education ?? [],
    }),
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

  if (portal === "hospital") {
    return (
      <ResourceManager
        config={{
          // Ratings, review counts and ordering are set by Vita; partners edit the rest.
          ...withoutFields(config, ["hospital_id", "rating", "review_count", "sort_order"]),
          subtitle: "Doctors at your hospital — profiles, fees and support contacts shown in the app",
          scope: q => q.eq("hospital_id", hospitalId),
          defaults: { hospital_id: hospitalId },
          columns: config.columns.filter(c => c.key !== "hospital"),
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
  return <ResourceManager config={config} />;
}
