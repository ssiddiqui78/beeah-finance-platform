import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

import { serverEnv } from "../../env.server";
import { loadReportingDataset } from "../loaders/reporting-loader";
import type { SourceType } from "../../../types/reporting";

export type ReportingStatus = {
  mode: "supabase_primary" | "imported_snapshot" | "workbook_fallback" | "sample_fallback";
  label: string;
  periodLabel: string;
  sourceType: SourceType;
  reportingRowCount: number | null;
  summaryControlCount: number | null;
  lastImportedAt: string | null;
  snapshotPath: string | null;
  workbookPath?: string;
};

export async function getReportingStatus(): Promise<ReportingStatus> {
  // 1. Query the unified data orchestrator loader layer to check the current storage state
  const { dataset, mode } = await loadReportingDataset();

  const labelMap: Record<string, string> = {
    supabase_primary: "Supabase primary",
    imported_snapshot: "Imported snapshot",
    workbook_fallback: "Workbook fallback",
    sample_fallback: "Sample fallback",
  };

  // 2. Resolve the timestamp metadata for file tracking resilience with self-healing checks
  let lastImportedAt: string | null = null;
  let snapshotPath: string | null = null;

  try {
    const snapshotService = require("./local-report-snapshot");
    const pathFn = 
      snapshotService.getSnapshotPath || 
      snapshotService.default?.getSnapshotPath || 
      snapshotService.getLocalReportSnapshotPath ||
      snapshotService.default?.getLocalReportSnapshotPath;

    if (typeof pathFn === "function") {
      snapshotPath = pathFn();
    } else {
      // Direct literal calculation backup fallback
      snapshotPath = path.join(process.cwd(), "src/data/local-report-snapshot.json");
    }
  } catch {
    snapshotPath = path.join(process.cwd(), "src/data/local-report-snapshot.json");
  }

  if (mode === "imported_snapshot" && snapshotPath && fs.existsSync(snapshotPath)) {
    try {
      const stats = await fsPromises.stat(snapshotPath);
      lastImportedAt = stats.mtime.toISOString();
    } catch {
      lastImportedAt = null;
    }
  }

  return {
    mode,
    label: labelMap[mode] ?? mode,
    periodLabel: dataset.periodLabel || "Mar 2026 YTD",
    sourceType: dataset.sourceType || "excel",
    reportingRowCount: dataset.reportingRows?.length || 0,
    summaryControlCount: dataset.summaryControls?.length || 0,
    lastImportedAt,
    snapshotPath: mode === "imported_snapshot" ? snapshotPath : null,
    workbookPath: serverEnv.REPORTING_WORKBOOK_PATH ?? "./data/input/beeah-monthly-report.xlsx",
  };
}
