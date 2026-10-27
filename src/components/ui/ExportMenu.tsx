"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { exportReportToExcel, type ExcelExportSheet } from "@/lib/utils/export";
import { useSession } from "@/lib/auth/session";

interface ExportMenuProps {
  reportName: string;
  sheets?: ExcelExportSheet[];
  className?: string;
}

export function ExportMenu({ reportName, sheets, className }: ExportMenuProps) {
  const { admin } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await exportReportToExcel(reportName, sheets ?? [], {
        exportedBy: admin?.full_name || admin?.email || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300",
        loading && "opacity-80 cursor-wait",
        className
      )}
    >
      <Download className={cn("w-4 h-4", loading && "animate-pulse")} />
      {success ? "Downloaded!" : loading ? "Exporting…" : "Export"}
    </button>
  );
}
