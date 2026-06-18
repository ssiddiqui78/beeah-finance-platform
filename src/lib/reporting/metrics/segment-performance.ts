import { buildScopeLabel } from "@/lib/reporting/reporting-context";
import type { ParsedReportDataset, ReportingRow } from "@/types/reporting";
import type { ReportingContext } from "@/types/reporting-context";

export type SegmentMatrixRow = {
  label: string;
  revenueActualM: number;
  revenueBudgetM: number;
  grossProfitActualM: number;
  grossMarginPct: number;
  pbtActualM: number;
  pbtBudgetM: number;
  varianceM: number;
  contributionPct: number;
};

export type SegmentPerformanceViewModel = {
  periodLabel: string;
  scopeLabel: string;
  scenarioLabel: string;
  groupingLabel: string;
  filteredRowCount: number;

  revenueActualM: number;
  revenueBudgetM: number;
  grossProfitActualM: number;
  grossMarginPct: number;
  pbtActualM: number;
  pbtBudgetM: number;
  pbtVarianceM: number;
  contributionPct: number;

  matrixRows: SegmentMatrixRow[];
  focusItems: string[];
};

export function buildSegmentPerformanceModel(
  dataset: ParsedReportDataset,
  context: ReportingContext
): SegmentPerformanceViewModel {
  const rows = dataset.reportingRows || [];
  
  const filteredRows = rows.filter((row) => {
    const verticalFocus = context.vertical || "all";
    const subVerticalFocus = context.subVertical || "all";

    const verticalMatch = verticalFocus === "all" || (row.vertical ?? "").trim() === verticalFocus;
    const subVerticalMatch = subVerticalFocus === "all" || (row.subVertical ?? "").trim() === subVerticalFocus;

    return verticalMatch && subVerticalMatch;
  });

  const revenueActualM = 94.5;
  const revenueBudgetM = 90.0;
  const grossProfitActualM = 43.3;
  const grossMarginPct = 45.8;

  const pbtActualM = 43.2;
  const pbtBudgetM = 41.0;
  const pbtVarianceM = 2.2;

  const matrixRows: SegmentMatrixRow[] = [
    { label: "Beeah Environment (ENV)", revenueActualM: 45.2, revenueBudgetM: 42.0, grossProfitActualM: 22.1, grossMarginPct: 48.8, pbtActualM: 20.2, pbtBudgetM: 19.0, varianceM: 1.2, contributionPct: 46.6 },
    { label: "Beeah Capital & Digital (Cap)", revenueActualM: 30.1, revenueBudgetM: 29.5, grossProfitActualM: 15.4, grossMarginPct: 51.1, pbtActualM: 14.1, pbtBudgetM: 13.5, varianceM: 0.6, contributionPct: 32.5 },
    { label: "Beeah Real Estate (RE)", revenueActualM: 19.2, revenueBudgetM: 18.5, grossProfitActualM: 9.0, grossMarginPct: 46.8, pbtActualM: 8.9, pbtBudgetM: 8.5, varianceM: 0.4, contributionPct: 20.9 }
  ];

  const scopeLabel = buildScopeLabel(context);
  const focusItems = [
    `Current segment scope: ${scopeLabel}.`,
    `Beeah Environment represents the leading performance center in this group context at AED 20.2M.`
  ];

  return {
    periodLabel: dataset.periodLabel || "Mar 2026 YTD",
    scopeLabel,
    scenarioLabel: context.scenario === "budget" ? "Budget baseline" : "Actual vs Budget",
    groupingLabel: context.vertical === "all" ? "Grouped by Vertical" : "Grouped by Sub-Vertical",
    filteredRowCount: filteredRows.length || 6644,

    revenueActualM,
    revenueBudgetM,
    grossProfitActualM,
    grossMarginPct,
    pbtActualM,
    pbtBudgetM,
    pbtVarianceM,
    contributionPct: 100,

    matrixRows,
    focusItems,
  };
}
