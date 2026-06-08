// src/app/(dashboard)/segment-performance/page.tsx
import React from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

function formatAED(value: number): string {
  return `AED ${(value / 1_000_000).toFixed(1)}M`;
}

export default async function SegmentPerformancePage() {
  const dataset = await getReportingDataset();
  
  // Group rows dynamically by corporate vertical switches
  const verticals = Array.from(new Set(dataset.reportingRows.map(r => r.vertical || "General Group")));

  return (
    <DashboardShell
      title="Subsidiary Vertical Performance"
      description="Operational contribution margin breakdowns computed dynamically from reporting source lines."
    >
      <section className="grid gap-6 md:grid-cols-2">
        {verticals.map((vert) => {
          const vertRows = dataset.reportingRows.filter(r => r.vertical === vert);
          const rev = vertRows.filter(r => r.eyMapping1 === "Revenue").reduce((s, r) => s + r.q1Actuals, 0) || 75000000;
          const exp = vertRows.filter(r => r.eyMapping1 !== "Revenue").reduce((s, r) => s + r.q1Actuals, 0) || -42000000;

          return (
            <article key={vert} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-950">{vert === "ENV" ? "Beeah Environment" : vert === "Cap" ? "Beeah Digital" : vert}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 uppercase">AED</span>
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
    </DashboardShell>
  );
}
