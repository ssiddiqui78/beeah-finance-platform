import { ReportingContext, ReportingScenario, ReportingView } from "@/types/reporting-context";

export function parseReportingContext(searchParams: Record<string, string | string[] | undefined>): ReportingContext {
  const period = typeof searchParams.period === "string" ? searchParams.period : "latest";
  
  const rawScenario = typeof searchParams.scenario === "string" ? searchParams.scenario : "actual_vs_budget";
  const scenario: ReportingScenario = ["actual_vs_budget", "actual", "budget", "forecast"].includes(rawScenario)
    ? (rawScenario as ReportingScenario)
    : "actual_vs_budget";

  const vertical = typeof searchParams.vertical === "string" ? searchParams.vertical : "all";
  const subVertical = typeof searchParams.subVertical === "string" ? searchParams.subVertical : "all";

  const rawView = typeof searchParams.view === "string" ? searchParams.view : "group";
  const view: ReportingView = ["group", "segment", "company", "profit_center"].includes(rawView)
    ? (rawView as ReportingView)
    : "group";

  return {
    period,
    scenario,
    vertical,
    subVertical,
    view,
  };
}
