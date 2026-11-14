import { supabase } from "@/lib/supabase/client";
import { audit } from "@/lib/data/hooks";
import type { MembershipFeature, MembershipPlan, MembershipPlanVersion, MembershipTier, PlanStatus } from "@/lib/types/membership";
import { STANDARD_MEMBERSHIP_FEATURES, featureKeyFromIndex } from "@/lib/membership/default-features";

export type DoctorFeeMode = "fixed_default" | "percent" | "doctor_default";

export interface DbPlanRow {
  id: string;
  slug: string;
  name: string;
  tier: MembershipTier;
  price: number;
  validity_days: number;
  max_family_members: number;
  status: PlanStatus;
  current_version: number;
  doctor_fee_mode: DoctorFeeMode;
  doctor_member_fee_default: number | null;
  doctor_fee_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbFeatureRow {
  id: string;
  plan_id: string;
  feature_key: string;
  name: string;
  category: string;
  enabled: boolean;
  limit_count: number | null;
  percentage: number | null;
  quantity: number | null;
  validity_days: number | null;
  sort_order: number;
}

export interface DbVersionRow {
  id: string;
  plan_id: string;
  version: number;
  created_at: string;
  created_by: string | null;
  changes: string;
  snapshot: Record<string, unknown>;
}

export interface DoctorPlanFeeRow {
  plan_id: string;
  doctor_id: string;
  member_fee: number;
  doctor?: { full_name: string; specialty: string | null; consultation_fee: number | null; member_fee: number | null; hospital: { name: string } | null };
}

export interface PlanDoctorPricing {
  doctorFeeMode: DoctorFeeMode;
  doctorMemberFeeDefault: number | null;
  doctorFeePercent: number | null;
  doctorOverrides: DoctorPlanFeeRow[];
}

export interface CreatePlanInput {
  name: string;
  tier: MembershipTier;
  price: number;
  validityDays: number;
  maxFamilyMembers: number;
  features: MembershipFeature[];
  doctorFeeMode?: DoctorFeeMode;
  doctorFeePercent?: number | null;
  doctorMemberFeeDefault?: number | null;
}

function rowToFeature(r: DbFeatureRow): MembershipFeature {
  return {
    id: r.feature_key,
    name: r.name,
    category: r.category,
    enabled: r.enabled,
    limit: r.limit_count ?? undefined,
    percentage: r.percentage ?? undefined,
    quantity: r.quantity ?? undefined,
    validityDays: r.validity_days ?? undefined,
  };
}

function featureToInsert(planId: string, f: MembershipFeature, sortOrder: number) {
  return {
    plan_id: planId,
    feature_key: f.id,
    name: f.name,
    category: f.category,
    enabled: f.enabled,
    limit_count: f.limit ?? null,
    percentage: f.percentage ?? null,
    quantity: f.quantity ?? null,
    validity_days: f.validityDays ?? null,
    sort_order: sortOrder,
  };
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `plan-${base}` : `plan-${crypto.randomUUID().slice(0, 8)}`;
}

export async function fetchPlanFeatureRows(planId: string): Promise<DbFeatureRow[]> {
  const { data, error } = await supabase()
    .from("membership_plan_features")
    .select("*")
    .eq("plan_id", planId)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as DbFeatureRow[];
}

export async function fetchPlanVersions(planId: string): Promise<MembershipPlanVersion[]> {
  const { data, error } = await supabase()
    .from("membership_plan_versions")
    .select("version, created_at, created_by, changes")
    .eq("plan_id", planId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(v => ({
    version: v.version,
    createdAt: v.created_at,
    createdBy: v.created_by ?? "Super Admin",
    changes: v.changes ?? "",
    features: [],
  }));
}

async function fetchMemberCountMap(): Promise<Map<string, number>> {
  const { data, error } = await supabase().from("memberships").select("plan_id, plan_name, is_active");
  if (error) throw new Error(error.message);
  const { data: plans } = await supabase().from("membership_plans").select("id, name");
  const nameToId = new Map((plans ?? []).map(p => [p.name.toLowerCase(), p.id as string]));
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.is_active) continue;
    const pid = (row.plan_id as string | null) ?? nameToId.get(String(row.plan_name).toLowerCase());
    if (!pid) continue;
    counts.set(pid, (counts.get(pid) ?? 0) + 1);
  }
  return counts;
}

async function assemblePlan(row: DbPlanRow, memberCounts: Map<string, number>): Promise<MembershipPlan> {
  let features = (await fetchPlanFeatureRows(row.id)).map(rowToFeature);
  if (features.length === 0) {
    features = STANDARD_MEMBERSHIP_FEATURES.map((f, i) => ({ ...f, id: featureKeyFromIndex(i) }));
  }
  const versions = await fetchPlanVersions(row.id);
  return {
    id: row.slug,
    name: row.name,
    tier: row.tier,
    price: Number(row.price),
    validityDays: row.validity_days,
    maxFamilyMembers: row.max_family_members,
    status: row.status,
    currentVersion: row.current_version,
    memberCount: memberCounts.get(row.id) ?? 0,
    versions,
    features,
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
  };
}

