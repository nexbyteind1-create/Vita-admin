export type CreditSource =
  | "bill_payment"
  | "medical_bill_upload"
  | "lab_bill_upload"
  | "diagnostic_bill_upload"
  | "membership_purchase"
  | "promotional"
  | "referral";

export interface WalletConfig {
  moduleEnabled: boolean;
  creditPercentage: number;
  effectiveDate: string;
  minBillAmount: number;
  maxCreditsPerTransaction: number;
  maxCreditsPerDay: number;
  maxCreditsPerMonth: number;
  creditSources: CreditSourceConfig[];
  creditExpiryDays: number;
  expiryNotificationDays: number;
  autoExpiryEnabled: boolean;
  redemptionEnabled: boolean;
}

export interface CreditSourceConfig {
  source: CreditSource;
  label: string;
  enabled: boolean;
}

export interface CashbackRule {
  id: string;
  percentage: number;
  maxCashback: number;
  eligibleTransactions: string[];
  campaignStart: string;
  campaignEnd: string;
  validityDays: number;
  status: "active" | "inactive";
}

export interface ReferralRewardConfig {
  referrerCredits: number;
  newUserCredits: number;
  maxReferralRewards: number;
  campaignDuration: number;
  enabled: boolean;
}

export interface UtilizationPolicy {
  id: string;
  monthlyLimit: number;
  maxCreditsPerTransaction: number;
  minTransactionAmount: number;
  maxRedemptionPercentage: number;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface MonthlyUtilizationConfig {
  month: string;
  year: number;
  monthlyLimit: number;
  effectiveDate: string;
}

export interface WalletAnalytics {
  totalCreditsIssued: number;
  totalCreditsEarned: number;
  totalCreditsRedeemed: number;
  totalCreditsExpired: number;
  totalWalletUsers: number;
  averageCreditsPerUser: number;
}

export interface UserWallet {
  userId: string;
  uhid: string;
  name: string;
  mobile: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit" | "expired";
  amount: number;
  source: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface WalletAuditLog {
  id: string;
  action: string;
  previousValue: string;
  updatedValue: string;
  modifiedBy: string;
  modifiedAt: string;
  remarks?: string;
}

export interface WalletConfigVersion {
  version: number;
  previousConfig: Partial<WalletConfig>;
  updatedConfig: Partial<WalletConfig>;
  effectiveDate: string;
  modifiedBy: string;
  modifiedAt: string;
}
