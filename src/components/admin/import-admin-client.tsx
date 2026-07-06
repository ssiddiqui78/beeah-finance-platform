"use client";

import { useRef, useState } from "react";
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
  snapshotPath?: string | null;
  repositoryName?: string;
  preparedReportingRowCount?: number;
  preparedSummaryControlCount?: number;
  status?: ReportingStatus;
};

type UploadResponse = {
  ok: boolean;
  message: string;
  savedFileName?: string;
  savedPath?: string;
  repositoryName?: string;
  reportingRowCount?: number;
  summaryControlCount?: number;
  periodLabel?: string;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<ReportingStatus>(initialStatus);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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
      }

      setMessage(
        `${data.message} Rows: ${data.reportingRowCount ?? 0}. Controls: ${
          data.summaryControlCount ?? 0
        }. Repository: ${data.repositoryName ?? "unknown"}.`
      );

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleUploadWorkbook() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setMessage("Please choose a workbook file first.");
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/reporting/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Workbook upload failed.");
      }

      if (data.status) {
        setStatus(data.status);
      }

      setMessage(
        `${data.message} File: ${data.savedFileName ?? "uploaded"}. Rows: ${
          data.reportingRowCount ?? 0
        }. Controls: ${data.summaryControlCount ?? 0}.`
      );

      setSelectedFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
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
            status.reportingRowCount !== null
              ? status.reportingRowCount.toLocaleString()
              : "Not loaded"
          }
        />
        <InfoCard
          label="Summary Controls"
          value={
            status.summaryControlCount !== null
              ? status.summaryControlCount.toLocaleString()
              : "Not loaded"
          }
        />
        <InfoCard
          label="Last Imported"
          value={formatDateTime(status.lastImportedAt)}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">
          Upload New Workbook
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          As project owner, you can upload a new reporting workbook, save it to
          the configured input location, and trigger import automatically.
        </p>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) =>
                setSelectedFileName(event.target.files?.[0]?.name ?? null)
              }
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
            <p className="mt-3 text-xs text-slate-500">
              Accepted types: .xlsx, .xls, .csv
            </p>
            {selectedFileName ? (
              <p className="mt-2 text-sm font-medium text-slate-700">
                Selected file: {selectedFileName}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleUploadWorkbook}
              disabled={isUploading}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isUploading ? "Uploading..." : "Upload and import workbook"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Import Actions</h3>
        <p className="mt-2 text-sm text-slate-600">
          Use these actions to refresh the local reporting snapshot from the
          currently saved workbook source.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleImportWorkbook}
            disabled={isImporting}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isImporting ? "Importing..." : "Re-import saved workbook"}
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
          <h3 className="text-lg font-semibold text-slate-950">
            Workbook Source Path
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Current local target path for workbook storage and import.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 break-all">
            {workbookPath}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">
            Snapshot Location
          </h3>
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
