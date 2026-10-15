import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client proxy or throw helpful error
    return createBrowserClient(
      supabaseUrl || "https://placeholder-url.supabase.co",
      supabaseAnonKey || "placeholder-anon-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
