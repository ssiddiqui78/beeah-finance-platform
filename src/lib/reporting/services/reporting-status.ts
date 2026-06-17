import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

import { serverEnv } from "@/lib/env.server";
import type { SourceType } from "@/types/reporting";

export type ReportingStatus = {
  mode: "imported_snapshot" | "workbook_fallback" | "sample_fallback";
  label: string;
  periodLabel: string;
  sourceType: SourceType;
  reportingRowCount: number | null;
  summaryControlCount: number | null;
  lastImportedAt: string | null;
  snapshotPath: string | null;
};

export async function getReportingStatus(): Promise<ReportingStatus> {
  let snapshot: any = null;
  let snapshotPath: string | null = null;

  // Bypasses static bundler warning traces by executing an inline evaluation check
  try {
    const snapshotService = require("./local-report-snapshot");
    const readSnapshot = snapshotService.readLocalReportSnapshot || snapshotService.default?.readLocalReportSnapshot;
    const getSnapshotPath = snapshotService.getLocalReportSnapshotPath || snapshotService.default?.getLocalReportSnapshotPath;

    if (typeof readSnapshot === "function") {
      snapshot = await readSnapshot();
    }
    if (typeof getSnapshotPath === "function") {
      snapshotPath = getSnapshotPath();
    }
  } catch {
    snapshot = null;
    snapshotPath = null;
  }

  if (snapshot && snapshotPath) {
    let lastImportedAt: string | null = null;

    try {
      const stats = await fsPromises.stat(snapshotPath);
      lastImportedAt = stats.mtime.toISOString();
    } catch {
      lastImportedAt = null;
    }

    return {
      mode: "imported_snapshot",
      label: "Imported snapshot",
      periodLabel: snapshot.periodLabel || "Active Snapshot",
      sourceType: snapshot.sourceType || "excel",
      reportingRowCount: snapshot.reportingRows?.length || 0,
      summaryControlCount: snapshot.summaryControls?.length || 0,
      lastImportedAt,
      snapshotPath,
    };
  }

  const workbookPath =
    serverEnv.REPORTING_WORKBOOK_PATH ??
    path.join(process.cwd(), "data/input/beeah-monthly-report.xlsx");

  const resolvedWorkbookPath = path.isAbsolute(workbookPath)
    ? workbookPath
    : path.join(process.cwd(), workbookPath);

  if (fs.existsSync(resolvedWorkbookPath)) {
    return {
      mode: "workbook_fallback",
      label: "Workbook fallback",
      periodLabel: serverEnv.REPORTING_PERIOD_LABEL || "Excel Mode",
      sourceType: "excel",
      reportingRowCount: null,
      summaryControlCount: null,
      lastImportedAt: null,
      snapshotPath: null,
    };
  }

  return {
    mode: "sample_fallback",
    label: "Sample fallback",
    periodLabel: "Sample dataset",
    sourceType: "manual",
    reportingRowCount: null,
    summaryControlCount: null,
    lastImportedAt: null,
    snapshotPath: null,
  };
}
