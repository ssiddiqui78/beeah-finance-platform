import type { AppRole, PermissionKey } from "../../types/access-control";

export const roleRank: Record<AppRole, number> = {
  owner: 100,
  admin: 80,
  approver: 60,
  preparer: 40,
  viewer: 20,
};

export const rolePermissions: Record<AppRole, PermissionKey[]> = {
  owner: [
    "view_dashboards",
    "export_reports",
    "import_workbook",
    "refresh_reporting_data",
    "manage_reporting_periods",
    "unlock_periods",
    "edit_commentary",
    "approve_commentary",
    "manage_planning_versions",
    "submit_plans",
    "approve_plans",
    "run_ai_analysis",
    "manage_users",
    "manage_roles",
    "manage_integrations",
    "manage_system_settings",
    "transfer_ownership",
  ],
  admin: [
    "view_dashboards",
    "export_reports",
    "import_workbook",
    "refresh_reporting_data",
    "manage_reporting_periods",
    "unlock_periods",
    "edit_commentary",
    "approve_commentary",
    "manage_planning_versions",
    "submit_plans",
    "approve_plans",
    "run_ai_analysis",
    "manage_users",
    "manage_roles",
    "manage_integrations",
    "manage_system_settings",
  ],
  approver: [
    "view_dashboards",
    "export_reports",
    "approve_commentary",
    "approve_plans",
    "run_ai_analysis",
  ],
  preparer: [
    "view_dashboards",
    "export_reports",
    "import_workbook",
    "refresh_reporting_data",
    "edit_commentary",
    "manage_planning_versions",
    "submit_plans",
    "run_ai_analysis",
  ],
  viewer: [
    "view_dashboards",
    "export_reports",
  ],
};

export function getHighestRole(roles: AppRole[]): AppRole | null {
  if (roles.length === 0) return null;

  return [...roles].sort((a, b) => roleRank[b] - roleRank[a])[0];
}

export function hasPermission(
  roles: AppRole[],
  permission: PermissionKey
): boolean {
  return roles.some((role) => rolePermissions[role].includes(permission));
}

export function canManageRole(
  actorRoles: AppRole[],
  targetRole: AppRole
): boolean {
  const actorHighest = getHighestRole(actorRoles);
  if (!actorHighest) return false;

  return roleRank[actorHighest] > roleRank[targetRole];
}

export function isOwner(roles: AppRole[]): boolean {
  return roles.includes("owner");
}
