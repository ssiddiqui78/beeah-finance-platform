import { createSupabaseServerClient } from "../supabase/server";
import { getHighestRole, type AppRole } from "./roles";

type RoleAssignment = {
  role_key: AppRole;
};

export async function getCurrentUserAccess() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      roles: [] as AppRole[],
      highestRole: null as AppRole | null,
    };
  }

  const { data: roleAssignments } = await supabase
    .from("app_role_assignments")
    .select("role_key")
    .eq("user_id", user.id);

  const roles = ((roleAssignments ?? []) as RoleAssignment[]).map((r) => r.role_key);
  const highestRole = roles.length ? getHighestRole(roles) : null;

  return {
    user,
    roles,
    highestRole,
  };
}
