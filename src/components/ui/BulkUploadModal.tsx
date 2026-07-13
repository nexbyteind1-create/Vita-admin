"use client";
import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2, XCircle, X } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

export interface BulkUploadColumn {
  key: string;
  header: string;
  required?: boolean;
  example?: string;
}

interface ParseSuccess<T> { data: T }
interface ParseError { error: string }

interface BulkUploadModalProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  templateColumns: BulkUploadColumn[];
  templateFileName?: string;
  parseRow: (raw: Record<string, string>, rowIndex: number) => ParseSuccess<T> | ParseError;
  onConfirm: (rows: T[]) => void;
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return String(value.result ?? "");
    if ("richText" in value && Array.isArray(value.richText)) return value.richText.map(r => r.text).join("");
  }
  return String(value);
}

async function downloadTemplate(columns: BulkUploadColumn[], fileName: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Template");
  sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: Math.max(18, c.header.length + 4) }));
  sheet.getRow(1).font = { bold: true };
  if (columns.some(c => c.example)) {
    sheet.addRow(Object.fromEntries(columns.map(c => [c.key, c.example ?? ""])));
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function extractRows(file: File, columns: BulkUploadColumn[]): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerMap: Record<number, string> = {};
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerText = cellToString(cell.value).trim().toLowerCase();
    const column = columns.find(c => c.header.trim().toLowerCase() === headerText);
    if (column) headerMap[colNumber] = column.key;
  });

  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, string> = {};
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const key = headerMap[colNumber];
      if (key) obj[key] = cellToString(cell.value).trim();
    });
    if (Object.values(obj).some(v => v !== "")) rows.push(obj);
  });
  return rows;
}

export function BulkUploadModal<T>({ open, onClose, title, subtitle, templateColumns, templateFileName, parseRow, onConfirm }: BulkUploadModalProps<T>) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [validRows, setValidRows] = useState<T[]>([]);
  const [errorRows, setErrorRows] = useState<{ row: number; message: string }[]>([]);
  const [readError, setReadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFileName(null);
    setValidRows([]);
    setErrorRows([]);
    setReadError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setParsing(true);
    setReadError(null);
    setValidRows([]);
    setErrorRows([]);
    try {
      const rawRows = await extractRows(file, templateColumns);
      const valid: T[] = [];
      const errors: { row: number; message: string }[] = [];
      rawRows.forEach((raw, i) => {
        const result = parseRow(raw, i);
        if ("error" in result) errors.push({ row: i + 2, message: result.error });
        else valid.push(result.data);
      });
      if (rawRows.length === 0) setReadError("No data rows found. Make sure you used the downloaded template and filled in rows below the header.");
      setValidRows(valid);
      setErrorRows(errors);
    } catch {
      setReadError("Couldn't read this file. Please upload a .xlsx file generated from the template.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(validRows);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} subtitle={subtitle} size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div className="text-sm font-semibold text-slate-900">1. Download the template</div>
            <div className="text-xs text-slate-500 mt-0.5">Fill in rows below the header, keeping column names unchanged.</div>
          </div>
          <Button size="sm" variant="secondary" icon={<Download className="w-3.5 h-3.5" />} onClick={() => downloadTemplate(templateColumns, templateFileName ?? "template.xlsx")}>
            Template
          </Button>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2">2. Upload the filled Excel file</div>
          <label className={cn(
            "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors",
            "border-slate-300 hover:border-red-300 hover:bg-red-50/40"
          )}>
            <UploadCloud className="w-6 h-6 text-slate-400" />
            <span className="text-sm text-slate-600">{fileName ?? "Click to choose a .xlsx file"}</span>
            <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>
        </div>

        {parsing && <div className="text-sm text-slate-500">Reading file…</div>}

        {readError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {readError}
          </div>
        )}

        {!parsing && (validRows.length > 0 || errorRows.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="w-4 h-4" />{validRows.length} valid</span>
              {errorRows.length > 0 && <span className="inline-flex items-center gap-1.5 text-red-700"><XCircle className="w-4 h-4" />{errorRows.length} skipped</span>}
            </div>
            {errorRows.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-red-200">
                {errorRows.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs text-red-700 border-b border-red-100 last:border-0 bg-red-50/60">
                    <span className="font-semibold flex-shrink-0">Row {e.row}:</span>
                    <span>{e.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button className="flex-1" disabled={validRows.length === 0} onClick={handleConfirm} icon={<FileSpreadsheet className="w-4 h-4" />}>
            Confirm Upload ({validRows.length})
          </Button>
          <Button variant="secondary" icon={<X className="w-4 h-4" />} onClick={handleClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
