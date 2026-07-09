import { createSupabaseServerClient } from "../../../supabase/server";
import type { ParsedReportDataset } from "../../../../types/reporting";

export async function readLatestDatasetFromSupabase(): Promise<ParsedReportDataset | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Query the primary reporting lines table from Supabase
    const { data: rows, error: rowsError } = await supabase
      .from("reporting_rows")
      .select("gl_code, gl_name, statement_type, ey_mapping_1, vertical, sub_vertical, q1_actuals, q2_budget");

    if (rowsError || !rows) {
      console.error("[SUPABASE_READER_ERR]: Failed to fetch reporting rows.", rowsError);
      return null;
    }

    // 2. Map snake_case database columns back to camelCase frontend keys
    const reportingRows = rows.map((r: any) => ({
      glCode: r.gl_code,
      glName: r.gl_name,
      statementType: r.statement_type || "PL",
      eyMapping1: r.ey_mapping_1,
      vertical: r.vertical,
      subVertical: r.sub_vertical,
      q1Actuals: Number(r.q1_actuals || 0),
      q1Budget: Number(r.q2_budget || 0), // Maps your database column back to dashboard models
      scenario: "actual",
      versionLabel: "base"
    }));

    return {
      periodCode: "2026-03",
      periodLabel: "Mar 2026 YTD",
      sourceType: "supabase",
      reportingRows,
      summaryControls: []
    };

  } catch (error) {
    console.error("[SUPABASE_READER_CRASH]:", error);
    return null;
  }
}
