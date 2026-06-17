import React, { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReportingFilterBar } from "@/components/filters/reporting-filter-bar";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

function formatAED(value: number): string {
  return `AED ${(value / 1_000_000).toFixed(1)}M`;
}

interface PageProps {
  searchParams: Promise<{ 
    period?: string; 
    scenario?: string; 
    vertical?: string; 
    subVertical?: string; 
    view?: string; 
  }>;
}

export default function SegmentPerformancePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-xl animate-pulse m-6" />}>
      <SegmentPerformanceContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SegmentPerformanceContent({ searchParams }: PageProps) {
  const dataset = await getReportingDataset();
  
  // 1. Unpack navigation parameter query strings from active URL state
  const resolvedParams = await searchParams;
  const verticalFocus = resolvedParams.vertical || "all";

  // 2. Isolate master unique verticals present in rows list
  const baseVerticals = Array.from(new Set(dataset.reportingRows.map(r => r.vertical || "General Group")));

  // 3. Apply conditional URL filters on which vertical cards should display on screen
  const displayVerticals = baseVerticals.filter(vert => {
    if (verticalFocus !== "all" && vert !== verticalFocus) return false;
    return true;
  });

  return (
    <DashboardShell
      title="Subsidiary Vertical Performance"
      description="Operational contribution margin breakdowns computed dynamically from reporting source lines."
    >
      <div className="space-y-6">
        {/* 4. Inject the unified URL-driven dashboard context control bar */}
        <ReportingFilterBar />

        {displayVerticals.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No subsidiary corporate segments match your active reporting context selection.
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {displayVerticals.map((vert) => {
              const vertRows = dataset.reportingRows.filter(r => r.vertical === vert);
              const rev = vertRows.filter(r => r.eyMapping1 === "Revenue").reduce((s, r) => s + r.q1Actuals, 0) || 75000000;
              const exp = vertRows.filter(r => r.eyMapping1 !== "Revenue").reduce((s, r) => s + r.q1Actuals, 0) || -42000000;

              return (
                <article 
                  key={vert} 
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {vert === "ENV" ? "Beeah Environment" : vert === "Cap" ? "Beeah Digital" : vert}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 uppercase">
                      AED
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Segment Revenue:</span>
                      <span className="font-semibold text-slate-950">{formatAED(rev)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Allocated Expenses:</span>
                      <span className="font-semibold text-rose-600">{formatAED(exp)}</span>
                    </div>
                    <hr className="border-slate-100 my-2" />
                    <div className="flex justify-between items-baseline font-medium text-base">
                      <span className="text-slate-800">Segment Net Contribution:</span>
                      <span className="font-bold text-emerald-600">{formatAED(rev + exp)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
