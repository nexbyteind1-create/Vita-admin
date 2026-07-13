"use client";
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { BulkUploadModal, type BulkUploadColumn } from "@/components/ui/BulkUploadModal";
import { tickets as initialTickets } from "@/lib/mock-data/tickets";
import { PANEL_LABELS } from "@/lib/types/ticket";
import type { SupportTicket, TicketPriority, TicketStatus, TicketPanel, TicketPriorityChangeLog } from "@/lib/types/ticket";
import { getResolutionInfo, PRIORITY_SLA_LABEL } from "@/lib/utils/tickets";
import { formatDateTime } from "@/lib/utils/format";
import { LifeBuoy, CheckCircle2, AlertTriangle, Eye, Gauge, PlayCircle, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const PANEL_OPTIONS: { label: string; value: TicketPanel }[] = (Object.keys(PANEL_LABELS) as TicketPanel[]).map(p => ({ label: PANEL_LABELS[p], value: p }));
const PRIORITY_OPTIONS: TicketPriority[] = ["P1", "P2", "P3"];
const STATUS_LABEL: Record<TicketStatus, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };

const templateColumns: BulkUploadColumn[] = [
  { key: "memberName", header: "Member Name", required: true, example: "Lokesh Kumar" },
  { key: "email", header: "Email", required: true, example: "lokesh@email.com" },
  { key: "contactNo", header: "Contact No", required: true, example: "9876543210" },
  { key: "department", header: "Department", required: true, example: "Billing" },
  { key: "panel", header: "Panel", required: true, example: "Hospital" },
  { key: "panelEntityName", header: "Hospital / Entity Name", example: "Apollo Hospitals" },
  { key: "issueDescription", header: "Issue Description", required: true, example: "Duplicate charge on appointment booking" },
  { key: "priority", header: "Priority (P1/P2/P3)", required: true, example: "P1" },
];

