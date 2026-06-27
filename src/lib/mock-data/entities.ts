import type { User, Hospital, Doctor, MedicalStore, Laboratory, DiagnosticCenter, Admin, EntityAuditLog } from "@/lib/types/entity";

export const users: User[] = [
  { id: "u1", name: "Lokesh Kumar", uhid: "VITA100245", mobile: "9876543210", email: "lokesh@email.com", age: 34, gender: "male", city: "Hyderabad", state: "Telangana", status: "active", membershipTier: "Gold", totalAppointments: 12, totalSpend: 48200, walletBalance: 1840, createdAt: "2023-02-14", lastLogin: "2024-12-26T08:30:00Z", lastActivity: "2024-12-26T09:15:00Z" },
  { id: "u2", name: "Priya Sharma", uhid: "VITA100246", mobile: "9876543211", email: "priya@email.com", age: 28, gender: "female", city: "Mumbai", state: "Maharashtra", status: "active", membershipTier: "Platinum", totalAppointments: 8, totalSpend: 124800, walletBalance: 6240, createdAt: "2023-04-20", lastLogin: "2024-12-25T14:20:00Z", lastActivity: "2024-12-25T15:00:00Z" },
  { id: "u3", name: "Rajesh Patel", uhid: "VITA100247", mobile: "9876543212", email: "rajesh@email.com", age: 52, gender: "male", city: "Ahmedabad", state: "Gujarat", status: "suspended", membershipTier: "Silver", totalAppointments: 24, totalSpend: 28400, walletBalance: 420, createdAt: "2023-01-10", lastLogin: "2024-11-20T10:00:00Z", lastActivity: "2024-11-20T10:30:00Z" },
  { id: "u4", name: "Ananya Krishnan", uhid: "VITA100248", mobile: "9876543213", email: "ananya@email.com", age: 41, gender: "female", city: "Chennai", state: "Tamil Nadu", status: "active", membershipTier: "Gold", totalAppointments: 18, totalSpend: 84200, walletBalance: 2840, createdAt: "2023-03-08", lastLogin: "2024-12-26T07:45:00Z", lastActivity: "2024-12-26T08:20:00Z" },
  { id: "u5", name: "Mohammed Raza", uhid: "VITA100249", mobile: "9876543214", email: "raza@email.com", age: 38, gender: "male", city: "Hyderabad", state: "Telangana", status: "blocked", membershipTier: undefined, totalAppointments: 3, totalSpend: 4200, walletBalance: 0, createdAt: "2024-01-15", lastLogin: "2024-08-10T12:00:00Z", lastActivity: "2024-08-10T12:30:00Z" },
  { id: "u6", name: "Sunita Reddy", uhid: "VITA100250", mobile: "9876543215", email: "sunita@email.com", age: 45, gender: "female", city: "Bangalore", state: "Karnataka", status: "active", membershipTier: "Silver", totalAppointments: 6, totalSpend: 12800, walletBalance: 640, createdAt: "2023-08-20", lastLogin: "2024-12-24T16:30:00Z", lastActivity: "2024-12-24T17:00:00Z" },
];

export const hospitals: Hospital[] = [
  { id: "h1", name: "Apollo Hospitals", registrationId: "REG-AP-2019-001", city: "Hyderabad", state: "Telangana", status: "active", totalDoctors: 248, totalPatients: 84200, totalAppointments: 28420, approvalStatus: "approved", createdAt: "2023-01-20", lastLogin: "2024-12-26T08:00:00Z" },
  { id: "h2", name: "Fortis Healthcare", registrationId: "REG-FH-2019-002", city: "Mumbai", state: "Maharashtra", status: "active", totalDoctors: 312, totalPatients: 74180, totalAppointments: 24180, approvalStatus: "approved", createdAt: "2023-01-25", lastLogin: "2024-12-26T09:00:00Z" },
  { id: "h3", name: "KIMS Hospitals", registrationId: "REG-KM-2019-003", city: "Hyderabad", state: "Telangana", status: "active", totalDoctors: 184, totalPatients: 58240, totalAppointments: 18920, approvalStatus: "approved", createdAt: "2023-02-10", lastLogin: "2024-12-25T14:00:00Z" },
  { id: "h4", name: "City Care Hospital", registrationId: "REG-CC-2024-041", city: "Pune", state: "Maharashtra", status: "pending", totalDoctors: 0, totalPatients: 0, totalAppointments: 0, approvalStatus: "pending", createdAt: "2024-12-01", lastLogin: undefined },
  { id: "h5", name: "MedPlus Clinic", registrationId: "REG-MP-2024-042", city: "Chennai", state: "Tamil Nadu", status: "suspended", totalDoctors: 12, totalPatients: 4820, totalAppointments: 2840, approvalStatus: "approved", createdAt: "2023-06-15", lastLogin: "2024-09-15T10:00:00Z" },
];

export const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Arun Mehta", licenseNumber: "LIC-TG-2018-4821", specialty: "Cardiology", hospital: "Apollo Hospitals", hospitalId: "h1", status: "active", totalAppointments: 4820, rating: 4.9, verificationStatus: "verified", createdAt: "2023-01-20", lastLogin: "2024-12-26T08:30:00Z" },
  { id: "d2", name: "Dr. Kavitha Nair", licenseNumber: "LIC-MH-2019-3241", specialty: "Neurology", hospital: "Fortis Healthcare", hospitalId: "h2", status: "active", totalAppointments: 3840, rating: 4.7, verificationStatus: "verified", createdAt: "2023-01-25", lastLogin: "2024-12-26T09:15:00Z" },
  { id: "d3", name: "Dr. Ramesh Reddy", licenseNumber: "LIC-TG-2017-2189", specialty: "Orthopedics", hospital: "KIMS Hospitals", hospitalId: "h3", status: "suspended", totalAppointments: 2840, rating: 4.5, verificationStatus: "verified", createdAt: "2023-02-10", lastLogin: "2024-10-20T10:00:00Z" },
  { id: "d4", name: "Dr. Sunita Patel", licenseNumber: "LIC-GJ-2020-1842", specialty: "Pediatrics", hospital: "Apollo Hospitals", hospitalId: "h1", status: "active", totalAppointments: 5840, rating: 4.8, verificationStatus: "verified", createdAt: "2023-01-20", lastLogin: "2024-12-25T11:30:00Z" },
];

