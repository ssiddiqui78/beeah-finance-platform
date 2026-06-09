import { ParsedReportDataset } from "../../../types/reporting";
import { getSnapshot, saveSnapshot } from "../services/local-report-snapshot";
import { beeahSampleDataset } from "../mock/beeah-sample";

export class ReportingRepository {
  async findLatest(): Promise<ParsedReportDataset> {
    const cached = await getSnapshot();
    if (cached) return cached;
    return beeahSampleDataset;
  }

  async save(dataset: ParsedReportDataset): Promise<void> {
    await saveSnapshot(dataset);
  }
}

export const reportingRepository = new ReportingRepository();
