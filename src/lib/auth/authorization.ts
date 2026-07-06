import type {
  AppRole,
  ScopeLevel,
  UserScopeAssignment,
} from "../../types/access-control";
import { hasPermission, isOwner } from "./roles";

export function canAccessScope(
  roles: AppRole[],
  scopeAssignments: UserScopeAssignment[],
  requestedScopeLevel: ScopeLevel,
  requestedScopeValue: string
): boolean {
  if (isOwner(roles)) return true;

  if (roles.includes("admin")) return true;

  const matchingAssignment = scopeAssignments.find(
    (assignment) =>
      assignment.isActive &&
      assignment.scopeLevel === requestedScopeLevel &&
      assignment.scopeValue === requestedScopeValue
  );

  if (matchingAssignment) return true;

  const groupAssignment = scopeAssignments.find(
    (assignment) =>
      assignment.isActive && assignment.scopeLevel === "group"
  );

  return Boolean(groupAssignment);
}

export function canRunWorkbookImport(roles: AppRole[]): boolean {
  return hasPermission(roles, "import_workbook");
}

export function canApproveReporting(roles: AppRole[]): boolean {
  return hasPermission(roles, "approve_commentary");
}

export function canManagePlatform(roles: AppRole[]): boolean {
  return (
    hasPermission(roles, "manage_system_settings") ||
    hasPermission(roles, "manage_integrations")
  );
}
