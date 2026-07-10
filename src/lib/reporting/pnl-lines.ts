export const DRILLABLE_PNL_LINES = [
  "Revenue",
  "Direct Cost",
  "G&A",
  "Marketing",
  "Other Income",
  "Share of Profit",
  "Finance Costs",
] as const;

export type DrillablePnlLine = (typeof DRILLABLE_PNL_LINES)[number];

export function isDrillablePnlLine(value: string): value is DrillablePnlLine {
  return DRILLABLE_PNL_LINES.includes(value as DrillablePnlLine);
}

export function normalizePnlLineSelection(value: string | null | undefined): DrillablePnlLine {
  if (value && isDrillablePnlLine(value)) {
    return value;
  }

  return "Revenue";
}
