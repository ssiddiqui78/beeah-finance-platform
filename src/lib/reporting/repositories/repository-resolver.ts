import { env } from "../../env";
import { serverEnv } from "../../env.server";
import type { ReportingRepository } from "./reporting-repository";
import { LocalReportingRepository } from "./impl/local-reporting-repository";
import { SupabaseReportingRepository } from "./impl/supabase-reporting-repository";

export function resolveReportingRepository(): ReportingRepository {
  const hasSupabaseConnection =
    Boolean((env as any).supabaseUrl || (env as any).NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);

  if (hasSupabaseConnection) {
    return new SupabaseReportingRepository();
  }

  return new LocalReportingRepository();
}
