import { createClient } from "@supabase/supabase-js";

import { env } from "../env";
import { serverEnv } from "../env.server";

export function createSupabaseAdminClient() {
  const targetUrl = (env as any).supabaseUrl || (env as any).NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!targetUrl || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    targetUrl,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
