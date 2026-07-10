export const dynamic = "force-dynamic"; // ⚡ FORCES NEXT.JS TO BYPASS CACHE AND LIVE-RENDER THE LINKS
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { buildConsolidatedPnlModel } from "@/lib/reporting/metrics/consolidated-pnl";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { DRILLABLE_PNL_LINES } from "@/lib/reporting/pnl-lines";

function formatAedMillions(value: number) {
  // Gracefully handles formatting negative or positive currency scales
  const sign = value < 0 ? "-" : "";
  return `${sign}AED ${(Math.abs(value) / 1_000_000).toFixed(1)}M`;
}

function formatPct(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function varianceTone(value: number, label: string) {
  const isExpense = label.includes("Cost") || label.includes("G&A") || label.includes("Marketing") || label.includes("Impairment");
  
  // Favorable vs unfavorable threshold flags matching standard accounting principles
  if (value > 0) return isExpense ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold";
  if (value < 0) return isExpense ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold";
  return "text-slate-500";
}

function buildLineHref(
  searchParams: Record<string, string | string[] | undefined>,
  line: string,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });

  params.set("line", line);
  return `/consolidated-pl?${params.toString()}`;
}

export default async function ConsolidatedPnlPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const context = parseReportingContext(resolvedSearchParams);
  const selectedLine =
    typeof resolvedSearchParams.line === "string" ? resolvedSearchParams.line : undefined;
  
  // Load core assets out of our verified unified pipeline data layer
  const dataset = await getReportingDataset();
  const filterOptions = await getReportingFilterOptions();
  const model = buildConsolidatedPnlModel(dataset, context, selectedLine);

  return (
    <DashboardShell
      title="Consolidated P&L"
      description={`Management income statement view for ${model.scopeLabel}.`}
    >
      <div className="space-y-6">
        {/* Dynamic filters bar control segment */}
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Revenue
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">
              {formatAedMillions(model.revenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Gross Profit
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">
              {formatAedMillions(model.grossProfit)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Gross Margin
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">
              {formatPct(model.grossMarginPct)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operating Profit
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">
              {formatAedMillions(model.operatingProfit)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              PBT
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">
              {formatAedMillions(model.pbt)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
            <div className="px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Consolidated Line Matrix
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Actual vs budget performance breakdown aggregated from your 6,644 reporting rows.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50/70 text-left text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Line Item Category</th>
                    <th className="px-5 py-3 font-semibold">Actual</th>
                    <th className="px-5 py-3 font-semibold">Budget</th>
                    <th className="px-5 py-3 font-semibold">Variance</th>
                    <th className="px-5 py-3 font-semibold">Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {model.lines.map((line) => {
                                        const isPercentLine = line.label.includes("%");
                    const isSubTotalLine = line.label === "Gross Profit" || line.label === "Operating Profit" || line.label === "PBT";
                    const isSelected = model.selectedLine === line.label;
                    
                    // ⚡ HARD OVERRIDE: Any plain row that isn't a subtotal or percentage becomes drillable
                    const isDrillable = !isPercentLine && !isSubTotalLine;

                    return (
                      <tr 
                        key={line.key} 
                        className={`transition hover:bg-slate-50/40 ${isSubTotalLine ? "bg-slate-50/50 font-medium" : ""} ${isSelected ? "bg-amber-50/70" : ""}`}
                      >
                        <td className={`px-5 py-3 text-slate-900 ${isSubTotalLine ? "font-semibold" : ""}`}>
                          {isDrillable ? (
                            <Link
                              href={buildLineHref(resolvedSearchParams, line.label)}
                              className={`inline-flex rounded-md px-2 py-1 transition ${
                                isSelected
                                  ? "bg-amber-100 text-amber-900 font-bold"
                                  : "text-emerald-600 hover:bg-slate-100 font-semibold"
                              }`}
                            >
                              🔍 {line.label}
                            </Link>
                          ) : (
                            <span>{line.label}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {isPercentLine ? `${line.actual.toFixed(1)}%` : formatAedMillions(line.actual)}
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {isPercentLine ? `${line.budget.toFixed(1)}%` : formatAedMillions(line.budget)}
                        </td>
                        <td className={`px-5 py-3 ${varianceTone(line.variance, line.label)}`}>
                          {isPercentLine ? `${line.variance.toFixed(1)}%` : formatAedMillions(line.variance)}
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-medium">
                          {formatPct(line.variancePct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Management Focus Alerts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Automated driver insight tags computed directly from active account categories.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {model.focusItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-sm"
                >
                  <span className="text-slate-400 mt-0.5">💡</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Drilldown Panels Viewports */}
        {model.selectedLine && (
          <section className="grid gap-6 xl:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  EY Mapping 2 breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Composition of <strong>"{model.selectedLine}"</strong> category by intermediate mappings.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 font-medium">EY Mapping 2</th>
                      <th className="px-5 py-3 font-medium">Actual</th>
                      <th className="px-5 py-3 font-medium">Budget</th>
                      <th className="px-5 py-3 font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.mapping2Rows && model.mapping2Rows.length ? (
                      model.mapping2Rows.map((item, index) => (
                        <tr key={index} className="border-t border-slate-100 hover:bg-slate-50/40 transition">
                          <td className="px-5 py-3 font-medium text-slate-900">{item.label}</td>
                          <td className="px-5 py-3 text-slate-700">{formatAedMillions(item.actual)}</td>
                          <td className="px-5 py-3 text-slate-700">{formatAedMillions(item.budget)}</td>
                          <td className={`px-5 py-3 font-medium ${varianceTone(item.variance, model.selectedLine || "")}`}>
                            {formatAedMillions(item.variance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                          No EY Mapping 2 breakdown available for this selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  GL account breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Granular general ledger account-level details for <strong>"{model.selectedLine}"</strong>.
                </p>
              </div>

              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-medium bg-slate-50">GL Account</th>
                      <th className="px-5 py-3 font-medium bg-slate-50">Actual</th>
                      <th className="px-5 py-3 font-medium bg-slate-50">Budget</th>
                      <th className="px-5 py-3 font-medium bg-slate-50">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.glRows && model.glRows.length ? (
                      model.glRows.map((item, index) => (
                        <tr key={index} className="border-t border-slate-100 hover:bg-slate-50/40 transition">
                          <td className="px-5 py-3 font-medium text-slate-900 truncate max-w-[220px]" title={item.label}>
                            {item.label}
                          </td>
                          <td className="px-5 py-3 text-slate-700">{formatAedMillions(item.actual)}</td>
                          <td className="px-5 py-3 text-slate-700">{formatAedMillions(item.budget)}</td>
                          <td className={`px-5 py-3 font-medium ${varianceTone(item.variance, model.selectedLine || "")}`}>
                            {formatAedMillions(item.variance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                          No GL account breakdown available for this selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
