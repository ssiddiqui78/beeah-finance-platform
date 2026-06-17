import type { ReportingContext, ReportingScenario, ReportingView } from "@/types/reporting-context";

type SearchParamValue = string | string[] | undefined;

function pickSingleValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeScenario(value: string | undefined): ReportingScenario {
  if (
    value === "actual_vs_budget" ||
    value === "actual" ||
    value === "budget" ||
    value === "forecast"
  ) {
    return value;
  }

  return "actual_vs_budget";
}

function normalizeView(value: string | undefined): ReportingView {
  if (
    value === "group" ||
    value === "segment" ||
    value === "company" ||
    value === "profit_center"
  ) {
    return value;
  }

  return "group";
}

export function parseReportingContext(
  searchParams: Record<string, SearchParamValue>
): ReportingContext {
  return {
    period: pickSingleValue(searchParams.period) ?? "latest",
    scenario: normalizeScenario(pickSingleValue(searchParams.scenario)),
    vertical: pickSingleValue(searchParams.vertical) ?? "all",
    subVertical: pickSingleValue(searchParams.subVertical) ?? "all",
    view: normalizeView(pickSingleValue(searchParams.view)),
  };
}

export function buildScopeLabel(context: ReportingContext): string {
  const parts: string[] = [];

  if (context.vertical !== "all") {
    parts.push(context.vertical);
  }

  if (context.subVertical !== "all") {
    parts.push(context.subVertical);
  }

  if (parts.length === 0) {
    return "Group-wide scope";
  }

  return parts.join(" • ");
}
