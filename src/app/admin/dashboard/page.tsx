"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { AreaChartComponent } from "@/components/charts/AreaChart";
import { BarChartComponent } from "@/components/charts/BarChart";
import { dashboardMetrics, userGrowthData, appointmentTrendData } from "@/lib/mock-data/dashboard";
import { formatNumber } from "@/lib/utils/format";
import {
  Users, Building2, Stethoscope, Store, FlaskConical, Scan,
  ShieldCheck, Ticket, FileText, Activity, Calendar, TrendingUp, AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
  const m = dashboardMetrics;

  const cards = [
    { section: "Users", items: [
      { label: "Total Registered Users", value: m.totalUsers, icon: <Users className="w-full h-full" />, color: "blue" as const, delta: 8.4 },
      { label: "Active Users", value: m.activeUsers, icon: <Activity className="w-full h-full" />, color: "emerald" as const },
      { label: "New Users Today", value: m.newUsersToday, icon: <Users className="w-full h-full" />, color: "cyan" as const },
      { label: "New Users This Month", value: m.newUsersMonth, icon: <TrendingUp className="w-full h-full" />, color: "purple" as const },
    ]},
    { section: "Hospitals", items: [
      { label: "Total Hospitals", value: m.totalHospitals, icon: <Building2 className="w-full h-full" />, color: "blue" as const },
      { label: "Active Hospitals", value: m.activeHospitals, icon: <Building2 className="w-full h-full" />, color: "emerald" as const },
      { label: "Total Doctors", value: m.totalDoctors, icon: <Stethoscope className="w-full h-full" />, color: "purple" as const },
      { label: "Active Doctors", value: m.activeDoctors, icon: <Stethoscope className="w-full h-full" />, color: "cyan" as const },
    ]},
    { section: "Appointments", items: [
      { label: "Total Appointments", value: m.totalAppointments, icon: <Calendar className="w-full h-full" />, color: "blue" as const },
      { label: "Completed", value: m.completedAppointments, icon: <Activity className="w-full h-full" />, color: "emerald" as const },
      { label: "Cancelled", value: m.cancelledAppointments, icon: <AlertCircle className="w-full h-full" />, color: "red" as const },
      { label: "Follow-ups", value: m.followUpAppointments, icon: <Calendar className="w-full h-full" />, color: "amber" as const },
    ]},
    { section: "Memberships", items: [
      { label: "Active Memberships", value: m.activeMemberships, icon: <ShieldCheck className="w-full h-full" />, color: "blue" as const },
      { label: "Silver", value: m.silverMembers, icon: <ShieldCheck className="w-full h-full" />, color: "silver" as const },
      { label: "Gold", value: m.goldMembers, icon: <ShieldCheck className="w-full h-full" />, color: "amber" as const },
      { label: "Platinum", value: m.platinumMembers, icon: <ShieldCheck className="w-full h-full" />, color: "purple" as const },
    ]},
    { section: "Support & Documents", items: [
      { label: "Total Support Tickets", value: m.openSupportTickets + m.closedSupportTickets, icon: <Ticket className="w-full h-full" />, color: "blue" as const },
      { label: "Open Tickets", value: m.openSupportTickets, icon: <AlertCircle className="w-full h-full" />, color: "amber" as const },
      { label: "Prescriptions Uploaded", value: m.totalPrescriptions, icon: <FileText className="w-full h-full" />, color: "emerald" as const },
      { label: "Lab Reports Uploaded", value: m.totalLabReports, icon: <FlaskConical className="w-full h-full" />, color: "purple" as const },
    ]},
  ];

  return (
    <div className="min-h-screen">
      <TopHeader title="Admin Dashboard" subtitle="Platform overview & key metrics" role="admin" actions={<ExportMenu reportName="Admin Dashboard" />} />
      <div className="p-6 space-y-8 max-w-[1600px]">
        <FilterBar filters={[
          { key: "hospital", label: "All Hospitals", value: "", options: [{ label: "Apollo", value: "apollo" }, { label: "Fortis", value: "fortis" }] },
          { key: "doctor", label: "All Doctors", value: "", options: [] },
        ]} />

        {cards.map(section => (
          <section key={section.section}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{section.section}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.items.map((card, i) => <StatCard key={i} {...card} />)}
            </div>
          </section>
        ))}

        {/* Charts */}
        <section>
          <h2 className="text-base font-bold text-white mb-4">Analytics Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <AreaChartComponent data={userGrowthData} title="User Growth Trend" valueLabel="Total Users" value2Label="New Users" color="#2563eb" color2="#10b981" />
            </div>
            <div className="glass-card p-6">
              <AreaChartComponent data={appointmentTrendData} title="Appointment Trends" valueLabel="Total" value2Label="Cancelled" color="#6366f1" color2="#ef4444" />
            </div>
          </div>
        </section>
        <div className="h-8" />
      </div>
    </div>
  );
}
