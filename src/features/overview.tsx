"use client";
import Link from "next/link";
import { CalendarCheck, Clock, FlaskConical, IndianRupee, Receipt, Stethoscope, Users, UserPlus } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/lib/supabase/client";
import { useLoad } from "@/lib/data/hooks";
import { formatCurrency } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

/** Live numbers from the app's database, for the top of both dashboards. */
export function LiveOverview() {
  const { base } = usePortal();
  // The super admin console keeps these under Entity Management.
  const entity = (name: string) => (base === "/super-admin" ? `/super-admin/entities/${name}` : `/admin/${name}`);

  const { data, error } = useLoad(async () => {
    const count = async (table: string, filter?: (q: ReturnType<typeof head>) => ReturnType<typeof head>) => {
      let q = head(table);
      if (filter) q = filter(q);
      const { count, error } = await q;
      if (error) throw new Error(error.message);
      return count ?? 0;
    };
    const now = new Date().toISOString();
    const [users, upcoming, due, doctors, tests, bills, pendingAdmins, paid] = await Promise.all([
      count("users"),
      count("appointments", q => q.eq("status", "upcoming").gte("scheduled_at", now)),
      count("appointments", q => q.eq("status", "upcoming").lt("scheduled_at", now)),
      count("doctors", q => q.eq("is_active", true)),
      count("tests", q => q.eq("is_active", true)),
      count("bills"),
      count("admin_users", q => q.eq("is_active", false)),
      supabase().from("appointments").select("fee").eq("payment_status", "paid"),
    ]);
    if (paid.error) throw new Error(paid.error.message);
    const revenue = (paid.data as { fee: number | null }[]).reduce((s, r) => s + (r.fee ?? 0), 0);
    return { users, upcoming, due, doctors, tests, bills, pendingAdmins, revenue };
  });

  if (error) return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">Live data unavailable: {error}</p>;

  const v = (n: number | undefined) => (data ? n ?? 0 : "…");
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-sm font-bold text-slate-900">Live from the Vita app</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={entity("users")}>
          <StatCard label="App users" value={v(data?.users)} icon={<Users className="w-full h-full" />} color="blue" />
        </Link>
        <Link href={`${base}/bookings`}>
          <StatCard label="Upcoming bookings" value={v(data?.upcoming)} icon={<CalendarCheck className="w-full h-full" />} color="emerald" />
        </Link>
        <Link href={`${base}/bookings`}>
          <StatCard label="Awaiting completion" value={v(data?.due)} icon={<Clock className="w-full h-full" />} color="amber" subValue="Past visits still marked upcoming" />
        </Link>
        <StatCard label="Collected (paid bookings)" value={data ? formatCurrency(data.revenue) : "…"} icon={<IndianRupee className="w-full h-full" />} color="purple" />
        <Link href={entity("doctors")}>
          <StatCard label="Active doctors" value={v(data?.doctors)} icon={<Stethoscope className="w-full h-full" />} color="cyan" />
        </Link>
        <Link href={`${base}/catalog/tests`}>
          <StatCard label="Tests & scans" value={v(data?.tests)} icon={<FlaskConical className="w-full h-full" />} color="emerald" />
        </Link>
        <Link href={`${base}/bills`}>
          <StatCard label="Bills uploaded" value={v(data?.bills)} icon={<Receipt className="w-full h-full" />} color="blue" />
        </Link>
        {base === "/super-admin" && (
          <Link href="/super-admin/entities/admins">
            <StatCard label="Admins awaiting approval" value={v(data?.pendingAdmins)} icon={<UserPlus className="w-full h-full" />} color="red" />
          </Link>
        )}
      </div>
    </section>
  );
}

const head = (table: string) => supabase().from(table).select("*", { count: "exact", head: true });
