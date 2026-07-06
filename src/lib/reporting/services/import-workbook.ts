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

  // Read the physical file into a Node Buffer
  const fileBuffer = fs.readFileSync(resolvedPath);
  
  // Convert Node Buffer to an ArrayBuffer for your workbook parser
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset, 
    fileBuffer.byteOffset + fileBuffer.byteLength
  );

  const periodCode = serverEnv.REPORTING_PERIOD_CODE ?? "2026-03";
  const dataset = await parseBeeahWorkbookFile(arrayBuffer as any, periodCode);

  const repository = resolveReportingRepository();
  const dbPayload = mapParsedDatasetToDbPayload(dataset);

  await repository.saveDataset(dataset);

  return {
    dataset,
    snapshotPath: repository.getRepositoryName() === "local_json_snapshot" ? "src/data/local-report-snapshot.json" : null,
    workbookPath: resolvedPath,
    repositoryName: repository.getRepositoryName(),
    preparedReportingRowCount: dbPayload.reportingRows.length,
    preparedSummaryControlCount: dbPayload.summaryControls.length,
  };
}
