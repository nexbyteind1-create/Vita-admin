export interface MetricCard {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  value2?: number;
}

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

export interface DashboardMetrics {
  // Healthcare
  totalPatientVisits: number;
  uniquePatients: number;
  repeatPatients: number;
  newPatientsToday: number;
  newPatientsMonth: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  followUpAppointments: number;
  followUpCompletionRate: number;
  // Clinical Docs
  totalPrescriptions: number;
  totalLabReports: number;
  totalDiagnosticReports: number;
  totalDischargeSummaries: number;
  totalMedicalDocuments: number;
  // Partners
  totalHospitals: number;
  activeHospitals: number;
  totalDoctors: number;
  activeDoctors: number;
  totalLaboratories: number;
  totalDiagnosticCenters: number;
  totalMedicalStores: number;
  newPartnersMonth: number;
  // Operations
  pendingFollowUps: number;
  pendingLabReports: number;
  pendingDiagnosticReports: number;
  openSupportTickets: number;
  closedSupportTickets: number;
  escalatedSupportTickets: number;
  // Platform
  dau: number;
  mau: number;
  activeSessions: number;
  totalLoginsToday: number;
  avgSessionMinutes: number;
  returningUserPercentage: number;
  userRetentionRate: number;
  // Membership
  activeMemberships: number;
  silverMembers: number;
  goldMembers: number;
  platinumMembers: number;
  membershipRenewals: number;
  membershipExpiryThisMonth: number;
  membershipConversionRate: number;
  // Financial
  totalHealthcareSpending: number;
  hospitalBilling: number;
  labBilling: number;
  diagnosticBilling: number;
  medicalStoreBilling: number;
  avgSpendPerPatient: number;
  // Users
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersMonth: number;
}