export const medicalStores: MedicalStore[] = [
  { id: "ms1", name: "MedLife Pharmacy", licenseNumber: "DL-TG-2020-8421", city: "Hyderabad", state: "Telangana", status: "active", totalBillsUploaded: 8420, totalBillingAmount: 4821000, approvalStatus: "approved", createdAt: "2023-03-15", lastLogin: "2024-12-26T10:00:00Z" },
  { id: "ms2", name: "Apollo Pharmacy", licenseNumber: "DL-MH-2020-7831", city: "Mumbai", state: "Maharashtra", status: "active", totalBillsUploaded: 6840, totalBillingAmount: 3924000, approvalStatus: "approved", createdAt: "2023-04-10", lastLogin: "2024-12-25T16:00:00Z" },
  { id: "ms3", name: "Care Plus Pharmacy", licenseNumber: "DL-TN-2021-4821", city: "Chennai", state: "Tamil Nadu", status: "suspended", totalBillsUploaded: 2140, totalBillingAmount: 842000, approvalStatus: "approved", createdAt: "2023-08-20", lastLogin: "2024-10-15T09:00:00Z" },
];

export const laboratories: Laboratory[] = [
  { id: "l1", name: "SRL Diagnostics", licenseNumber: "LAB-TG-2019-2841", city: "Hyderabad", state: "Telangana", status: "active", totalBookings: 24820, pendingReports: 124, approvalStatus: "approved", createdAt: "2023-02-01", lastLogin: "2024-12-26T07:30:00Z" },
  { id: "l2", name: "Thyrocare", licenseNumber: "LAB-MH-2018-1842", city: "Mumbai", state: "Maharashtra", status: "active", totalBookings: 18420, pendingReports: 84, approvalStatus: "approved", createdAt: "2023-01-28", lastLogin: "2024-12-25T15:00:00Z" },
  { id: "l3", name: "LALS Path Labs", licenseNumber: "LAB-DL-2020-3421", city: "Delhi", state: "Delhi", status: "active", totalBookings: 14280, pendingReports: 42, approvalStatus: "approved", createdAt: "2023-03-10", lastLogin: "2024-12-24T11:00:00Z" },
];

export const diagnosticCenters: DiagnosticCenter[] = [
  { id: "dc1", name: "Medall Diagnostic Center", licenseNumber: "DIA-TG-2020-1842", city: "Hyderabad", state: "Telangana", status: "active", totalBookings: 12840, pendingReports: 48, approvalStatus: "approved", createdAt: "2023-02-15", lastLogin: "2024-12-26T08:00:00Z" },
  { id: "dc2", name: "Mahesh Radiology", licenseNumber: "DIA-MH-2019-2841", city: "Mumbai", state: "Maharashtra", status: "active", totalBookings: 8420, pendingReports: 32, approvalStatus: "approved", createdAt: "2023-03-20", lastLogin: "2024-12-25T14:00:00Z" },
];

export const admins: Admin[] = [
  { id: "a1", name: "Vikram Singh", email: "vikram@vita.health", role: "admin", status: "active", permissions: ["view_users", "view_hospitals", "manage_reports"], assignedBy: "Super Admin", createdAt: "2023-01-10", lastLogin: "2024-12-26T09:00:00Z" },
  { id: "a2", name: "Deepa Menon", email: "deepa@vita.health", role: "admin", status: "active", permissions: ["view_users", "manage_memberships"], assignedBy: "Super Admin", createdAt: "2023-04-15", lastLogin: "2024-12-25T17:00:00Z" },
  { id: "a3", name: "Rahul Gupta", email: "rahul@vita.health", role: "admin", status: "suspended", permissions: ["view_users"], assignedBy: "Super Admin", createdAt: "2023-06-20", lastLogin: "2024-10-10T10:00:00Z" },
];

export const entityAuditLogs: EntityAuditLog[] = [
  { id: "ea1", action: "User Suspended", entityType: "user", entityName: "Rajesh Patel (VITA100247)", previousStatus: "active", updatedStatus: "suspended", modifiedBy: "Admin Vikram Singh", modifiedAt: "2024-11-20T10:00:00Z", remarks: "Fraudulent activity detected" },
  { id: "ea2", action: "Hospital Approved", entityType: "hospital", entityName: "Apollo Hospitals", previousStatus: "pending", updatedStatus: "active", modifiedBy: "Super Admin", modifiedAt: "2023-01-20T09:00:00Z" },
  { id: "ea3", action: "Doctor Suspended", entityType: "doctor", entityName: "Dr. Ramesh Reddy", previousStatus: "active", updatedStatus: "suspended", modifiedBy: "Super Admin", modifiedAt: "2024-10-20T10:00:00Z", remarks: "Pending license verification" },
  { id: "ea4", action: "Admin Created", entityType: "admin", entityName: "Deepa Menon", previousStatus: undefined, updatedStatus: "active", modifiedBy: "Super Admin", modifiedAt: "2023-04-15T09:00:00Z" },
];
