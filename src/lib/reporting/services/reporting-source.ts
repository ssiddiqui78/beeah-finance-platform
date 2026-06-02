import { beeahSampleDataset } from "@/lib/reporting/mock/beeah-sample";
import { parseBeeahWorkbookFile } from "@/lib/reporting/parsers/beeah-workbook-parser";
import type { ParsedReportDataset } from "@/types/reporting";

type ReportingSourceOptions = {
  workbookPath?: string;
};

export async function getReportingDataset(
  options: ReportingSourceOptions = {}
): Promise<ParsedReportDataset> {
  if (options.workbookPath) {
    return parseBeeahWorkbookFile(options.workbookPath);
  }

  return beeahSampleDataset;
}
