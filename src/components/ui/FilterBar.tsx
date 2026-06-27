"use client";
import { useState } from "react";
import { Calendar, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DateFilter = "today" | "yesterday" | "week" | "month" | "year" | "custom";

interface FilterBarProps {
  dateFilter?: DateFilter;
  onDateChange?: (filter: DateFilter) => void;
  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string) => void;
  className?: string;
}

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
}

const dateOptions: { label: string; value: DateFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "Custom Range", value: "custom" },
];

export function FilterBar({ dateFilter = "month", onDateChange, filters = [], onFilterChange, className }: FilterBarProps) {
  const [activeDate, setActiveDate] = useState<DateFilter>(dateFilter);

  const handleDate = (v: DateFilter) => {
    setActiveDate(v);
    onDateChange?.(v);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1 bg-[#0d1526] border border-[#1f2d45] rounded-lg p-1">
        {dateOptions.slice(0, 5).map(opt => (
          <button key={opt.value} onClick={() => handleDate(opt.value)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150", activeDate === opt.value ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>
            {opt.label}
          </button>
        ))}
        <button onClick={() => handleDate("custom")} className={cn("px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all", activeDate === "custom" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>
          <Calendar className="w-3 h-3" />
          Custom
        </button>
      </div>

      {filters.map(f => (
        <select key={f.key} value={f.value} onChange={e => onFilterChange?.(f.key, e.target.value)} className="vita-input py-2 pr-8 text-xs appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_10px_center] min-w-[120px] max-w-[160px]">
          <option value="">{f.label}</option>
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}

      {filters.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Filter className="w-3 h-3" />
          Filters
        </div>
      )}
    </div>
  );
}
