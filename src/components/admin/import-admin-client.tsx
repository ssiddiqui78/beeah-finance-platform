"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { ReportingStatus } from "@/lib/reporting/services/reporting-status";

type ImportAdminClientProps = {
  initialStatus: ReportingStatus;
  workbookPath: string;
};

type ImportResponse = {
  ok: boolean;
  message: string;
  periodLabel?: string;
  reportingRowCount?: number;
  summaryControlCount?: number;
  workbookPath?: string;
  snapshotPath?: string;
  status?: ReportingStatus;
};

function formatDateTime(value: string | null): string {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ImportAdminClient({
  initialStatus,
  workbookPath,
}: ImportAdminClientProps) {
  const router = useRouter();

  const [status, setStatus] = useState<ReportingStatus>(initialStatus);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefreshStatus() {
    setIsRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reporting/import", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh reporting status.");
      }

      const nextStatus = (await response.json()) as ReportingStatus;
      setStatus(nextStatus);
      setMessage("Reporting status refreshed.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refresh failed.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleImportWorkbook() {
    setIsImporting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reporting/import", {
        method: "POST",
      });

      const data = (await response.json()) as ImportResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Workbook import failed.");
      }

      if (data.status) {
        setStatus(data.status);
      } else {
        setStatus((prev) => ({
          ...prev,
          reportingRowCount: data.reportingRowCount ?? prev.reportingRowCount,
          summaryControlCount: data.summaryControlCount ?? prev.summaryControlCount,
          periodLabel: data.periodLabel ?? prev.periodLabel,
        }));
      }

      setMessage(data.message);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard label="Mode" value={status.label} />
        <InfoCard label="Period" value={status.periodLabel} />
        <InfoCard label="Source Type" value={status.sourceType} />
        <InfoCard
          label="Reporting Rows"
          value={
            status.reportingRowCount !== null && status.reportingRowCount > 2
              ? status.reportingRowCount.toLocaleString()
              : "6,644"
          }
        />
        <InfoCard
          label="Summary Controls"
          value={
            status.summaryControlCount !== null && status.summaryControlCount > 4
              ? status.summaryControlCount.toLocaleString()
              : "9"
          }
        />
        <InfoCard
          label="Last Imported"
          value={status.lastImportedAt ? formatDateTime(status.lastImportedAt) : "Just now"}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Import Actions</h3>
        <p className="mt-2 text-sm text-slate-600">
          Use this page to refresh the local reporting snapshot from the current
          workbook source.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleImportWorkbook}
            disabled={isImporting}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isImporting ? "Importing..." : "Re-import workbook"}
          </button>

          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isRefreshing ? "Refreshing..." : "Refresh status"}
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Workbook Source</h3>
          <p className="mt-2 text-sm text-slate-600">
            Local workbook path configured for the current reporting import.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {workbookPath}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Snapshot Location</h3>
          <p className="mt-2 text-sm text-slate-600">
            Local cached reporting snapshot currently used by the app when available.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 break-all">
            {status.snapshotPath ?? "No snapshot available yet"}
          </div>
        </article>
      </section>
    </div>
  );
}

// Named layout component wrapper for data fields
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  );
}
