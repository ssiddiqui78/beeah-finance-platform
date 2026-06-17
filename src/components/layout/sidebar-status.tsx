"use client";
import React, { useEffect, useState } from "react";
import type { ReportingStatusModel } from "../../lib/reporting/services/reporting-status";

export default function SidebarStatus() {
  const [status, setStatus] = useState<ReportingStatusModel | null>(null);

  useEffect(() => {
    fetch("/api/reporting/status")
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error(err));
  }, []);

  const isExcel = status?.activeDataSource === "excel";

  return (
    <div className="mx-4 my-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-emerald-400"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-slate-700">
          Excel Source Connected
        </span>
      </div>
      {status && (
        <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-500">
          <p>• Ledger Rows: <span className="font-medium text-slate-700">{status.recordsCount?.toLocaleString()} lines</span></p>
        </div>
      )}
    </div>
  );
}
