import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wwvpfupkorgyooaqfwio.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dnBmdXBrb3JneW9vYXFmd2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTI2NzIsImV4cCI6MjEwNzcyODY3Mn0.ilBsPJU86I2zARZ_0fgGBWgtTSIKGgijmdnsE5nKJ1E";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
