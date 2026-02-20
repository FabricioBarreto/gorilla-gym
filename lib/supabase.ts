import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "Key:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
  );

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
