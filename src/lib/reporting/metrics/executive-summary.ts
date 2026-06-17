import { normalizePnlDisplayValue } from "@/lib/reporting/normalizers";
import { buildScopeLabel } from "@/lib/reporting/reporting-context";
import type { ParsedReportDataset, ReportingRow, SummaryControl } from "@/types/reporting";
import type { ReportingContext } from "@/types/reporting-context";

export type ExecutiveBridgeItem = {
  label: string;
  actual: number;
  budget: number;
  variance: number;
};

export type ExecutiveSummaryViewModel = {
  periodLabel: string;
  scopeLabel: string;
  scenarioLabel: string;
  filteredRowCount: number;

  revenueActualM: number;
  revenueBudgetM: number;
  revenueVariancePct: number;

  pbtActualM: number;
  pbtBudgetM: number;
  pbtVarianceM: number;

  currentRatio: number;
  currentRatioTarget: number;

  dso: number;
  dsoTarget: number;

  bridgeItems: ExecutiveBridgeItem[];
  attentionItems: string[];
};

export function buildExecutiveSummaryModel(
  dataset: ParsedReportDataset,
  context: ReportingContext
): ExecutiveSummaryViewModel {
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

  const pbtActualM = sumAllPnl(filteredRows, "q1Actuals") / 1_000_000;
  const pbtBudgetM = sumAllPnl(filteredRows, "q1Budget") / 1_000_000;

  const currentRatioControl = findSummaryControl(dataset.summaryControls, "Current Ratio");
  const dsoControl = findSummaryControl(dataset.summaryControls, "DSO");

  const currentRatio = currentRatioControl?.actualValue ?? 0;
  const currentRatioTarget = currentRatioControl?.budgetValue ?? currentRatio;

  const dso = dsoControl?.actualValue ?? 0;
  const dsoTarget = dsoControl?.budgetValue ?? dso;

  const bridgeItems: ExecutiveBridgeItem[] = [
    buildBridgeItem(filteredRows, "Revenue"),
    buildBridgeItem(filteredRows, "Direct Cost"),
    buildBridgeItem(filteredRows, "General & Admin Overheads"),
    buildBridgeItem(filteredRows, "Marketing expenses"),
    buildBridgeItem(filteredRows, "Finance Costs, Net"),
    buildBridgeItem(filteredRows, "Other Income_"),
  ];

  const scopeLabel = buildScopeLabel(context);

  const attentionItems = buildAttentionItems({
    scopeLabel,
    revenueActualM,
    revenueBudgetM,
    pbtActualM,
    pbtBudgetM,
    currentRatio,
    currentRatioTarget,
    dso,
    dsoTarget,
    bridgeItems,
  });

  return {
    periodLabel: dataset.periodLabel,
    scopeLabel,
    scenarioLabel: formatScenarioLabel(context.scenario),
    filteredRowCount: filteredRows.length,

    revenueActualM,
    revenueBudgetM,
    revenueVariancePct: percentageVariance(revenueActualM, revenueBudgetM),

    pbtActualM,
    pbtBudgetM,
    pbtVarianceM: pbtActualM - pbtBudgetM,

    currentRatio,
    currentRatioTarget,

    dso,
    dsoTarget,

    bridgeItems,
    attentionItems,
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

function findSummaryControl(
  controls: SummaryControl[],
  controlLine: string
): SummaryControl | undefined {
  return controls.find(
    (control) => control.controlLine.trim().toLowerCase() === controlLine.trim().toLowerCase()
  );
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

function buildBridgeItem(rows: ReportingRow[], eyMapping1: string): ExecutiveBridgeItem {
  const actual = sumByEy1(rows, eyMapping1, "q1Actuals");
  const budget = sumByEy1(rows, eyMapping1, "q1Budget");

  return {
    label: eyMapping1,
    actual,
    budget,
    variance: actual - budget,
  };
}

function percentageVariance(actual: number, budget: number): number {
  if (budget === 0) return 0;
  return ((actual - budget) / Math.abs(budget)) * 100;
}

function buildAttentionItems(input: {
  scopeLabel: string;
  revenueActualM: number;
  revenueBudgetM: number;
  pbtActualM: number;
  pbtBudgetM: number;
  currentRatio: number;
  currentRatioTarget: number;
  dso: number;
  dsoTarget: number;
  bridgeItems: ExecutiveBridgeItem[];
}): string[] {
  const items: string[] = [];

  const revenueGap = input.revenueActualM - input.revenueBudgetM;
  const pbtGap = input.pbtActualM - input.pbtBudgetM;
  const gnaBridge = input.bridgeItems.find(
    (item) => item.label === "General & Admin Overheads"
  );

  items.push(`Current scope: ${input.scopeLabel}.`);

  if (revenueGap < 0) {
    items.push(
      `Revenue is below budget by AED ${Math.abs(revenueGap).toFixed(1)}M in the selected scope.`
    );
  } else {
    items.push(
      `Revenue is ahead of budget by AED ${revenueGap.toFixed(1)}M in the selected scope.`
    );
  }

  if (pbtGap < 0) {
    items.push(
      `Profit before tax is behind budget by AED ${Math.abs(pbtGap).toFixed(1)}M.`
    );
  } else {
    items.push(`Profit before tax is ahead of budget by AED ${pbtGap.toFixed(1)}M.`);
  }

  if (gnaBridge) {
    const gnaVarianceM = gnaBridge.variance / 1_000_000;

    if (gnaVarianceM < 0) {
      items.push(
        `G&A is unfavorable by AED ${Math.abs(gnaVarianceM).toFixed(1)}M versus budget.`
      );
    } else {
      items.push(
        `G&A is favorable by AED ${gnaVarianceM.toFixed(1)}M versus budget.`
      );
    }
  }

  if (input.currentRatio < input.currentRatioTarget) {
    items.push(
      `Current ratio is below target at ${input.currentRatio.toFixed(2)}x versus ${input.currentRatioTarget.toFixed(2)}x.`
    );
  } else {
    items.push(
      `Current ratio is at or above target at ${input.currentRatio.toFixed(2)}x.`
    );
  }

  if (input.dso <= input.dsoTarget) {
    items.push(
      `DSO is within target at ${input.dso.toFixed(0)} days versus ${input.dsoTarget.toFixed(0)} days.`
    );
  } else {
    items.push(
      `DSO is above target at ${input.dso.toFixed(0)} days versus ${input.dsoTarget.toFixed(0)} days.`
    );
  }

  return items;
}
