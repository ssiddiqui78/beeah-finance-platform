export type ReportPeriodInsert = {
  period_code: string;
  period_label: string;
  fiscal_year: number;
  fiscal_month: number | null;
  quarter_label: string | null;
  status: string;
  source_type: string;
};

export type ReportingRowInsert = {
  source_type: string;
  source_batch_id: string | null;
  statement_type: string;
  scenario: string;
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
  jan_value: number;
  feb_value: number;
  mar_value: number;
  apr_value: number;
  may_value: number;
  jun_value: number;
  jul_value: number;
  aug_value: number;
  sep_value: number;
  oct_value: number;
  nov_value: number;
  dec_value: number;
  q1_actuals: number;
  q1_budget: number;
  q2_budget: number;
  q3_budget: number;
  q4_budget: number;
  ytd_budget: number;
};

export type SummaryControlInsert = {
  control_section: string;
  control_line: string;
  budget_value: number;
  actual_value: number;
  variance_value: number;
  variance_pct: number | null;
};

export type PersistableReportingDataset = {
  reportPeriod: ReportPeriodInsert;
  reportingRows: ReportingRowInsert[];
  summaryControls: SummaryControlInsert[];
};
