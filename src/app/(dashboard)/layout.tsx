import { ReactNode } from "react";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Enforce a strict global session gate for the entire internal app workspace
  await requireAuthenticatedUser();

  return <>{children}</>;
}
