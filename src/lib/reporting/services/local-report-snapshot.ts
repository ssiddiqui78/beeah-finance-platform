import * as fs from 'fs';
import * as path from 'path';
import { ParsedReportDataset } from '../../../types/reporting';

const CACHE_FILE_PATH = path.resolve(process.cwd(), 'data/cache/latest-report-snapshot.json');

export async function getSnapshot(): Promise<ParsedReportDataset | null> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const dataStr = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(dataStr) as ParsedReportDataset;
    }
  } catch (error) {
    console.error('⚠️ Failed to parse local json report snapshot cache:', error);
  }
  return null;
}

export async function saveSnapshot(dataset: ParsedReportDataset): Promise<void> {
  try {
    const dataStr = JSON.stringify(dataset, null, 2);
    fs.mkdirSync(path.dirname(CACHE_FILE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, dataStr, 'utf8');
    console.log('💾 Snapshot permanently saved to cache disk storage layer.');
  } catch (error) {
    console.error('❌ CRITICAL: Failed to write report snapshot file to cache partition:', error);
  }
}
