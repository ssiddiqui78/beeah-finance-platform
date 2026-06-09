export type SourceType = "excel" | "sap_api" | "manual";
export type StatementType = "PL" | "BS" | "CF";
export type ScenarioType = "actual" | "budget" | "forecast" | "prior_year";
export type WorkflowStatus = "draft" | "reviewed" | "approved" | "locked";

export type ReportingRow = {
  periodCode: string;
  periodLabel: string;
  sourceType: SourceType;
  statementType: StatementType;
  scenario: ScenarioType;
  versionLabel?: string | null;
  coCode?: string | null;
  coName?: string | null;
  glCode?: string | null;
  glName: string;
  eyMapping1?: string | null;
  eyMapping2?: string | null;
  notes?: string | null;
  type?: string | null;
  pcCode?: string | null;
  pcName?: string | null;
  vertical?: string | null;
  subVertical?: string | null;
  geographical?: string | null;
  orgLevel3?: string | null;
  janValue: number; febValue: number; marValue: number;
  aprValue: number; mayValue: number; junValue: number;
  julValue: number; augValue: number; sepValue: number;
  octValue: number; novValue: number; decValue: number;
  q1Actuals: number; q1Budget: number;
  q2Budget: number; q3Budget: number; q4Budget: number;
  ytdBudget: number;
};

export type SummaryControl = {
  periodCode: string;
  periodLabel: string;
  controlSection: string;
  controlLine: string;
  budgetValue: number;
  actualValue: number;
  varianceValue: number;
  variancePct: number | null;
};

export type CommentaryRecord = {
  moduleKey: string;
  entityLevel: string;
  entityKey: string;
  ownerName?: string | null;
  status: WorkflowStatus;
  commentText: string;
};

export type ParsedReportDataset = {
  periodCode: string;
  periodLabel: string;
  sourceType: SourceType;
  reportingRows: ReportingRow[];
  summaryControls: SummaryControl[];
};

export {};
