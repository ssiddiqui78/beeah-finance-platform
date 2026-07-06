import React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ImportAdminClient } from "@/components/admin/import-admin-client";
import { serverEnv } from "@/lib/env.server";
import { getReportingStatus } from "@/lib/reporting/services/reporting-status";

// Force absolute dynamic execution to capture live workbook directory adjustments
export const dynamic = "force-dynamic";

export default async function ReportingAdminPage() {
  const status = await getReportingStatus();

  return (
    <DashboardShell
      title="Reporting Admin"
      description="Owner/admin control center for workbook upload, snapshot refresh, and reporting source operations."
      showFilters={false}
    >
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Owner operations
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          Upload, import, and snapshot control
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          This page is intended for owner/admin reporting operations. Later,
          when authentication is enabled, access to this screen should be
          restricted by the formal role hierarchy.
        </p>
      </section>

      <ImportAdminClient
        initialStatus={status}
        workbookPath={
          serverEnv.REPORTING_WORKBOOK_PATH ??
          "./data/input/beeah-monthly-report.xlsx"
        }
      />
    </DashboardShell>
  );
}
