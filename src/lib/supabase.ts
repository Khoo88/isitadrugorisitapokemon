import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FETCH_TIMEOUT_MS = 10_000;

let serverSingleton: SupabaseClient | null = null;

function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: init?.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }),
    },
  });
}

/**
 * Browser-safe Supabase client (anon key).
 */
export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("", "");

/** Reused server client with session persistence disabled and fetch timeouts. */
export function getSupabaseServer(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  if (!serverSingleton) {
    serverSingleton = createServerClient();
  }

  return serverSingleton;
}
