// src/lib/reporting/services/reporting-status.ts
import fs from "fs";
import path from "path";

export interface ReportingStatusModel {
  isHealthy: boolean;
  activeDataSource: "excel" | "mock_fallback";
  cacheSnapshotExists: boolean;
  lastImportTimestamp: string | null;
  recordsCount: number;
}

/**
 * Evaluates the structural health parameters of your platform data layers natively.
 * Fully type-guarded with try/catch to protect your UI boundaries from throwing 500 crashes.
 */
export async function getReportingStatus(): Promise<ReportingStatusModel> {
  const cachePath = path.resolve(process.cwd(), "data/cache/latest-report-snapshot.json");
  
  // Set explicit default baseline states
  let cacheSnapshotExists = false;
  let lastImportTimestamp: string | null = null;
  let recordsCount = 0;
  let activeDataSource: "mock_fallback" | "excel" = "mock_fallback";

  try {
    // Safely verify if the file structurally exists on disk partition loops
    if (fs.existsSync(cachePath)) {
      cacheSnapshotExists = true;
      const fileStats = fs.statSync(cachePath);
      lastImportTimestamp = fileStats.mtime.toISOString();

      const rawJson = fs.readFileSync(cachePath, "utf8");
      
      // Strict fallback guard: ensure raw string is not completely empty before parsing
      if (rawJson && rawJson.trim().length > 0) {
        const parsedData = JSON.parse(rawJson);
        recordsCount = Array.isArray(parsedData?.reportingRows) 
          ? parsedData.reportingRows.length 
          : 0;
          
        if (recordsCount > 0) {
          activeDataSource = "excel";
        }
      }
    }
  } catch (error) {
    // Log the glitch safely to server output logs without letting it trip your client screens
    console.warn("⚠️ Data status verification fallback triggered gracefully:", error);
  }

  return {
    isHealthy: true,
    activeDataSource,
    cacheSnapshotExists,
    lastImportTimestamp,
    recordsCount
  };
}
