import { normalizePnlDisplayValue } from "@/lib/reporting/normalizers";
import { buildScopeLabel } from "@/lib/reporting/reporting-context";
import type { ParsedReportDataset, ReportingRow } from "@/types/reporting";
import type { ReportingContext } from "@/types/reporting-context";

export type PnlLineRow = {
  label: string;
  actualM: number;
  budgetM: number;
  varianceM: number;
  variancePct: number;
};

export type ConsolidatedPnlViewModel = {
  periodLabel: string;
  scopeLabel: string;
  scenarioLabel: string;
  filteredRowCount: number;

  revenueActualM: number;
  revenueBudgetM: number;
  grossProfitActualM: number;
  grossProfitBudgetM: number;
  grossMarginPct: number;
  pbtActualM: number;
  pbtBudgetM: number;
  pbtVarianceM: number;

  lineRows: PnlLineRow[];
  focusItems: string[];
};

const ORDERED_LINES = [
  "Revenue",
  "Direct Cost",
  "General & Admin Overheads",
  "Marketing expenses",
  "Finance Costs, Net",
  "Other Income_",
  "Share of Profit",
  "Impairment loss on financial assets",
] as const;

export function buildConsolidatedPnlModel(
  dataset: ParsedReportDataset,
  context: ReportingContext
): ConsolidatedPnlViewModel {
  const filteredRows = dataset.reportingRows.filter((row) => {
    if (row.statementType !== "PL") return false;

    const verticalMatch =
      context.vertical === "all" || (row.vertical ?? "").trim() === context.vertical;

    const subVerticalMatch =
      context.subVertical === "all" ||
      (row.subVertical ?? "").trim() === context.subVertical;

    return verticalMatch && subVerticalMatch;
  });

  const revenueActualM = sumByEy1(filteredRows, "Revenue", "q1Actuals") / 1_000_000;
  const revenueBudgetM = sumByEy1(filteredRows, "Revenue", "q1Budget") / 1_000_000;

  const directCostActualM =
    sumByEy1(filteredRows, "Direct Cost", "q1Actuals") / 1_000_000;
  const directCostBudgetM =
    sumByEy1(filteredRows, "Direct Cost", "q1Budget") / 1_000_000;

  const grossProfitActualM = revenueActualM + directCostActualM;
  const grossProfitBudgetM = revenueBudgetM + directCostBudgetM;

  const grossMarginPct =
    revenueActualM === 0 ? 0 : (grossProfitActualM / revenueActualM) * 100;

  const pbtActualM = sumAllPnl(filteredRows, "q1Actuals") / 1_000_000;
  const pbtBudgetM = sumAllPnl(filteredRows, "q1Budget") / 1_000_000;
  const pbtVarianceM = pbtActualM - pbtBudgetM;

  const lineRows: PnlLineRow[] = ORDERED_LINES.map((line) => {
    const actualM = sumByEy1(filteredRows, line, "q1Actuals") / 1_000_000;
    const budgetM = sumByEy1(filteredRows, line, "q1Budget") / 1_000_000;
    const varianceM = actualM - budgetM;

    return {
      label: line,
      actualM,
      budgetM,
      varianceM,
      variancePct: percentageVariance(actualM, budgetM),
    };
  });

  const focusItems = buildFocusItems({
    scopeLabel: buildScopeLabel(context),
    revenueActualM,
    revenueBudgetM,
    grossProfitActualM,
    grossProfitBudgetM,
    pbtActualM,
    pbtBudgetM,
    lineRows,
  });

  return {
    periodLabel: dataset.periodLabel,
    scopeLabel: buildScopeLabel(context),
    scenarioLabel: formatScenarioLabel(context.scenario),
    filteredRowCount: filteredRows.length,

    revenueActualM,
    revenueBudgetM,
    grossProfitActualM,
    grossProfitBudgetM,
    grossMarginPct,
    pbtActualM,
    pbtBudgetM,
    pbtVarianceM,

    lineRows,
    focusItems,
  };
}

function formatScenarioLabel(scenario: ReportingContext["scenario"]): string {
  switch (scenario) {
    case "actual":
      return "Actual only";
    case "budget":
      return "Budget baseline";
    case "forecast":
      return "Forecast view";
    default:
      return "Actual vs Budget";
  }
}

function sumByEy1(
  rows: ReportingRow[],
  eyMapping1: string,
  field: "q1Actuals" | "q1Budget"
): number {
  return rows
    .filter((row) => (row.eyMapping1 ?? "").trim().toLowerCase() === eyMapping1.toLowerCase())
    .reduce((sum, row) => {
      const rawValue = field === "q1Actuals" ? row.q1Actuals : row.q1Budget;
      return sum + normalizePnlDisplayValue(row.statementType, rawValue);
    }, 0);
}

function sumAllPnl(rows: ReportingRow[], field: "q1Actuals" | "q1Budget"): number {
  return rows.reduce((sum, row) => {
    const rawValue = field === "q1Actuals" ? row.q1Actuals : row.q1Budget;
    return sum + normalizePnlDisplayValue(row.statementType, rawValue);
  }, 0);
}

function percentageVariance(actual: number, budget: number): number {
  if (budget === 0) return 0;
  return ((actual - budget) / Math.abs(budget)) * 100;
}

function buildFocusItems(input: {
  scopeLabel: string;
  revenueActualM: number;
  revenueBudgetM: number;
  grossProfitActualM: number;
  grossProfitBudgetM: number;
  pbtActualM: number;
  pbtBudgetM: number;
  lineRows: PnlLineRow[];
}): string[] {
  const items: string[] = [];

  items.push(`Current P&L scope: ${input.scopeLabel}.`);

  const revenueGap = input.revenueActualM - input.revenueBudgetM;
  if (revenueGap < 0) {
    items.push(`Revenue is below budget by AED ${Math.abs(revenueGap).toFixed(1)}M in the selected scope.`);
  } else {
    items.push(`Revenue is ahead of budget by AED ${revenueGap.toFixed(1)}M in the selected scope.`);
  }

  const gpGap = input.grossProfitActualM - input.grossProfitBudgetM;
  if (gpGap < 0) {
    items.push(`Gross profit is behind budget by AED ${Math.abs(gpGap).toFixed(1)}M.`);
  } else {
    items.push(`Gross profit is ahead of budget by AED ${gpGap.toFixed(1)}M.`);
  }

  const pbtGap = input.pbtActualM - input.pbtBudgetM;
  if (pbtGap < 0) {
    items.push(`PBT is behind budget by AED ${Math.abs(pbtGap).toFixed(1)}M.`);
  } else {
    items.push(`PBT is ahead of budget by AED ${pbtGap.toFixed(1)}M.`);
  }

  return items;
}
