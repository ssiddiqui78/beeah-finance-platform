import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildSegmentPerformanceModel } from "@/lib/reporting/metrics/segment-performance";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";

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

export default async function SegmentPerformancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const context = parseReportingContext(resolvedSearchParams);

  const dataset = await getReportingDataset();
  const filterOptions = await getReportingFilterOptions();
  const model = buildSegmentPerformanceModel(dataset, context);

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
      change: `${formatPercent(model.grossMarginPct)} margin`,
      tone: "text-slate-600",
    },
    {
      label: "PBT",
      value: formatAedMillions(model.pbtActualM),
      change: `${formatSignedAedMillions(model.pbtVarianceM)} vs budget`,
      tone: getToneClass(model.pbtVarianceM),
    },
    {
      label: "Contribution",
      value: formatPercent(model.contributionPct),
      change: "Share of group PBT",
      tone: "text-slate-600",
    },
  ];

  return (
    <DashboardShell
      title="Segment Performance"
      description={`Operational performance view for ${model.periodLabel} • ${model.scopeLabel} • ${model.scenarioLabel}.`}
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
                Active segment scope
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {model.scopeLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {model.groupingLabel} • {model.scenarioLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {model.filteredRowCount.toLocaleString()} filtered reporting rows
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
              Performance Matrix
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Data-driven segment breakdown from the imported reporting dataset.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-3 font-medium">Group</th>
                    <th className="px-3 py-3 font-medium">Revenue</th>
                    <th className="px-3 py-3 font-medium">Gross Profit</th>
                    <th className="px-3 py-3 font-medium">Margin %</th>
                    <th className="px-3 py-3 font-medium">PBT</th>
                    <th className="px-3 py-3 font-medium">Budget Var</th>
                    <th className="px-3 py-3 font-medium">Contribution %</th>
                  </tr>
                </thead>
                <tbody>
                  {model.matrixRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100">
                      <td className="px-3 py-3 font-medium text-slate-900">
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAedMillions(row.revenueActualM)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAedMillions(row.grossProfitActualM)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatPercent(row.grossMarginPct)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatAedMillions(row.pbtActualM)}
                      </td>
                      <td className={`px-3 py-3 font-medium ${getToneClass(row.varianceM)}`}>
                        {formatSignedAedMillions(row.varianceM)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {formatPercent(row.contributionPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">
              Top Focus Areas
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {model.focusItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
