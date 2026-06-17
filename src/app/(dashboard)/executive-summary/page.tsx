import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildExecutiveSummaryModel } from "@/lib/reporting/metrics/executive-summary";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";

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

function formatBridgeAedMillions(value: number): string {
  return `AED ${(value / 1_000_000).toFixed(1)}M`;
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

  return (
    <DashboardShell
      title="Executive Summary"
      description={`Management KPI overview for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
    >
      <div className="space-y-6">
        {/* Render our interactive URL panel */}
        <ReportingFilterBar />

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
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Actual vs Budget Bridge Drivers
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Scope-aware driver view recalculated from the selected reporting context.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {model.bridgeItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-medium text-slate-700 truncate">{item.label}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-slate-600">
                      Actual:{" "}
                      <span className="font-medium">
                        {formatBridgeAedMillions(item.actual)}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      Budget:{" "}
                      <span className="font-medium">
                        {formatBridgeAedMillions(item.budget)}
                      </span>
                    </p>
                    <p className={`font-medium ${getToneClass(item.variance)}`}>
                      Variance: {formatBridgeAedMillions(item.variance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Management Attention & Commentary
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {model.attentionItems.map((item) => (
                <li key={item} className="leading-relaxed text-slate-600">• {item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
