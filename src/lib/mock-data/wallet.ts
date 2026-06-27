import type { WalletConfig, WalletAnalytics, UserWallet, WalletAuditLog, CashbackRule, UtilizationPolicy } from "@/lib/types/wallet";

export const walletConfig: WalletConfig = {
  moduleEnabled: true,
  creditPercentage: 2.5,
  effectiveDate: "2024-01-01",
  minBillAmount: 500,
  maxCreditsPerTransaction: 500,
  maxCreditsPerDay: 1000,
  maxCreditsPerMonth: 5000,
  creditSources: [
    { source: "bill_payment", label: "Bill Payment via Vita", enabled: true },
    { source: "medical_bill_upload", label: "Medical Bill Upload", enabled: true },
    { source: "lab_bill_upload", label: "Laboratory Bill Upload", enabled: true },
    { source: "diagnostic_bill_upload", label: "Diagnostic Bill Upload", enabled: true },
    { source: "membership_purchase", label: "Membership Purchase", enabled: true },
    { source: "promotional", label: "Promotional Campaigns", enabled: false },
    { source: "referral", label: "Referral Rewards", enabled: true },
  ],
  creditExpiryDays: 365,
  expiryNotificationDays: 30,
  autoExpiryEnabled: true,
  redemptionEnabled: false,
};

export const walletAnalytics: WalletAnalytics = {
  totalCreditsIssued: 28420000,
  totalCreditsEarned: 24180000,
  totalCreditsRedeemed: 0,
  totalCreditsExpired: 4240000,
  totalWalletUsers: 198420,
  averageCreditsPerUser: 143,
};

export const cashbackRules: CashbackRule[] = [
  { id: "cb1", percentage: 5, maxCashback: 500, eligibleTransactions: ["Bill Payment", "Lab Booking"], campaignStart: "2024-01-01", campaignEnd: "2024-03-31", validityDays: 30, status: "inactive" },
  { id: "cb2", percentage: 10, maxCashback: 1000, eligibleTransactions: ["Membership Purchase"], campaignStart: "2024-12-01", campaignEnd: "2024-12-31", validityDays: 60, status: "active" },
];

export const utilizationPolicies: UtilizationPolicy[] = [
  { id: "up1", monthlyLimit: 500, maxCreditsPerTransaction: 100, minTransactionAmount: 500, maxRedemptionPercentage: 20, effectiveStartDate: "2024-01-01", effectiveEndDate: "2024-01-31", createdBy: "Super Admin", createdAt: "2023-12-20T10:00:00Z" },
  { id: "up2", monthlyLimit: 300, maxCreditsPerTransaction: 100, minTransactionAmount: 500, maxRedemptionPercentage: 20, effectiveStartDate: "2024-02-01", effectiveEndDate: "2024-02-29", createdBy: "Super Admin", createdAt: "2024-01-25T10:00:00Z" },
  { id: "up3", monthlyLimit: 750, maxCreditsPerTransaction: 150, minTransactionAmount: 400, maxRedemptionPercentage: 25, effectiveStartDate: "2024-03-01", createdBy: "Super Admin", createdAt: "2024-02-20T10:00:00Z" },
];

export const monthlyUtilizationConfig = [
  { month: "January", year: 2024, monthlyLimit: 500, effectiveDate: "2024-01-01" },
  { month: "February", year: 2024, monthlyLimit: 300, effectiveDate: "2024-02-01" },
  { month: "March", year: 2024, monthlyLimit: 750, effectiveDate: "2024-03-01" },
  { month: "April", year: 2024, monthlyLimit: 600, effectiveDate: "2024-04-01" },
  { month: "May", year: 2024, monthlyLimit: 600, effectiveDate: "2024-05-01" },
  { month: "June", year: 2024, monthlyLimit: 800, effectiveDate: "2024-06-01" },
];

export const userWallets: UserWallet[] = [
  {
    userId: "u1",
    uhid: "VITA100245",
    name: "Lokesh Kumar",
    mobile: "9876543210",
    balance: 1840,
    totalEarned: 4820,
    totalRedeemed: 0,
    totalExpired: 2980,
    transactions: [
      { id: "t1", type: "credit", amount: 480, source: "Medical Bill Upload", description: "Bill upload credited", date: "2024-12-20", status: "completed" },
      { id: "t2", type: "credit", amount: 320, source: "Lab Bill Upload", description: "Lab bill credited", date: "2024-12-15", status: "completed" },
      { id: "t3", type: "expired", amount: 2980, source: "Auto Expiry", description: "Credits expired", date: "2024-06-01", status: "completed" },
    ],
  },
  {
    userId: "u2",
    uhid: "VITA100246",
    name: "Priya Sharma",
    mobile: "9876543211",
    balance: 6240,
    totalEarned: 8420,
    totalRedeemed: 0,
    totalExpired: 2180,
    transactions: [
      { id: "t4", type: "credit", amount: 1240, source: "Membership Purchase", description: "Platinum plan credited", date: "2024-12-01", status: "completed" },
      { id: "t5", type: "credit", amount: 840, source: "Bill Payment", description: "Bill payment credited", date: "2024-11-20", status: "completed" },
    ],
  },
];

export const walletAuditLogs: WalletAuditLog[] = [
  { id: "wa1", action: "Credit Percentage Updated", previousValue: "2.0%", updatedValue: "2.5%", modifiedBy: "Super Admin", modifiedAt: "2024-01-01T10:00:00Z", remarks: "Annual credit percentage review" },
  { id: "wa2", action: "Cashback Rule Created", previousValue: "None", updatedValue: "10% on Membership, max ₹1000", modifiedBy: "Super Admin", modifiedAt: "2024-12-01T09:00:00Z", remarks: "Year-end promotional campaign" },
  { id: "wa3", action: "Monthly Limit Updated", previousValue: "500 Credits", updatedValue: "300 Credits", modifiedBy: "Super Admin", modifiedAt: "2024-01-25T10:00:00Z", remarks: "February budget adjustment" },
  { id: "wa4", action: "Credit Source Disabled", previousValue: "Promotional Campaigns: Enabled", updatedValue: "Promotional Campaigns: Disabled", modifiedBy: "Super Admin", modifiedAt: "2024-03-15T11:00:00Z" },
];

export const topCreditEarners = [
  { rank: 1, name: "Priya Sharma", uhid: "VITA100246", totalCredits: 8420, plan: "Platinum" },
  { rank: 2, name: "Ananya Krishnan", uhid: "VITA100248", totalCredits: 6840, plan: "Gold" },
  { rank: 3, name: "Lokesh Kumar", uhid: "VITA100245", totalCredits: 4820, plan: "Gold" },
  { rank: 4, name: "Sunita Reddy", uhid: "VITA100250", totalCredits: 3240, plan: "Silver" },
  { rank: 5, name: "Ravi Kumar", uhid: "VITA100251", totalCredits: 2980, plan: "Gold" },
];
