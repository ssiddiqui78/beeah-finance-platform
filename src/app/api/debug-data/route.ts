import { NextResponse } from "next/server";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

export async function GET() {
  try {
    const dataset = await getReportingDataset();
    
    // Scan statement types inside the row matrix
    const totalRows = dataset?.reportingRows?.length || 0;
    const bsRowsCount = dataset?.reportingRows?.filter((r: any) => String(r.statementType || "").trim().toUpperCase() === "BS").length || 0;
    const plRowsCount = dataset?.reportingRows?.filter((r: any) => String(r.statementType || "").trim().toUpperCase() === "PL").length || 0;
    
    // Sample rows and distinct tracking columns
    const sampleRows = dataset?.reportingRows?.slice(0, 3) || [];
    const uniqueStatementTypes = Array.from(new Set(dataset?.reportingRows?.map((r: any) => r.statementType)));
    const uniqueMappings = Array.from(new Set(dataset?.reportingRows?.map((r: any) => r.eyMapping1).filter(Boolean))).slice(0, 10);
    const summaryControlsKeys = dataset?.summaryControls?.map((c: any) => c.controlLine) || [];

    return NextResponse.json({
      success: true,
      message: "Data-layer diagnostic telemetry report complete.",
      activePeriodLabel: dataset?.periodLabel || "Missing",
      totalRowsDiscovered: totalRows,
      balanceSheetRowsCount: bsRowsCount,
      incomeStatementRowsCount: plRowsCount,
      allDiscoveredStatementTypes: uniqueStatementTypes,
      sampleEyMapping1Values: uniqueMappings,
      workbookSummaryControlsFound: summaryControlsKeys,
      sampleRowStructure: sampleRows
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    }, { status: 500 });
  }
}
