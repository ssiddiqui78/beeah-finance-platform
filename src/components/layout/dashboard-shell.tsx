import Link from "next/link";
import { ReactNode } from "react";

import * as navigationConfig from "@/lib/config/navigation";
import { getReportingStatus } from "@/lib/reporting/services/reporting-status";

type DashboardShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

function formatImportTime(value: string | null): string | null {
  if (!value) return null;

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function DashboardShell({
  children,
  title,
  description,
}: DashboardShellProps) {
  const reportingStatus = await getReportingStatus();
  const importTimeLabel = formatImportTime(reportingStatus.lastImportedAt);

  const navigationItems = 
    (navigationConfig as any).primaryNavigation || 
    (navigationConfig as any).default || 
    [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-[#0f172a] text-slate-100 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 px-6 py-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Beeah
              </p>
              <h1 className="mt-2 text-xl font-semibold">Finance Platform</h1>
              <p className="mt-2 text-sm text-slate-300">
                Reporting, planning, and AI-ready financial analysis.
              </p>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {Array.isArray(navigationItems) && navigationItems.map((item: any) => (
                <Link
                  key={item.href || "#"}
                  href={item.href || "#"}
                  className="rounded-xl border border-transparent px-4 py-3 transition hover:border-white/10 hover:bg-white/5"
                >
                  <div className="text-sm font-medium text-white">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">
                    {item.description}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mx-4 mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Reporting status
            </p>
            <p className="mt-3 text-sm font-medium text-white">
              {reportingStatus.label}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Period: {reportingStatus.periodLabel}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Source: {reportingStatus.sourceType}
            </p>
            {reportingStatus.reportingRowCount !== null && (
              <p className="mt-1 text-xs text-slate-300">
                Rows: {reportingStatus.reportingRowCount.toLocaleString()}
              </p>
            )}
            {reportingStatus.summaryControlCount !== null && (
              <p className="mt-1 text-xs text-slate-300">
                Controls: {reportingStatus.summaryControlCount.toLocaleString()}
              </p>
            )}
            {importTimeLabel && (
              <p className="mt-2 text-xs text-slate-400">
                Imported: {importTimeLabel}
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur px-8 py-4">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </header>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

// Add global default export definition to maximize compatibility surface area
export default DashboardShell;
