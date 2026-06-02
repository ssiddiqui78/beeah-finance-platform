import React from "react";

export default function ConsolidatedPnlPage() {
  return (
    <div className="space-y-6">
      {/* Header section instead of using a component prop */}
      <div>
        <h2 className="text-2xl font-bold text-slate-950">Consolidated P&L</h2>
        <p className="text-sm text-slate-500 mt-1">
          Earnings engine for actual vs budget analysis, line-item bridges, and margin tracking.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600 shadow-sm">
        Consolidated P&L module scaffold ready for semantic bindings, matrix
        view, and drill-down analysis.
      </div>
    </div>
  );
}
