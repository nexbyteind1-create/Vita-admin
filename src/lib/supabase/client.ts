"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the console. Uses the publishable key and the
 * signed-in admin's session; what an admin may read or change is decided by
 * RLS (`public.is_admin()`, see VITA/sql/admin.sql), not by this app.
 */
let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env.local.",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "vita-admin-auth" },
  });
  return client;
}

/** Throws the PostgREST error, so callers can `await unwrap(query)`. */
export async function unwrap<T>(query: PromiseLike<{ data: T; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}
