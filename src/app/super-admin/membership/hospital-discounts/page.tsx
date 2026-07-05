"use client";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { hospitalDiscountConfigs } from "@/lib/mock-data/hospital-discounts";
import { formatDate } from "@/lib/utils/format";
import type { HospitalDiscountConfig } from "@/lib/types/membership";
import type { Column } from "@/components/ui/DataTable";
import { Percent, Building2, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

const columns: Column<HospitalDiscountConfig>[] = [
  { key: "hospitalName", header: "Hospital", sortable: true, render: c => <span className="text-sm font-semibold text-slate-900">{c.hospitalName}</span> },
  { key: "planName", header: "Plan", render: c => <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{c.planName}</span> },
  { key: "overrides", header: "Overridden Categories", render: c => <span className="text-slate-500 text-sm">{c.overrides.map(o => `${o.name.replace(" Discounts", "")} ${o.percentage}%`).join(", ")}</span> },
  { key: "currentVersion", header: "Version", align: "center", render: c => <span className="font-semibold text-slate-700">v{c.currentVersion}</span> },
  { key: "updatedAt", header: "Last Updated", render: c => <span className="text-slate-500 text-sm">{formatDate(c.updatedAt)}</span> },
];

export default function HospitalDiscountsPage() {
  return (
    <div className="min-h-screen">
      <TopHeader
        title="Hospital Discount Overrides"
        subtitle="Configure hospital-specific discount percentages that override a plan's default rates"
        role="super-admin"
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Hospitals with Overrides" value={hospitalDiscountConfigs.length} icon={<Building2 className="w-full h-full" />} color="blue" />
          <StatCard label="Total Overridden Categories" value={hospitalDiscountConfigs.reduce((s, c) => s + c.overrides.length, 0)} icon={<Percent className="w-full h-full" />} color="emerald" />
          <StatCard label="Total Config Versions" value={hospitalDiscountConfigs.reduce((s, c) => s + c.currentVersion, 0)} icon={<RefreshCw className="w-full h-full" />} color="purple" />
        </div>

        <div className="glass-card p-4 text-xs text-slate-500">
          Every hospital starts on a plan&apos;s default discount percentages. Use &quot;Configure&quot; below, or the &quot;Discounts&quot; action on a hospital&apos;s row in Entity Management, to set a hospital-specific rate once — it can be updated any time afterward and only affects that hospital under that plan.
        </div>

        <DataTable
          columns={[...columns, {
            key: "id", header: "Actions", render: c => (
              <Link href={`/super-admin/membership/hospital-discounts/${c.hospitalId}?planId=${c.planId}`}>
                <Button size="xs" variant="ghost" icon={<Eye className="w-3 h-3" />}>Configure</Button>
              </Link>
            )
          }]}
          data={hospitalDiscountConfigs}
          pageSize={10}
        />
      </div>
    </div>
  );
}
