import type { ParsedReportDataset } from "../../../../types/reporting";
import type { ReportingRepository } from "../reporting-repository";

export class LocalReportingRepository implements ReportingRepository {
  async getLatestDataset(): Promise<ParsedReportDataset | null> {
    try {
      const snapshotService = require("../../services/local-report-snapshot");
      const readFn = snapshotService.getSnapshot || snapshotService.default?.getSnapshot;
      
      if (typeof readFn === "function") {
        return await readFn();
      }
      return null;
    } catch (error) {
      console.error("[LOCAL_REPO_GET_FAILED]:", error);
      return null;
    }
  }

  async saveDataset(dataset: ParsedReportDataset): Promise<void> {
    try {
      const snapshotService = require("../../services/local-report-snapshot");
      const writeFn = snapshotService.saveSnapshot || snapshotService.default?.saveSnapshot;
      
      if (typeof writeFn === "function") {
        await writeFn(dataset);
      } else {
        console.warn("[LOCAL_REPO_SAVE_ERROR]: Snapshot write function was not callable.");
      }
    } catch (error) {
      console.error("[LOCAL_REPO_SAVE_FAILED]:", error);
    }
  }

  getRepositoryName(): string {
    return "local_json_snapshot";
  }
}
