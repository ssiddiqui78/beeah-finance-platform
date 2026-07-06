import { importWorkbookToLocalSnapshot } from "../src/lib/reporting/services/import-workbook";

async function run() {
  try {
    const result = await importWorkbookToLocalSnapshot();

    console.log("Workbook import completed successfully");
    console.log("--------------------------------------");
    console.log("Workbook path:", result.workbookPath);
    console.log("Repository:", result.repositoryName);
    console.log("Snapshot path:", result.snapshotPath ?? "not used");
    console.log("Period:", result.dataset.periodLabel);
    console.log("Source type:", result.dataset.sourceType);
    console.log("Reporting rows:", result.dataset.reportingRows.length);
    console.log("Summary controls:", result.dataset.summaryControls.length);
    console.log("DB-ready reporting rows:", result.preparedReportingRowCount);
    console.log("DB-ready summary controls:", result.preparedSummaryControlCount);

    console.log("--------------------------------------");
    console.log("Sample rows:");
    console.table(
      result.dataset.reportingRows.slice(0, 5).map((row) => ({
        coName: row.coName,
        glName: row.glName,
        eyMapping1: row.eyMapping1,
        eyMapping2: row.eyMapping2,
        vertical: row.vertical,
        subVertical: row.subVertical,
        q1Actuals: row.q1Actuals,
        q1Budget: row.q1Budget,
      }))
    );
  } catch (error) {
    console.error("Workbook import failed");
    console.error(error);
    process.exit(1);
  }
}

run();
