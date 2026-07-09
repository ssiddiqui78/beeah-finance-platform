import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

export function diagnoseExcelStructure() {
  const configuredPath = "./data/input/beeah-monthly-report.xlsx";
  const resolvedPath = path.join(process.cwd(), configuredPath);

  if (!fs.existsSync(resolvedPath)) {
    return { error: `File not found at: ${resolvedPath}. Please place your spreadsheet there.` };
  }

  const workbook = XLSX.readFile(resolvedPath);
  const diagnostics: Record<string, any> = {};

  // Analyze every single sheet tab in the workbook file
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: null });
    
    if (rawRows.length === 0) continue;

    // Capture column headers from the first few rows
    const firstRowHeaders = rawRows[0] || [];
    const secondRowHeaders = rawRows[1] || [];

    // Search for rows that mention Cash, Bank, or Equity to see their exact text shape
    const sampleRows: any[] = [];
    for (const row of rawRows) {
      const rowString = JSON.stringify(row).toLowerCase();
      if (
        rowString.includes("cash") || 
        rowString.includes("bank") || 
        rowString.includes("equity") || 
        rowString.includes("capital")
      ) {
        sampleRows.push(row);
        if (sampleRows.length >= 4) break; // Grab up to 4 sample matches
      }
    }

    diagnostics[sheetName] = {
      totalRowsFound: rawRows.length,
      row1Headers: firstRowHeaders.slice(0, 15), // First 15 column keys
      row2Headers: secondRowHeaders.slice(0, 15),
      detectedSampleRows: sampleRows
    };
  }

  return diagnostics;
}
