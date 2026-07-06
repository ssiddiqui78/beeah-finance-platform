import type { ParsedReportDataset } from "@/types/reporting";

export interface ReportingRepository {
  getLatestDataset(): Promise<ParsedReportDataset | null>;
  saveDataset(dataset: ParsedReportDataset): Promise<void>;
  getRepositoryName(): string;
}
