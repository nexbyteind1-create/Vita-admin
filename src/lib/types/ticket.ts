export type TicketPriority = "P1" | "P2" | "P3";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPanel = "hospital" | "doctor" | "laboratory" | "diagnostic" | "medical_store" | "user";

export const PANEL_LABELS: Record<TicketPanel, string> = {
  hospital: "Hospital",
  doctor: "Doctor",
  laboratory: "Laboratory",
  diagnostic: "Diagnostic Center",
  medical_store: "Medical Store",
  user: "User / Patient",
};

export interface SupportTicket {
  id: string;
  memberName: string;
  email: string;
  contactNo: string;
  department: string;
  panel: TicketPanel;
  panelEntityName?: string;
  issueDescription: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface TicketPriorityChangeLog {
  id: string;
  ticketId: string;
  fromPriority: TicketPriority;
  toPriority: TicketPriority;
  changedBy: string;
  changedAt: string;
  remarks?: string;
}
