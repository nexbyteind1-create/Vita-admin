"use client";
import { useState } from "react";
import { Download, ChevronDown, FileText, Table, File } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { exportReport, type ExportFormat } from "@/lib/utils/export";

interface ExportMenuProps {
  reportName: string;
  className?: string;
}

const formats: { label: string; format: ExportFormat; icon: React.ReactNode; desc: string }[] = [
  { label: "PDF", format: "pdf", icon: <FileText className="w-4 h-4" />, desc: "Formatted report" },
  { label: "Excel", format: "excel", icon: <Table className="w-4 h-4" />, desc: "Spreadsheet format" },
  { label: "CSV", format: "csv", icon: <File className="w-4 h-4" />, desc: "Raw data export" },
];

export function ExportMenu({ reportName, className }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);
    await exportReport(reportName, format);
    setLoading(null);
    setOpen(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200",
          success ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
        )}
      >
        <Download className="w-4 h-4" />
        {success ? "Downloaded!" : "Export"}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 glass-card py-1 z-20 border border-slate-200 animate-fade-in-up">
            {formats.map(f => (
              <button
                key={f.format}
                onClick={() => handleExport(f.format)}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-slate-400">{f.icon}</span>
                <div>
                  <div className="text-sm font-medium text-slate-900">{f.label}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </div>
                {loading === f.format && <div className="ml-auto w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
