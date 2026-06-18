import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
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
  searchParams: Promise<{ 
    period?: string; 
    scenario?: string; 
    vertical?: string; 
    subVertical?: string; 
    view?: string; 
  }>;
}

export default function ConsolidatedPnLPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse m-6" />}>
      <PnLContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PnLContent({ searchParams }: PageProps) {
  const dataset = await getReportingDataset();
  const plRows = dataset.reportingRows.filter(row => row.statementType === "PL");
  
  const resolvedParams = await searchParams;
  const verticalFocus = resolvedParams.vertical || "all";
  const subVerticalFocus = resolvedParams.subVertical || "all";
  
  const activeCurrency = "AED";

  // Scan live dataset options on the server side
  const filterOptions = await getReportingFilterOptions();

  // Apply conditional data-aware filtering constraints over raw ledger rows
  const filteredRows = plRows.filter(row => {
    if (verticalFocus !== "all" && row.vertical !== verticalFocus) return false;
    if (subVerticalFocus !== "all" && row.subVertical !== subVerticalFocus) return false;
    return true;
  });

  return (
    <DashboardShell
      title="Consolidated Income Statement"
      description={`Source-driven dynamic ledger view across operational sectors (${activeCurrency} in Millions).`}
    > 
      <div className="space-y-6">
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />
        
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No active P&L ledger metrics matched your selected reporting context filter fields.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600">
                  <tr>
                    <th className="p-4 pl-6 min-w-[280px]">Financial Line Item</th>
                    <th className="p-4 text-right">Q1 Actuals</th>
                    <th className="p-4 text-right">Q2 Budget</th>
                    <th className="p-4 text-right">Q3 Budget</th>
                    <th className="p-4 text-right">Q4 Budget</th>
                    <th className="p-4 pr-6 text-right font-semibold text-slate-900">Period Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRows.map((row, idx) => {
                    const name = row.glName || "";
                    const isTotal = name.toLowerCase().includes("total") || name.toLowerCase().includes("profit");
                    
                    const dynamicTotal = 
                      (row.q1Actuals || 0) + 
                      (row.q2Budget || 0) + 
                      (row.q3Budget || 0) + 
                      (row.q4Budget || 0);
                      
                    const compositeKey = `${row.glCode || "GL"}-${idx}-${name.substring(0,3)}`;
                    
                    return (
                      <tr 
                        key={compositeKey} 
                        className={`hover:bg-slate-50/50 transition-colors ${isTotal ? "bg-slate-50/70 font-semibold text-slate-950" : ""}`}
                      >
                        <td className="p-4 pl-6 font-medium">{name}</td>
                        <td className="p-4 text-right tabular-nums">{formatCurrency((row.q1Actuals || 0) / 1_000_000)}</td>
                        <td className="p-4 text-right tabular-nums">{formatCurrency((row.q2Budget || 0) / 1_000_000)}</td>
                        <td className="p-4 text-right tabular-nums">{formatCurrency((row.q3Budget || 0) / 1_000_000)}</td>
                        <td className="p-4 text-right tabular-nums">{formatCurrency((row.q4Budget || 0) / 1_000_000)}</td>
                        <td className={`p-4 pr-6 text-right tabular-nums ${isTotal ? "text-emerald-700 border-double border-b-4 border-slate-300" : ""}`}>
                          {formatCurrency(dynamicTotal / 1_000_000)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
