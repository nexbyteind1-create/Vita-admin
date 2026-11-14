"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FlaskConical, IndianRupee, Package, Scan } from "lucide-react";
import { ResourceManager, type ResourceConfig } from "@/components/data/ResourceManager";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { SaveSuccessAlert } from "@/components/ui/SaveSuccessAlert";
import { TopHeader } from "@/components/layout/TopHeader";
import { usePortal } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, useLoad } from "@/lib/data/hooks";
import { fetchActivePlanOptions } from "@/lib/membership/plan-catalog";
import type { PlanFeeMap } from "@/components/membership/DoctorPlanFeesFields";
import {
  clearCentreTestPlanFees,
  fetchPlanFeesByCentre,
  fetchPlanFeesByTest,
  lowestPlanFee,
  saveCentreTestPlanFees,
} from "@/lib/membership/centre-test-plan-fees";

/** public.tests — the Book Lab test / Book Diagnostic catalogue. */
export interface TestRow {
  id: string;
  kind: "lab" | "diagnostic";
  name: string;
  category: string;
  about: string | null;
  parameters: string[];
  sample_type: string | null;
  preparation: string | null;
  duration_minutes: number | null;
  report_hours: number | null;
  is_package: boolean;
  sort_order: number;
  is_active: boolean;
  offers: { price: number }[];
}

interface Centre {
  id: string;
  name: string;
  kind: "lab" | "diagnostic" | "both";
}

export interface PlanOption {
  id: string;
  slug: string;
  name: string;
}

interface PriceLine {
  centreId: string;
  centreName: string;
  testId: string;
  testName: string;
  offered: boolean;
  price: number | null;
  planFees: PlanFeeMap;
  existed: boolean;
}

const fits = (centre: Centre, kind: TestRow["kind"]) => centre.kind === "both" || centre.kind === kind;

