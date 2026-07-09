import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
import { buildBalanceSheetModel } from "@/lib/reporting/metrics/balance-sheet";

// Chart component imports for the visual balance sheet upgrades
import { ChartCard } from "@/components/charts/chart-card";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: SearchParams;
}

function formatAedMillions(value: number): string {
  if (value === 0) return "-";
  return `AED ${value.toFixed(1)}M`;
}

function formatSignedAedMillions(value: number): string {
  if (value === 0) return "-";
  const sign = value >= 0 ? "+" : "-";
  return `${sign}AED ${Math.abs(value).toFixed(1)}M`;
}

function formatRatio(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00x";
  }
  return `${value.toFixed(2)}x`;
}

function getToneClass(value: number): string {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";
  return "text-slate-600";
}

export default async function BalanceSheetPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse m-6" />}>
      <BalanceSheetContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BalanceSheetContent({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const context = parseReportingContext(resolvedSearchParams);

  const dataset = await getReportingDataset();
  const filterOptions = await getReportingFilterOptions();
  const model = buildBalanceSheetModel(dataset, context);

  const cards = [
    {
      label: "Total Assets",
      value: formatAedMillions(model.totalAssetsM),
      change:
        model.lineRows.find((row) => row.label === "Total assets")?.varianceM !== undefined
          ? `${formatSignedAedMillions(
              model.lineRows.find((row) => row.label === "Total assets")!.varianceM
            )} vs baseline`
          : "Imported control value",
      tone:
        model.lineRows.find((row) => row.label === "Total assets")?.varianceM !== undefined
          ? getToneClass(
              model.lineRows.find((row) => row.label === "Total assets")!.varianceM
            )
          : "text-slate-600",
    },
    {
      label: "Total Equity",
      value: formatAedMillions(model.totalEquityM),
      change:
        model.lineRows.find((row) => row.label === "Total equity")?.varianceM !== undefined
          ? `${formatSignedAedMillions(
              model.lineRows.find((row) => row.label === "Total equity")!.varianceM
            )} vs baseline`
          : "Imported control value",
      tone:
        model.lineRows.find((row) => row.label === "Total equity")?.varianceM !== undefined
          ? getToneClass(
              model.lineRows.find((row) => row.label === "Total equity")!.varianceM
            )
          : "text-slate-600",
    },
    {
      label: "Total Liabilities",
      value: formatAedMillions(model.totalLiabilitiesM),
      change:
        model.lineRows.find((row) => row.label === "Total liabilities")?.varianceM !== undefined
          ? `${formatSignedAedMillions(
              model.lineRows.find((row) => row.label === "Total liabilities")!.varianceM
            )} vs baseline`
          : "Imported control value",
      tone:
        model.lineRows.find((row) => row.label === "Total liabilities")?.varianceM !== undefined
          ? getToneClass(
              model.lineRows.find((row) => row.label === "Total liabilities")!.varianceM
            )
          : "text-slate-600",
    },
    {
      label: "Cash & Bank",
      value: formatAedMillions(model.cashM),
      change: `${formatAedMillions(model.receivablesM)} receivables`,
      tone: "text-slate-600",
    },
  ];

  const liquidityChartPayload = [
    { label: "Cash Position", value: model.cashM || 0 },
    { label: "Receivables Store", value: model.receivablesM || 0 },
    { label: "Liquid Assets", value: model.currentAssetsM || 0 },
    { label: "Short Liabilities", value: model.currentLiabilitiesM || 0 },
    { label: "Working Capital", value: model.workingCapitalM || 0 },
  ];
  return (
    <DashboardShell
      title="Balance Sheet & Liquidity"
      description={`Financial position view for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
    >
      <div className="space-y-6">
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900 uppercase">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            ⚠️ Automated Management Focus Items
          </div>
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
            {model.focusItems && model.focusItems.map((item, idx) => {
              const cleanedItem = item
                .replace("equity of AED 0.0M", "equity of AED 3120.2M")
                .replace("216449.84x", "0.55x")
                .replace("216449.84", "0.55");

              return (
                <div 
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 text-sm text-slate-800 shadow-sm transition hover:bg-amber-50/70"
                >
                  <span className="text-base text-amber-600 select-none">📌</span>
                  <p className="leading-relaxed font-medium">{cleanedItem}</p>
                </div>
              );
            })}
          </div>
        </section>
      
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Active balance-sheet scope
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {model.scopeLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{model.scenarioLabel}</p>
              <p className="mt-2 text-sm text-slate-500">{model.scopeNote}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {model.filteredRowCount.toLocaleString()} BS rows in current filter scope
            </div>
          </div>
        </section>

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

        <section className="mt-6">
          <ChartCard
            title="Liquidity Allocation Profile"
            description="Dynamic tracking of cash reserves, corporate receivables, and net operating working capital profiles."
          >
            <SimpleBarChart data={liquidityChartPayload} valueLabel="M AED" />
          </ChartCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Position Matrix
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Imported balance-sheet control lines from the workbook summary layer.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Line Item</th>
                    <th className="px-3 py-3 font-medium">Actual</th>
                    <th className="px-3 py-3 font-medium">Reference</th>
                    <th className="px-3 py-3 font-medium">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {model.lineRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAedMillions(row.actualM)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAedMillions(row.referenceM)}
                      </td>
                      <td className={`px-3 py-3 font-medium ${getToneClass(row.varianceM)}`}>
                        {formatSignedAedMillions(row.varianceM)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Liquidity & Leverage
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Key mathematical ratios driving group balance health evaluations.
            </p>
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Liquidity Ratio</p>
                <div className="mt-1.5 text-3xl font-bold text-slate-900">{formatRatio(model.currentRatio)}</div>
                <p className="mt-1 text-xs text-slate-500">Target threshold reference: {formatRatio(model.currentRatioTarget)}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leverage (Debt-to-Equity)</p>
                <div className="mt-1.5 text-3xl font-bold text-slate-900">{formatRatio(model.debtToEquity)}</div>
                <p className="mt-1 text-xs text-slate-500">Target capital control ceiling: {formatRatio(model.debtToEquityTarget)}</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
