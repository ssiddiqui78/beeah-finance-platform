import fs from "node:fs";
import path from "node:path";
import { serverEnv } from "../../env.server";
import { parseBeeahWorkbookFile } from "../parsers/beeah-workbook-parser";
import { loadReportingDataset } from "../loaders/reporting-loader";
import type { ParsedReportDataset } from "../../../types/reporting";

/**
 * PRIMARY DATA ARCHITECTURE CORE: 
 * Route dashboard queries to the primary unified reporting loader engine.
 */
export async function getReportingDataset(): Promise<ParsedReportDataset> {
  try {
    const result = await loadReportingDataset();
    if (result && result.dataset && result.dataset.reportingRows && result.dataset.reportingRows.length > 0) {
      return result.dataset;
    }
  } catch (loaderError) {
    console.warn("[REPORTING_SOURCE_LOADER_CRASH]: Loader layer bypassed, trying direct cache resolvers.", loaderError);
  }

  // Self-healing fallback: Resolve cache using the exact same multi-name syntax from reporting-status
  try {
    const snapshotService = require("./local-report-snapshot");
    const readFn = 
      snapshotService.readLocalReportSnapshot || 
      snapshotService.default?.readLocalReportSnapshot ||
      snapshotService.getSnapshot ||
      snapshotService.default?.getSnapshot;

    if (typeof readFn === "function") {
      const snapshot = await readFn();
      if (snapshot && snapshot.reportingRows && snapshot.reportingRows.length > 0) {
        console.log(`[REPORTING_SOURCE]: Restored calculations via self-healing cache function mapping.`);
        return snapshot;
      }
    }
  } catch (cacheError) {
    console.warn("[REPORTING_SOURCE_CACHE_FAILED]: Cache unresolved, falling back to workbook parse.", cacheError);
  }

  return getRawWorkbookFallbackDataset();
}

/**
 * LOW-LEVEL BACKUP ENGINE: Directly parses the physical Excel sheet from your local machine staging directory.
 */
export async function getRawWorkbookFallbackDataset(): Promise<ParsedReportDataset> {
  const configuredPath = serverEnv.REPORTING_WORKBOOK_PATH || "./data/input/beeah-monthly-report.xlsx";
  const resolvedDestination = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);

  if (!fs.existsSync(resolvedDestination)) {
    throw new Error(`Master Workbook File Absence: No Excel spreadsheet discovered at path: ${resolvedDestination}`);
  }

  const fileBuffer = fs.readFileSync(resolvedDestination);
  const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
  const periodCode = serverEnv.REPORTING_PERIOD_CODE || "2026-03";
  
  return await parseBeeahWorkbookFile(arrayBuffer as any, periodCode);
}
