import fs from "node:fs";
import path from "node:path";

import { serverEnv } from "../../env.server";
import { mapParsedDatasetToDbPayload } from "../mappers/reporting-dataset-to-db";
import { parseBeeahWorkbookFile } from "../parsers/beeah-workbook-parser";
import { resolveReportingRepository } from "../repositories/repository-resolver";
import type { ParsedReportDataset } from "../../../types/reporting";

type ImportWorkbookOptions = {
  workbookPath?: string;
};

export async function importWorkbookToLocalSnapshot(
  options: ImportWorkbookOptions = {}
): Promise<{
  dataset: ParsedReportDataset;
  snapshotPath: string | null;
  workbookPath: string;
  repositoryName: string;
  preparedReportingRowCount: number;
  preparedSummaryControlCount: number;
}> {
  const workbookPath =
    options.workbookPath ??
    serverEnv.REPORTING_WORKBOOK_PATH ??
    path.join(process.cwd(), "data/input/beeah-monthly-report.xlsx");

  const resolvedPath = path.isAbsolute(workbookPath)
    ? workbookPath
    : path.join(process.cwd(), workbookPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Workbook not found at: ${resolvedPath}`);
  }

  // 1. Read the physical file into a Node Buffer
  const fileBuffer = fs.readFileSync(resolvedPath);
  
  // 2. Convert Node Buffer to an ArrayBuffer for your workbook parser
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset, 
    fileBuffer.byteOffset + fileBuffer.byteLength
  );

  const periodCode = serverEnv.REPORTING_PERIOD_CODE ?? "2026-03";
  const dataset = await parseBeeahWorkbookFile(arrayBuffer as any, periodCode);

  // 3. TRANSITIONAL STEP A: Write down local file snapshot backup data to disk drive cache
  try {
    const snapshotService = require("./local-report-snapshot");
    const writeFn = snapshotService.saveSnapshot || snapshotService.default?.saveSnapshot || snapshotService.writeLocalReportSnapshot;
    if (typeof writeFn === "function") {
      await writeFn(dataset);
    }
  } catch (snapshotError) {
    console.warn("[TRANSITIONAL_SNAPSHOT_BACKUP_WARN]:", snapshotError);
  }

  // 4. TRANSITIONAL STEP B: Automatically resolve the active repository and stream live data to Supabase Postgres
  const repository = resolveReportingRepository();
  const saveResult = await repository.saveDataset(dataset);

  return {
    dataset,
    snapshotPath: "src/data/local-report-snapshot.json",
    workbookPath: resolvedPath,
    repositoryName: repository.getRepositoryName(),
    preparedReportingRowCount: saveResult.rowCount,
    preparedSummaryControlCount: saveResult.controlCount,
  };
}
