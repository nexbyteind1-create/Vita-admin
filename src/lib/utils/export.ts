import ExcelJS from "exceljs";

export interface ExcelExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelExportSheet {
  name: string;
  columns: ExcelExportColumn[];
  rows: Record<string, string | number | boolean | null | undefined>[];
}

function downloadExcelBuffer(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportReportToExcel(
  reportName: string,
  sheets: ExcelExportSheet[],
  meta?: { exportedBy?: string }
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VitaAdmin";
  workbook.created = new Date();

  const info = workbook.addWorksheet("Report Info");
  info.columns = [
    { header: "Field", key: "field", width: 18 },
    { header: "Value", key: "value", width: 48 },
  ];
  info.getRow(1).font = { bold: true };
  info.addRow({ field: "Report", value: reportName });
  info.addRow({ field: "Exported At", value: new Date().toLocaleString() });
  if (meta?.exportedBy) {
    info.addRow({ field: "Exported By", value: meta.exportedBy });
  }

  const dataSheets =
    sheets.length > 0
      ? sheets
      : [
          {
            name: "Summary",
            columns: [{ header: "Note", key: "note" }],
            rows: [{ note: "No detailed rows were provided for this report." }],
          },
        ];

  for (const sheetDef of dataSheets) {
    const sheet = workbook.addWorksheet(sheetDef.name.slice(0, 31));
    sheet.columns = sheetDef.columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width ?? Math.max(14, col.header.length + 4),
    }));
    sheet.getRow(1).font = { bold: true };
    for (const row of sheetDef.rows) {
      const values = Object.fromEntries(
        sheetDef.columns.map(col => [col.key, row[col.key] ?? ""])
      );
      sheet.addRow(values);
    }
  }

  const fileName = `${reportName.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(buffer, fileName);
}
