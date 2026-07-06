import { serverEnv } from "../../env.server";
import { LocalReportingRepository } from "./impl/local-reporting-repository";
import { SupabaseReportingRepository } from "./impl/supabase-reporting-repository";

export function resolveReportingRepository() {
  // Read from Next.js server env schema OR fall back to standard process.env for terminal scripts
  const supabaseUrl = serverEnv.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const hasSupabaseConnection = Boolean(supabaseUrl) && Boolean(serviceRoleKey);

  if (hasSupabaseConnection) {
    return new SupabaseReportingRepository();
  }

  return new LocalReportingRepository();
}
