import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

function validateWorkbook() {
  console.log("?? [TEST BENCH] Starting corporate workbook structural analysis...");
  const targetPath = path.resolve(process.cwd(), "data/input/beeah-monthly-report.xlsx");
  console.log("?? Checking file stream target at: " + targetPath);

  if (!fs.existsSync(targetPath)) {
    console.error("? ERROR: Target file 'beeah-monthly-report.xlsx' is missing inside 'data/input/' directory.");
    process.exit(1);
  }

  try {
    const fileBuffer = fs.readFileSync(targetPath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    console.log("? SUCCESS: Excel binary successfully read by compiler engine.");
    console.log("?? Discovered sheets count: " + workbook.SheetNames.length);
    console.log("?? Entities parsed list: [ " + workbook.SheetNames.join(", ") + " ]");
  } catch (error: any) {
    console.error("? CRITICAL FAULT: Failed to parse spreadsheet cells.", error.message);
  }
}

validateWorkbook();
