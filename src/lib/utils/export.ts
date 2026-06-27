export type ExportFormat = "pdf" | "excel" | "csv";

export function exportReport(reportName: string, format: ExportFormat): Promise<void> {
  return new Promise((resolve) => {
    // Simulate download delay
    setTimeout(() => {
      const extensions: Record<ExportFormat, string> = {
        pdf: "pdf",
        excel: "xlsx",
        csv: "csv",
      };
      const fileName = `${reportName.replace(/\s+/g, "_").toLowerCase()}_${new Date()
        .toISOString()
        .split("T")[0]}.${extensions[format]}`;
      console.log(`Exporting: ${fileName}`);
      resolve();
    }, 800);
  });
}
