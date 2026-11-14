import { supabase } from "@/lib/supabase/client";
import type { PlanFeeMap } from "@/components/membership/DoctorPlanFeesFields";

export async function fetchDoctorPlanMemberFees(doctorId: string): Promise<PlanFeeMap> {
  const { data, error } = await supabase()
    .from("membership_plan_doctor_fees")
    .select("plan_id, member_fee")
    .eq("doctor_id", doctorId);
  if (error) throw new Error(error.message);
  const map: PlanFeeMap = {};
  for (const row of data ?? []) {
    map[row.plan_id as string] = Number(row.member_fee);
  }
  return map;
}

export async function fetchPlanFeesByDoctorIds(doctorIds: string[]): Promise<Map<string, PlanFeeMap>> {
  if (!doctorIds.length) return new Map();
  const { data, error } = await supabase()
    .from("membership_plan_doctor_fees")
    .select("plan_id, doctor_id, member_fee, plan:membership_plans(name)")
    .in("doctor_id", doctorIds);
  if (error) throw new Error(error.message);
  const map = new Map<string, PlanFeeMap>();
  for (const row of data ?? []) {
    const did = row.doctor_id as string;
    if (!map.has(did)) map.set(did, {});
    map.get(did)![row.plan_id as string] = Number(row.member_fee);
  }
  return map;
}

/** Upsert per-plan fees for one doctor; removes rows when fee is null/empty. */
export async function saveDoctorPlanMemberFees(doctorId: string, fees: PlanFeeMap): Promise<void> {
  const { error: delErr } = await supabase().from("membership_plan_doctor_fees").delete().eq("doctor_id", doctorId);
  if (delErr) throw new Error(delErr.message);

  const rows = Object.entries(fees)
    .filter(([, fee]) => fee != null && !Number.isNaN(fee))
    .map(([planId, member_fee]) => ({ plan_id: planId, doctor_id: doctorId, member_fee }));

  if (rows.length > 0) {
    const { error } = await supabase().from("membership_plan_doctor_fees").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export function lowestPlanFee(fees: PlanFeeMap): number | null {
  const nums = Object.values(fees).filter((v): v is number => v != null && !Number.isNaN(v));
  return nums.length ? Math.min(...nums) : null;
}