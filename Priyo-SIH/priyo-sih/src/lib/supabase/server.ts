import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for RSC and Server Actions.
 * Creates a NEW client per request — never cached, never shared.
 * This prevents cross-request auth leakage in serverless environments.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from Server Components where cookies
            // cannot be set. This is expected — the middleware handles
            // session refresh instead.
          }
        },
      },
    }
  );
}

import { cache } from "react";

/**
 * Admin client with service role key.
 * ONLY use in trusted Server Actions for admin operations.
 * Never import this in client components or expose the key.
 */
export async function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Request-scoped cached user getter.
 * Deduplicates auth.getUser() calls across Server Components, layouts, and queries
 * within a single request render tree.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user || null;
});

/**
 * Request-scoped cached profile getter.
 * Deduplicates profiles table queries across layouts, pages, and queries.
 */
export const getCachedProfile = cache(async () => {
  const user = await getCachedUser();
  if (!user) return null;

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, bio, phone")
    .eq("id", user.id)
    .maybeSingle();

  const metaRole = user.user_metadata?.role;
  const metaName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  let effectiveRole = profile?.role || metaRole || "student";
  if (metaRole === "academician" || profile?.role === "academician") {
    effectiveRole = "academician";
  } else if (metaRole && profile?.role === "student" && metaRole !== "student") {
    effectiveRole = metaRole;
  }

  return {
    id: user.id,
    email: user.email || "",
    role: effectiveRole,
    full_name: profile?.full_name || metaName,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    bio: profile?.bio || null,
    phone: profile?.phone || null,
  };
});
