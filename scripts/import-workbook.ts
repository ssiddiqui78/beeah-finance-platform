import * as path from 'path';
import { importWorkbookFile } from '../src/lib/reporting/services/import-workbook';

async function runImport() {
  console.log('📥 [INGESTION ENGINE] Starting Excel ledger row extraction runner...');
  const defaultFilePath = 'data/input/beeah-monthly-report.xlsx';
  const defaultPeriod = '2026-03';

  try {
    console.log('⏳ Parsing spreadsheet file buffer elements: ' + defaultFilePath);
    await importWorkbookFile(defaultFilePath, defaultPeriod);
    console.log('✨ SUCCESS: Ingestion pipeline finished error-free!');
    console.log('💾 The system local disk snapshot cache is completely hydrated.');
  } catch (error: any) {
    console.error('❌ INGESTION FAILED: Critical pipeline error encountered:');
    console.error(error.message);
    process.exit(1);
  }
}

runImport();
