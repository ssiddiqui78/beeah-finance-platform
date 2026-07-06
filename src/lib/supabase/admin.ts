import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "../env.server";

export function createSupabaseAdminClient() {
  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
