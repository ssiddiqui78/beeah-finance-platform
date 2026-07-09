import { NextResponse } from "next/server";
import { getReportingStatus } from "@/lib/reporting/services/reporting-status";
import supabaseReportingWriter from "@/lib/reporting/repositories/impl/supabase-reporting-writer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getReportingStatus();
    return NextResponse.json({
      message: "Diagnostics API endpoint active.",
      status
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const importService = require("@/lib/reporting/services/import-workbook");
    let importWorkbookToLocalSnapshot = 
      importService.importWorkbookToLocalSnapshot || 
      importService.default || 
      importService;

    const explicitFallbackPath = "./data/input/beeah-monthly-report.xlsx";
    
    // Execute workbook compilation and capture the result
    let result = await importWorkbookToLocalSnapshot({ workbookPath: explicitFallbackPath });
    
    return NextResponse.json({
      success: true,
      repository: result?.repositoryName,
      rowCount: result?.preparedReportingRowCount,
      controlCount: result?.preparedSummaryControlCount,
    });
  } catch (error: any) {
    console.error("[CRITICAL_DIAGNOSTICS_CATCH]:", error);
    
    // ⚡ FORCES THE REAL TRANSITION ERRORS AND TRACES TO DISPLAY DIRECTLY IN THE BROWSER WINDOW
    return NextResponse.json(
      {
        success: false,
        ok: false,
        errorMessage: error?.message || String(error),
        errorStack: error?.stack || "No trace found."
      },
      { status: 500 }
    );
  }
}
