"use client";
import Link from "next/link";
import { CalendarCheck, CalendarClock, CheckCircle, Clock, IndianRupee, Star } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { StatCard } from "@/components/ui/StatCard";
import { supabase } from "@/lib/supabase/client";
import { useLoad } from "@/lib/data/hooks";
import { ROLE_LABEL, usePortal, useSession } from "@/lib/auth/session";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

/**
 * Home for hospital, doctor and lab / diagnostic centre accounts: their own
 * bookings, open slots and rating. RLS limits appointments to the partner.
 */

interface Appt {
  id: string;
  booking_code: string;
  title: string;
  status: "upcoming" | "completed" | "cancelled";
  scheduled_at: string;
  fee: number | null;
  payment_status: "unpaid" | "paid";
  doctor: { full_name: string } | null;
  test: { name: string } | null;
}

export default function PartnerDashboard() {
  const { admin } = useSession();
  const { portal, base, hospitalId, doctorId, centreId } = usePortal();

  const { data, error } = useLoad(async () => {
    // Who this account runs, and its rating.
    const profile =
      portal === "hospital"
        ? supabase().from("hospitals").select("name, rating").eq("id", hospitalId!).single()
        : portal === "doctor"
          ? supabase().from("doctors").select("name:full_name, rating").eq("id", doctorId!).single()
          : supabase().from("test_centres").select("name, rating").eq("id", centreId!).single();

    let appts = supabase()
      .from("appointments")
      .select("id, booking_code, title, status, scheduled_at, fee, payment_status, doctor:doctors(full_name), test:tests(name)");
    if (portal === "hospital") appts = appts.not("doctor_id", "is", null);
    if (portal === "doctor") appts = appts.eq("doctor_id", doctorId!);
    if (portal === "centre") appts = appts.eq("centre_id", centreId!);

    const now = new Date();
    const week = new Date(now.getTime() + 7 * 864e5).toISOString();
    let slots;
    if (portal === "centre") {
      slots = supabase().from("centre_slots").select("capacity, booked_count").eq("centre_id", centreId!).gte("starts_at", now.toISOString()).lt("starts_at", week);
    } else {
      let doctors = supabase().from("doctors").select("id");
      doctors = portal === "hospital" ? doctors.eq("hospital_id", hospitalId!) : doctors.eq("id", doctorId!);
      const ids = await doctors;
      if (ids.error) throw new Error(ids.error.message);
      slots = supabase()
        .from("doctor_slots")
        .select("is_booked")
        .in("doctor_id", (ids.data as { id: string }[]).map(d => d.id))
        .gte("starts_at", now.toISOString())
        .lt("starts_at", week);
    }

    const [p, a, s] = await Promise.all([profile, appts.order("scheduled_at", { ascending: true }).limit(2000), slots]);
    if (p.error) throw new Error(p.error.message);
    if (a.error) throw new Error(a.error.message);
    if (s.error) throw new Error(s.error.message);

    const rows = a.data as unknown as Appt[];
    const nowIso = now.toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const openSlots = (s.data as { is_booked?: boolean; capacity?: number; booked_count?: number }[]).reduce(
      (n, slot) => n + (portal === "centre" ? Math.max((slot.capacity ?? 0) - (slot.booked_count ?? 0), 0) : slot.is_booked ? 0 : 1),
      0,
    );
    return {
      name: (p.data as { name: string }).name,
      rating: (p.data as { rating: number | null }).rating,
      upcoming: rows.filter(r => r.status === "upcoming" && r.scheduled_at >= nowIso),
      due: rows.filter(r => r.status === "upcoming" && r.scheduled_at < nowIso).length,
      completedMonth: rows.filter(r => r.status === "completed" && r.scheduled_at >= monthStart).length,
      collected: rows.filter(r => r.payment_status === "paid").reduce((sum, r) => sum + (r.fee ?? 0), 0),
      openSlots,
    };
  }, [portal, hospitalId, doctorId, centreId]);

  const v = (n: number | undefined) => (data ? (n ?? 0) : "…");
  const slotsHref = portal === "centre" ? `${base}/schedules/centre-slots` : `${base}/schedules/doctor-slots`;

  return (
    <div className="min-h-screen">
      <TopHeader
        title={data ? data.name : "Dashboard"}
        subtitle={`${admin ? ROLE_LABEL[admin.role] : ""} dashboard — your bookings, slots and ratings`}
        role={portal}
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <Link href={`${base}/bookings`}>
            <StatCard label="Upcoming bookings" value={v(data?.upcoming.length)} icon={<CalendarCheck className="w-full h-full" />} color="blue" />
          </Link>
          <Link href={`${base}/bookings`}>
            <StatCard label="Awaiting completion" value={v(data?.due)} icon={<Clock className="w-full h-full" />} color="amber" subValue="Past visits still marked upcoming" />
          </Link>
          <StatCard label="Completed this month" value={v(data?.completedMonth)} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
          <StatCard label="Collected (paid)" value={data ? formatCurrency(data.collected) : "…"} icon={<IndianRupee className="w-full h-full" />} color="purple" />
          <Link href={slotsHref}>
            <StatCard label="Open slots, next 7 days" value={v(data?.openSlots)} icon={<CalendarClock className="w-full h-full" />} color="cyan" />
          </Link>
          <Link href={`${base}/reviews`}>
            <StatCard
              label="Rating"
              value={data ? (data.rating != null ? `★ ${Number(data.rating).toFixed(1)}` : "—") : "…"}
              icon={<Star className="w-full h-full" />}
              color="amber"
            />
          </Link>
        </div>

        <section className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Next bookings</h2>
            <Link href={`${base}/bookings`} className="text-xs text-red-600 hover:underline">
              View all
            </Link>
          </div>
          {!data ? (
            <p className="text-sm text-slate-400">{error ? "—" : "Loading…"}</p>
          ) : data.upcoming.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming bookings.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.upcoming.slice(0, 8).map(b => (
                <li key={b.id}>
                  <Link href={`${base}/bookings?id=${b.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{b.doctor?.full_name ?? b.test?.name ?? b.title}</div>
                      <div className="text-xs text-slate-500">{b.booking_code}</div>
                    </div>
                    <div className="text-sm text-slate-600 flex-shrink-0">{formatDateTime(b.scheduled_at)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
