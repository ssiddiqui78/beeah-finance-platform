// src/components/layout/sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { env } from "@/lib/env";
import SidebarStatus from "./sidebar-status";
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  TrendingUp, 
  PieChart, 
  Database,
  Briefcase
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Unified global navigation map linked directly to your Zod runtime feature flags
  const menuItems = [
    {
      label: "Executive Summary",
      href: "/executive-summary",
      icon: LayoutDashboard,
      enabled: env.flags.execSummary,
    },
    {
      label: "Consolidated P&L",
      href: "/consolidated-pnl",
      icon: FileSpreadsheet,
      enabled: env.flags.consolidatedPnL,
    },
    {
      label: "Balance Sheet",
      href: "/balance-sheet",
      icon: TrendingUp,
      enabled: env.flags.balanceSheet,
    },
    {
      label: "Segment Performance",
      href: "/segment-performance",
      icon: PieChart,
      enabled: env.flags.segmentPerformance,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      {/* 1. Header Branded Workspace Container */}
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-between rounded-xl bg-emerald-600 p-2 text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">Beeah Group</h1>
            <p className="text-[10px] font-medium text-slate-500">Finance Control Hub</p>
          </div>
        </div>
      </div>

      {/* 2. Automated Ledger Telemetry Pulse Indicator */}
      <SidebarStatus />

      {/* 3. Primary Core Component App Routes Navigation Tree */}
      <nav className="flex-1 space-y-1 px-4 py-3 overflow-y-auto">
        {menuItems
          .filter((item) => item.enabled)
          .map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* 4. Footer Infrastructure Meta Versioning Panel */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-400">
          <Database className="h-3.5 w-3.5" />
          <span className="text-[10px] font-medium tracking-wide uppercase text-slate-500">v1.1.0-snapshot</span>
        </div>
      </div>
    </aside>
  );
}
