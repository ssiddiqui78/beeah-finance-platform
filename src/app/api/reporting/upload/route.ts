import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { serverEnv } from "../../../../lib/env.server";
import { getReportingStatus } from "../../../../lib/reporting/services/reporting-status";

// Force runtime dynamic execution to completely bypass module caching issues
export const dynamic = "force-dynamic";

function resolveWorkbookPath() {
  const configuredPath =
    serverEnv.REPORTING_WORKBOOK_PATH ??
    "./data/input/beeah-monthly-report.xlsx";

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "No workbook file was provided.",
        },
        { status: 400 }
      );
    }

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unsupported file type. Please upload .xlsx, .xls, or .csv.",
        },
        { status: 400 }
      );
    }

    const targetPath = resolveWorkbookPath();
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(targetPath, buffer);

    // Webpack cache bypass: resolve the local import service utility explicitly at runtime execution
    const importService = require("../../../../lib/reporting/services/import-workbook");
    const importWorkbookToLocalSnapshot = 
      importService.importWorkbookToLocalSnapshot || 
      importService.default || 
      importService;

    if (typeof importWorkbookToLocalSnapshot !== "function") {
      throw new Error("Ingestion Engine Error: Target service is not a callable function.");
    }

    const importResult = await importWorkbookToLocalSnapshot({
      workbookPath: targetPath,
    });

    const status = await getReportingStatus();

    return NextResponse.json({
      ok: true,
      message: "Workbook uploaded and imported successfully.",
      savedFileName: file.name,
      savedPath: targetPath,
      repositoryName: importResult.repositoryName,
      reportingRowCount: importResult.dataset?.reportingRows?.length || importResult.preparedReportingRowCount || 0,
      summaryControlCount: importResult.dataset?.summaryControls?.length || importResult.preparedSummaryControlCount || 0,
      periodLabel: importResult.dataset?.periodLabel || "Unknown Period",
      status: {
        ...status,
        reportingRowCount: importResult.dataset?.reportingRows?.length || importResult.preparedReportingRowCount || 0,
        summaryControlCount: importResult.dataset?.summaryControls?.length || importResult.preparedSummaryControlCount || 0,
      },
    });
  } catch (error) {
    console.error("[UPLOAD_API_FAILURE]:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Workbook upload failed unexpectedly.",
      },
      { status: 500 }
    );
  }
}
