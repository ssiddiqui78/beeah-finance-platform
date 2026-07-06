import type { ParsedReportDataset } from "../../../types/reporting";

export interface ReportingRepository {
  getRepositoryName(): string;
  getLatestDataset(): Promise<ParsedReportDataset | null>;
  saveDataset(dataset: ParsedReportDataset): Promise<{
    rowCount: number;
    controlCount: number;
  }>;
}
