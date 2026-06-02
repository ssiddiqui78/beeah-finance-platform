import React from "react";

export default function BalanceSheetPage() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Balance Sheet & Liquidity</h2>
        <p className="text-sm text-slate-500 mt-1">
          Financial position, leverage, receivables, working-capital metrics, and liquidity analysis.
        </p>
      </div>

      {/* Content area card */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600 shadow-sm">
        Balance Sheet module scaffold ready for liquidity KPIs, composition
        analysis, and covenant monitoring.
      </div>
    </div>
  );
}
