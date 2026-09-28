"use client";
import { useMemo, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import { audit, useLoad } from "@/lib/data/hooks";
import { formatDate } from "@/lib/utils/format";
import { usePortal } from "@/lib/auth/session";

/**
 * Patient reviews: doctors (doctor_reviews, shown on the doctor profile) and
 * labs/centres (centre_reviews). Removing a review hides it from the app; the
 * rating/review count on the profile are edited on the doctor or centre.
 */

interface Review {
  id: string;
  source: "doctor" | "centre";
  subject: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
}

export default function ReviewsPage() {
  const { portal: role, isPartner, hospitalId, doctorId, centreId } = usePortal();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | "doctor" | "centre">("all");

  const { data, loading, error, reload } = useLoad(async () => {
    const none = Promise.resolve({ data: [], error: null });
    // Reviews are public, so partners narrow to their own doctors / centre here.
    let doctorQuery = supabase().from("doctor_reviews").select(
      `id, author_name, rating, body, created_at, doctor:doctors${role === "hospital" ? "!inner" : ""}(full_name, hospital_id)`,
    );
    if (role === "hospital") doctorQuery = doctorQuery.eq("doctor.hospital_id", hospitalId!);
    if (role === "doctor") doctorQuery = doctorQuery.eq("doctor_id", doctorId!);
    let centreQuery = supabase().from("centre_reviews").select("id, author_name, rating, body, created_at, centre:test_centres(name)");
    if (role === "centre") centreQuery = centreQuery.eq("centre_id", centreId!);
    const [doctor, centre] = await Promise.all([
      role === "centre" ? none : doctorQuery.order("created_at", { ascending: false }),
      role === "hospital" || role === "doctor" ? none : centreQuery.order("created_at", { ascending: false }),
    ]);
    if (doctor.error) throw new Error(doctor.error.message);
    if (centre.error) throw new Error(centre.error.message);
    const rows: Review[] = [
      ...(doctor.data as unknown as (Omit<Review, "source" | "subject"> & { doctor: { full_name: string } | null })[]).map(r => ({
        ...r,
        source: "doctor" as const,
        subject: r.doctor?.full_name ?? "—",
      })),
      ...(centre.data as unknown as (Omit<Review, "source" | "subject"> & { centre: { name: string } | null })[]).map(r => ({
        ...r,
        source: "centre" as const,
        subject: r.centre?.name ?? "—",
      })),
    ];
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [role, hospitalId, doctorId, centreId]);

  const rows = useMemo(() => data ?? [], [data]);
  const filtered = rows.filter(r => {
    if (source !== "all" && r.source !== source) return false;
    const term = query.trim().toLowerCase();
    return !term || [r.subject, r.author_name, r.body].some(v => v.toLowerCase().includes(term));
  });

  const remove = async (r: Review) => {
    if (!confirm(`Remove ${r.author_name}'s review of ${r.subject}?`)) return;
    const table = r.source === "doctor" ? "doctor_reviews" : "centre_reviews";
    const { error } = await supabase().from(table).delete().eq("id", r.id);
    if (error) return alert(error.message);
    await audit("delete", table, r.id);
    reload();
  };

  const columns: Column<Review>[] = [
    {
      key: "subject",
      header: "About",
      render: r => (
        <div>
          <div className="text-sm font-semibold text-slate-900">{r.subject}</div>
          <div className="text-xs text-slate-500">{r.source === "doctor" ? "Doctor" : "Lab / centre"}</div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: r => (
        <span className="inline-flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={cn("w-3.5 h-3.5", n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          ))}
        </span>
      ),
    },
    { key: "body", header: "Review", render: r => <span className="text-sm text-slate-600 line-clamp-2 max-w-md block">{r.body || <em className="text-slate-400">No comment</em>}</span> },
    { key: "author_name", header: "By", render: r => <span className="text-sm">{r.author_name}</span> },
    { key: "created_at", header: "Date", sortable: true, render: r => formatDate(r.created_at) },
    // Only Vita moderates reviews.
    ...(isPartner
      ? []
      : [
          {
            key: "__actions",
            header: "",
            render: (r: Review) => (
              <Button size="xs" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => remove(r)}>
                Remove
              </Button>
            ),
          },
        ]),
  ];

  return (
    <div className="min-h-screen">
      <TopHeader title="Reviews" subtitle="What patients say about doctors, labs and centres" role={role} />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        <div className="flex flex-wrap gap-3">
          <SearchInput placeholder="Search reviews…" onSearch={setQuery} className="max-w-md flex-1" />
          {!isPartner && (
            <select className="vita-input w-auto text-sm" value={source} onChange={e => setSource(e.target.value as typeof source)}>
              <option value="all">Doctors and centres</option>
              <option value="doctor">Doctors</option>
              <option value="centre">Labs & centres</option>
            </select>
          )}
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage={loading ? "Loading…" : "No reviews yet."} pageSize={15} />
      </div>
    </div>
  );
}
