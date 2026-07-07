import { createBrowserClient } from "@supabase/ssr";

function getSupabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function createSupabaseBrowserClient() {
  // Use explicit Next.js public environment lookup rules
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = getSupabasePublicKey();

  if (!url || !key) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return createBrowserClient(url, key);
}
