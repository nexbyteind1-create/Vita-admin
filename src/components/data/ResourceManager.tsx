"use client";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Power } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FormField, cleanValues, type FieldDef, type FormValues } from "./FormField";
import { supabase } from "@/lib/supabase/client";
import { audit, errorText, useLoad } from "@/lib/data/hooks";
import { usePortal } from "@/lib/auth/session";

// PostgREST filter builder; typed loosely so configs can chain .eq/.in freely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query = any;

export interface ResourceConfig<Row extends { id: string }> {
  table: string;
  /** Singular noun for buttons and titles: "hospital". */
  noun: string;
  title: string;
  subtitle?: string;
  select?: string;
  order?: { column: string; ascending?: boolean };
  /** Narrow the rows (e.g. `q => q.eq("kind", "lab")`). */
  scope?: (q: Query) => Query;
  /** Values merged into every insert (e.g. `{ kind: "lab" }`). */
  defaults?: FormValues;
  columns: Column<Row>[];
  fields: FieldDef[];
  searchKeys: (keyof Row | string)[];
  /** Row → form values. Defaults to picking field keys off the row. */
  toForm?: (row: Row) => FormValues;
  /** Form values → the row to write. Defaults to the cleaned values. */
  fromForm?: (values: FormValues, row: Row | null) => FormValues;
  /** Column holding the on/off flag, if any. */
  activeKey?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  deleteWarning?: string;
  /** Extra buttons per row. */
  rowActions?: (row: Row, reload: () => void) => React.ReactNode;
  /** Content above the table (stat cards etc.). */
  summary?: (rows: Row[]) => React.ReactNode;
  headerActions?: React.ReactNode;
  modalSize?: "sm" | "md" | "lg" | "xl";
}

/**
 * The same config with some fields taken off the form, and never written —
 * so a `fromForm` that fills defaults (`sort_order ?? 0`) can't overwrite
 * values the viewer isn't allowed to see.
 */
export function withoutFields<Row extends { id: string }>(config: ResourceConfig<Row>, hidden: string[]): ResourceConfig<Row> {
  const fromForm = config.fromForm;
  return {
    ...config,
    fields: config.fields.filter(f => !hidden.includes(f.key)),
    fromForm: (values, row) => {
      const out = fromForm ? fromForm(values, row) : values;
      return Object.fromEntries(Object.entries(out).filter(([key]) => !hidden.includes(key)));
    },
  };
}

function blankValues(fields: FieldDef[], defaults?: FormValues): FormValues {
  const values: FormValues = {};
  for (const f of fields) {
    values[f.key] = f.type === "toggle" ? true : f.type === "tags" ? [] : null;
  }
  return { ...values, ...defaults };
}

