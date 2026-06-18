import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
import { buildBalanceSheetModel } from "@/lib/reporting/metrics/balance-sheet";

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

function formatRatio(value: number): string {
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

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current Assets</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatAedMillions(model.currentAssetsM)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current Liabilities</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatAedMillions(model.currentLiabilitiesM)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current Ratio</p>
                <p className="mt-2 text-xl font-semibold text-emerald-600">
                  {formatRatio(model.currentRatio)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Debt to Equity</p>
                <p className="mt-2 text-xl font-semibold text-indigo-600">
                  {formatRatio(model.debtToEquity)}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-900">Analyst Focus Commentary</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {model.focusItems.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}