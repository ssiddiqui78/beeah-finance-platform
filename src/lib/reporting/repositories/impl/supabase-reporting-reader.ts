import { createSupabaseServerClient } from "../../../supabase/server";
import { mapDbRowsToParsedDataset } from "../../serializers/db-to-reporting";
import type { ParsedReportDataset } from "../../../../types/reporting";

export async function readLatestDatasetFromSupabase(): Promise<ParsedReportDataset | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Direct query lookup matching by active period code string instead of complex column indices
    const { data: period, error: periodError } = await supabase
      .from("report_periods")
      .select("id, period_code, period_label, source_type")
      .eq("period_code", "2026-03")
      .maybeSingle();

    if (periodError || !period) {
      // Fall back immediately to local snapshot parsing if no exact period code mapping row exists
      return null;
    }

    // 2. Query financial rows and dashboard control indicators in parallel paths
    const [{ data: rows, error: rowsError }, { data: controls, error: controlsError }] =
      await Promise.all([
        supabase
          .from("reporting_rows")
          .select(`
            source_type,
            statement_type,
            scenario,
            version_label,
            co_code,
            co_name,
            gl_code,
            gl_name,
            ey_mapping_1,
            ey_mapping_2,
            notes,
            type,
            pc_code,
            pc_name,
            vertical,
            sub_vertical,
            geographical,
            org_level_3,
            jan_value,
            feb_value,
            mar_value,
            apr_value,
            may_value,
            jun_value,
            jul_value,
            aug_value,
            sep_value,
            oct_value,
            nov_value,
            dec_value,
            q1_actuals,
            q1_budget,
            q2_budget,
            q3_budget,
            q4_budget,
            ytd_budget
          `)
          .eq("period_id", period.id),

        supabase
          .from("summary_controls")
          .select(`
            control_section,
            control_line,
            budget_value,
            actual_value,
            variance_value,
            variance_pct
          `)
          .eq("period_id", period.id),
      ]);

    if (rowsError || !rows || rows.length === 0) {
      return null;
    }

    // 3. Serialize your Postgres database rows smoothly straight back to application format
    return mapDbRowsToParsedDataset({
      period,
      rows: rows ?? [],
      controls: controls ?? [],
    });
  } catch (error) {
    console.warn("[SUPABASE_READER_EXCEPTION]: Redirecting to secondary local cache files stack.", error);
    return null;
  }
}
