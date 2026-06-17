import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildExecutiveSummaryModel } from "@/lib/reporting/metrics/executive-summary";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

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

export default async function ExecutiveSummaryPage() {
  const dataset = await getReportingDataset();
  const model = buildExecutiveSummaryModel(dataset);

  const cards = [
    {
      label: "Revenue",
      value: formatAedMillions(model.revenueActualM),
      change: `${formatSignedAedMillions(
        model.revenueActualM - model.revenueBudgetM
      )} vs budget (${formatSignedPercent(model.revenueVariancePct)})`,
      tone: getToneClass(model.revenueActualM - model.revenueBudgetM),
    },
    {
      label: "PBT",
      value: formatAedMillions(model.pbtActualM),
      change: `${formatSignedAedMillions(model.pbtVarianceM)} vs budget`,
      tone: getToneClass(model.pbtVarianceM),
    },
    {
      label: "Current Ratio",
      value: `${model.currentRatio.toFixed(2)}x`,
      change: `Target ${model.currentRatioTarget.toFixed(2)}x`,
      tone: getToneClass(model.currentRatio - model.currentRatioTarget),
    },
    {
      label: "DSO",
      value: `${model.dso.toFixed(0)} days`,
      change: `${model.dsoTarget.toFixed(0)} day target`,
      tone: getToneClass(model.dsoTarget - model.dso),
    },
  ];

  return (
    <DashboardShell
      title="Executive Summary"
      description={`Management KPI overview and variance summary for ${model.periodLabel}.`}
    >
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            Actual vs Budget Bridge Drivers
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Data-driven bridge inputs from the semantic reporting layer.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {model.bridgeItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-slate-600">
                    Actual: <span className="font-medium">{formatBridgeAedMillions(item.actual)}</span>
                  </p>
                  <p className="text-slate-600">
                    Budget: <span className="font-medium">{formatBridgeAedMillions(item.budget)}</span>
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
            Management Attention
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {model.attentionItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>
      </section>
    </DashboardShell>
  );
}
