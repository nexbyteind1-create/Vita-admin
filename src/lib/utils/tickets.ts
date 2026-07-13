import type { SupportTicket, TicketPriority } from "@/lib/types/ticket";

export const SLA_HOURS: Record<TicketPriority, number> = { P1: 1, P2: 24, P3: 48 };
export const PRIORITY_SLA_LABEL: Record<TicketPriority, string> = { P1: "1 hour", P2: "1 day", P3: "2 days" };

export function getSlaDeadline(createdAt: string, priority: TicketPriority): Date {
  return new Date(new Date(createdAt).getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(Math.abs(ms) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function getResolutionInfo(ticket: SupportTicket, now: number): { overdue: boolean; label: string } {
  const deadline = getSlaDeadline(ticket.createdAt, ticket.priority);

  if (ticket.status === "resolved" && ticket.resolvedAt) {
    const resolvedAt = new Date(ticket.resolvedAt);
    const diff = resolvedAt.getTime() - deadline.getTime();
    return diff > 0
      ? { overdue: true, label: `Resolved ${formatDuration(diff)} late` }
      : { overdue: false, label: `Resolved ${formatDuration(diff)} within SLA` };
  }

  const diff = deadline.getTime() - now;
  return diff < 0
    ? { overdue: true, label: `Overdue by ${formatDuration(diff)}` }
    : { overdue: false, label: `${formatDuration(diff)} remaining` };
}
