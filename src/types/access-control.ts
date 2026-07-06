export type AppRole =
  | "owner"
  | "admin"
  | "approver"
  | "preparer"
  | "viewer";

export type PermissionKey =
  | "view_dashboards"
  | "export_reports"
  | "import_workbook"
  | "refresh_reporting_data"
  | "manage_reporting_periods"
  | "unlock_periods"
  | "edit_commentary"
  | "approve_commentary"
  | "manage_planning_versions"
  | "submit_plans"
  | "approve_plans"
  | "run_ai_analysis"
  | "manage_users"
  | "manage_roles"
  | "manage_integrations"
  | "manage_system_settings"
  | "transfer_ownership";

export type ScopeLevel =
  | "group"
  | "vertical"
  | "sub_vertical"
  | "company"
  | "profit_center";

export type UserProfile = {
  userId: string;
  email: string | null;
  displayName: string | null;
  isActive: boolean;
};

export type UserRoleAssignment = {
  userId: string;
  role: AppRole;
  isActive: boolean;
};

export type UserScopeAssignment = {
  userId: string;
  scopeLevel: ScopeLevel;
  scopeValue: string;
  isActive: boolean;
};
