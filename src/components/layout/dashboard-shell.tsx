"use client";
import React from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function DashboardShell({ children, title, description }: DashboardShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
