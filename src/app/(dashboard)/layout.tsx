// src/app/(dashboard)/layout.tsx
import React from "react";
import Sidebar from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Global Dashboard Structural Route Shell.
 * Provides the master containment grid layout across all core accounting views.
 */
export default function DashboardRouteLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Primary Left Navigation Column */}
      <Sidebar />

      {/* 2. Main High-Density Scrollable Analytics View Area */}
      <div className="pl-64">
        <main className="min-h-screen w-full px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
