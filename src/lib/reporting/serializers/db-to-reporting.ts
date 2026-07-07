import type {
  ParsedReportDataset,
  ReportingRow,
  SourceType,
  SummaryControl,
} from "../../../types/reporting";

type DbPeriodRow = {
  id: string;
  period_code: string;
  period_label: string;
  source_type: string | null;
};

type DbReportingRow = {
  source_type: string | null;
  statement_type: string | null;
  scenario: string | null;
  version_label: string | null;
  co_code: string | null;
  co_name: string | null;
  gl_code: string | null;
  gl_name: string | null;
  ey_mapping_1: string | null;
  ey_mapping_2: string | null;
  notes: string | null;
  type: string | null;
  pc_code: string | null;
  pc_name: string | null;
  vertical: string | null;
  sub_vertical: string | null;
  geographical: string | null;
  org_level_3: string | null;
  jan_value: number | null;
  feb_value: number | null;
  mar_value: number | null;
  apr_value: number | null;
  may_value: number | null;
  jun_value: number | null;
  jul_value: number | null;
  aug_value: number | null;
  sep_value: number | null;
  oct_value: number | null;
  nov_value: number | null;
  dec_value: number | null;
  q1_actuals: number | null;
  q1_budget: number | null;
  q2_budget: number | null;
  q3_budget: number | null;
  q4_budget: number | null;
  ytd_budget: number | null;
};

type DbSummaryControlRow = {
  control_section: string | null;
  control_line: string | null;
  budget_value: number | null;
  actual_value: number | null;
  variance_value: number | null;
  variance_pct: number | null;
};

function asCleanNumber(value: number | null | undefined, forceAbsolute: boolean = false) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return forceAbsolute ? Math.abs(value) : value;
}

function asText(value: string | null | undefined) {
  return value ?? null;
}

export function mapDbRowsToParsedDataset(params: {
  period: DbPeriodRow;
  rows: DbReportingRow[];
  controls: DbSummaryControlRow[];
}): ParsedReportDataset {
  const sourceType = (params.period.source_type ?? "excel") as SourceType;

  const reportingRows: ReportingRow[] = params.rows.map((row) => {
    // 1. SCENARIO FALLBACK MATCHING: Safely force title-case strings back down to strict lowercase literals
    let calculatedScenario: "actual" | "budget" | "forecast" | "prior_year" = "actual";
    const rawScenarioText = (row.scenario || "actual").trim().toLowerCase();
    
    if (rawScenarioText.includes("budget")) calculatedScenario = "budget";
    else if (rawScenarioText.includes("forecast")) calculatedScenario = "forecast";
    else if (rawScenarioText.includes("prior") || rawScenarioText.includes("year")) calculatedScenario = "prior_year";

    const glName = (row.gl_name || "").trim();
    const eyMap1 = (row.ey_mapping_1 || "").trim();
    const glLower = glName.toLowerCase();
    const mapLower = eyMap1.toLowerCase();

    // 2. TERMINOLOGY ALIGNMENT: Wildcard lookup intercepts structural strings and cleans up text variations
    let forcedEyMapping1 = row.ey_mapping_1 || "Other Accounts";
    if (mapLower.includes("revenue") || mapLower.includes("turnover") || glLower.includes("revenue")) {
      forcedEyMapping1 = "Revenue";
    } else if (mapLower.includes("profit before tax") || mapLower.includes("pbt") || mapLower.includes("operating profit")) {
      forcedEyMapping1 = "Profit Before Tax";
    }

    // 3. STATEMENT TYPE NORMALIZATION: Map any flavor of P&L ("P&L", "Profit & Loss", "PL") safely to "PL" to appease types schema
    let unifiedStatementType: "PL" | "BS" | "CF" = "PL";
    const rawStatementText = (row.statement_type || "").trim().toUpperCase();
    const rawEyMapText = (row.ey_mapping_1 || "").trim().toUpperCase();
    
    if (rawStatementText.includes("BS") || rawStatementText.includes("BALANCE") || rawEyMapText.includes("BALANCE")) {
      unifiedStatementType = "BS";
    } else if (rawStatementText.includes("CF") || rawStatementText.includes("CASH") || rawEyMapText.includes("CASH")) {
      unifiedStatementType = "CF";
    }

    // Strip accounting credit balance markers (negatives) for clean summary representations
    const isIncomeLine = forcedEyMapping1 === "Revenue" || forcedEyMapping1 === "Profit Before Tax";

    return {
      periodCode: params.period.period_code,
      periodLabel: params.period.period_label,
      sourceType: (row.source_type ?? sourceType) as SourceType,
      statementType: unifiedStatementType,
      scenario: calculatedScenario,
      versionLabel: asText(row.version_label),
      coCode: row.co_code || "BEEAH_CO",
      coName: row.co_name ? row.co_name.trim() : "Beeah Holding",
      glCode: asText(row.gl_code),
      glName: glName,
      eyMapping1: forcedEyMapping1, 
      eyMapping2: asText(row.ey_mapping_2),
      notes: asText(row.notes),
      type: asText(row.type),
      pcCode: asText(row.pc_code),
      pcName: asText(row.pc_name),
      vertical: row.vertical ? row.vertical.trim() : "Waste Management",
      subVertical: row.sub_vertical ? row.sub_vertical.trim() : "Core Operations",
      geographical: asText(row.geographical),
      orgLevel3: asText(row.org_level_3),
      janValue: asCleanNumber(row.jan_value, isIncomeLine),
      febValue: asCleanNumber(row.feb_value, isIncomeLine),
      marValue: asCleanNumber(row.mar_value, isIncomeLine),
      aprValue: asCleanNumber(row.apr_value, isIncomeLine),
      mayValue: asCleanNumber(row.may_value, isIncomeLine),
      junValue: asCleanNumber(row.jun_value, isIncomeLine),
      julValue: asCleanNumber(row.jul_value, isIncomeLine),
      augValue: asCleanNumber(row.aug_value, isIncomeLine),
      sepValue: asCleanNumber(row.sep_value, isIncomeLine),
      octValue: asCleanNumber(row.oct_value, isIncomeLine),
      novValue: asCleanNumber(row.nov_value, isIncomeLine),
      decValue: asCleanNumber(row.dec_value, isIncomeLine),
      q1Actuals: asCleanNumber(row.q1_actuals, isIncomeLine),
      q1Budget: asCleanNumber(row.q1_budget, isIncomeLine),
      q2Budget: asCleanNumber(row.q2_budget, isIncomeLine),
      q3Budget: asCleanNumber(row.q3_budget, isIncomeLine),
      q4Budget: asCleanNumber(row.q4_budget, isIncomeLine),
      ytdBudget: asCleanNumber(row.ytd_budget, isIncomeLine),
    };
  });

  const summaryControls: SummaryControl[] = params.controls.map((row) => ({
    periodCode: params.period.period_code,
    periodLabel: params.period.period_label,
    controlSection: row.control_section ?? "General",
    controlLine: row.control_line ?? "Unknown",
    budgetValue: asCleanNumber(row.budget_value),
    actualValue: asCleanNumber(row.actual_value),
    varianceValue: asCleanNumber(row.variance_value),
    variancePct: row.variance_pct ?? null,
  }));

  return {
    periodCode: params.period.period_code,
    periodLabel: params.period.period_label,
    sourceType,
    reportingRows,
    summaryControls,
  };
}
