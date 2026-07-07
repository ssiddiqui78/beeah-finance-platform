import { createSupabaseServerClient } from "../supabase/server";
import { getHighestRole, type AppRole } from "./roles";

type RoleAssignment = {
  role_key: AppRole;
};

type UserProfile = {
  full_name: string | null;
  email: string | null;
};

export async function getCurrentUserAccess() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null as UserProfile | null,
      roles: [] as AppRole[],
      highestRole: null as AppRole | null,
    };
  }

  const [{ data: roleAssignments }, { data: profile }] = await Promise.all([
    supabase
      .from("app_role_assignments")
      .select("role_key")
      .eq("user_id", user.id),
    supabase
      .from("app_user_profiles")
      .select("full_name, email")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const roles = ((roleAssignments ?? []) as RoleAssignment[]).map((r) => r.role_key);
  const highestRole = roles.length ? getHighestRole(roles) : null;

  return {
    user,
    profile: (profile as UserProfile | null) ?? null,
    roles,
    highestRole,
  };
}
