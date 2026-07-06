// 1. Force synchronous inline ingestion of env variables first before loading any modules
const path = require("node:path");
const fs = require("node:fs");

const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf8");
  envConfig.split(/\r?\n/).forEach((line: string) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, ""); // Clean quotes
      process.env[key.trim()] = value.trim();
    }
  });
}

// 2. Dynamically require the import function at execution runtime to bypass static hoisting blocks
const { importWorkbookToLocalSnapshot } = require("../src/lib/reporting/services/import-workbook");

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
      result.dataset.reportingRows.slice(0, 5).map((row: any) => ({
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
