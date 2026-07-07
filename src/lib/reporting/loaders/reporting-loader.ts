import { readLocalReportSnapshot } from "../services/local-report-snapshot";
import { getReportingDataset } from "../services/reporting-source";
import type { ParsedReportDataset } from "../../../types/reporting";

export type ReportingLoadResult = {
  dataset: ParsedReportDataset;
  mode:
    | "supabase_primary"
    | "imported_snapshot"
    | "workbook_fallback"
    | "sample_fallback";
};

export async function loadReportingDataset(): Promise<ReportingLoadResult> {
  // 📂 TIER 1: Secondary Resilient Path - Local JSON Cache Snapshot File (Forced Primary for UI Calculations)
  try {
    const snapshotService = require("../services/local-report-snapshot");
    const readFn = 
      snapshotService.getSnapshot || 
      snapshotService.default?.getSnapshot || 
      snapshotService.readLocalReportSnapshot ||
      snapshotService.default?.readLocalReportSnapshot;

    if (typeof readFn === "function") {
      const localSnapshot = await readFn();
      if (localSnapshot && localSnapshot.reportingRows && localSnapshot.reportingRows.length > 0) {
        console.log(`[LOADER]: Successfully loaded ${localSnapshot.reportingRows.length} active ledger lines from local snapshot cache.`);
        return {
          dataset: localSnapshot,
          mode: "imported_snapshot",
        };
      }
    }
  } catch (snapshotError) {
    console.warn("[LOADER_SNAPSHOT_WARN]: Cache read failed, shifting down to workbook fallback stacks.", snapshotError);
  }

  // 📊 TIER 2: Safe Failover - Dynamic Workbook Parse or Base Sample Engine Dataset
  const fallbackDataset = await getReportingDataset();

  return {
    dataset: fallbackDataset,
    mode:
      fallbackDataset.sourceType === "excel"
        ? "workbook_fallback"
        : "sample_fallback",
  };
}
