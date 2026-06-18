import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
// Import the advanced playbook dynamic calculation model engine
import { buildConsolidatedPnlModel } from "@/lib/reporting/metrics/consolidated-pnl";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatAedMillions(value: number): string {
  return `AED ${value.toFixed(1)}M`;
}

function formatSignedAedMillions(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}AED ${Math.abs(value).toFixed(1)}M`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getToneClass(value: number): string {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";
  return "text-slate-600";
}

interface PageProps {
  searchParams: SearchParams;
}

export default function ConsolidatedPnLPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse m-6" />}>
      <PnLContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PnLContent({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const context = parseReportingContext(resolvedSearchParams);

  const dataset = (await getReportingDataset()) as any;
  const filterOptions = await getReportingFilterOptions();
  
  // Compute the dataset totals against context configurations
  const model = buildConsolidatedPnlModel(dataset, context);

  const cards = [
    {
      label: "Revenue",
      value: formatAedMillions(model.revenueActualM),
      change: `${formatSignedAedMillions(
        model.revenueActualM - model.revenueBudgetM
      )} vs budget`,
      tone: getToneClass(model.revenueActualM - model.revenueBudgetM),
    },
    {
      label: "Gross Profit",
      value: formatAedMillions(model.grossProfitActualM),
      change: `${formatSignedAedMillions(
        model.grossProfitActualM - model.grossProfitBudgetM
      )} vs budget`,
      tone: getToneClass(model.grossProfitActualM - model.grossProfitBudgetM),
    },
    {
      label: "Gross Margin",
      value: formatPercent(model.grossMarginPct),
      change: "Calculated from actual revenue and direct cost",
      tone: "text-slate-600",
    },
    {
      label: "PBT",
      value: formatAedMillions(model.pbtActualM),
      change: `${formatSignedAedMillions(model.pbtVarianceM)} vs budget`,
      tone: getToneClass(model.pbtVarianceM),
    },
  ];

  return (
    <DashboardShell
      title="Consolidated P&L"
      description={`Earnings engine for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
    >
      <div className="space-y-6">
        {/* Render our data-aware contextual filter dropdown panel */}
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

        {/* Scope Overview Badge Block Panel */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Active P&L scope
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {model.scopeLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {model.scenarioLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {model.filteredRowCount.toLocaleString()} filtered reporting rows
            </div>
          </div>
        </section>

        {/* High Executive Metrics Summary Cards Grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className={`mt-2 text-sm font-medium ${card.tone}`}>{card.change}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Main Statement Category Aggregations Data Grid */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              P&L Line Matrix
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Scope-aware actual, budget, and variance view by reporting line item categories.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Line Item Dimensions</th>
                    <th className="px-3 py-3 font-medium text-right">Actual Balance</th>
                    <th className="px-3 py-3 font-medium text-right">Budget Baseline</th>
                    <th className="px-3 py-3 font-medium text-right">Variance Balance</th>
                    <th className="px-3 py-3 font-medium text-right">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {model.lineRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatAedMillions(row.actualM)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatAedMillions(row.budgetM)}
                      </td>
                      <td className={`px-3 py-3 text-right tabular-nums font-medium ${getToneClass(row.varianceM)}`}>
                        {formatSignedAedMillions(row.varianceM)}
                      </td>
                      <td className={`px-3 py-3 text-right tabular-nums font-medium ${getToneClass(row.varianceM)}`}>
                        {formatPercent(row.variancePct)}
                      </td>
                    </tr>
                  ))}
                  {/* Bottom Line Summary Aggregation Row Marker */}
                  <tr className="bg-slate-50/80 font-bold border-t border-slate-300 text-slate-950">
                    <td className="px-3 py-4 text-base">Net Profit Before Tax</td>
                    <td className="px-3 py-4 text-right tabular-nums">{formatAedMillions(model.pbtActualM)}</td>
                    <td className="px-3 py-4 text-right tabular-nums">{formatAedMillions(model.pbtBudgetM)}</td>
                    <td className={`px-3 py-4 text-right tabular-nums ${getToneClass(model.pbtVarianceM)}`}>
                      {formatSignedAedMillions(model.pbtVarianceM)}
                    </td>
                    <td className={`px-3 py-4 text-right tabular-nums ${getToneClass(model.pbtVarianceM)}`}>
                      {formatPercent(model.pbtBudgetM !== 0 ? (model.pbtActualM - model.pbtBudgetM) / Math.abs(model.pbtBudgetM) * 100 : 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          {/* Scope-Aware Management Attention Highlights Panel */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Management Focus
            </h3>
            <p className="text-xs text-slate-500 mt-1">Automated commentary tracks parsed from live vertical parameters.</p>
            <ul className="mt-5 space-y-4 text-sm text-slate-700">
              {model.focusItems.map((item) => (
                <li key={item} className="leading-relaxed text-slate-600 flex items-start gap-2">
                  <span className="text-indigo-600 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