function parseTicketRow(raw: Record<string, string>): { data: SupportTicket } | { error: string } {
  const memberName = raw.memberName?.trim();
  const email = raw.email?.trim();
  const contactNo = raw.contactNo?.trim();
  const department = raw.department?.trim();
  const issueDescription = raw.issueDescription?.trim();

  if (!memberName) return { error: "Member Name is required." };
  if (!email) return { error: "Email is required." };
  if (!contactNo) return { error: "Contact No is required." };
  if (!department) return { error: "Department is required." };
  if (!issueDescription) return { error: "Issue Description is required." };

  const panelRaw = raw.panel?.trim().toLowerCase();
  const panel = (Object.keys(PANEL_LABELS) as TicketPanel[]).find(
    p => p === panelRaw?.replace(/\s+/g, "_") || PANEL_LABELS[p].toLowerCase() === panelRaw
  );
  if (!panel) return { error: `Panel must be one of: ${Object.values(PANEL_LABELS).join(", ")}.` };

  const priorityRaw = raw.priority?.trim().toUpperCase();
  if (priorityRaw !== "P1" && priorityRaw !== "P2" && priorityRaw !== "P3") {
    return { error: "Priority must be P1, P2, or P3." };
  }

  return {
    data: {
      id: `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      memberName, email, contactNo, department, panel,
      panelEntityName: raw.panelEntityName?.trim() || undefined,
      issueDescription,
      priority: priorityRaw,
      status: "open",
      createdAt: new Date().toISOString(),
    },
  };
}

const emptyNewTicket = { memberName: "", email: "", contactNo: "", department: "", panel: "hospital" as TicketPanel, panelEntityName: "", issueDescription: "", priority: "P3" as TicketPriority };

export function SupportTicketsView({ role }: { role: "admin" | "super-admin" }) {
  const [ticketList, setTicketList] = useState<SupportTicket[]>(initialTickets);
  const [priorityLogs, setPriorityLogs] = useState<TicketPriorityChangeLog[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [panelFilter, setPanelFilter] = useState("");

  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [priorityModal, setPriorityModal] = useState<SupportTicket | null>(null);
  const [newPriority, setNewPriority] = useState<TicketPriority>("P3");
  const [priorityRemarks, setPriorityRemarks] = useState("");
  const [bulkModal, setBulkModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState(emptyNewTicket);

  // `now` starts null so the server-rendered HTML and the client's first render match exactly;
  // it's only set after mount, so SLA countdowns never trigger a hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration clock sync, not derived state
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const resolutionInfoOf = (t: SupportTicket) => now === null ? null : getResolutionInfo(t, now);

  const filtered = ticketList.filter(t => {
    const q = query.toLowerCase();
    const matchesQuery = !q || t.memberName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.issueDescription.toLowerCase().includes(q) || (t.panelEntityName ?? "").toLowerCase().includes(q);
    return matchesQuery
      && (!statusFilter || t.status === statusFilter)
      && (!priorityFilter || t.priority === priorityFilter)
      && (!panelFilter || t.panel === panelFilter);
  });

  const openCount = ticketList.filter(t => t.status === "open").length;
  const resolvedCount = ticketList.filter(t => t.status === "resolved").length;
  const breachedCount = now === null ? 0 : ticketList.filter(t => t.status !== "resolved" && getResolutionInfo(t, now).overdue).length;

  const updateTicket = (id: string, patch: Partial<SupportTicket>) => {
    setTicketList(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const handleStartProgress = (t: SupportTicket) => updateTicket(t.id, { status: "in_progress" });
  const handleResolve = (t: SupportTicket) => updateTicket(t.id, { status: "resolved", resolvedAt: new Date().toISOString() });

  const openPriorityModal = (t: SupportTicket) => {
    setPriorityModal(t);
    setNewPriority(t.priority);
    setPriorityRemarks("");
  };

  const handleUpdatePriority = () => {
    if (!priorityModal) return;
    if (newPriority !== priorityModal.priority) {
      setPriorityLogs(prev => [{
        id: `pl-${Date.now()}`, ticketId: priorityModal.id, fromPriority: priorityModal.priority, toPriority: newPriority,
        changedBy: role === "super-admin" ? "Super Admin" : "Admin", changedAt: new Date().toISOString(), remarks: priorityRemarks || undefined,
      }, ...prev]);
      updateTicket(priorityModal.id, { priority: newPriority });
    }
    setPriorityModal(null);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.memberName || !newTicket.email || !newTicket.issueDescription) return;
    const ticket: SupportTicket = {
      id: `tk-${Date.now()}`,
      memberName: newTicket.memberName,
      email: newTicket.email,
      contactNo: newTicket.contactNo,
      department: newTicket.department || "General",
      panel: newTicket.panel,
      panelEntityName: newTicket.panelEntityName || undefined,
      issueDescription: newTicket.issueDescription,
      priority: newTicket.priority,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setTicketList(prev => [ticket, ...prev]);
    setCreateModal(false);
    setNewTicket(emptyNewTicket);
  };

  const columns: Column<SupportTicket>[] = [
    { key: "memberName", header: "Member", sortable: true, render: t => (
      <div>
        <div className="text-sm font-semibold text-slate-900">{t.memberName}</div>
        <div className="text-xs text-slate-500">{t.email}</div>
      </div>
    )},
    { key: "contactNo", header: "Contact No", render: t => <span className="text-sm text-slate-600">{t.contactNo}</span> },
    { key: "department", header: "Department", render: t => <span className="text-sm text-slate-600">{t.department}</span> },
    { key: "panel", header: "Panel", render: t => (
      <div>
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">{PANEL_LABELS[t.panel]}</span>
        {t.panelEntityName && <div className="text-xs text-slate-400 mt-1">{t.panelEntityName}</div>}
      </div>
    )},
    { key: "issueDescription", header: "Issue", width: "min-w-[220px]", render: t => <span className="text-sm text-slate-600 line-clamp-2">{t.issueDescription}</span> },
    { key: "priority", header: "Priority", align: "center", render: t => (
      <div className="flex flex-col items-center gap-1">
        <Badge variant={t.priority} label={t.priority} />
        <span className="text-[10px] text-slate-400">SLA {PRIORITY_SLA_LABEL[t.priority]}</span>
      </div>
    )},
    { key: "status", header: "Status", render: t => <Badge variant={t.status} label={STATUS_LABEL[t.status]} /> },
    { key: "resolutionSla", header: "Resolution / SLA", render: t => {
      const info = resolutionInfoOf(t);
      if (!info) return <span className="text-xs text-slate-400">—</span>;
      return <span className={cn("text-xs font-medium", info.overdue ? "text-red-600" : "text-emerald-600")}>{info.label}</span>;
    }},
  ];

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Support Tickets"
        subtitle="All support tickets across hospitals, doctors, labs, diagnostics, medical stores and users"
        role={role}
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Support Tickets Report" />
            <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => setBulkModal(true)}>Bulk Upload</Button>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModal(true)}>New Ticket</Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tickets" value={ticketList.length} icon={<LifeBuoy className="w-full h-full" />} color="blue" />
          <StatCard label="Open" value={openCount} icon={<AlertTriangle className="w-full h-full" />} color="amber" />
          <StatCard label="Resolved" value={resolvedCount} icon={<CheckCircle2 className="w-full h-full" />} color="emerald" />
          <StatCard label="SLA Breached" value={breachedCount} icon={<Gauge className="w-full h-full" />} color="red" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="P1 Tickets" subValue="1 hour SLA" value={ticketList.filter(t => t.priority === "P1").length} icon={<AlertTriangle className="w-full h-full" />} color="red" />
          <StatCard label="P2 Tickets" subValue="1 day SLA" value={ticketList.filter(t => t.priority === "P2").length} icon={<AlertTriangle className="w-full h-full" />} color="amber" />
          <StatCard label="P3 Tickets" subValue="2 day SLA" value={ticketList.filter(t => t.priority === "P3").length} icon={<AlertTriangle className="w-full h-full" />} color="blue" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search by member, email, or issue..." onSearch={setQuery} className="max-w-lg flex-1" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="vita-input py-2 text-xs max-w-[160px]">
            <option value="">All Statuses</option>
            {(Object.keys(STATUS_LABEL) as TicketStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="vita-input py-2 text-xs max-w-[140px]">
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={panelFilter} onChange={e => setPanelFilter(e.target.value)} className="vita-input py-2 text-xs max-w-[180px]">
            <option value="">All Panels</option>
            {PANEL_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <DataTable
          columns={[...columns, {
            key: "id", header: "Actions", render: t => (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />} onClick={() => setSelected(t)}>View</Button>
                <Button size="xs" variant="ghost" icon={<Gauge className="w-3 h-3" />} onClick={() => openPriorityModal(t)}>Priority</Button>
                {t.status === "open" && <Button size="xs" variant="warning" icon={<PlayCircle className="w-3 h-3" />} onClick={() => handleStartProgress(t)}>Start</Button>}
                {t.status !== "resolved" && <Button size="xs" variant="success" icon={<CheckCircle2 className="w-3 h-3" />} onClick={() => handleResolve(t)}>Resolve</Button>}
              </div>
            )
          }]}
          data={filtered}
          pageSize={8}
        />

        {/* View Modal */}
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.memberName} subtitle={selected?.email} size="lg">
          {selected && (
            <div className="space-y-4">
              {(() => {
                const info = resolutionInfoOf(selected);
                return (
                  <div className={cn("p-3 rounded-lg text-sm border", info?.overdue ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700")}>
                    {info?.label ?? "Calculating…"} — Priority {selected.priority} ({PRIORITY_SLA_LABEL[selected.priority]} SLA)
                  </div>
                );
              })()}
              {[
                ["Contact No", selected.contactNo],
                ["Department", selected.department],
                ["Panel", PANEL_LABELS[selected.panel]],
                ["Hospital / Entity", selected.panelEntityName ?? "—"],
                ["Status", STATUS_LABEL[selected.status]],
                ["Created", formatDateTime(selected.createdAt)],
                ["Resolved", selected.resolvedAt ? formatDateTime(selected.resolvedAt) : "—"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-200 text-sm"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900">{v}</span></div>
              ))}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Issue Description</div>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">{selected.issueDescription}</p>
              </div>
              {priorityLogs.filter(l => l.ticketId === selected.id).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Priority History</div>
                  <div className="space-y-2">
                    {priorityLogs.filter(l => l.ticketId === selected.id).map(l => (
                      <div key={l.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
                        {l.fromPriority} → {l.toPriority} by {l.changedBy} on {formatDateTime(l.changedAt)}{l.remarks && ` — ${l.remarks}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Change Priority Modal */}
        <Modal open={!!priorityModal} onClose={() => setPriorityModal(null)} title="Change Priority" subtitle={priorityModal?.memberName} size="sm">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Priority</label>
              <select value={newPriority} onChange={e => setNewPriority(e.target.value as TicketPriority)} className="vita-input">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p} — {PRIORITY_SLA_LABEL[p]} SLA</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Remarks (optional)</label>
              <textarea value={priorityRemarks} onChange={e => setPriorityRemarks(e.target.value)} className="vita-input" rows={3} placeholder="Reason for escalation/de-escalation" />
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button className="flex-1" onClick={handleUpdatePriority}>Update Priority</Button>
              <Button variant="secondary" onClick={() => setPriorityModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>

        {/* New Ticket Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Support Ticket" subtitle="Log a new issue raised from any panel" size="md">
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Member Name</label>
                <input value={newTicket.memberName} onChange={e => setNewTicket(t => ({ ...t, memberName: e.target.value }))} className="vita-input" placeholder="Lokesh Kumar" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Email</label>
                <input type="email" value={newTicket.email} onChange={e => setNewTicket(t => ({ ...t, email: e.target.value }))} className="vita-input" placeholder="lokesh@email.com" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Contact No</label>
                <input value={newTicket.contactNo} onChange={e => setNewTicket(t => ({ ...t, contactNo: e.target.value }))} className="vita-input" placeholder="9876543210" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Department</label>
                <input value={newTicket.department} onChange={e => setNewTicket(t => ({ ...t, department: e.target.value }))} className="vita-input" placeholder="Billing" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Panel</label>
                <select value={newTicket.panel} onChange={e => setNewTicket(t => ({ ...t, panel: e.target.value as TicketPanel }))} className="vita-input">
                  {PANEL_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Hospital / Entity Name</label>
                <input value={newTicket.panelEntityName} onChange={e => setNewTicket(t => ({ ...t, panelEntityName: e.target.value }))} className="vita-input" placeholder="Apollo Hospitals" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Priority</label>
              <select value={newTicket.priority} onChange={e => setNewTicket(t => ({ ...t, priority: e.target.value as TicketPriority }))} className="vita-input">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p} — {PRIORITY_SLA_LABEL[p]} SLA</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Issue Description</label>
              <textarea value={newTicket.issueDescription} onChange={e => setNewTicket(t => ({ ...t, issueDescription: e.target.value }))} className="vita-input" rows={3} required />
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button type="submit" className="flex-1">Create Ticket</Button>
              <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>

        <BulkUploadModal<SupportTicket>
          open={bulkModal}
          onClose={() => setBulkModal(false)}
          title="Bulk Upload Support Tickets"
          subtitle="Upload tickets in bulk for any hospital, doctor, lab, diagnostic center, medical store or user panel"
          templateColumns={templateColumns}
          templateFileName="support-tickets-template.xlsx"
          parseRow={(raw) => parseTicketRow(raw)}
          onConfirm={rows => setTicketList(prev => [...rows, ...prev])}
        />
      </div>
    </div>
  );
}
