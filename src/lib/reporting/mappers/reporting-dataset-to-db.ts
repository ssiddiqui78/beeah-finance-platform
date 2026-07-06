import type { ParsedReportDataset } from "../../../types/reporting";
import type { PersistableReportingDataset } from "../../../types/database";

function parsePeriod(periodCode: string) {
  const [yearText, monthText] = periodCode.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  const quarter =
    month <= 3 ? "Q1" :
    month <= 6 ? "Q2" :
    month <= 9 ? "Q3" : "Q4";

  return { year, month, quarter };
}

export function mapParsedDatasetToDbPayload(
  dataset: ParsedReportDataset,
): PersistableReportingDataset {
  const { year, month, quarter } = parsePeriod(dataset.periodCode);

  return {
    period: {
      period_code: dataset.periodCode,
      period_label: dataset.periodLabel,
      fiscal_year: year,
      fiscal_month: month,
      quarter_label: quarter,
      status: "draft",
      source_type: dataset.sourceType,
    },
    rows: dataset.reportingRows.map((row) => ({
      period_id: "",
      source_type: row.sourceType,
      source_batch_id: null,
      statement_type: row.statementType,
      scenario: row.scenario,
      version_label: row.versionLabel ?? null,
      co_code: row.coCode ?? null,
      co_name: row.coName ?? null,
      gl_code: row.glCode ?? null,
      gl_name: row.glName ?? null,
      ey_mapping_1: row.eyMapping1 ?? null,
      ey_mapping_2: row.eyMapping2 ?? null,
      notes: row.notes ?? null,
      type: row.type ?? null,
      pc_code: row.pcCode ?? null,
      pc_name: row.pcName ?? null,
      vertical: row.vertical ?? null,
      sub_vertical: row.subVertical ?? null,
      geographical: row.geographical ?? null,
      org_level_3: row.orgLevel3 ?? null,
      jan_value: row.janValue,
      feb_value: row.febValue,
      mar_value: row.marValue,
      apr_value: row.aprValue,
      may_value: row.mayValue,
      jun_value: row.junValue,
      jul_value: row.julValue,
      aug_value: row.augValue,
      sep_value: row.sepValue,
      oct_value: row.octValue,
      nov_value: row.novValue,
      dec_value: row.decValue,
      q1_actuals: row.q1Actuals,
      q1_budget: row.q1Budget,
      q2_budget: row.q2Budget,
      q3_budget: row.q3Budget,
      q4_budget: row.q4Budget,
      ytd_budget: row.ytdBudget,
    })),
    controls: dataset.summaryControls.map((control) => ({
      period_id: "",
      control_section: control.controlSection,
      control_line: control.controlLine,
      budget_value: control.budgetValue,
      actual_value: control.actualValue,
      variance_value: control.varianceValue,
      variance_pct: control.variancePct ?? null,
    })),
  };
}
