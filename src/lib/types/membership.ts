export type MembershipTier = "silver" | "gold" | "platinum" | "custom";
export type PlanStatus = "active" | "inactive" | "archived";

export interface MembershipFeature {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  limit?: number;
  percentage?: number;
  quantity?: number;
  validityDays?: number;
}

export interface MembershipPlanVersion {
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
  features: MembershipFeature[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  price: number;
  validityDays: number;
  maxFamilyMembers: number;
  status: PlanStatus;
  currentVersion: number;
  memberCount: number;
  versions: MembershipPlanVersion[];
  features: MembershipFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface UserMembership {
  userId: string;
  uhid: string;
  name: string;
  mobile: string;
  plan: MembershipPlan;
  version: number;
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "expired" | "cancelled";
  benefitsAvailable: Record<string, number>;
  benefitsUtilized: Record<string, number>;
  benefitsRemaining: Record<string, number>;
  upgradeHistory: UpgradeRecord[];
  renewalHistory: RenewalRecord[];
}

export interface UpgradeRecord {
  date: string;
  fromPlan: string;
  toPlan: string;
  amount: number;
}

export interface RenewalRecord {
  date: string;
  plan: string;
  amount: number;
  expiryDate: string;
}

export interface MembershipRule {
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

export interface MembershipAuditLog {
  id: string;
  action: string;
  planId: string;
  planName: string;
  version: number;
  modifiedBy: string;
  modifiedAt: string;
  previousConfig: Record<string, unknown>;
  newConfig: Record<string, unknown>;
  remarks?: string;
}

export interface MembershipAnalytics {
  tier: MembershipTier;
  totalUsers: number;
  activeMembers: number;
  expiredMembers: number;
  renewals: number;
  upgrades: number;
  revenue: number;
  conversionRate: number;
  renewalRate: number;
}
