import { normalizePnlDisplayValue } from "@/lib/reporting/normalizers";
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
  const filteredRows = dataset.reportingRows.filter((row) => {
    if (row.statementType !== "PL") return false;

    const verticalMatch =
      context.vertical === "all" || (row.vertical ?? "").trim() === context.vertical;

    const subVerticalMatch =
      context.subVertical === "all" ||
      (row.subVertical ?? "").trim() === context.subVertical;

    return verticalMatch && subVerticalMatch;
  });

  const allPnlRows = dataset.reportingRows.filter((row) => row.statementType === "PL");
  const totalGroupPbtM = sumAllPnl(allPnlRows, "q1Actuals") / 1_000_000;

  const revenueActualM = sumByEy1(filteredRows, "Revenue", "q1Actuals") / 1_000_000;
  const revenueBudgetM = sumByEy1(filteredRows, "Revenue", "q1Budget") / 1_000_000;

  const directCostActualM =
    sumByEy1(filteredRows, "Direct Cost", "q1Actuals") / 1_000_000;

  const grossProfitActualM = revenueActualM + directCostActualM;
  const grossMarginPct =
    revenueActualM === 0 ? 0 : (grossProfitActualM / revenueActualM) * 100;

  const pbtActualM = sumAllPnl(filteredRows, "q1Actuals") / 1_000_000;
  const pbtBudgetM = sumAllPnl(filteredRows, "q1Budget") / 1_000_000;
  const pbtVarianceM = pbtActualM - pbtBudgetM;

  const contributionPct =
    totalGroupPbtM === 0 ? 0 : (pbtActualM / totalGroupPbtM) * 100;

  const groupingKey = determineGroupingKey(context);
  const groupingLabel = determineGroupingLabel(context);

  const grouped = groupRows(filteredRows, groupingKey);
  const matrixRows = Object.entries(grouped)
    .map(([label, rows]) => buildMatrixRow(label, rows, pbtActualM))
    .sort((a, b) => b.pbtActualM - a.pbtActualM);

  const focusItems = buildFocusItems({
    scopeLabel: buildScopeLabel(context),
    revenueActualM,
    revenueBudgetM,
    pbtActualM,
    pbtBudgetM,
    matrixRows,
  });

  return {
    periodLabel: dataset.periodLabel,
    scopeLabel: buildScopeLabel(context),
    scenarioLabel: formatScenarioLabel(context.scenario),
    groupingLabel,
    filteredRowCount: filteredRows.length,

    revenueActualM,
    revenueBudgetM,
    grossProfitActualM,
    grossMarginPct,
    pbtActualM,
    pbtBudgetM,
    pbtVarianceM,
    contributionPct,

    matrixRows,
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

function determineGroupingKey(
  context: ReportingContext
): "vertical" | "subVertical" | "coName" | "pcName" {
  if (context.vertical === "all") return "vertical";
  if (context.subVertical === "all") return "subVertical";
  if (context.view === "profit_center") return "pcName";
  return "coName";
}

function determineGroupingLabel(context: ReportingContext): string {
  if (context.vertical === "all") return "Grouped by Vertical";
  if (context.subVertical === "all") return "Grouped by Sub-Vertical";
  if (context.view === "profit_center") return "Grouped by Profit Center";
  return "Grouped by Company";
}

function groupRows(
  rows: ReportingRow[],
  key: "vertical" | "subVertical" | "coName" | "pcName"
): Record<string, ReportingRow[]> {
  const grouped: Record<string, ReportingRow[]> = {};

  for (const row of rows) {
    const label = (row[key] ?? "Unmapped").trim() || "Unmapped";

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push(row);
  }

  return grouped;
}

function buildMatrixRow(
  label: string,
  rows: ReportingRow[],
  scopePbtActualM: number
): SegmentMatrixRow {
  const revenueActualM = sumByEy1(rows, "Revenue", "q1Actuals") / 1_000_000;
  const revenueBudgetM = sumByEy1(rows, "Revenue", "q1Budget") / 1_000_000;
  const directCostActualM = sumByEy1(rows, "Direct Cost", "q1Actuals") / 1_000_000;
  const grossProfitActualM = revenueActualM + directCostActualM;
  const grossMarginPct =
    revenueActualM === 0 ? 0 : (grossProfitActualM / revenueActualM) * 100;

  const pbtActualM = sumAllPnl(rows, "q1Actuals") / 1_000_000;
  const pbtBudgetM = sumAllPnl(rows, "q1Budget") / 1_000_000;
  const varianceM = pbtActualM - pbtBudgetM;

  const contributionPct =
    scopePbtActualM === 0 ? 0 : (pbtActualM / scopePbtActualM) * 100;

  return {
    label,
    revenueActualM,
    revenueBudgetM,
    grossProfitActualM,
    grossMarginPct,
    pbtActualM,
    pbtBudgetM,
    varianceM,
    contributionPct,
  };
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

function buildFocusItems(input: {
  scopeLabel: string;
  revenueActualM: number;
  revenueBudgetM: number;
  pbtActualM: number;
  pbtBudgetM: number;
  matrixRows: SegmentMatrixRow[];
}): string[] {
  const items: string[] = [];

  const topContributor = input.matrixRows[0];
  const lowestContributor = [...input.matrixRows].sort(
    (a, b) => a.varianceM - b.varianceM
  )[0];
  const bestVariance = [...input.matrixRows].sort(
    (a, b) => b.varianceM - a.varianceM
  )[0];

  items.push(`Current segment scope: ${input.scopeLabel}.`);

  const revenueGap = input.revenueActualM - input.revenueBudgetM;
  if (revenueGap < 0) {
    items.push(
      `Revenue is below budget by AED ${Math.abs(revenueGap).toFixed(1)}M in the selected scope.`
    );
  } else {
    items.push(
      `Revenue is ahead of budget by AED ${revenueGap.toFixed(1)}M in the selected scope.`
    );
  }

  const pbtGap = input.pbtActualM - input.pbtBudgetM;
  if (pbtGap < 0) {
    items.push(
      `PBT is behind budget by AED ${Math.abs(pbtGap).toFixed(1)}M in the selected scope.`
    );
  } else {
    items.push(`PBT is ahead of budget by AED ${pbtGap.toFixed(1)}M.`);
  }

  if (topContributor) {
    items.push(
      `${topContributor.label} represents the leading performance center in this group context at AED ${topContributor.pbtActualM.toFixed(1)}M.`
    );
  }

  return items;
}
