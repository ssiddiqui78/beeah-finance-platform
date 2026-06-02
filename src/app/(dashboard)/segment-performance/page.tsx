import React from "react";

const segments = [
  { label: "ENV", actual: "AED 58.1M", budget: "AED 63.8M" },
  { label: "Cap", actual: "AED -5.5M", budget: "AED -8.2M" },
  { label: "RE", actual: "AED -11.1M", budget: "AED -12.9M" },
  { label: "Exec", actual: "AED -4.9M", budget: "AED -4.9M" },
];

export default function SegmentPerformancePage() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Segment Performance</h2>
        <p className="text-sm text-slate-500 mt-1">
          Vertical, sub-vertical, company, and profit-center performance with future SAP drill-through.
        </p>
      </div>

      {/* Segment Cards Grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {segments.map((segment) => (
          <article
            key={segment.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{segment.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {segment.actual}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Budget: {segment.budget}
            </p>
          </article>
        ))}
      </section>

      {/* Layout Split Section */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            Segment contribution overview
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder for vertical comparison, waterfall analysis, and
            revenue-cost mix visualizations.
          </p>
          <div className="mt-6 h-72 rounded-xl bg-slate-100" />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            Top focus areas
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>• Tandeef remains the largest profit contributor.</li>
            <li>• Shared Services is a major cost concentration area.</li>
            <li>
              • Digital is currently ahead of budget and needs drill-down logic.
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
