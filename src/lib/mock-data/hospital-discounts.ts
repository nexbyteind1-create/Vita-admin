import { hospitals } from "@/lib/mock-data/entities";
import { membershipPlans } from "@/lib/mock-data/membership";
import type { HospitalDiscountConfig } from "@/lib/types/membership";

function discountFeaturesOf(planId: string) {
  return membershipPlans.find(p => p.id === planId)!.features.filter(f => f.category === "Discounts" && f.enabled);
}

export const hospitalDiscountConfigs: HospitalDiscountConfig[] = [
  {
    id: `${hospitals[0].id}-plan-gold`,
    hospitalId: hospitals[0].id,
    hospitalName: hospitals[0].name,
    planId: "plan-gold",
    planName: "Gold",
    currentVersion: 2,
    overrides: discountFeaturesOf("plan-gold").map(f =>
      f.name === "Laboratory Discounts" ? { featureId: f.id, name: f.name, category: f.category, percentage: 25 } : { featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 }
    ),
    versions: [
      { version: 1, overrides: discountFeaturesOf("plan-gold").map(f => ({ featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 })), changes: "Initialized from Gold plan defaults", modifiedBy: "Super Admin", modifiedAt: "2024-02-01T10:00:00Z" },
      { version: 2, overrides: [], changes: "Raised Laboratory Discounts from 20% to 25% per hospital agreement", modifiedBy: "Super Admin", modifiedAt: "2024-07-15T11:30:00Z" },
    ],
    createdAt: "2024-02-01",
    updatedAt: "2024-07-15",
  },
  {
    id: `${hospitals[1].id}-plan-silver`,
    hospitalId: hospitals[1].id,
    hospitalName: hospitals[1].name,
    planId: "plan-silver",
    planName: "Silver",
    currentVersion: 2,
    overrides: discountFeaturesOf("plan-silver").map(f =>
      f.name === "Diagnostic Discounts" ? { featureId: f.id, name: f.name, category: f.category, percentage: 5 } : { featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 }
    ),
    versions: [
      { version: 1, overrides: discountFeaturesOf("plan-silver").map(f => ({ featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 })), changes: "Initialized from Silver plan defaults", modifiedBy: "Super Admin", modifiedAt: "2024-03-05T09:00:00Z" },
      { version: 2, overrides: [], changes: "Lowered Diagnostic Discounts from 10% to 5% per hospital agreement", modifiedBy: "Super Admin", modifiedAt: "2024-08-20T13:45:00Z" },
    ],
    createdAt: "2024-03-05",
    updatedAt: "2024-08-20",
  },
  {
    id: `${hospitals[2].id}-plan-platinum`,
    hospitalId: hospitals[2].id,
    hospitalName: hospitals[2].name,
    planId: "plan-platinum",
    planName: "Platinum",
    currentVersion: 1,
    overrides: discountFeaturesOf("plan-platinum").map(f => ({ featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 })),
    versions: [
      { version: 1, overrides: discountFeaturesOf("plan-platinum").map(f => ({ featureId: f.id, name: f.name, category: f.category, percentage: f.percentage ?? 0 })), changes: "Initialized from Platinum plan defaults", modifiedBy: "Super Admin", modifiedAt: "2024-05-12T10:00:00Z" },
    ],
    createdAt: "2024-05-12",
    updatedAt: "2024-05-12",
  },
];