function PriceEditor({
  lines: initial,
  label,
  plans,
  onSaved,
}: {
  lines: PriceLine[];
  label: "centre" | "test";
  plans: PlanOption[];
  onSaved: () => void;
}) {
  const [lines, setLines] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const update = (i: number, patch: Partial<PriceLine>) =>
    setLines(cur => cur.map((line, j) => (j === i ? { ...line, ...patch } : line)));

  const updatePlanFee = (i: number, planId: string, raw: string) => {
    setLines(cur =>
      cur.map((line, j) => {
        if (j !== i) return line;
        const planFees = { ...line.planFees };
        if (raw === "") delete planFees[planId];
        else planFees[planId] = Number(raw);
        return { ...line, planFees };
      }),
    );
  };

  const save = async () => {
    setError("");
    setSaved(false);
    const bad = lines.find(l => l.offered && !(l.price && l.price > 0));
    if (bad) return setError(`Enter a standard price for ${label === "centre" ? bad.centreName : bad.testName}.`);
    setBusy(true);
    try {
      const offered = lines.filter(l => l.offered);
      const upserts = offered.map(l => ({
        centre_id: l.centreId,
        test_id: l.testId,
        price: l.price!,
        member_price: lowestPlanFee(l.planFees),
      }));
      if (upserts.length) {
        const { error: upErr } = await supabase().from("centre_tests").upsert(upserts, { onConflict: "centre_id,test_id" });
        if (upErr) throw new Error(upErr.message);
      }
      for (const l of offered) {
        await saveCentreTestPlanFees(l.centreId, l.testId, l.planFees);
      }
      for (const l of lines.filter(l => !l.offered && l.existed)) {
        const { error: delErr } = await supabase().from("centre_tests").delete().eq("centre_id", l.centreId).eq("test_id", l.testId);
        if (delErr) throw new Error(delErr.message);
        await clearCentreTestPlanFees(l.centreId, l.testId);
      }
      await audit("update", "centre_tests", null, { lines: upserts.length, planWise: true });
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {plans.length === 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No membership plans found. Run <code>Vita-admin/sql/membership_plans.sql</code> or create plans under Membership → Plans.
        </p>
      )}
      {saved && (
        <SaveSuccessAlert
          title="Prices saved successfully"
          description="Standard and membership-plan prices are updated for this lab or diagnostic centre."
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="vita-table w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left">Offered</th>
              <th className="text-left">{label === "centre" ? "Lab / centre" : "Test"}</th>
              <th className="text-right">Standard price (₹)</th>
              {plans.map(p => (
                <th key={p.id} className="text-right whitespace-nowrap">
                  {p.name} plan (₹)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={`${line.centreId}:${line.testId}`}>
                <td>
                  <input
                    type="checkbox"
                    className="accent-red-600 w-4 h-4"
                    checked={line.offered}
                    onChange={e => update(i, { offered: e.target.checked })}
                  />
                </td>
                <td className="text-sm font-medium text-slate-900">{label === "centre" ? line.centreName : line.testName}</td>
                <td className="text-right">
                  <input
                    type="number"
                    min={1}
                    disabled={!line.offered}
                    value={line.price ?? ""}
                    onChange={e => update(i, { price: e.target.value === "" ? null : Number(e.target.value) })}
                    className="vita-input w-28 text-right py-1.5"
                  />
                </td>
                {plans.map(p => (
                  <td key={p.id} className="text-right">
                    <input
                      type="number"
                      min={0}
                      disabled={!line.offered}
                      placeholder="Auto"
                      value={line.planFees[p.id] != null ? String(line.planFees[p.id]) : ""}
                      onChange={e => updatePlanFee(i, p.id, e.target.value)}
                      className="vita-input w-24 text-right py-1.5"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        <strong>Standard price</strong> — without a membership plan. <strong>Plan columns</strong> — what users on Silver / Gold /
        Platinum (etc.) pay, same as doctor consultation fees per plan.
      </p>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <Button className="w-full" loading={busy} onClick={save}>
        Save prices
      </Button>
    </div>
  );
}

async function loadCentres(): Promise<Centre[]> {
  const { data, error } = await supabase().from("test_centres").select("id, name, kind").order("sort_order");
  if (error) throw new Error(error.message);
  return data as Centre[];
}

async function loadOffers(filter: { test?: string; centre?: string }) {
  let q = supabase().from("centre_tests").select("centre_id, test_id, price, member_price");
  if (filter.test) q = q.eq("test_id", filter.test);
  if (filter.centre) q = q.eq("centre_id", filter.centre);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as { centre_id: string; test_id: string; price: number; member_price: number | null }[];
}

async function loadPlans(): Promise<PlanOption[]> {
  try {
    return await fetchActivePlanOptions();
  } catch {
    return [];
  }
}

/** Every compatible centre for one test. */
function TestPricesModal({ test, onClose }: { test: TestRow; onClose: () => void }) {
  const { data, error } = useLoad(async () => {
    const [centres, offers, planByCentre, plans] = await Promise.all([
      loadCentres(),
      loadOffers({ test: test.id }),
      fetchPlanFeesByTest(test.id).catch(() => new Map<string, PlanFeeMap>()),
      loadPlans(),
    ]);
    return {
      plans,
      lines: centres
        .filter(c => fits(c, test.kind))
        .map<PriceLine>(c => {
          const o = offers.find(x => x.centre_id === c.id);
          return {
            centreId: c.id,
            centreName: c.name,
            testId: test.id,
            testName: test.name,
            offered: !!o,
            price: o?.price ?? null,
            planFees: planByCentre.get(c.id) ?? {},
            existed: !!o,
          };
        }),
    };
  }, [test.id]);

  return (
    <Modal open onClose={onClose} title={`Prices — ${test.name}`} subtitle="Standard fee and membership-plan prices per lab or centre" size="xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data ? <PriceEditor lines={data.lines} label="centre" plans={data.plans} onSaved={onClose} /> : !error && <p className="text-sm text-slate-400">Loading…</p>}
    </Modal>
  );
}

/** Every test the centre's type allows, with what it offers today. */
async function loadCentreLines(centreId: string) {
  const [centres, offers, tests, planByTest, plans] = await Promise.all([
    loadCentres(),
    loadOffers({ centre: centreId }),
    supabase().from("tests").select("id, name, kind").order("kind").order("sort_order"),
    fetchPlanFeesByCentre(centreId).catch(() => new Map<string, PlanFeeMap>()),
    loadPlans(),
  ]);
  if (tests.error) throw new Error(tests.error.message);
  const centre = centres.find(c => c.id === centreId);
  if (!centre) throw new Error("Centre not found");
  const lines = (tests.data as { id: string; name: string; kind: TestRow["kind"] }[])
    .filter(t => fits(centre, t.kind))
    .map<PriceLine>(t => {
      const o = offers.find(x => x.test_id === t.id);
      return {
        centreId,
        centreName: centre.name,
        testId: t.id,
        testName: t.name,
        offered: !!o,
        price: o?.price ?? null,
        planFees: planByTest.get(t.id) ?? {},
        existed: !!o,
      };
    });
  return { centre, lines, plans };
}

/** Every compatible test at one centre (opened from a lab/centre's "Prices"). */
function CentrePrices({ centreId, onChanged }: { centreId: string; onChanged: () => void }) {
  const [open, setOpen] = useState(true);
  const { data, error, reload } = useLoad(() => loadCentreLines(centreId), [centreId]);

  if (!open) return null;
  return (
    <Modal open onClose={() => setOpen(false)} title={data ? `Price list — ${data.centre.name}` : "Price list"} size="xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data ? (
        <PriceEditor
          key={data.lines.length}
          lines={data.lines}
          label="test"
          plans={data.plans}
          onSaved={() => {
            reload();
            setOpen(false);
            onChanged();
          }}
        />
      ) : (
        !error && <p className="text-sm text-slate-400">Loading…</p>
      )}
    </Modal>
  );
}

export default function TestsPage() {
  const centreId = useSearchParams().get("centre");
  const [pricing, setPricing] = useState<TestRow | null>(null);
  const [version, setVersion] = useState(0);

  const config = useMemo<ResourceConfig<TestRow>>(
    () => ({
      table: "tests",
      noun: "test",
      title: "Tests & scans",
      subtitle: "Lab and diagnostic catalogue — standard price plus fees per membership plan",
      select: "*, offers:centre_tests(price)",
      order: { column: "sort_order" },
      searchKeys: ["name", "category", "parameters"],
      activeKey: "is_active",
      modalSize: "xl",
      deleteWarning: "Its prices at every centre are deleted too; past bookings keep their history.",
      columns: [
        {
          key: "name",
          header: "Test",
          sortable: true,
          render: t => (
            <div className="flex items-center gap-3">
              <div className={t.kind === "lab" ? "text-emerald-600" : "text-purple-600"}>
                {t.kind === "lab" ? <FlaskConical className="w-4 h-4" /> : <Scan className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">
                  {t.category}
                  {t.is_package ? ` · Package of ${t.parameters.length}` : ""}
                </div>
              </div>
            </div>
          ),
        },
        { key: "kind", header: "Type", render: t => (t.kind === "lab" ? "Lab test" : "Scan") },
        { key: "report_hours", header: "Report in", align: "center", render: t => (t.report_hours != null ? `${t.report_hours} h` : "—") },
        {
          key: "offers",
          header: "Price range",
          align: "right",
          render: t => {
            const prices = t.offers.map(o => o.price);
            if (!prices.length) return <span className="text-amber-600 text-xs font-medium">Not priced — hidden in app</span>;
            const lo = Math.min(...prices);
            const hi = Math.max(...prices);
            return (
              <span className="font-semibold">
                ₹{lo.toLocaleString("en-IN")}
                {hi !== lo ? `–${hi.toLocaleString("en-IN")}` : ""}
                <span className="text-xs text-slate-400 font-normal"> · {prices.length} centres</span>
              </span>
            );
          },
        },
      ],
      fields: [
        { key: "name", label: "Name", required: true, placeholder: "Lipid Profile" },
        {
          key: "kind",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { value: "lab", label: "Lab test" },
            { value: "diagnostic", label: "Scan / diagnostic" },
          ],
        },
        { key: "category", label: "Category", required: true, placeholder: "Heart, MRI, Full body…", help: "Drives the Filter in the app" },
        { key: "sample_type", label: "Sample type", placeholder: "Blood, Urine", help: "Lab tests" },
        { key: "report_hours", label: "Report in (hours)", type: "number", min: 1 },
        { key: "duration_minutes", label: "Scan duration (minutes)", type: "number", min: 1, help: "Scans" },
        { key: "about", label: "About", type: "textarea", wide: true },
        { key: "parameters", label: "Parameters / tests included", type: "tags", wide: true },
        {
          key: "preparation",
          label: "How to prepare",
          type: "textarea",
          wide: true,
          help: "Start with “Fast for 10–12 hours…” and the app shows a fasting tag automatically",
        },
        { key: "sort_order", label: "Display order", type: "number" },
        { key: "is_package", label: "Package (bundle of tests)", type: "toggle" },
        { key: "is_active", label: "Visible in app", type: "toggle" },
      ],
      toForm: t => ({ ...t, offers: undefined }),
      fromForm: values => ({ ...values, parameters: values.parameters ?? [], sort_order: values.sort_order ?? 0 }),
      rowActions: t => (
        <Button size="xs" variant="ghost" icon={<IndianRupee className="w-3 h-3" />} onClick={() => setPricing(t)}>
          Prices
        </Button>
      ),
      summary: rows => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Lab tests" value={rows.filter(t => t.kind === "lab").length} icon={<FlaskConical className="w-full h-full" />} color="emerald" />
          <StatCard label="Scans" value={rows.filter(t => t.kind === "diagnostic").length} icon={<Scan className="w-full h-full" />} color="purple" />
          <StatCard
            label="Not priced anywhere"
            value={rows.filter(t => !t.offers.length).length}
            icon={<Package className="w-full h-full" />}
            color="amber"
            subValue="Tests need a price at one centre to appear"
          />
        </div>
      ),
    }),
    [],
  );

  return (
    <>
      <ResourceManager key={version} config={config} />
      {pricing && (
        <TestPricesModal
          test={pricing}
          onClose={() => {
            setPricing(null);
            setVersion(v => v + 1);
          }}
        />
      )}
      {centreId && <CentrePrices centreId={centreId} onChanged={() => setVersion(v => v + 1)} />}
    </>
  );
}

/** A lab or diagnostic centre's own price list (partner console). */
export function CentrePriceListPage() {
  const { centreId } = usePortal();
  const { data, error, reload } = useLoad(() => loadCentreLines(centreId ?? ""), [centreId]);

  return (
    <div className="min-h-screen">
      <TopHeader
        title="Tests & prices"
        subtitle="Standard fee and membership-plan price per test — unpriced tests stay hidden in the app"
        role="centre"
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1200px]">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {data ? (
          <div className="glass-card p-4 sm:p-6">
            <PriceEditor lines={data.lines} label="test" plans={data.plans} onSaved={reload} />
          </div>
        ) : (
          !error && <p className="text-sm text-slate-400">Loading…</p>
        )}
      </div>
    </div>
  );
}