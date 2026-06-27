"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { BarChartComponent } from "@/components/charts/BarChart";
import { entityStatusData } from "@/lib/mock-data/dashboard";
import { users, hospitals, doctors, laboratories, diagnosticCenters, medicalStores, admins } from "@/lib/mock-data/entities";
import { AuditLogRow } from "@/components/ui/AuditLogRow";
import { entityAuditLogs } from "@/lib/mock-data/entities";
import { Users, Building2, Stethoscope, FlaskConical, Scan, Store, UserCog, CheckCircle, Pause, Ban } from "lucide-react";
import Link from "next/link";

const entitySummary = [
  { label: "Total Users", value: users.length, active: users.filter(u => u.status === "active").length, suspended: users.filter(u => u.status === "suspended").length, blocked: users.filter(u => u.status === "blocked").length, icon: <Users className="w-full h-full" />, href: "/super-admin/entities/users", color: "blue" as const },
  { label: "Total Hospitals", value: hospitals.length, active: hospitals.filter(h => h.status === "active").length, suspended: hospitals.filter(h => h.status === "suspended").length, blocked: 0, icon: <Building2 className="w-full h-full" />, href: "/super-admin/entities/hospitals", color: "emerald" as const },
  { label: "Total Doctors", value: doctors.length, active: doctors.filter(d => d.status === "active").length, suspended: doctors.filter(d => d.status === "suspended").length, blocked: 0, icon: <Stethoscope className="w-full h-full" />, href: "/super-admin/entities/doctors", color: "purple" as const },
  { label: "Laboratories", value: laboratories.length, active: laboratories.filter(l => l.status === "active").length, suspended: 0, blocked: 0, icon: <FlaskConical className="w-full h-full" />, href: "/super-admin/entities/laboratories", color: "cyan" as const },
  { label: "Diagnostic Centers", value: diagnosticCenters.length, active: diagnosticCenters.filter(d => d.status === "active").length, suspended: 0, blocked: 0, icon: <Scan className="w-full h-full" />, href: "/super-admin/entities/diagnostics", color: "amber" as const },
  { label: "Medical Stores", value: medicalStores.length, active: medicalStores.filter(m => m.status === "active").length, suspended: medicalStores.filter(m => m.status === "suspended").length, blocked: 0, icon: <Store className="w-full h-full" />, href: "/super-admin/entities/medical-stores", color: "blue" as const },
  { label: "Admins", value: admins.length, active: admins.filter(a => a.status === "active").length, suspended: admins.filter(a => a.status === "suspended").length, blocked: 0, icon: <UserCog className="w-full h-full" />, href: "/super-admin/entities/admins", color: "purple" as const },
];

export default function EntityDashboardPage() {
  return (
    <div className="min-h-screen">
      <TopHeader title="Entity Management Dashboard" subtitle="Platform-wide entity overview and quick access" role="super-admin" />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        {/* Entity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {entitySummary.map(e => (
            <Link key={e.label} href={e.href}>
              <StatCard label={e.label} value={e.value} icon={e.icon} color={e.color} className="hover:border-red-300 transition-all" />
            </Link>
          ))}
        </div>

        {/* Detailed Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entitySummary.map(e => (
            <Link key={e.label} href={e.href}>
              <div className="glass-card p-5 cursor-pointer hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600 w-9 h-9">{e.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{e.label}</div>
                    <div className="text-xs text-slate-500">Total: {e.value}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{e.active}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-600">{e.suspended}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Pause className="w-3 h-3" />Suspended</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{e.blocked}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Ban className="w-3 h-3" />Blocked</div>
                  </div>
                </div>
                <div className="vita-progress mt-3">
                  <div className="vita-progress-fill bg-emerald-500" style={{ width: `${(e.active / e.value) * 100}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6">
          <BarChartComponent data={entityStatusData} title="Entity Count by Type" color="#2563eb" />
        </div>

        {/* Recent Audit */}
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent Entity Actions</h2>
          <div className="glass-card px-6">
            {entityAuditLogs.map(log => (
              <AuditLogRow key={log.id} id={log.id} action={log.action} entity={log.entityName} previousStatus={log.previousStatus} updatedStatus={log.updatedStatus} modifiedBy={log.modifiedBy} modifiedAt={log.modifiedAt} remarks={log.remarks} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
