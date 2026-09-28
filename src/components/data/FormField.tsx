"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "decimal"
  | "select"
  | "toggle"
  | "tags"
  | "color"
  | "url"
  | "email"
  | "tel";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: FieldOption[];
  /** Span both columns of the form grid. */
  wide?: boolean;
  min?: number;
  max?: number;
}

export type FormValues = Record<string, unknown>;

const labelClass = "text-xs font-semibold text-slate-400 uppercase mb-2 block";

function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const next = draft.split(",").map(s => s.trim()).filter(Boolean);
    if (next.length) onChange([...value, ...next.filter(t => !value.includes(t))]);
    setDraft("");
  };
  return (
    <div className="vita-input flex flex-wrap items-center gap-1.5 min-h-[42px] py-1.5">
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700">
          {tag}
          <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="text-slate-400 hover:text-red-600">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder ?? "Type and press Enter"}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}

export function FormField({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const type = field.type ?? "text";
  const common = {
    id: field.key,
    required: field.required,
    placeholder: field.placeholder,
    className: "vita-input",
  };

  let control: React.ReactNode;
  if (type === "textarea") {
    control = <textarea {...common} rows={4} value={(value as string) ?? ""} onChange={e => onChange(e.target.value)} />;
  } else if (type === "select") {
    control = (
      <select {...common} value={(value as string) ?? ""} onChange={e => onChange(e.target.value || null)}>
        {!field.required && <option value="">—</option>}
        {field.options?.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (type === "toggle") {
    control = <ToggleSwitch enabled={!!value} onChange={onChange} />;
  } else if (type === "tags") {
    control = <TagsInput value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} />;
  } else if (type === "number" || type === "decimal") {
    control = (
      <input
        {...common}
        type="number"
        step={type === "decimal" ? "any" : 1}
        min={field.min}
        max={field.max}
        value={value == null ? "" : String(value)}
        onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    );
  } else if (type === "color") {
    control = (
      <div className="flex items-center gap-2">
        <input type="color" value={(value as string) || "#E01E23"} onChange={e => onChange(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg border border-slate-200" />
        <input {...common} value={(value as string) ?? ""} onChange={e => onChange(e.target.value)} />
      </div>
    );
  } else {
    control = (
      <input
        {...common}
        type={type === "url" ? "url" : type === "email" ? "email" : type === "tel" ? "tel" : "text"}
        value={(value as string) ?? ""}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={cn(field.wide && "sm:col-span-2")}>
      <label htmlFor={field.key} className={labelClass}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {control}
      {field.help && <p className="text-xs text-slate-400 mt-1">{field.help}</p>}
    </div>
  );
}

/** Empty strings become null so optional text columns stay NULL, not ''. */
export function cleanValues(fields: FieldDef[], values: FormValues): FormValues {
  const out: FormValues = {};
  for (const field of fields) {
    const v = values[field.key];
    out[field.key] = typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v;
  }
  return out;
}
