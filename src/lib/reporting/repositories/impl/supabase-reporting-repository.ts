import { mapParsedDatasetToDbPayload } from "../../mappers/reporting-dataset-to-db";
import type { ReportingRepository } from "../reporting-repository";
import { createSupabaseAdminClient } from "../../../supabase/admin";
import type { ParsedReportDataset } from "../../../../types/reporting";

export class SupabaseReportingRepository implements ReportingRepository {
  async getLatestDataset(): Promise<ParsedReportDataset | null> {
    return null;
  }

  async saveDataset(dataset: ParsedReportDataset): Promise<void> {
    const client = createSupabaseAdminClient();

    if (!client) {
      throw new Error(
        "Supabase admin client is not configured. Add SUPABASE_SERVICE_ROLE_KEY and public Supabase URL first."
      );
    }

    const payload = mapParsedDatasetToDbPayload(dataset);

    const { data: periodRow, error: periodError } = await client
      .from("report_periods")
      .upsert(payload.reportPeriod, { onConflict: "period_code" })
      .select("id")
      .single();

    if (periodError || !periodRow) {
      throw new Error(periodError?.message ?? "Failed to upsert report period.");
    }

    const periodId = periodRow.id as string;

    const { error: deleteRowsError } = await client
      .from("reporting_rows")
      .delete()
      .eq("period_id", periodId);

    if (deleteRowsError) {
      throw new Error(deleteRowsError.message);
    }

    const { error: deleteControlsError } = await client
      .from("summary_controls")
      .delete()
      .eq("period_id", periodId);

    if (deleteControlsError) {
      throw new Error(deleteControlsError.message);
    }

    if (payload.reportingRows.length > 0) {
      const rowsToInsert = payload.reportingRows.map((row) => ({
        period_id: periodId,
        ...row,
      }));

      const { error: rowInsertError } = await client
        .from("reporting_rows")
        .insert(rowsToInsert);

      if (rowInsertError) {
        throw new Error(rowInsertError.message);
      }
    }

    if (payload.summaryControls.length > 0) {
      const controlsToInsert = payload.summaryControls.map((control) => ({
        period_id: periodId,
        ...control,
      }));

      const { error: controlInsertError } = await client
        .from("summary_controls")
        .insert(controlsToInsert);

      if (controlInsertError) {
        throw new Error(controlInsertError.message);
      }
    }
  }

  getRepositoryName(): string {
    return "supabase";
  }
}
