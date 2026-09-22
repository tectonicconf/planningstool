import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Browser-safe client. Runs as the `anon` Postgres role, so it is bound by
// RLS. Fine for data that's meant to be publicly readable/writable.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Server-only client for privileged lookups, e.g. resolving a volunteer's
// personal token to their shifts. Uses the secret key, which bypasses RLS
// entirely — never import this from a Client Component, and never prefix
// SUPABASE_SECRET_KEY with NEXT_PUBLIC_.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey!, {
  auth: { persistSession: false },
});