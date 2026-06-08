// src/app/(dashboard)/consolidated-pnl/page.tsx
import React, { Suspense } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import PeriodFilter from "@/components/shared/period-filter";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

function formatCurrency(value: number): string {
  if (value === 0) return "-";
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function ConsolidatedPnLPage({ searchParams }: PageProps) {
  const dataset = await getReportingDataset();
  const plRows = dataset.reportingRows.filter(row => row.statementType === "PL");
  
  const resolvedParams = await searchParams;
  const periodFocus = resolvedParams.period || "all";

  return (
    <DashboardShell
      title="Consolidated Income Statement"
      description={`Source-driven dynamic ledger view across operational sectors (${dataset.currency} in Millions).`}
    >
      <div className="space-y-4">
        <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse" />}>
          <PeriodFilter />
        </Suspense>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600">
                <tr>
                  <th className="p-4 pl-6 min-w-[280px]">Financial Line Item</th>
                  {(periodFocus === "all" || periodFocus === "Q1") && <th className="p-4 text-right">Q1 Actuals</th>}
                  {(periodFocus === "all" || periodFocus === "Q2") && <th className="p-4 text-right">Q2 Budget</th>}
                  {(periodFocus === "all" || periodFocus === "Q3") && <th className="p-4 text-right">Q3 Budget</th>}
                  {(periodFocus === "all" || periodFocus === "Q4") && <th className="p-4 text-right">Q4 Budget</th>}
                  <th className="p-4 pr-6 text-right font-semibold text-slate-900">Period Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {plRows.map((row) => {
                  const isTotal = row.glName.toLowerCase().includes("total") || row.glName.toLowerCase().includes("profit");
                  
                  let dynamicTotal = 0;
                  if (periodFocus === "all") dynamicTotal = row.q1Actuals + row.q2Budget + row.q3Budget + row.q4Budget;
                  if (periodFocus === "Q1") dynamicTotal = row.q1Actuals;
                  if (periodFocus === "Q2") dynamicTotal = row.q2Budget;
                  if (periodFocus === "Q3") dynamicTotal = row.q3Budget;
                  if (periodFocus === "Q4") dynamicTotal = row.q4Budget;

                  return (
                    <tr 
                      key={row.glCode} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isTotal ? "bg-slate-50/70 font-semibold text-slate-950" : ""
                      }`}
                    >
                      <td className="p-4 pl-6 font-medium">{row.glName}</td>
                      {(periodFocus === "all" || periodFocus === "Q1") && <td className="p-4 text-right tabular-nums">{formatCurrency(row.q1Actuals / 1_000_000)}</td>}
                      {(periodFocus === "all" || periodFocus === "Q2") && <td className="p-4 text-right tabular-nums">{formatCurrency(row.q2Budget / 1_000_000)}</td>}
                      {(periodFocus === "all" || periodFocus === "Q3") && <td className="p-4 text-right tabular-nums">{formatCurrency(row.q3Budget / 1_000_000)}</td>}
                      {(periodFocus === "all" || periodFocus === "Q4") && <td className="p-4 text-right tabular-nums">{formatCurrency(row.q4Budget / 1_000_000)}</td>}
                      <td className={`p-4 pr-6 text-right tabular-nums ${
                        isTotal ? "text-emerald-700 border-double border-b-4 border-slate-300" : ""
                      }`}>
                        {formatCurrency(dynamicTotal / 1_000_000)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
