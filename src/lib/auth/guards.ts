import { redirect } from "next/navigation";
import { getCurrentUserAccess } from "./current-user";
import { hasPermission, type AppRole } from "./roles";

export async function requireAuthenticatedUser() {
  const access = await getCurrentUserAccess();

  if (!access.user) {
    redirect("/login");
  }

  return access;
}

export async function requireAnyRole(allowedRoles: AppRole[]) {
  const access = await requireAuthenticatedUser();

  const permitted = access.roles.some((role) => allowedRoles.includes(role));

  if (!permitted) {
    redirect("/unauthorized");
  }

  return access;
}

export async function requirePermission(permission: any) {
  const access = await requireAuthenticatedUser();

  if (!access.roles.length || !hasPermission(access.roles, permission)) {
    redirect("/unauthorized");
  }

  return access;
}
