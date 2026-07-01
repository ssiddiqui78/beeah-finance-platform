import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ImportAdminClient } from "@/components/admin/import-admin-client";
import { serverEnv } from "@/lib/env.server";
import { getReportingStatus } from "@/lib/reporting/services/reporting-status";

// Force absolute dynamic execution to capture live workbook directory adjustments
export const dynamic = "force-dynamic";

export default async function ReportingAdminPage() {
  // Fetch telemetry markers directly from the underlying ledger source layer
  const status = await getReportingStatus();

  return (
    <DashboardShell
      title="Reporting Admin"
      description="Operational controls for workbook import, snapshot refresh, and reporting source visibility."
      showFilters={false} // Disable global reporting selection tools for this admin screen
    >
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Reporting operations
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          Import and refresh control center
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          This page manages the local reporting snapshot used by the dashboards.
          Later, the same workflow can be redirected to Supabase persistence and
          eventually SAP-driven sync jobs.
        </p>
      </section>

      <ImportAdminClient
        initialStatus={status}
        workbookPath={
          serverEnv.REPORTING_WORKBOOK_PATH ??
          (status as any).workbookPath ??
          "./data/input/beeah-monthly-report.xlsx"
        }
      />
    </DashboardShell>
  );
}
