"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { AreaChartComponent } from "@/components/charts/AreaChart";
import { BarChartComponent } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { formatCurrency, formatNumber, formatCompact } from "@/lib/utils/format";
import {
  dashboardMetrics, userGrowthData, appointmentTrendData, membershipGrowthData,
  hospitalAppointmentsData, financialTrendData, membershipDistribution, topHospitals
} from "@/lib/mock-data/dashboard";
import {
  Users, Building2, Stethoscope, FlaskConical, Scan, Store, ShieldCheck,
  Activity, FileText, TrendingUp, Wallet, AlertCircle, Headphones,
  UserPlus, Calendar, Heart, BarChart2, Clock, Target, Zap
} from "lucide-react";

const sectionTitle = (title: string, subtitle?: string) => (
  <div className="mb-4">
    <h2 className="text-base font-bold text-slate-900">{title}</h2>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
);

export default function SuperAdminDashboard() {
  const m = dashboardMetrics;

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Enterprise Dashboard"
        subtitle="Platform-wide analytics & health overview"
        role="super-admin"
        actions={<ExportMenu reportName="Enterprise Dashboard Report" />}
      />

      <div className="p-4 sm:p-6 space-y-8 max-w-[1600px]">
        <FilterBar />

        {/* ── Healthcare Activity ── */}
        <section>
          {sectionTitle("Healthcare Activity", "Patient visits, appointments & clinical operations")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Patient Visits", value: m.totalPatientVisits, icon: <Heart className="w-full h-full" />, color: "blue" as const, delta: 12.4 },
              { label: "Unique Patients", value: m.uniquePatients, icon: <Users className="w-full h-full" />, color: "emerald" as const, delta: 8.2 },
              { label: "New Patients Today", value: m.newPatientsToday, icon: <UserPlus className="w-full h-full" />, color: "cyan" as const, delta: 5.1 },
              { label: "Total Appointments", value: m.totalAppointments, icon: <Calendar className="w-full h-full" />, color: "purple" as const, delta: 9.8 },
              { label: "Follow-up Rate", value: `${m.followUpCompletionRate}%`, icon: <Target className="w-full h-full" />, color: "amber" as const },
            ].map((card, i) => (
              <div key={i} className={`animate-fade-in-up stagger-${i + 1}`}>
                <StatCard {...card} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: "Completed Appointments", value: m.completedAppointments, icon: <Activity className="w-full h-full" />, color: "emerald" as const },
              { label: "Cancelled", value: m.cancelledAppointments, icon: <AlertCircle className="w-full h-full" />, color: "red" as const },
              { label: "No Shows", value: m.noShowAppointments, icon: <Clock className="w-full h-full" />, color: "amber" as const },
              { label: "Follow-ups", value: m.followUpAppointments, icon: <Calendar className="w-full h-full" />, color: "blue" as const },
            ].map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <AreaChartComponent data={userGrowthData} title="User Growth" valueLabel="Total Users" value2Label="New Users" color="#2563eb" color2="#10b981" formatValue={formatCompact} />
          </div>
          <div className="glass-card p-6">
            <AreaChartComponent data={appointmentTrendData} title="Appointment Trends" valueLabel="Total" value2Label="Cancelled" color="#6366f1" color2="#ef4444" />
          </div>
        </div>

        {/* ── Clinical Documents ── */}
        <section>
          {sectionTitle("Clinical Documents", "Document uploads across the platform")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Prescriptions", value: m.totalPrescriptions, icon: <FileText className="w-full h-full" />, color: "blue" as const },
              { label: "Lab Reports", value: m.totalLabReports, icon: <FlaskConical className="w-full h-full" />, color: "emerald" as const },
              { label: "Diagnostic Reports", value: m.totalDiagnosticReports, icon: <Scan className="w-full h-full" />, color: "purple" as const },
              { label: "Discharge Summaries", value: m.totalDischargeSummaries, icon: <FileText className="w-full h-full" />, color: "cyan" as const },
              { label: "Total Documents", value: m.totalMedicalDocuments, icon: <FileText className="w-full h-full" />, color: "amber" as const },
              { label: "Pending Lab Reports", value: m.pendingLabReports, icon: <AlertCircle className="w-full h-full" />, color: "red" as const },
            ].map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* ── Partner Activity ── */}
        <section>
          {sectionTitle("Partner Activity", "Registered healthcare providers & partners")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Hospitals", value: m.totalHospitals, subValue: `${m.activeHospitals} Active`, icon: <Building2 className="w-full h-full" />, color: "blue" as const, delta: 3.2 },
              { label: "Total Doctors", value: m.totalDoctors, subValue: `${m.activeDoctors} Active`, icon: <Stethoscope className="w-full h-full" />, color: "emerald" as const, delta: 5.8 },
              { label: "Laboratories", value: m.totalLaboratories, icon: <FlaskConical className="w-full h-full" />, color: "purple" as const },
              { label: "Diagnostic Centers", value: m.totalDiagnosticCenters, icon: <Scan className="w-full h-full" />, color: "cyan" as const },
              { label: "Medical Stores", value: m.totalMedicalStores, icon: <Store className="w-full h-full" />, color: "amber" as const },
              { label: "New Partners (Month)", value: m.newPartnersMonth, icon: <UserPlus className="w-full h-full" />, color: "emerald" as const, delta: 15.2 },
            ].map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 lg:col-span-2">
            <BarChartComponent data={hospitalAppointmentsData} title="Top Hospitals by Appointments" color="#2563eb" height={280} />
          </div>
          <div className="glass-card p-6">
            <DonutChart data={membershipDistribution} title="Membership Distribution" formatValue={formatNumber} />
          </div>
        </div>

        {/* ── Operations + Platform Health ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations */}
          <section>
            {sectionTitle("Operations Dashboard", "Pending items requiring attention")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Pending Follow-ups", value: m.pendingFollowUps, icon: <Clock className="w-full h-full" />, color: "amber" as const },
                { label: "Pending Lab Reports", value: m.pendingLabReports, icon: <FlaskConical className="w-full h-full" />, color: "red" as const },
                { label: "Pending Diagnostic", value: m.pendingDiagnosticReports, icon: <Scan className="w-full h-full" />, color: "red" as const },
                { label: "Open Support Tickets", value: m.openSupportTickets, icon: <Headphones className="w-full h-full" />, color: "amber" as const },
              ].map((card, i) => <StatCard key={i} {...card} />)}
            </div>
          </section>

          {/* Platform Health */}
          <section>
            {sectionTitle("Platform Health", "User activity & engagement metrics")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Daily Active Users", value: m.dau, icon: <Activity className="w-full h-full" />, color: "blue" as const, delta: 4.2 },
                { label: "Monthly Active Users", value: m.mau, icon: <Users className="w-full h-full" />, color: "emerald" as const, delta: 8.1 },
                { label: "User Retention Rate", value: `${m.userRetentionRate}%`, icon: <Target className="w-full h-full" />, color: "purple" as const },
                { label: "Returning Users", value: `${m.returningUserPercentage}%`, icon: <TrendingUp className="w-full h-full" />, color: "cyan" as const },
              ].map((card, i) => <StatCard key={i} {...card} />)}
            </div>
          </section>
        </div>

        {/* ── Membership Analytics ── */}
        <section>
          {sectionTitle("Membership Analytics", "Plan performance & member growth")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: "Active Memberships", value: m.activeMemberships, icon: <ShieldCheck className="w-full h-full" />, color: "blue" as const, delta: 6.8 },
              { label: "Silver Members", value: m.silverMembers, icon: <ShieldCheck className="w-full h-full" />, color: "silver" as const },
              { label: "Gold Members", value: m.goldMembers, icon: <ShieldCheck className="w-full h-full" />, color: "amber" as const },
              { label: "Platinum Members", value: m.platinumMembers, icon: <ShieldCheck className="w-full h-full" />, color: "purple" as const },
              { label: "Renewals", value: m.membershipRenewals, icon: <TrendingUp className="w-full h-full" />, color: "emerald" as const },
              { label: "Expiring This Month", value: m.membershipExpiryThisMonth, icon: <AlertCircle className="w-full h-full" />, color: "red" as const },
              { label: "Conversion Rate", value: `${m.membershipConversionRate}%`, icon: <Target className="w-full h-full" />, color: "cyan" as const },
            ].map((card, i) => <StatCard key={i} {...card} />)}
          </div>
        </section>

        {/* ── Charts Row 3 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <AreaChartComponent data={membershipGrowthData} title="Membership Growth" valueLabel="Total" value2Label="Active" color="#f59e0b" color2="#10b981" formatValue={formatCompact} />
          </div>
          <div className="glass-card p-6">
            <AreaChartComponent data={financialTrendData} title="Healthcare Spending Trends" valueLabel="Monthly Spend" color="#10b981" formatValue={(v) => `₹${(v/10000000).toFixed(1)}Cr`} />
          </div>
        </div>

        {/* ── Financial Analytics ── */}
        <section>
          {sectionTitle("Financial Analytics", "Revenue & billing across all categories")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Healthcare Spending", value: formatCurrency(m.totalHealthcareSpending), icon: <Wallet className="w-full h-full" />, color: "emerald" as const },
              { label: "Hospital Billing", value: formatCurrency(m.hospitalBilling), icon: <Building2 className="w-full h-full" />, color: "blue" as const },
              { label: "Lab Billing", value: formatCurrency(m.labBilling), icon: <FlaskConical className="w-full h-full" />, color: "purple" as const },
              { label: "Diagnostic Billing", value: formatCurrency(m.diagnosticBilling), icon: <Scan className="w-full h-full" />, color: "cyan" as const },
              { label: "Avg Spend/Patient", value: formatCurrency(m.avgSpendPerPatient), icon: <TrendingUp className="w-full h-full" />, color: "amber" as const },
            ].map((card, i) => <StatCard key={i} {...card} />)}
          </div>
        </section>

        {/* ── Top Hospitals Table ── */}
        <section>
          {sectionTitle("Top Performing Hospitals", "By appointment volume this month")}
          <div className="glass-card overflow-hidden">
            <table className="vita-table w-full">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>City</th>
                  <th className="text-right">Appointments</th>
                  <th className="text-right">Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topHospitals.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center text-xs font-bold text-red-600 border border-red-200">
                          {i + 1}
                        </div>
                        <span className="font-medium text-slate-900">{h.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{h.city}</td>
                    <td className="text-right font-semibold text-slate-900">{formatNumber(h.appointments)}</td>
                    <td className="text-right">
                      <span className="text-amber-600 font-semibold">⭐ {h.rating}</span>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
