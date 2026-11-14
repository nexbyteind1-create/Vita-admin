import { supabase } from "@/lib/supabase/client";
import type { PlanFeeMap } from "@/components/membership/DoctorPlanFeesFields";

export function lowestPlanFee(fees: PlanFeeMap): number | null {
  const nums = Object.values(fees).filter((v): v is number => v != null && !Number.isNaN(v) && v > 0);
  return nums.length ? Math.min(...nums) : null;
}

/** Map centre_id → plan fees for one test. */
export async function fetchPlanFeesByTest(testId: string): Promise<Map<string, PlanFeeMap>> {
  const { data, error } = await supabase()
    .from("membership_plan_centre_test_fees")
    .select("centre_id, plan_id, price")
    .eq("test_id", testId);
  if (error) throw new Error(error.message);
  const map = new Map<string, PlanFeeMap>();
  for (const row of data ?? []) {
    const cid = row.centre_id as string;
    if (!map.has(cid)) map.set(cid, {});
    map.get(cid)![row.plan_id as string] = Number(row.price);
  }
  return map;
}

/** Map test_id → plan fees for one centre. */
export async function fetchPlanFeesByCentre(centreId: string): Promise<Map<string, PlanFeeMap>> {
  const { data, error } = await supabase()
    .from("membership_plan_centre_test_fees")
    .select("test_id, plan_id, price")
    .eq("centre_id", centreId);
  if (error) throw new Error(error.message);
  const map = new Map<string, PlanFeeMap>();
  for (const row of data ?? []) {
    const tid = row.test_id as string;
    if (!map.has(tid)) map.set(tid, {});
    map.get(tid)![row.plan_id as string] = Number(row.price);
  }
  return map;
}

export async function saveCentreTestPlanFees(centreId: string, testId: string, fees: PlanFeeMap): Promise<void> {
  const { error: delErr } = await supabase()
    .from("membership_plan_centre_test_fees")
    .delete()
    .eq("centre_id", centreId)
    .eq("test_id", testId);
  if (delErr) throw new Error(delErr.message);

  const rows = Object.entries(fees)
    .filter(([, price]) => price != null && !Number.isNaN(price) && price >= 0)
    .map(([planId, price]) => ({
      plan_id: planId,
      centre_id: centreId,
      test_id: testId,
      price: Math.round(price!),
    }));

  if (rows.length > 0) {
    const { error } = await supabase().from("membership_plan_centre_test_fees").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function clearCentreTestPlanFees(centreId: string, testId: string): Promise<void> {
  const { error } = await supabase()
    .from("membership_plan_centre_test_fees")
    .delete()
    .eq("centre_id", centreId)
    .eq("test_id", testId);
  if (error) throw new Error(error.message);
}