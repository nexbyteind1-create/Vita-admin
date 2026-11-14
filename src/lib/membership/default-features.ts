import type { MembershipFeature } from "@/lib/types/membership";

/** Full feature template used when creating a new plan or missing rows in the database. */
export const STANDARD_MEMBERSHIP_FEATURES: Omit<MembershipFeature, "id">[] = [
  { name: "Free Doctor Appointments", category: "Appointments", enabled: true, quantity: 4, validityDays: 365 },
  { name: "Follow-up Appointments", category: "Appointments", enabled: true, quantity: 2, validityDays: 365 },
  { name: "Laboratory Discounts", category: "Discounts", enabled: true, percentage: 10 },
  { name: "Diagnostic Discounts", category: "Discounts", enabled: true, percentage: 10 },
  { name: "Pharmacy Discounts", category: "Discounts", enabled: true, percentage: 5 },
  { name: "Health Package Discounts", category: "Discounts", enabled: false },
  { name: "Wallet Credits", category: "Financial", enabled: true, percentage: 2 },
  { name: "Cashback Percentage", category: "Financial", enabled: false },
  { name: "Insurance Benefits", category: "Insurance", enabled: false },
  { name: "AI Health Assistant", category: "Digital", enabled: true, limit: 10 },
  { name: "Emergency Benefits", category: "Emergency", enabled: false },
  { name: "Priority Booking", category: "Appointments", enabled: false },
  { name: "Free Health Checkups", category: "Checkups", enabled: true, quantity: 1 },
  { name: "Referral Rewards", category: "Rewards", enabled: true, quantity: 100 },
];

export function featureKeyFromIndex(i: number) {
  return `f${i + 1}`;
}