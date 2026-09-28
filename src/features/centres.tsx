"use client";
import Link from "next/link";
import { CalendarClock, CheckCircle, FlaskConical, Home, IndianRupee, Scan } from "lucide-react";
import { ResourceManager, withoutFields, type ResourceConfig } from "@/components/data/ResourceManager";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { usePortal, useSession } from "@/lib/auth/session";

/** public.test_centres — labs and imaging centres for Book Lab test / Book Diagnostic. */
export interface CentreRow {
  id: string;
  name: string;
  kind: "lab" | "diagnostic" | "both";
  accreditation: string | null;
  address_text: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number;
  home_collection: boolean;
  opening_hours: string | null;
  support_name: string | null;
  support_phone: string | null;
  sort_order: number;
  is_active: boolean;
}

const COPY = {
  lab: { title: "Laboratories", noun: "lab", icon: FlaskConical, subtitle: "Labs offering tests in Book Lab test" },
  diagnostic: { title: "Diagnostic centres", noun: "centre", icon: Scan, subtitle: "Imaging centres offering scans in Book Diagnostic" },
};

export default function CentresPage({ kind }: { kind: "lab" | "diagnostic" }) {
  const { base, portal, centreId } = usePortal();
  const copy = COPY[kind];
  const Icon = copy.icon;

  const config: ResourceConfig<CentreRow> = {
    table: "test_centres",
    noun: copy.noun,
    title: copy.title,
    subtitle: copy.subtitle,
    // A centre that does both shows on both pages.
    scope: q => q.in("kind", [kind, "both"]),
    defaults: { kind },
    order: { column: "sort_order" },
    searchKeys: ["name", "city", "address_text", "accreditation"],
    activeKey: "is_active",
    modalSize: "xl",
    deleteWarning: "Its prices, slots and reviews are deleted too; past bookings keep their history.",
    columns: [
      {
        key: "name",
        header: copy.noun === "lab" ? "Lab" : "Centre",
        sortable: true,
        render: c => (
          <div>
            <div className="text-sm font-semibold text-slate-900">{c.name}</div>
            <div className="text-xs text-slate-500">
              {[c.accreditation, c.kind === "both" ? "Lab + imaging" : null].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        ),
      },
      { key: "address_text", header: "Location", render: c => <span className="text-sm text-slate-500">{c.address_text ?? "—"}</span> },
      {
        key: "home_collection",
        header: "Home collection",
        align: "center",
        render: c => (c.home_collection ? <span className="text-emerald-600 font-medium text-sm">Yes</span> : <span className="text-slate-400 text-sm">No</span>),
      },
      { key: "rating", header: "Rating", align: "center", render: c => (c.rating != null ? `★ ${Number(c.rating).toFixed(1)} (${c.review_count})` : "—") },
    ],
    fields: [
      { key: "name", label: "Name", required: true },
      {
        key: "kind",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "lab", label: "Lab (tests)" },
          { value: "diagnostic", label: "Diagnostic (scans)" },
          { value: "both", label: "Both" },
        ],
      },
      { key: "accreditation", label: "Accreditation", placeholder: "NABL · CAP" },
      { key: "opening_hours", label: "Opening hours", placeholder: "7:00 AM – 8:00 PM" },
      { key: "address_text", label: "Address", wide: true },
      { key: "city", label: "City" },
      { key: "rating", label: "Rating (0–5)", type: "decimal", min: 0, max: 5 },
      { key: "latitude", label: "Latitude", type: "decimal" },
      { key: "longitude", label: "Longitude", type: "decimal" },
      { key: "support_name", label: "Support staff name" },
      { key: "support_phone", label: "Support staff phone", type: "tel" },
      { key: "review_count", label: "Review count", type: "number", min: 0 },
      { key: "sort_order", label: "Display order", type: "number" },
      { key: "home_collection", label: "Offers home sample collection", type: "toggle", help: "Lab tests only" },
      { key: "is_active", label: "Visible in app", type: "toggle" },
    ],
    fromForm: values => ({ ...values, review_count: values.review_count ?? 0, sort_order: values.sort_order ?? 0 }),
    rowActions: c => (
      <>
        <Link href={`${base}/catalog/tests?centre=${c.id}`}>
          <Button size="xs" variant="ghost" icon={<IndianRupee className="w-3 h-3" />}>
            Prices
          </Button>
        </Link>
        <Link href={`${base}/schedules/centre-slots?centre=${c.id}`}>
          <Button size="xs" variant="ghost" icon={<CalendarClock className="w-3 h-3" />}>
            Slots
          </Button>
        </Link>
      </>
    ),
    summary: rows => (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={copy.title} value={rows.length} icon={<Icon className="w-full h-full" />} color="blue" />
        <StatCard label="Visible in app" value={rows.filter(c => c.is_active).length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
        <StatCard label="Home collection" value={rows.filter(c => c.home_collection).length} icon={<Home className="w-full h-full" />} color="purple" />
      </div>
    ),
  };

  if (portal === "centre") {
    const platformOnly = ["kind", "rating", "review_count", "sort_order", "is_active"];
    return (
      <ResourceManager
        config={{
          ...withoutFields(config, platformOnly),
          title: kind === "lab" ? "Lab profile" : "Centre profile",
          subtitle: "How you appear in the Vita app",
          scope: q => q.eq("id", centreId),
          activeKey: undefined,
          canCreate: false,
          canDelete: false,
          summary: undefined,
          rowActions: () => (
            <>
              <Link href={`${base}/prices`}>
                <Button size="xs" variant="ghost" icon={<IndianRupee className="w-3 h-3" />}>
                  Prices
                </Button>
              </Link>
              <Link href={`${base}/schedules/centre-slots`}>
                <Button size="xs" variant="ghost" icon={<CalendarClock className="w-3 h-3" />}>
                  Slots
                </Button>
              </Link>
            </>
          ),
        }}
      />
    );
  }
  return <ResourceManager key={kind} config={config} />;
}

/** A lab or diagnostic centre's own profile (partner console). */
export function CentreProfilePage() {
  const { admin } = useSession();
  return <CentresPage kind={admin?.role === "diagnostic" ? "diagnostic" : "lab"} />;
}
