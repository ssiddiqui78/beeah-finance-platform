import React from "react";
import { getCurrentUserAccess } from "../../lib/auth/current-user";
import { CurrentUserPanel } from "../auth/current-user-panel";

type DashboardShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  showFilters?: boolean;
};

export async function DashboardShell({
  children,
  title,
  description,
  showFilters = true,
}: DashboardShellProps) {
  // Load current user profile, system role key, and identity data directly from server layers
  const access = await getCurrentUserAccess();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Side Master Sidebar Navigation Layout Hub */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <div className="font-bold text-slate-900 tracking-tight">Beeah Group</div>
          </div>
          
          {/* Main Navigation Matrix Links */}
          <nav className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            <a href="/executive-summary" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              📊 Executive Summary
            </a>
            <a href="/consolidated-pl" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              📋 Consolidated P&L
            </a>
            <a href="/balance-sheet" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              ⚖️ Balance Sheet
            </a>
            <a href="/segment-performance" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              🎯 Segment Performance
            </a>
            <a href="/reporting-admin" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
              ⚙️ Reporting Admin
            </a>
          </nav>
        </div>

        {/* Enterprise Identity Layer Stacked at the base of your Sidebar navigation layout */}
        <div className="mt-auto space-y-4 w-full">
          {access.user ? (
            <CurrentUserPanel
              email={access.profile?.email || access.user.email || "Unknown user"}
              fullName={access.profile?.full_name || null}
              highestRole={access.highestRole}
            />
          ) : null}
          
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 font-medium">
            🟢 Connected Core Cluster: <span className="font-bold text-slate-700">Production Mode</span>
          </div>
        </div>
      </aside>

      {/* Right Side Dynamic Financial Matrix Content Stream */}
      <main className="pl-64 flex-1">
        <header className="border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500 font-medium">{description}</p>}
            </div>
            
            {/* Upper Right Action and Context Container */}
            <div className="flex items-center gap-3">
              {access.highestRole ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  🔑 Role: <span className="font-bold text-slate-900 uppercase tracking-wide">{access.highestRole}</span>
                </span>
              ) : null}

              {showFilters && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  📅 FY2026 Active
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
