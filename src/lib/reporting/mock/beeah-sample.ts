import type { ParsedReportDataset } from "@/types/reporting";

export const beeahSampleDataset: ParsedReportDataset = {
  periodCode: "2026-03",
  periodLabel: "Mar 2026 YTD",
  sourceType: "excel",
  reportingRows: [
    {
      periodCode: "2026-03", periodLabel: "Mar 2026 YTD", sourceType: "excel", statementType: "PL", scenario: "actual", versionLabel: "base", coCode: "UAE", coName: "Beeah_UAE", glCode: "REV-ENV-001", glName: "Service revenue", eyMapping1: "Revenue", eyMapping2: "Service revenue", notes: "Sample seed row", type: "PL", pcCode: "ENV-TAN", pcName: "Tandeef", vertical: "ENV", subVertical: "Tandeef", geographical: "Domestic", orgLevel3: "Operations",
      janValue: -110000000, febValue: -105000000, marValue: -105000000, aprValue: 0, mayValue: 0, junValue: 0, julValue: 0, augValue: 0, sepValue: 0, octValue: 0, novValue: 0, decValue: 0, q1Actuals: -320000000, q1Budget: -340000000, q2Budget: 0, q3Budget: 0, q4Budget: 0, ytdBudget: -340000000
    },
    {
      periodCode: "2026-03", periodLabel: "Mar 2026 YTD", sourceType: "excel", statementType: "PL", scenario: "actual", versionLabel: "base", coCode: "UAE", coName: "Beeah_UAE", glCode: "CST-ENV-001", glName: "Direct cost", eyMapping1: "Direct Cost", eyMapping2: "Direct Employees Cost", notes: "Sample seed row", type: "PL", pcCode: "ENV-TAN", pcName: "Tandeef", vertical: "ENV", subVertical: "Tandeef", geographical: "Domestic", orgLevel3: "Operations",
      janValue: 80000000, febValue: 76000000, marValue: 74000000, aprValue: 0, mayValue: 0, junValue: 0, julValue: 0, augValue: 0, sepValue: 0, octValue: 0, novValue: 0, decValue: 0, q1Actuals: 230000000, q1Budget: 245000000, q2Budget: 0, q3Budget: 0, q4Budget: 0, ytdBudget: 245000000
    }
  ],
  summaryControls: [
    { periodCode: "2026-03", periodLabel: "Mar 2026 YTD", controlSection: "Performance", controlLine: "Revenue", budgetValue: 445.425, actualValue: 399.194, varianceValue: -46.231, variancePct: -10.4 },
    { periodCode: "2026-03", periodLabel: "Mar 2026 YTD", controlSection: "Performance", controlLine: "Profit before tax", budgetValue: 37.847, actualValue: 36.553, varianceValue: -1.294, variancePct: -3.4 },
    { periodCode: "2026-03", periodLabel: "Mar 2026 YTD", controlSection: "Liquidity", controlLine: "Current Ratio", budgetValue: 1.08, actualValue: 1.08, varianceValue: 0, variancePct: 0 },
    { periodCode: "2026-03", periodLabel: "Mar 2026 YTD", controlSection: "Working Capital", controlLine: "DSO", budgetValue: 79, actualValue: 75, varianceValue: -4, variancePct: -5.1 }
  ]
};
