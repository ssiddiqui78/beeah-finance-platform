import { ParsedReportDataset } from "../../../types/reporting";
import { reportingRepository } from "../repositories/reporting-repository";

export async function getReportingDataset(): Promise<ParsedReportDataset> {
  return reportingRepository.findLatest();
}
