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
 * LOW-LEVEL BACKUP ENGINE: Directly passes the physical Excel sheet string path to the parser.
 */
export async function getRawWorkbookFallbackDataset(): Promise<ParsedReportDataset> {
  const configuredPath = serverEnv.REPORTING_WORKBOOK_PATH || "./data/input/beeah-monthly-report.xlsx";
  const resolvedDestination = path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);

  if (!fs.existsSync(resolvedDestination)) {
    throw new Error(`Master Workbook File Absence: No Excel spreadsheet discovered at path: ${resolvedDestination}`);
  }

  const periodCode = serverEnv.REPORTING_PERIOD_CODE || "2026-03";
  
  // Cleaned Call: Pass the file path string directly and wrap the configuration options in an object container.
  // Removed 'await' since the underlying parser executes synchronously.
  return parseBeeahWorkbookFile(resolvedDestination, {
    periodCode: periodCode,
    periodLabel: "Mar 2026 YTD"
  });
}
