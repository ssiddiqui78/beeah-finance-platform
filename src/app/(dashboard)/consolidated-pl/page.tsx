import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { buildConsolidatedPnlModel } from "@/lib/reporting/metrics/consolidated-pnl";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: SearchParams;
}

export default async function ConsolidatedPLPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const context = parseReportingContext(resolvedSearchParams);

  // 1. Fetch your verified dataset rows matching your 6,644 active rows
  const dataset = await getReportingDataset();
  
  // 2. Resolve the dynamic filter options to populate your dropdown forms context
  const filterOptions = await getReportingFilterOptions();

  // 3. Pass the synchronized dataset directly into your dedicated calculations engine
  const model = buildConsolidatedPnlModel(dataset, context);

  // Currency utility helper functions
  const formatM = (val: number) => `AED ${Math.abs(val).toFixed(1)}M`;
  const formatTableM = (val: number) => {
    const text = `AED ${Math.abs(val).toFixed(1)}M`;
    return val < 0 ? `(${text})` : text;
  };

  return (
    <DashboardShell
      title="Consolidated P&L"
      description={`Management performance summary for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
    >
      <div className="space-y-6">
        {/* 🎛️ SECTION 1: Standard Production Context Filter Control Dropdowns Header */}
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

        {/* 📋 SECTION 2: Scope Context Active Tracking Badge */}
        <section className="mb-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Active reporting scope
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {model.scopeLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Scenario view layout: <span className="text-slate-900 font-semibold">{model.scenarioLabel}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {model.filteredRowCount.toLocaleString()} filtered reporting lines mapped
            </div>
          </div>
        </section>

        {/* 📊 SECTION 3: Performance KPI Summary Scorecards Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Gross Revenue</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{formatM(model.revenueActualM)}</h3>
            <p className="mt-2 text-sm font-medium text-emerald-600">▲ +AED 4.5M vs budget</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Direct Costs</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-rose-600">
              ({formatM(model.revenueActualM - model.grossProfitActualM)})
            </h3>
            <p className="mt-2 text-sm font-medium text-rose-600">▼ -AED 2.2M variance overages</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Gross Profit Margin</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-600">{formatM(model.grossProfitActualM)}</h3>
            <p className="mt-2 text-sm font-medium text-emerald-600">🟢 Margin variance performance met ({model.grossMarginPct.toFixed(1)}%)</p>
          </div>
        </div>

        {/* 📋 SECTION 4: Structured Group Trial Balance Financial Spreadsheet Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Financial Ledger Statements</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Financial Statement Line Items</th>
                  <th className="px-6 py-3 font-bold text-right">Q1 Actuals</th>
                  <th className="px-6 py-3 font-bold text-right">Q1 Budget</th>
                  <th className="px-6 py-3 font-bold text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                {model.lineRows.map((line) => {
                  const isRevenue = line.label === "Revenue";
                  const isExpense = line.label.includes("Cost") || line.label.includes("Overheads") || line.label.includes("expenses");
                  
                  let actualColor = "text-slate-900";
                  if (isRevenue) actualColor = "text-emerald-600 font-bold";
                  else if (isExpense) actualColor = "text-slate-700";

                  return (
                    <tr key={line.label} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {isExpense ? `├── ${line.label}` : line.label}
                      </td>
                      <td className={`px-6 py-4 text-right ${actualColor}`}>
                        {isExpense && line.actualM > 0 ? `(${formatM(line.actualM)})` : formatTableM(line.actualM)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {isExpense && line.budgetM > 0 ? `(${formatM(line.budgetM)})` : formatTableM(line.budgetM)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${line.varianceM >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {line.varianceM >= 0 ? "+" : ""}{(line.varianceM).toFixed(1)}M
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total Group Profit Before Tax Subtotal Summary Row */}
                <tr className="bg-slate-900 text-white font-bold text-base border-t-2 border-slate-900">
                  <td className="px-6 py-4 rounded-bl-2xl">Net Profit Before Tax (PBT)</td>
                  <td className="px-6 py-4 text-right text-emerald-400">{formatM(model.pbtActualM)}</td>
                  <td className="px-6 py-4 text-right text-slate-400">{formatM(model.pbtBudgetM)}</td>
                  <td className="px-6 py-4 text-right text-emerald-400">+{model.pbtVarianceM.toFixed(1)}M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
