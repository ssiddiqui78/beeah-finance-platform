// src/app/(dashboard)/balance-sheet/page.tsx
import React from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

function formatCurrency(value: number): string {
  if (value === 0) return "-";
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

export default async function BalanceSheetPage() {
  const dataset = await getReportingDataset();
  const bsRows = dataset.reportingRows.filter(row => row.statementType === "BS");

  return (
    <DashboardShell
      title="Consolidated Balance Sheet"
      description={`Statement of financial position as of close of period (${dataset.currency} in Millions).`}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {bsRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No active balance sheet ledger metrics discovered in the uploaded workbook.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600">
                <tr>
                  <th className="p-4 pl-6 min-w-[260px]">Statement Line Item</th>
                  <th className="p-4 text-right">Q1 Closing</th>
                  <th className="p-4 text-right">Q2 Target</th>
                  <th className="p-4 text-right">Q3 Target</th>
                  <th className="p-4 text-right">Q4 Target</th>
                  <th className="p-4 pr-6 text-right font-semibold text-slate-900">YTD Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bsRows.map((row) => {
                  const isTotal = row.glName.toLowerCase().includes("total") || row.glName.toLowerCase().includes("net");
                  return (
                    <tr 
                      key={row.glCode} 
                      className={`hover:bg-slate-50/50 transition-colors ${isTotal ? "bg-slate-50/70 font-semibold text-slate-950" : ""}`}
                    >
                      <td className="p-4 pl-6 font-medium">{row.glName}</td>
                      <td className="p-4 text-right tabular-nums">{formatCurrency(row.q1Actuals / 1_000_000)}</td>
                      <td className="p-4 text-right tabular-nums">{formatCurrency(row.q2Budget / 1_000_000)}</td>
                      <td className="p-4 text-right tabular-nums">{formatCurrency(row.q3Budget / 1_000_000)}</td>
                      <td className="p-4 text-right tabular-nums">{formatCurrency(row.q4Budget / 1_000_000)}</td>
                      <td className={`p-4 pr-6 text-right tabular-nums ${isTotal ? "text-emerald-700 border-double border-b-4 border-slate-300" : ""}`}>
                        {formatCurrency(row.q1Actuals / 1_000_000)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
