import type { ParsedReportDataset } from "../../../../types/reporting";
import type { ReportingRepository } from "../reporting-repository";

export class LocalReportingRepository implements ReportingRepository {
  getRepositoryName() {
    return "local_json_snapshot";
  }

  async getLatestDataset(): Promise<ParsedReportDataset | null> {
    try {
      // Bypass static TS compilation by resolving module dynamically at runtime execution
      const snapshotService = require("../../services/local-report-snapshot");
      const readFn = snapshotService.getSnapshot || snapshotService.default?.getSnapshot || snapshotService.readLocalReportSnapshot;
      
      if (typeof readFn === "function") {
        return await readFn();
      }
      return null;
    } catch (error) {
      console.error("[LOCAL_REPO_GET_FAILED]:", error);
      return null;
    }
  }

  async saveDataset(dataset: ParsedReportDataset) {
    try {
      const snapshotService = require("../../services/local-report-snapshot");
      const writeFn = snapshotService.saveSnapshot || snapshotService.default?.saveSnapshot || snapshotService.writeLocalReportSnapshot;
      
      if (typeof writeFn === "function") {
        await writeFn(dataset);
      } else {
        console.warn("[LOCAL_REPO_SAVE_ERROR]: Snapshot write function was not callable.");
      }
    } catch (error) {
      console.error("[LOCAL_REPO_SAVE_FAILED]:", error);
    }

    return {
      rowCount: dataset.reportingRows?.length || 0,
      controlCount: dataset.summaryControls?.length || 0,
    };
  }
}
