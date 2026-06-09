import * as XLSX from "xlsx";
import type { ParsedReportDataset, ReportingRow, SummaryControl } from "../../../types/reporting";

export function parseBeeahWorkbookFile(buffer: ArrayBuffer, periodCode: string = "2026-03"): ParsedReportDataset {
  const workbook = XLSX.read(buffer, { type: "array" });
  const reportingRows: ReportingRow[] = [];
  
  workbook.SheetNames.forEach((sheetName) => {
    if (sheetName.toLowerCase().includes("control")) return;
    const worksheet = workbook.Sheets[sheetName];
    const rawMatrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    
    rawMatrix.forEach((row: any, idx: number) => {
      if (idx < 2 || !row || !row[0] || String(row[0]).trim() === "") return;
      reportingRows.push({
        periodCode, periodLabel: "Mar 2026 YTD", sourceType: "excel", statementType: "PL", scenario: "actual",
        glCode: "GL-" + idx, glName: String(row[0]), eyMapping1: String(row[0]),
        janValue: 0, febValue: 0, marValue: 0, aprValue: 0, mayValue: 0, junValue: 0, julValue: 0, augValue: 0, sepValue: 0, octValue: 0, novValue: 0, decValue: 0,
        q1Actuals: Number(row[1]) || 0, q1Budget: Number(row[2]) || 0, q2Budget: 0, q3Budget: 0, q4Budget: 0, ytdBudget: Number(row[2]) || 0
      });
    });
  });
  
  return { periodCode, periodLabel: "Mar 2026 YTD", sourceType: "excel", reportingRows, summaryControls: [] };
}