/** Internal UUID from slug or UUID string. */
export async function resolvePlanUuid(idOrSlug: string): Promise<{ uuid: string; row: DbPlanRow } | null> {
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  let q = supabase().from("membership_plans").select("*");
  q = isUuid ? q.eq("id", idOrSlug) : q.eq("slug", idOrSlug);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { uuid: data.id, row: data as DbPlanRow };
}

export async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  const { data, error } = await supabase().from("membership_plans").select("*").order("price");
  if (error) throw new Error(error.message);
  const memberCounts = await fetchMemberCountMap();
  return Promise.all((data as DbPlanRow[]).map(r => assemblePlan(r, memberCounts)));
}

export async function fetchMembershipPlan(idOrSlug: string): Promise<MembershipPlan | null> {
  const resolved = await resolvePlanUuid(idOrSlug);
  if (!resolved) return null;
  const memberCounts = await fetchMemberCountMap();
  return assemblePlan(resolved.row, memberCounts);
}

export async function fetchPlanDoctorPricing(planIdOrSlug: string): Promise<PlanDoctorPricing | null> {
  const resolved = await resolvePlanUuid(planIdOrSlug);
  if (!resolved) return null;
  const { uuid, row } = resolved;
  const { data, error } = await supabase()
    .from("membership_plan_doctor_fees")
    .select("plan_id, doctor_id, member_fee, doctor:doctors(full_name, specialty, consultation_fee, member_fee, hospital:hospitals(name))")
    .eq("plan_id", uuid);
  if (error) throw new Error(error.message);
  return {
    doctorFeeMode: row.doctor_fee_mode,
    doctorMemberFeeDefault: row.doctor_member_fee_default != null ? Number(row.doctor_member_fee_default) : null,
    doctorFeePercent: row.doctor_fee_percent != null ? Number(row.doctor_fee_percent) : null,
    doctorOverrides: (data ?? []) as unknown as DoctorPlanFeeRow[],
  };
}

export function computePreviewMemberFee(
  consultationFee: number | null,
  pricing: Pick<PlanDoctorPricing, "doctorFeeMode" | "doctorMemberFeeDefault" | "doctorFeePercent">,
  doctorDefaultMemberFee: number | null,
  overrideFee: number | null,
): number | null {
  if (overrideFee != null) return overrideFee;
  if (pricing.doctorFeeMode === "fixed_default" && pricing.doctorMemberFeeDefault != null) {
    return pricing.doctorMemberFeeDefault;
  }
  if (pricing.doctorFeeMode === "percent" && consultationFee != null && pricing.doctorFeePercent != null) {
    return Math.round(consultationFee * (1 - pricing.doctorFeePercent / 100));
  }
  if (pricing.doctorFeeMode === "doctor_default") {
    return doctorDefaultMemberFee ?? consultationFee;
  }
  return doctorDefaultMemberFee ?? consultationFee;
}

export async function savePlanFeatures(
  idOrSlug: string,
  features: MembershipFeature[],
  changeNote: string,
): Promise<number> {
  const resolved = await resolvePlanUuid(idOrSlug);
  if (!resolved) throw new Error("Plan not found");
  const { uuid, row } = resolved;
  const nextVersion = row.current_version + 1;

  const { data: userData } = await supabase().auth.getUser();
  const createdBy = userData.user?.email ?? "Super Admin";

  const snapshot = {
    features,
    doctor_fee_mode: row.doctor_fee_mode,
    doctor_member_fee_default: row.doctor_member_fee_default,
    doctor_fee_percent: row.doctor_fee_percent,
  };

  const { error: vErr } = await supabase().from("membership_plan_versions").insert({
    plan_id: uuid,
    version: nextVersion,
    created_by: createdBy,
    changes: changeNote || "Feature configuration updated",
    snapshot,
  });
  if (vErr) throw new Error(vErr.message);

  const { error: delErr } = await supabase().from("membership_plan_features").delete().eq("plan_id", uuid);
  if (delErr) throw new Error(delErr.message);

  const rows = features.map((f, i) => featureToInsert(uuid, f, i));
  const { error: insErr } = await supabase().from("membership_plan_features").insert(rows);
  if (insErr) throw new Error(insErr.message);

  const { error: upErr } = await supabase()
    .from("membership_plans")
    .update({ current_version: nextVersion })
    .eq("id", uuid);
  if (upErr) throw new Error(upErr.message);

  await audit("update", "membership_plans", uuid, { version: nextVersion, changeNote });
  return nextVersion;
}

