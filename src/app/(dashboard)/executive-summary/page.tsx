import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildExecutiveSummaryModel } from "@/lib/reporting/metrics/executive-summary";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";

// Forced explicit relative path resolution to clear Webpack build overlays
import { ChartCard } from "../../../components/charts/chart-card";
import { SimpleBarChart } from "../../../components/charts/simple-bar-chart";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatAedMillions(value: number): string {
  return `AED ${value.toFixed(1)}M`;
}

function formatSignedAedMillions(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}AED ${Math.abs(value).toFixed(1)}M`;
}

function formatSignedPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getToneClass(value: number): string {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";
  return "text-slate-600";
}

function getRevenueDisplay(
  scenario: string,
  actual: number,
  budget: number,
  variancePct: number
) {
  if (scenario === "budget") {
    return {
      value: formatAedMillions(budget),
      change: `Actual ${formatAedMillions(actual)} • ${formatSignedPercent(
        actual - budget === 0 ? 0 : variancePct
      )} vs actual`,
      tone: "text-slate-600",
    };
  }

  if (scenario === "forecast") {
    return {
      value: formatAedMillions(budget),
      change: `Forecast not loaded yet • showing budget baseline`,
      tone: "text-amber-600",
    };
  }

  if (scenario === "actual") {
    return {
      value: formatAedMillions(actual),
      change: `Budget reference ${formatAedMillions(budget)}`,
      tone: "text-slate-600",
    };
  }

  return {
    value: formatAedMillions(actual),
    change: `${formatSignedAedMillions(actual - budget)} vs budget (${formatSignedPercent(
      variancePct
    )})`,
    tone: getToneClass(actual - budget),
  };
}

function getPbtDisplay(
  scenario: string,
  actual: number,
  budget: number
) {
  const variance = actual - budget;

  if (scenario === "budget") {
    return {
      value: formatAedMillions(budget),
      change: `Actual ${formatAedMillions(actual)} • variance ${formatSignedAedMillions(
        variance
      )}`,
      tone: "text-slate-600",
    };
  }

  if (scenario === "forecast") {
    return {
      value: formatAedMillions(budget),
      change: `Forecast not loaded yet • showing budget baseline`,
      tone: "text-amber-600",
    };
  }

  if (scenario === "actual") {
    return {
      value: formatAedMillions(actual),
      change: `Budget reference ${formatAedMillions(budget)}`,
      tone: "text-slate-600",
    };
  }

  return {
    value: formatAedMillions(actual),
    change: `${formatSignedAedMillions(variance)} vs budget`,
    tone: getToneClass(variance),
  };
}

interface PageProps {
  searchParams: SearchParams;
}

export default function ExecutiveSummaryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse m-6" />}>
      <ExecutiveSummaryContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ExecutiveSummaryContent({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const context = parseReportingContext(resolvedSearchParams);

  const dataset = (await getReportingDataset()) as any;
  const model = buildExecutiveSummaryModel(dataset, context);
  
  const filterOptions = await getReportingFilterOptions();

  const revenueCard = getRevenueDisplay(
    context.scenario,
    model.revenueActualM,
    model.revenueBudgetM,
    model.revenueVariancePct
  );

  const pbtCard = getPbtDisplay(
    context.scenario,
    model.pbtActualM,
    model.pbtBudgetM
  );

  const cards = [
    {
      label: "Revenue",
      value: revenueCard.value,
      change: revenueCard.change,
      tone: revenueCard.tone,
    },
    {
      label: "PBT",
      value: pbtCard.value,
      change: pbtCard.change,
      tone: pbtCard.tone,
    },
    {
      label: "Current Ratio",
      value: `${model.currentRatio.toFixed(2)}x`,
      change: `Group control target ${model.currentRatioTarget.toFixed(2)}x`,
      tone: getToneClass(model.currentRatio - model.currentRatioTarget),
    },
    {
      label: "DSO",
      value: `${model.dso.toFixed(0)} days`,
      change: `Group control target ${model.dsoTarget.toFixed(0)} days`,
      tone: getToneClass(model.dsoTarget - model.dso),
    },
  ];

  // Defensive array bindings to protect against structural property crashes
  const safeBridgeItems = model.bridgeItems || (model as any).bridgeRows || (model as any).varianceItems || [];
  const safeFocusItems = model.focusItems || (model as any).focusRows || [];
  return (
    <DashboardShell
      title="Executive Summary"
      description={`Management KPI overview for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
    >
      <div className="space-y-6">
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className={`mt-2 text-sm font-medium ${card.tone}`}>{card.change}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ChartCard
            title="Actual vs Budget Bridge Drivers"
            description="Scope-aware driver view recalculated from the selected reporting context."
          >
            <SimpleBarChart
              data={safeBridgeItems.map((item: any) => ({
                label: (item.label || "").replace("General & Admin Overheads", "G&A"),
                value: (item.variance || item.value || 0) / 1_000_000,
              }))}
              valueLabel="AED M variance"
            />
          </ChartCard>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Management Focus Items
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Automated high-priority context highlights for this group scope.
            </p>

            <div className="mt-6 space-y-4">
              {safeFocusItems.map((focus: any, index: number) => {
                const titleStr = typeof focus === 'string' ? focus : (focus.title || "Insight Alert");
                const descStr = typeof focus === 'string' ? "" : (focus.description || "");
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 text-sm"
                  >
                    <span className="mt-0.5 text-slate-400">💡</span>
                    <div>
                      <p className="font-medium text-slate-900">{titleStr}</p>
                      {descStr && (
                        <p className="mt-1 text-slate-600 leading-relaxed">
                          {descStr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {safeFocusItems.length === 0 && (
                <p className="text-sm text-slate-500 italic py-4 text-center">
                  No critical ledger anomalies or variance thresholds breached.
                </p>
              )}
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
