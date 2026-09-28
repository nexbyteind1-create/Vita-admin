"use client";
import { ResourceManager, type ResourceConfig } from "@/components/data/ResourceManager";

/**
 * Home screen content: Quick Actions tiles, Vault tiles, and the "Exclusive
 * offers" banner on the booking lists. Each row renders in the app by
 * `icon_key`; keys the app doesn't know fall back to a document icon.
 */

// Keys the app's icon registries understand (VITA/src/components/homeIcons.js, OffersBanner.js).
const HOME_ICONS = ["stethoscope", "upload-doc", "flask", "clipboard", "prescription", "report", "transaction", "insurance", "bill"];
const OFFER_ICONS = ["pill", "flask", "clipboard"];
const iconOptions = (keys: string[]) => keys.map(k => ({ value: k, label: k }));

/** What the app opens for each built-in Quick Action slug (VITA/App.js). */
const QUICK_ACTION_ROUTES: Record<string, string> = {
  "consult-doctor": "Consult Doctor",
  "upload-bill": "Upload Bill",
  "book-lab-test": "Book Lab test",
  "book-diagnostic": "Book Diagnostic",
};

/** Offer slugs the app routes on (VITA/App.js openOffer). */
const OFFER_ROUTES: Record<string, string> = {
  "lab-test": "Opens Book Lab test",
  diagnostic: "Opens Book Diagnostic",
  pharmacy: "Shows “coming soon”",
};

function Swatch({ color }: { color: string | null }) {
  return color ? <span className="inline-block w-4 h-4 rounded border border-slate-200 align-middle" style={{ background: color }} /> : null;
}

interface QuickActionRow {
  id: string;
  slug: string;
  label: string;
  icon_key: string;
  accent: string;
  sort_order: number;
  is_active: boolean;
}

interface VaultRow {
  id: string;
  slug: string;
  label: string;
  icon_key: string;
  sort_order: number;
  is_active: boolean;
}

interface OfferRow {
  id: string;
  slug: string;
  title: string;
  discount_percent: number;
  icon_key: string;
  accent: string;
  sort_order: number;
  is_active: boolean;
}

const quickActions: ResourceConfig<QuickActionRow> = {
  table: "quick_actions",
  noun: "quick action",
  title: "Home · Quick Actions",
  subtitle: "The four tiles under the greeting on Home",
  order: { column: "sort_order" },
  searchKeys: ["label", "slug"],
  activeKey: "is_active",
  columns: [
    { key: "label", header: "Tile", render: r => <span className="font-semibold text-slate-900">{r.label}</span> },
    {
      key: "slug",
      header: "Opens",
      render: r => (
        <span className="text-sm text-slate-500">
          {QUICK_ACTION_ROUTES[r.slug] ?? <span className="text-amber-600">Nothing yet — needs an app update</span>}
        </span>
      ),
    },
    { key: "icon_key", header: "Icon", render: r => <code className="text-xs">{r.icon_key}</code> },
    { key: "accent", header: "Accent", render: r => <Swatch color={r.accent} /> },
    { key: "sort_order", header: "Order", align: "center", sortable: true },
  ],
  fields: [
    { key: "label", label: "Label", required: true, placeholder: "Book Lab test" },
    {
      key: "slug",
      label: "Action",
      type: "select",
      required: true,
      options: Object.entries(QUICK_ACTION_ROUTES).map(([value, label]) => ({ value, label })),
      help: "What the tile opens in the app",
    },
    { key: "icon_key", label: "Icon", type: "select", required: true, options: iconOptions(HOME_ICONS) },
    { key: "accent", label: "Accent colour", type: "color" },
    { key: "sort_order", label: "Display order", type: "number" },
    { key: "is_active", label: "Visible in app", type: "toggle" },
  ],
  fromForm: v => ({ ...v, sort_order: v.sort_order ?? 0, accent: v.accent ?? "#E5202B" }),
};

const vault: ResourceConfig<VaultRow> = {
  table: "vault_categories",
  noun: "vault tile",
  title: "Home · Vault",
  subtitle: "Health vault shortcuts on Home",
  order: { column: "sort_order" },
  searchKeys: ["label", "slug"],
  activeKey: "is_active",
  columns: [
    { key: "label", header: "Tile", render: r => <span className="font-semibold text-slate-900">{r.label}</span> },
    { key: "slug", header: "Slug", render: r => <code className="text-xs">{r.slug}</code> },
    { key: "icon_key", header: "Icon", render: r => <code className="text-xs">{r.icon_key}</code> },
    { key: "sort_order", header: "Order", align: "center", sortable: true },
  ],
  fields: [
    { key: "label", label: "Label", required: true, placeholder: "Prescriptions" },
    { key: "slug", label: "Slug", required: true, placeholder: "prescriptions", help: "Unique id, lowercase" },
    { key: "icon_key", label: "Icon", type: "select", required: true, options: iconOptions(HOME_ICONS) },
    { key: "sort_order", label: "Display order", type: "number" },
    { key: "is_active", label: "Visible in app", type: "toggle" },
  ],
  fromForm: v => ({ ...v, sort_order: v.sort_order ?? 0 }),
};

const offers: ResourceConfig<OfferRow> = {
  table: "offers",
  noun: "offer",
  title: "Offers",
  subtitle: "“Exclusive offers when you pay on the app” on the Consult, Lab and Diagnostic lists",
  order: { column: "sort_order" },
  searchKeys: ["title", "slug"],
  activeKey: "is_active",
  columns: [
    { key: "title", header: "Offer", render: r => <span className="font-semibold text-slate-900">{r.title}</span> },
    { key: "discount_percent", header: "Up to", align: "center", render: r => <span className="font-semibold text-emerald-600">{r.discount_percent}% off</span> },
    { key: "slug", header: "Tapping it", render: r => <span className="text-sm text-slate-500">{OFFER_ROUTES[r.slug] ?? "Does nothing yet"}</span> },
    { key: "accent", header: "Accent", render: r => <Swatch color={r.accent} /> },
    { key: "sort_order", header: "Order", align: "center", sortable: true },
  ],
  fields: [
    { key: "title", label: "Title", required: true, placeholder: "Lab Test" },
    { key: "discount_percent", label: "Discount (up to %)", type: "number", required: true, min: 1, max: 100 },
    {
      key: "slug",
      label: "Links to",
      type: "select",
      required: true,
      options: Object.entries(OFFER_ROUTES).map(([value, label]) => ({ value, label: `${value} — ${label}` })),
    },
    { key: "icon_key", label: "Icon", type: "select", required: true, options: iconOptions(OFFER_ICONS) },
    { key: "accent", label: "Accent colour", type: "color" },
    { key: "sort_order", label: "Display order", type: "number" },
    { key: "is_active", label: "Visible in app", type: "toggle" },
  ],
  fromForm: v => ({ ...v, sort_order: v.sort_order ?? 0, accent: v.accent ?? "#E01E23" }),
};

export function QuickActionsPage() {
  return <ResourceManager config={quickActions} />;
}

export function VaultPage() {
  return <ResourceManager config={vault} />;
}

export function OffersPage() {
  return <ResourceManager config={offers} />;
}
