import { serverEnv } from "../../env.server";
import { LocalReportingRepository } from "./impl/local-reporting-repository";
import { SupabaseReportingRepository } from "./impl/supabase-reporting-repository";

export function resolveReportingRepository() {
  if (
    serverEnv.NEXT_PUBLIC_SUPABASE_URL &&
    serverEnv.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new SupabaseReportingRepository();
  }

  return new LocalReportingRepository();
}
