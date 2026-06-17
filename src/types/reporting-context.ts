export type ReportingScenario =
  | "actual_vs_budget"
  | "actual"
  | "budget"
  | "forecast";

export type ReportingView =
  | "group"
  | "segment"
  | "company"
  | "profit_center";

export type ReportingContext = {
  period: string;
  scenario: ReportingScenario;
  vertical: string;
  subVertical: string;
  view: ReportingView;
};
