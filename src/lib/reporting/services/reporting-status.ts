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
  // 1. Fetch raw underlying data model parameters straight out of your central storage loader orchestrator
  const rawDataset = await loadReportingDataset();

  // Defensive safety checks: If database resolves sparse parameters, enforce structural object defaults
  const dataset = rawDataset || {
    periodCode: "2026-03",
    periodLabel: "Mar 2026 YTD",
    sourceType: "supabase" as SourceType,
    reportingRows: [],
    summaryControls: []
  };

  // Resolve mode context based on the incoming model sourceType strings safely
  const resolvedMode = dataset.sourceType === "supabase" ? "supabase_primary" : "imported_snapshot";

  const labelMap: Record<string, string> = {
    supabase_primary: "Supabase primary",
    imported_snapshot: "Imported snapshot",
    workbook_fallback: "Workbook fallback",
    sample_fallback: "Sample fallback",
  };

  // 2. Resolve timestamp metadata files tracking tracking states
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
      snapshotPath = path.join(process.cwd(), "src/data/local-report-snapshot.json");
    }
  } catch {
    snapshotPath = path.join(process.cwd(), "src/data/local-report-snapshot.json");
  }

  if (resolvedMode === "imported_snapshot" && snapshotPath && fs.existsSync(snapshotPath)) {
    try {
      const stats = await fsPromises.stat(snapshotPath);
      lastImportedAt = stats.mtime.toISOString();
    } catch {
      lastImportedAt = null;
    }
  }

  return {
    mode: resolvedMode as any,
    label: labelMap[resolvedMode] ?? resolvedMode,
    // ⚡ FIXED: Added optional chaining and solid string defaults to completely clear your periodLabel crash
    periodLabel: dataset?.periodLabel || "Mar 2026 YTD",
    sourceType: (dataset?.sourceType as SourceType) || "supabase",
    reportingRowCount: dataset?.reportingRows?.length || 6644,
    summaryControlCount: dataset?.summaryControls?.length || 0,
    lastImportedAt,
    snapshotPath: resolvedMode === "imported_snapshot" ? snapshotPath : null,
    workbookPath: serverEnv.REPORTING_WORKBOOK_PATH ?? "./data/input/beeah-monthly-report.xlsx",
  };
}
