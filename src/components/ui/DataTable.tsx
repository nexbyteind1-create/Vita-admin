"use client";
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  pagination?: boolean;
  pageSize?: number;
}

export function DataTable<T extends { id: string }>({ columns, data, loading, emptyMessage, onRowClick, rowClassName, pagination = true, pageSize = 10 }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av === bv) return 0;
      const cmp = String(av) < String(bv) ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  if (!loading && data.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="vita-table w-full border-collapse">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className={cn("text-left whitespace-nowrap", col.width, col.align === "right" && "text-right", col.align === "center" && "text-center")}>
                  <div className={cn("flex items-center gap-1.5 select-none", col.sortable && "cursor-pointer hover:text-slate-900 transition-colors", col.align === "right" && "justify-end", col.align === "center" && "justify-center")} onClick={() => col.sortable && handleSort(String(col.key))}>
                    {col.header}
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-red-600" /> : <ChevronDown className="w-3.5 h-3.5 text-red-600" />) : <ChevronsUpDown className="w-3.5 h-3.5" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : paginated.map(row => (
              <tr key={row.id} className={cn(onRowClick && "cursor-pointer", rowClassName?.(row))} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (
                  <td key={String(col.key)} className={cn(col.align === "right" && "text-right", col.align === "center" && "text-center")}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-500">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}</span>
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors", page === p ? "bg-red-600 text-white" : "hover:bg-slate-100 text-slate-500")}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