export function ResourceManager<Row extends { id: string }>({ config }: { config: ResourceConfig<Row> }) {
  const role = usePortal().portal;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ row: Row | null; values: FormValues } | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const { data, error, loading, reload } = useLoad<Row[]>(async () => {
    let q: Query = supabase().from(config.table).select(config.select ?? "*");
    if (config.scope) q = config.scope(q);
    if (config.order) q = q.order(config.order.column, { ascending: config.order.ascending ?? true });
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data as Row[];
  }, [config.table]);

  const rows = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(row =>
      config.searchKeys.some(key => {
        const v = (row as Record<string, unknown>)[key as string];
        return (Array.isArray(v) ? v.join(" ") : String(v ?? "")).toLowerCase().includes(term);
      }),
    );
  }, [rows, query, config.searchKeys]);

  const openCreate = () => {
    setFormError("");
    setEditing({ row: null, values: blankValues(config.fields, config.defaults) });
  };

  const openEdit = (row: Row) => {
    setFormError("");
    const values = config.toForm
      ? config.toForm(row)
      : Object.fromEntries(config.fields.map(f => [f.key, (row as Record<string, unknown>)[f.key] ?? (f.type === "tags" ? [] : null)]));
    setEditing({ row, values });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormError("");
    try {
      const cleaned = cleanValues(config.fields, editing.values);
      const payload = config.fromForm ? config.fromForm(cleaned, editing.row) : cleaned;
      if (editing.row) {
        const { error } = await supabase().from(config.table).update(payload).eq("id", editing.row.id);
        if (error) throw new Error(error.message);
        await audit("update", config.table, editing.row.id, payload);
      } else {
        const { data, error } = await supabase()
          .from(config.table)
          .insert({ ...config.defaults, ...payload })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        await audit("create", config.table, data?.id ?? null, payload);
      }
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (row: Row) => {
    if (!config.activeKey) return;
    const next = !(row as Record<string, unknown>)[config.activeKey];
    const { error } = await supabase().from(config.table).update({ [config.activeKey]: next }).eq("id", row.id);
    if (error) return alert(error.message);
    await audit(next ? "activate" : "deactivate", config.table, row.id);
    reload();
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const { error } = await supabase().from(config.table).delete().eq("id", deleting.id);
    setBusy(false);
    if (error) return alert(error.message);
    await audit("delete", config.table, deleting.id);
    setDeleting(null);
    reload();
  };

  const actionColumn: Column<Row> = {
    key: "__actions",
    header: "Actions",
    render: row => (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button size="xs" variant="ghost" icon={<Pencil className="w-3 h-3" />} onClick={() => openEdit(row)}>
          Edit
        </Button>
        {config.activeKey && (
          <Button
            size="xs"
            variant={(row as Record<string, unknown>)[config.activeKey] ? "warning" : "success"}
            icon={<Power className="w-3 h-3" />}
            onClick={() => toggleActive(row)}
          >
            {(row as Record<string, unknown>)[config.activeKey] ? "Deactivate" : "Activate"}
          </Button>
        )}
        {config.rowActions?.(row, reload)}
        {config.canDelete !== false && (
          <Button size="xs" variant="danger" icon={<Trash2 className="w-3 h-3" />} onClick={() => setDeleting(row)}>
            Delete
          </Button>
        )}
      </div>
    ),
  };

  const statusColumn: Column<Row>[] = config.activeKey
    ? [
        {
          key: config.activeKey,
          header: "Status",
          render: row =>
            (row as Record<string, unknown>)[config.activeKey!] ? <Badge variant="active" /> : <Badge variant="inactive" />,
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <TopHeader
        title={config.title}
        subtitle={config.subtitle}
        role={role}
        actions={
          <div className="flex items-center gap-2">
            {config.headerActions}
            {config.canCreate !== false && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
                Add {config.noun}
              </Button>
            )}
          </div>
        }
      />
      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px]">
        {config.summary?.(rows)}
        <SearchInput placeholder={`Search ${config.noun}s…`} onSearch={setQuery} className="max-w-lg" />
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <DataTable
          columns={[...config.columns, ...statusColumn, actionColumn]}
          data={filtered}
          loading={loading}
          emptyMessage={loading ? "Loading…" : `No ${config.noun}s yet.`}
          pageSize={12}
        />
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.row ? `Edit ${config.noun}` : `Add ${config.noun}`}
        size={config.modalSize ?? "lg"}
      >
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map(field => (
                <FormField
                  key={field.key}
                  field={field}
                  value={editing.values[field.key]}
                  onChange={v => setEditing(cur => (cur ? { ...cur, values: { ...cur.values, [field.key]: v } } : cur))}
                />
              ))}
            </div>
            {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button type="submit" className="flex-1" loading={busy}>
                {editing.row ? "Save changes" : `Add ${config.noun}`}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${config.noun}?`} size="sm">
        <p className="text-slate-600 text-sm mb-4">
          {config.deleteWarning ?? "This can't be undone."} Consider deactivating instead if it may come back.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" className="flex-1" loading={busy} onClick={remove}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
