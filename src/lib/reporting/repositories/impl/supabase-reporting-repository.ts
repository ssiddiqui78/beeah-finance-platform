import type { ParsedReportDataset } from "../../../../types/reporting";
import type { ReportingRepository } from "../reporting-repository";
import { createSupabaseAdminClient } from "../../../supabase/admin";
import { mapParsedDatasetToDbPayload } from "../../mappers/reporting-dataset-to-db";

export class SupabaseReportingRepository implements ReportingRepository {
  getRepositoryName() {
    return "supabase_postgres";
  }

  async getLatestDataset(): Promise<ParsedReportDataset | null> {
    return null;
  }

  async saveDataset(dataset: ParsedReportDataset) {
    const supabase = createSupabaseAdminClient();
    const payload = mapParsedDatasetToDbPayload(dataset);

    const { data: existingPeriod, error: existingPeriodError } = await supabase
      .from("report_periods")
      .select("id")
      .eq("period_code", payload.period.period_code)
      .maybeSingle();

    if (existingPeriodError) throw existingPeriodError;

    let periodId = existingPeriod?.id as string | undefined;

    if (!periodId) {
      const { data: insertedPeriod, error: insertPeriodError } = await supabase
        .from("report_periods")
        .insert(payload.period)
        .select("id")
        .single();

      if (insertPeriodError) throw insertPeriodError;
      periodId = insertedPeriod.id;
    }

    const { error: deleteRowsError } = await supabase
      .from("reporting_rows")
      .delete()
      .eq("period_id", periodId);

    if (deleteRowsError) throw deleteRowsError;

    const { error: deleteControlsError } = await supabase
      .from("summary_controls")
      .delete()
      .eq("period_id", periodId);

    if (deleteControlsError) throw deleteControlsError;

    const rows = payload.rows.map((row) => ({ ...row, period_id: periodId! }));
    const controls = payload.controls.map((item) => ({ ...item, period_id: periodId! }));

    if (rows.length > 0) {
      const { error: rowsError } = await supabase.from("reporting_rows").insert(rows);
      if (rowsError) throw rowsError;
    }

    if (controls.length > 0) {
      const { error: controlsError } = await supabase.from("summary_controls").insert(controls);
      if (controlsError) throw controlsError;
    }

    return {
      rowCount: rows.length,
      controlCount: controls.length,
    };
  }
}
