"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AreaChartComponent } from "@/components/charts/AreaChart";
import { membershipPlans, membershipAnalytics } from "@/lib/mock-data/membership";
import { membershipGrowthData } from "@/lib/mock-data/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { ShieldCheck, TrendingUp, AlertCircle, RefreshCw, XCircle, Plus, Edit, Archive, Power, Users } from "lucide-react";
import Link from "next/link";

const tierColors = { silver: "border-slate-400/30 bg-slate-400/5", gold: "border-amber-400/30 bg-amber-400/5", platinum: "border-purple-400/30 bg-purple-400/5", custom: "border-blue-400/30 bg-blue-400/5" };
const tierGradients = { silver: "from-slate-400 to-slate-600", gold: "from-amber-400 to-yellow-600", platinum: "from-purple-400 to-indigo-600", custom: "from-blue-400 to-blue-600" };

export default function MembershipPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<typeof membershipPlans[0] | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; planId: string } | null>(null);

  const totalMembers = membershipPlans.reduce((s, p) => s + p.memberCount, 0);
  const totalRevenue = membershipAnalytics.reduce((s, a) => s + a.revenue, 0);

  return (
    <div className="min-h-screen">
      <TopHeader title="Membership Plans" subtitle="Configure and manage all membership plans" role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <ExportMenu reportName="Membership Plans" />
            <Link href="/super-admin/membership/plans/new">
              <Button icon={<Plus className="w-4 h-4" />}>Create Plan</Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Members" value={totalMembers} icon={<Users className="w-full h-full" />} color="blue" delta={6.8} />
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp className="w-full h-full" />} color="emerald" />
          <StatCard label="Active Plans" value={membershipPlans.filter(p => p.status === "active").length} icon={<ShieldCheck className="w-full h-full" />} color="purple" />
          <StatCard label="Plan Versions" value={membershipPlans.reduce((s, p) => s + p.currentVersion, 0)} icon={<RefreshCw className="w-full h-full" />} color="cyan" />
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {membershipPlans.map(plan => {
            const analytics = membershipAnalytics.find(a => a.tier === plan.tier);
            return (
              <div key={plan.id} className={`glass-card p-6 border ${tierColors[plan.tier]} relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 transition-transform`} onClick={() => setSelectedPlan(plan)}>
                {/* Gradient accent top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierGradients[plan.tier]} rounded-t-xl`} />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 bg-gradient-to-r ${tierGradients[plan.tier]} bg-clip-text text-transparent`}>
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-slate-400 text-sm">/year</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={plan.status === "active" ? "active" : plan.status === "inactive" ? "inactive" : "archived"} />
                    <span className="text-xs font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/10">v{plan.currentVersion}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { label: "Members", value: formatNumber(plan.memberCount), icon: <Users className="w-3 h-3" /> },
                    { label: "Family Members", value: `Up to ${plan.maxFamilyMembers}` },
                    { label: "Validity", value: `${plan.validityDays} days` },
                    { label: "Renewal Rate", value: `${analytics?.renewalRate ?? 0}%` },
                    { label: "Conversion Rate", value: `${analytics?.conversionRate ?? 0}%` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Feature count */}
                <div className="mb-4 py-3 border-y border-[#1f2d45]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{plan.features.filter(f => f.enabled).length} features enabled</span>
                    <span className="text-slate-500">{plan.features.length} total features</span>
                  </div>
                  <div className="vita-progress mt-1.5">
                    <div className={`vita-progress-fill bg-gradient-to-r ${tierGradients[plan.tier]}`} style={{ width: `${(plan.features.filter(f => f.enabled).length / plan.features.length) * 100}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                  <Link href={`/super-admin/membership/plans/${plan.id}/configure`}>
                    <Button variant="outline" size="sm" icon={<Edit className="w-3.5 h-3.5" />} className="w-full">Configure</Button>
                  </Link>
                  <Button variant={plan.status === "active" ? "warning" : "success"} size="sm" icon={<Power className="w-3.5 h-3.5" />} onClick={() => setConfirmAction({ action: plan.status === "active" ? "deactivate" : "activate", planId: plan.id })}>
                    {plan.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Archive className="w-3.5 h-3.5" />} onClick={() => setConfirmAction({ action: "archive", planId: plan.id })}>Archive</Button>
                  <Link href={`/super-admin/membership/plans/${plan.id}`}>
                    <Button variant="secondary" size="sm" className="w-full">View History</Button>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Add New Plan */}
          <Link href="/super-admin/membership/plans/new">
            <div className="glass-card p-6 border border-dashed border-[#1f2d45] flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-400 group-hover:text-blue-400 transition-colors">Add Custom Plan</p>
              <p className="text-xs text-slate-600 mt-1">Create a new membership tier</p>
            </div>
          </Link>
        </div>

        {/* Growth Chart */}
        <div className="glass-card p-6">
          <AreaChartComponent data={membershipGrowthData} title="Membership Growth" valueLabel="Total Members" value2Label="Active Members" color="#f59e0b" color2="#10b981" />
        </div>

        {/* Plan Detail Modal */}
        <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={`${selectedPlan?.name} Plan Details`} subtitle={`Version ${selectedPlan?.currentVersion}`} size="lg">
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{formatNumber(selectedPlan.memberCount)}</div>
                  <div className="text-xs text-slate-500 mt-1">Active Members</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(selectedPlan.price)}</div>
                  <div className="text-xs text-slate-500 mt-1">Annual Price</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-white">v{selectedPlan.currentVersion}</div>
                  <div className="text-xs text-slate-500 mt-1">Current Version</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Version History</h3>
              <div className="space-y-3">
                {selectedPlan.versions.map(v => (
                  <div key={v.version} className="flex items-start gap-3 p-3 bg-[#0d1526] rounded-lg border border-[#1f2d45]">
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">v{v.version}</span>
                    <div>
                      <p className="text-sm text-slate-200">{v.changes}</p>
                      <p className="text-xs text-slate-500 mt-0.5">By {v.createdBy} · {v.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-slate-300">Enabled Features ({selectedPlan.features.filter(f => f.enabled).length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedPlan.features.filter(f => f.enabled).map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 bg-[#0d1526] rounded-lg border border-[#1f2d45] text-xs">
                    <span className="text-slate-300">{f.name}</span>
                    <span className="text-slate-500">{f.quantity ?? f.percentage ? (f.quantity ? `×${f.quantity}` : `${f.percentage}%`) : "Enabled"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4 border-t border-[#1f2d45]">
            <Link href={`/super-admin/membership/plans/${selectedPlan?.id}/configure`} className="flex-1">
              <Button className="w-full" icon={<Edit className="w-4 h-4" />}>Configure Features</Button>
            </Link>
            <Button variant="secondary" onClick={() => setSelectedPlan(null)}>Close</Button>
          </div>
        </Modal>

        {/* Confirm Modal */}
        <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirm Action" size="sm">
          <p className="text-slate-300 text-sm">Are you sure you want to {confirmAction?.action} this plan? Existing members will not be affected until renewal.</p>
          <div className="flex gap-2 mt-4">
            <Button variant={confirmAction?.action === "archive" ? "danger" : "primary"} className="flex-1" onClick={() => setConfirmAction(null)}>
              Confirm {confirmAction?.action}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
