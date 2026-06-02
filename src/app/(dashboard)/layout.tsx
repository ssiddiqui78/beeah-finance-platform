import React from "react";
import DashboardShell from "@/components/layout/dashboard-shell";

export default function DashboardRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
