export type EntityStatus = "active" | "suspended" | "blocked" | "pending" | "inactive";
export type EntityType = "user" | "hospital" | "doctor" | "medical_store" | "laboratory" | "diagnostic" | "admin";

export interface BaseEntity {
  id: string;
  name: string;
  status: EntityStatus;
  createdAt: string;
  lastLogin?: string;
  lastActivity?: string;
}

export interface User extends BaseEntity {
  uhid: string;
  mobile: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  city: string;
  state: string;
  membershipTier?: string;
  totalAppointments: number;
  totalSpend: number;
  walletBalance: number;
}

export interface Hospital extends BaseEntity {
  registrationId: string;
  city: string;
  state: string;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  approvalStatus: "approved" | "pending" | "rejected";
}

export interface Doctor extends BaseEntity {
  licenseNumber: string;
  specialty: string;
  hospital: string;
  hospitalId: string;
  totalAppointments: number;
  rating: number;
  verificationStatus: "verified" | "pending" | "rejected";
}

export interface MedicalStore extends BaseEntity {
  licenseNumber: string;
  city: string;
  state: string;
  totalBillsUploaded: number;
  totalBillingAmount: number;
  approvalStatus: "approved" | "pending" | "rejected";
}

export interface Laboratory extends BaseEntity {
  licenseNumber: string;
  city: string;
  state: string;
  totalBookings: number;
  pendingReports: number;
  approvalStatus: "approved" | "pending" | "rejected";
}

export interface DiagnosticCenter extends BaseEntity {
  licenseNumber: string;
  city: string;
  state: string;
  totalBookings: number;
  pendingReports: number;
  approvalStatus: "approved" | "pending" | "rejected";
}

export interface Admin extends BaseEntity {
  email: string;
  role: "admin" | "super_admin";
  permissions: string[];
  assignedBy: string;
}

export interface ActivityTimelineEvent {
  id: string;
  event: string;
  description: string;
  timestamp: string;
  performedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface EntityAuditLog {
  id: string;
  action: string;
  entityType: EntityType;
  entityName: string;
  previousStatus?: EntityStatus;
  updatedStatus?: EntityStatus;
  modifiedBy: string;
  modifiedAt: string;
  remarks?: string;
}
