import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";
import { parseReportingContext } from "@/lib/reporting/reporting-context";
import { buildConsolidatedPnlModel } from "@/lib/reporting/metrics/consolidated-pnl";
import { getReportingFilterOptions } from "@/lib/reporting/services/reporting-filter-options";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { DRILLABLE_PNL_LINES } from "@/lib/reporting/pnl-lines";

export const dynamic = "force-dynamic";

function formatAedMillions(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}AED ${(Math.abs(value) / 1_000_000).toFixed(1)}M`;
}

function formatPct(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function varianceTone(value: number, label: string = "") {
  const isExpense = label.includes("Cost") || label.includes("G&A") || label.includes("Marketing") || label.includes("Impairment");
  if (value > 0) return isExpense ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold";
  if (value < 0) return isExpense ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold";
  return "text-slate-500";
}

function buildLineHref(searchParams: Record<string, string | string[] | undefined>, line: string) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) params.set(key, value);
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
  const selectedLine = typeof resolvedSearchParams.line === "string" ? resolvedSearchParams.line : undefined;
  
  const dataset = await getReportingDataset();
  const filterOptions = await getReportingFilterOptions();
  const model = buildConsolidatedPnlModel(dataset, context, selectedLine);

  return (
    <DashboardShell title="Consolidated P&L" description={`Management view for ${model.scopeLabel}.`}>
      <div className="space-y-6">
        <ReportingFilterBar 
          periodOptions={filterOptions.periodOptions}
          verticalOptions={filterOptions.verticalOptions}
          subVerticalOptions={filterOptions.subVerticalOptions}
          subVerticalOptionsByVertical={filterOptions.subVerticalOptionsByVertical}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {["Revenue", "Gross Profit", "Gross Margin", "Operating Profit", "PBT"].map((kpi) => {
            let valStr = "";
            if (kpi === "Revenue") valStr = formatAedMillions(model.revenue);
            if (kpi === "Gross Profit") valStr = formatAedMillions(model.grossProfit);
            if (kpi === "Gross Margin") valStr = formatPct(model.grossMarginPct);
            if (kpi === "Operating Profit") valStr = formatAedMillions(model.operatingProfit);
            if (kpi === "PBT") valStr = formatAedMillions(model.pbt);
            return (
              <div key={kpi} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{kpi}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900 tracking-tight">{valStr}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
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
                    const isDrillable = !isPercentLine && !isSubTotalLine;

                    return (
                      <tr key={line.key} className={`transition hover:bg-slate-50/40 ${isSubTotalLine ? "bg-slate-50/50 font-medium" : ""} ${isSelected ? "bg-amber-50/70" : ""}`}>
                        <td className={`px-5 py-3 text-slate-900 ${isSubTotalLine ? "font-semibold" : ""}`}>
                          {isDrillable ? (
                            <Link href={buildLineHref(resolvedSearchParams, line.label)} className={`inline-flex rounded-md px-2 py-1 transition ${isSelected ? "bg-amber-100 text-amber-900 font-bold" : "text-emerald-600 hover:bg-slate-100 font-semibold"}`}>
                              🔍 {line.label}
                            </Link>
                          ) : (
                            <span>{line.label}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-700">{isPercentLine ? `${line.actual.toFixed(1)}%` : formatAedMillions(line.actual)}</td>
                        <td className="px-5 py-3 text-slate-700">{isPercentLine ? `${line.budget.toFixed(1)}%` : formatAedMillions(line.budget)}</td>
                        <td className={`px-5 py-3 ${varianceTone(line.variance, line.label)}`}>{isPercentLine ? `${line.variance.toFixed(1)}%` : formatAedMillions(line.variance)}</td>
                        <td className="px-5 py-3 text-slate-600 font-medium">{formatPct(line.variancePct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900">Management Focus Alerts</h2>
            <div className="mt-6 space-y-3">
              {model.focusItems.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-700 flex items-start gap-2.5 shadow-sm">
                  <span>💡</span><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {model.selectedLine && (
          <section className="grid gap-6 xl:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">EY Mapping 2 Composition</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Sub-Classification Group</th>
                      <th className="px-4 py-2.5 font-semibold">Actual</th>
                      <th className="px-4 py-2.5 font-semibold">Budget</th>
                      <th className="px-4 py-2.5 font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {model.mapping2Rows.map((m2, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{m2.label}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAedMillions(m2.actual)}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAedMillions(m2.budget)}</td>
                        <td className={`px-4 py-2.5 font-semibold ${varianceTone(m2.variance, model.selectedLine || "")}`}>{formatAedMillions(m2.variance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Granular GL Account Detail</h3>
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto mt-4">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold bg-slate-50">GL Account</th>
                      <th className="px-4 py-2.5 font-semibold bg-slate-50">Actual</th>
                      <th className="px-4 py-2.5 font-semibold bg-slate-50">Budget</th>
                      <th className="px-4 py-2.5 font-semibold bg-slate-50">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {model.glRows.map((gl, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-slate-900 truncate max-w-[200px]" title={gl.label}>{gl.label}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAedMillions(gl.actual)}</td>
                        <td className="px-4 py-2.5 text-slate-700">{formatAedMillions(gl.budget)}</td>
                        <td className={`px-4 py-2.5 font-semibold ${varianceTone(gl.variance, model.selectedLine || "")}`}>{formatAedMillions(gl.variance)}</td>
                      </tr>
                    ))}
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
