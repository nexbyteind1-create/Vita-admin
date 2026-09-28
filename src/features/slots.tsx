"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Lock, Trash2, Unlock } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, useLoad } from "@/lib/data/hooks";
import { usePortal } from "@/lib/auth/session";

/**
 * Bookable times. Doctors: public.doctor_slots (one booking each; `is_booked`
 * with no appointment = blocked by admin). Labs/centres: public.centre_slots
 * (`capacity` places, `booked_count` taken). All times are IST, as in the app.
 */

type Kind = "doctor" | "centre";
const TZ = "Asia/Kolkata";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Owner {
  id: string;
  name: string;
}

interface Slot {
  id: string;
  starts_at: string;
  // doctor
  is_booked?: boolean;
  // centre
  capacity?: number;
  booked_count?: number;
}

const istDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const istTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
const addDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T00:00:00+05:30`);
  d.setUTCDate(d.getUTCDate() + n);
  return istDate(d);
};
const weekday = (ymd: string) => new Date(`${ymd}T12:00:00+05:30`).getUTCDay();

function GenerateModal({
  kind,
  owner,
  onClose,
  onDone,
}: {
  kind: Kind;
  owner: Owner;
  onClose: () => void;
  onDone: (count: number) => void;
}) {
  const today = istDate(new Date());
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDays(today, 13));
  const [days, setDays] = useState<number[]>(kind === "doctor" ? [1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5, 6]);
  const [start, setStart] = useState(kind === "doctor" ? "09:00" : "07:00");
  const [end, setEnd] = useState(kind === "doctor" ? "18:00" : "19:00");
  const [interval, setInterval] = useState(30);
  const [capacity, setCapacity] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const times = useMemo(() => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const out: string[] = [];
    for (let m = sh * 60 + sm; m <= eh * 60 + em && interval > 0; m += interval) {
      out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return out;
  }, [start, end, interval]);

  const dates = useMemo(() => {
    const out: string[] = [];
    for (let d = from; d <= to && out.length < 120; d = addDays(d, 1)) if (days.includes(weekday(d))) out.push(d);
    return out;
  }, [from, to, days]);

  const total = dates.length * times.length;

  const generate = async () => {
    setError("");
    if (!total) return setError("That range has no slots — check the dates, days and times.");
    setBusy(true);
    try {
      const now = Date.now();
      const rows = dates
        .flatMap(d => times.map(t => `${d}T${t}:00+05:30`))
        .filter(iso => new Date(iso).getTime() > now)
        .map(starts_at =>
          kind === "doctor"
            ? { doctor_id: owner.id, starts_at, is_booked: false }
            : { centre_id: owner.id, starts_at, capacity, booked_count: 0 },
        );
      const table = kind === "doctor" ? "doctor_slots" : "centre_slots";
      const conflict = kind === "doctor" ? "doctor_id,starts_at" : "centre_id,starts_at";
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase().from(table).upsert(rows.slice(i, i + 500), { onConflict: conflict, ignoreDuplicates: true });
        if (error) throw new Error(error.message);
      }
      await audit("generate", table, owner.id, { from, to, days, start, end, interval, capacity: kind === "centre" ? capacity : undefined });
      onDone(rows.length);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const label = "text-xs font-semibold text-slate-400 uppercase mb-2 block";
  return (
    <Modal open onClose={onClose} title={`Generate slots — ${owner.name}`} subtitle="Existing slots are kept; only missing times are added" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>From</label>
            <input type="date" className="vita-input" value={from} min={today} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className={label}>To</label>
            <input type="date" className="vita-input" value={to} min={from} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={label}>Days</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(cur => (cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm border",
                  days.includes(i) ? "bg-red-50 border-red-300 text-red-700" : "border-slate-200 text-slate-500",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>First slot</label>
            <input type="time" className="vita-input" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label className={label}>Last slot</label>
            <input type="time" className="vita-input" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div>
            <label className={label}>Every (min)</label>
            <input type="number" min={5} step={5} className="vita-input" value={interval} onChange={e => setInterval(Number(e.target.value))} />
          </div>
        </div>
        {kind === "centre" && (
          <div>
            <label className={label}>Bookings per slot</label>
            <input type="number" min={1} className="vita-input w-32" value={capacity} onChange={e => setCapacity(Math.max(1, Number(e.target.value)))} />
            <p className="text-xs text-slate-400 mt-1">How many patients the lab can take at once (e.g. parallel home collections).</p>
          </div>
        )}
        <p className="text-sm text-slate-600">
          {times.length} times × {dates.length} days = <strong>{total}</strong> slots (times already set up and past times are skipped). All times IST.
        </p>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button className="flex-1" loading={busy} onClick={generate}>
            Generate slots
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function SlotsPage({ kind }: { kind: Kind }) {
  const params = useSearchParams();
  const { base, portal, hospitalId, doctorId, centreId } = usePortal();
  const [chosenId, setOwnerId] = useState<string | null>(params.get(kind === "doctor" ? "doctor" : "centre"));
  const [day, setDay] = useState(istDate(new Date()));
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState("");

  const { data: owners } = useLoad<Owner[]>(async () => {
    let q =
      kind === "doctor"
        ? supabase().from("doctors").select("id, name:full_name").order("sort_order")
        : supabase().from("test_centres").select("id, name").order("sort_order");
    // Partners only manage their own doctors / centre.
    if (portal === "hospital") q = q.eq("hospital_id", hospitalId!);
    if (portal === "doctor") q = q.eq("id", doctorId!);
    if (portal === "centre") q = q.eq("id", centreId!);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data as Owner[];
  }, [kind, portal, hospitalId, doctorId, centreId]);

  // Until one is picked, show the first doctor / centre.
  const ownerId = (owners?.some(o => o.id === chosenId) ? chosenId : owners?.[0]?.id) ?? null;

  const owner = owners?.find(o => o.id === ownerId) ?? null;
  const table = kind === "doctor" ? "doctor_slots" : "centre_slots";
  const ownerColumn = kind === "doctor" ? "doctor_id" : "centre_id";

  const { data, error, loading, reload } = useLoad(async () => {
    if (!ownerId) return { slots: [] as Slot[], bookings: new Map<string, { id: string; status: string }[]>(), now: Date.now() };
    const { data, error } = await supabase()
      .from(table)
      .select(kind === "doctor" ? "id, starts_at, is_booked" : "id, starts_at, capacity, booked_count")
      .eq(ownerColumn, ownerId)
      .gte("starts_at", `${day}T00:00:00+05:30`)
      .lt("starts_at", `${addDays(day, 1)}T00:00:00+05:30`)
      .order("starts_at");
    if (error) throw new Error(error.message);
    const slots = data as unknown as Slot[];
    const bookings = new Map<string, { id: string; status: string }[]>();
    if (slots.length) {
      const slotColumn = kind === "doctor" ? "slot_id" : "centre_slot_id";
      const res = await supabase()
        .from("appointments")
        .select(`id, status, ${slotColumn}`)
        .in(slotColumn, slots.map(s => s.id));
      if (res.error) throw new Error(res.error.message);
      for (const a of res.data as unknown as Record<string, string>[]) {
        const key = a[slotColumn];
        bookings.set(key, [...(bookings.get(key) ?? []), { id: a.id, status: a.status }]);
      }
    }
    return { slots, bookings, now: Date.now() };
  }, [ownerId, day, kind]);

  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(istDate(new Date()), i)), []);

  const act = async (fn: () => PromiseLike<{ error: { message: string } | null }>, action: string, slotId: string) => {
    const { error } = await fn();
    if (error) return alert(error.message);
    await audit(action, table, slotId);
    reload();
  };

  const clearDay = async () => {
    if (!ownerId || !data) return;
    const open = data.slots.filter(s =>
      kind === "doctor" ? !s.is_booked : (s.booked_count ?? 0) === 0,
    );
    if (!open.length) return;
    if (!confirm(`Delete ${open.length} open slot(s) on ${day}? Booked slots are kept.`)) return;
    const { error } = await supabase().from(table).delete().in("id", open.map(s => s.id));
    if (error) return alert(error.message);
    await audit("clear_day", table, ownerId, { day, count: open.length });
    reload();
  };

  const title = portal === "doctor" || portal === "centre" ? "My slots" : kind === "doctor" ? "Doctor slots" : "Lab & centre slots";

  return (
    <div className="min-h-screen">
      <TopHeader
        title={title}
        subtitle="Bookable times in the app (IST). Block, free or generate slots."
        role={portal}
        actions={
          <Button icon={<CalendarPlus className="w-4 h-4" />} disabled={!owner} onClick={() => setGenerating(true)}>
            Generate slots
          </Button>
        }
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px]">
            <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">{kind === "doctor" ? "Doctor" : "Lab / centre"}</label>
            <select className="vita-input" value={ownerId ?? ""} onChange={e => setOwnerId(e.target.value)}>
              {owners?.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={clearDay}>
            Clear open slots this day
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map(d => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "flex-shrink-0 w-16 py-2 rounded-xl border text-center",
                d === day ? "bg-red-600 border-red-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-red-300",
              )}
            >
              <div className="text-xs opacity-80">{WEEKDAYS[weekday(d)]}</div>
              <div className="text-lg font-bold">{Number(d.slice(8))}</div>
            </button>
          ))}
        </div>

        {notice && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{notice}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : !data?.slots.length ? (
          <div className="glass-card p-8 text-center text-sm text-slate-500">
            No slots on this day. Use <strong>Generate slots</strong> to add some.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {data.slots.map(slot => {
              const bookings = (data.bookings.get(slot.id) ?? []).filter(b => b.status !== "cancelled");
              const past = new Date(slot.starts_at).getTime() < data.now;
              if (kind === "doctor") {
                const booked = bookings.length > 0;
                const blocked = !!slot.is_booked && !booked;
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "glass-card p-3 space-y-2",
                      booked && "border-emerald-300",
                      blocked && "border-slate-300 bg-slate-50",
                      past && "opacity-60",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{istTime(slot.starts_at)}</span>
                      <span className={cn("text-xs font-medium", booked ? "text-emerald-600" : blocked ? "text-slate-500" : "text-blue-600")}>
                        {booked ? "Booked" : blocked ? "Blocked" : "Open"}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {booked ? (
                        <Link href={`${base}/bookings?id=${bookings[0].id}`} className="text-xs text-red-600 hover:underline">
                          View booking
                        </Link>
                      ) : (
                        <>
                          <Button
                            size="xs"
                            variant="ghost"
                            icon={blocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            onClick={() => act(() => supabase().from(table).update({ is_booked: !blocked }).eq("id", slot.id), blocked ? "unblock" : "block", slot.id)}
                          >
                            {blocked ? "Free" : "Block"}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            icon={<Trash2 className="w-3 h-3" />}
                            onClick={() => act(() => supabase().from(table).delete().eq("id", slot.id), "delete", slot.id)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              }
              const taken = slot.booked_count ?? 0;
              const cap = slot.capacity ?? 1;
              return (
                <div key={slot.id} className={cn("glass-card p-3 space-y-2", taken >= cap && "border-emerald-300", past && "opacity-60")}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{istTime(slot.starts_at)}</span>
                    <span className={cn("text-xs font-medium", taken >= cap ? "text-emerald-600" : "text-blue-600")}>
                      {taken}/{cap} booked
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      disabled={cap <= Math.max(1, taken)}
                      onClick={() => act(() => supabase().from(table).update({ capacity: cap - 1 }).eq("id", slot.id), "capacity", slot.id)}
                    >
                      −
                    </Button>
                    <span className="text-xs text-slate-500">places</span>
                    <Button size="xs" variant="ghost" onClick={() => act(() => supabase().from(table).update({ capacity: cap + 1 }).eq("id", slot.id), "capacity", slot.id)}>
                      +
                    </Button>
                    {taken === 0 && (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={<Trash2 className="w-3 h-3" />}
                        onClick={() => act(() => supabase().from(table).delete().eq("id", slot.id), "delete", slot.id)}
                      />
                    )}
                  </div>
                  {bookings.length > 0 && (
                    <Link href={`${base}/bookings?slot=${slot.id}`} className="text-xs text-red-600 hover:underline">
                      View {bookings.length} booking{bookings.length > 1 ? "s" : ""}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {generating && owner && (
        <GenerateModal
          kind={kind}
          owner={owner}
          onClose={() => setGenerating(false)}
          onDone={count => {
            setGenerating(false);
            setNotice(`Added up to ${count} slots for ${owner.name}. Existing times were left as they were.`);
            reload();
          }}
        />
      )}
    </div>
  );
}
