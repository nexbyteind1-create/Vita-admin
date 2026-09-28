"use client";
import { Building2, CheckCircle, MapPin } from "lucide-react";
import { ResourceManager, withoutFields, type ResourceConfig } from "@/components/data/ResourceManager";
import { StatCard } from "@/components/ui/StatCard";
import { usePortal } from "@/lib/auth/session";

/** public.hospitals — shown on Home ("Nearby hospitals"), doctor pages and bookings. */
export interface HospitalRow {
  id: string;
  name: string;
  specialty: string | null;
  address_text: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  image_url: string | null;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const config: ResourceConfig<HospitalRow> = {
  table: "hospitals",
  noun: "hospital",
  title: "Hospitals",
  subtitle: "Hospitals shown in the app — Home, doctor profiles and bookings",
  order: { column: "sort_order" },
  searchKeys: ["name", "city", "specialty", "address_text"],
  activeKey: "is_active",
  deleteWarning: "Doctors and appointments at this hospital keep working but lose their hospital link.",
  columns: [
    {
      key: "name",
      header: "Hospital",
      sortable: true,
      render: h => (
        <div className="flex items-center gap-3">
          {h.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={h.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-900">{h.name}</div>
            <div className="text-xs text-slate-500">{h.specialty ?? "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "address_text",
      header: "Location",
      render: h => (
        <span className="text-sm text-slate-500">{[h.address_text, h.city].filter(Boolean).join(", ") || "—"}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      render: h => (h.rating != null ? <span className="font-semibold">★ {Number(h.rating).toFixed(1)}</span> : "—"),
    },
    { key: "sort_order", header: "Order", align: "center", sortable: true },
  ],
  fields: [
    { key: "name", label: "Hospital name", required: true, placeholder: "Apollo Spectra" },
    { key: "specialty", label: "Type / specialty", placeholder: "Multi-specialty" },
    { key: "address_text", label: "Address", wide: true, placeholder: "Sushant Lok 1, Gurugram" },
    { key: "city", label: "City", placeholder: "Gurugram" },
    { key: "rating", label: "Rating (0–5)", type: "decimal", min: 0, max: 5 },
    { key: "latitude", label: "Latitude", type: "decimal", help: "Used for distance and directions" },
    { key: "longitude", label: "Longitude", type: "decimal" },
    { key: "logo_url", label: "Logo URL", type: "url", wide: true },
    { key: "image_url", label: "Cover image URL", type: "url", wide: true },
    { key: "sort_order", label: "Display order", type: "number", help: "Lower shows first" },
    { key: "is_active", label: "Visible in app", type: "toggle" },
  ],
  fromForm: values => ({ ...values, sort_order: values.sort_order ?? 0 }),
  summary: rows => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Hospitals" value={rows.length} icon={<Building2 className="w-full h-full" />} color="blue" />
      <StatCard label="Visible in app" value={rows.filter(h => h.is_active).length} icon={<CheckCircle className="w-full h-full" />} color="emerald" />
      <StatCard
        label="Missing location"
        value={rows.filter(h => h.latitude == null || h.longitude == null).length}
        icon={<MapPin className="w-full h-full" />}
        color="amber"
        subValue="No distance or directions in the app"
      />
    </div>
  ),
};

/** Fields a hospital may not set on its own profile. */
const PLATFORM_ONLY = ["rating", "sort_order", "is_active"];

export default function HospitalsPage() {
  const { portal, hospitalId } = usePortal();
  if (portal !== "hospital") return <ResourceManager config={config} />;
  return (
    <ResourceManager
      config={{
        ...withoutFields(config, PLATFORM_ONLY),
        title: "Hospital profile",
        subtitle: "How your hospital appears in the Vita app",
        scope: q => q.eq("id", hospitalId),
        columns: config.columns.filter(c => c.key !== "sort_order"),
        activeKey: undefined,
        canCreate: false,
        canDelete: false,
        summary: undefined,
      }}
    />
  );
}