export async function savePlanDoctorPricing(
  idOrSlug: string,
  pricing: Omit<PlanDoctorPricing, "doctorOverrides"> & { overrides: { doctorId: string; memberFee: number | null }[] },
): Promise<void> {
  const resolved = await resolvePlanUuid(idOrSlug);
  if (!resolved) throw new Error("Plan not found");
  const { uuid } = resolved;

  const { error: planErr } = await supabase()
    .from("membership_plans")
    .update({
      doctor_fee_mode: pricing.doctorFeeMode,
      doctor_member_fee_default: pricing.doctorMemberFeeDefault,
      doctor_fee_percent: pricing.doctorFeePercent,
    })
    .eq("id", uuid);
  if (planErr) throw new Error(planErr.message);

  const { error: delErr } = await supabase().from("membership_plan_doctor_fees").delete().eq("plan_id", uuid);
  if (delErr) throw new Error(delErr.message);

  const toInsert = pricing.overrides
    .filter(o => o.memberFee != null && !Number.isNaN(o.memberFee))
    .map(o => ({ plan_id: uuid, doctor_id: o.doctorId, member_fee: o.memberFee }));

  if (toInsert.length > 0) {
    const { error: insErr } = await supabase().from("membership_plan_doctor_fees").insert(toInsert);
    if (insErr) throw new Error(insErr.message);
  }

  await audit("update", "membership_plan_doctor_fees", uuid, pricing);
}

export async function updatePlanStatus(idOrSlug: string, status: PlanStatus): Promise<void> {
  const resolved = await resolvePlanUuid(idOrSlug);
  if (!resolved) throw new Error("Plan not found");
  const { error } = await supabase().from("membership_plans").update({ status }).eq("id", resolved.uuid);
  if (error) throw new Error(error.message);
  await audit("update", "membership_plans", resolved.uuid, { status });
}

/** Users still pointing at this plan (blocks delete until reassigned). */
export async function countMembersLinkedToPlan(planUuid: string, planName: string): Promise<number> {
  const { data, error } = await supabase().from("memberships").select("user_id, plan_id, plan_name");
  if (error) throw new Error(error.message);
  const name = planName.trim().toLowerCase();
  return (data ?? []).filter(
    m =>
      m.plan_id === planUuid ||
      (m.plan_id == null && String(m.plan_name ?? "").trim().toLowerCase() === name),
  ).length;
}

/**
 * Permanently removes a plan from the database (features, versions, doctor fees cascade).
 * User memberships keep their row; `plan_id` is cleared via FK on delete.
 */
export async function deleteMembershipPlan(idOrSlug: string): Promise<{ name: string }> {
  const resolved = await resolvePlanUuid(idOrSlug);
  if (!resolved) throw new Error("Plan not found");

  const linked = await countMembersLinkedToPlan(resolved.uuid, resolved.row.name);
  if (linked > 0) {
    throw new Error(
      `${linked} user(s) still assigned to "${resolved.row.name}". Reassign them under Entities → Users, then delete again.`,
    );
  }

  const { error } = await supabase().from("membership_plans").delete().eq("id", resolved.uuid);
  if (error) throw new Error(error.message);

  await audit("delete", "membership_plans", resolved.uuid, { slug: resolved.row.slug, name: resolved.row.name });
  return { name: resolved.row.name };
}

export async function createMembershipPlan(input: CreatePlanInput): Promise<string> {
  const slug = slugify(input.name);
  const { data, error } = await supabase()
    .from("membership_plans")
    .insert({
      slug,
      name: input.name.trim(),
      tier: input.tier,
      price: input.price,
      validity_days: input.validityDays,
      max_family_members: input.maxFamilyMembers,
      status: "active",
      current_version: 1,
      doctor_fee_mode: input.doctorFeeMode ?? "percent",
      doctor_fee_percent: input.doctorFeePercent ?? 30,
      doctor_member_fee_default: input.doctorMemberFeeDefault ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const planId = data.id as string;
  const features =
    input.features.length > 0
      ? input.features
      : STANDARD_MEMBERSHIP_FEATURES.map((f, i) => ({ ...f, id: featureKeyFromIndex(i) }));

  const { error: fErr } = await supabase()
    .from("membership_plan_features")
    .insert(features.map((f, i) => featureToInsert(planId, f, i)));
  if (fErr) throw new Error(fErr.message);

  await supabase().from("membership_plan_versions").insert({
    plan_id: planId,
    version: 1,
    changes: "Initial plan creation",
    snapshot: { features },
  });

  await audit("create", "membership_plans", planId, { slug, name: input.name });
  return slug;
}

export async function fetchActivePlanOptions(): Promise<{ id: string; slug: string; name: string }[]> {
  const { data, error } = await supabase()
    .from("membership_plans")
    .select("id, slug, name")
    .eq("status", "active")
    .order("price");
  if (error) throw new Error(error.message);
  return data ?? [];
}