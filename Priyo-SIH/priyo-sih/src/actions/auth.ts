"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validators/auth";

export type AuthActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Sign up a new user with email/password.
 * Strictly enforces zero-redundancy:
 * 1. Normalized email (lowercase, trimmed)
 * 2. Pre-checks profiles table
 * 3. Pre-checks auth.users via Admin API
 * 4. Checks Supabase GoTrue identities array
 */
export async function signUp(input: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password, fullName, role } = parsed.data;

  // Strict Redundancy Check 1: Check existing profiles in database
  try {
    const admin = await createAdminClient();
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return {
        error:
          "An account with this email address already exists. Please sign in or use a different email.",
      };
    }
  } catch {
    // If profiles table is being migrated or unseeded, fall through to auth check
  }

  // Strict Redundancy Check 2: Check auth.users directly via Supabase Admin API
  try {
    const admin = await createAdminClient();
    const { data: userList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const emailAlreadyRegistered = userList?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (emailAlreadyRegistered) {
      return {
        error:
          "An account with this email address already exists. Please sign in or use a different email.",
      };
    }
  } catch {
    // Admin listing fallback
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already in use") ||
      msg.includes("already exists") ||
      error.code === "23505"
    ) {
      return {
        error:
          "An account with this email address already exists. Please sign in or use a different email.",
      };
    }

    // Free-tier SMTP rate limit fallback (creates active user directly via Admin API)
    if (msg.includes("rate limit") || error.code === "over_email_send_rate_limit") {
      try {
        const admin = await createAdminClient();
        const { data: adminCreated, error: adminErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role,
          },
        });

        if (adminErr) return { error: adminErr.message };

        if (adminCreated.user) {
          await admin.from("profiles").upsert(
            {
              id: adminCreated.user.id,
              email,
              full_name: fullName,
              role,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
        return { success: true };
      } catch (fallbackErr: any) {
        return { error: fallbackErr?.message || "Failed to create account. Please try again." };
      }
    }

    if (msg.includes("database error saving new user") || msg.includes("database error")) {
      return {
        error:
          "Database trigger configuration required: The Supabase trigger for profiles needs an INSERT policy. Please run the provided SQL in your Supabase SQL Editor to finish setting up the database.",
      };
    }

    return { error: error.message };
  }

  // Strict Redundancy Check 3: GoTrue anti-enumeration identity check
  // When an email is already registered and confirmation is enabled, GoTrue returns identities: []
  if (
    data.user &&
    (!data.user.identities || data.user.identities.length === 0)
  ) {
    return {
      error:
        "An account with this email address already exists. Please sign in or use a different email.",
    };
  }

  // Ensure profile row exists in database
  if (data.user) {
    try {
      const admin = await createAdminClient();
      await admin.auth.admin.updateUserById(data.user.id, {
        user_metadata: { full_name: fullName, role },
      });
      const { error: upsertErr } = await admin.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (upsertErr) {
        console.warn("Profile upsert warning:", upsertErr);
      }

      if (role === "academician") {
        const { data: existingDet } = await admin
          .from("academician_details")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!existingDet) {
          await admin.from("academician_details").insert({
            user_id: data.user.id,
            department: "Faculty Department",
            designation: "Academician / Faculty",
            areas_of_expertise: [],
            research_interests: [],
            open_for_consultancy: true,
          });
        }
      }
    } catch (upsertErr) {
      console.warn("Profile upsert warning:", upsertErr);
    }
  }

  return { success: true };
}

/**
 * Sign in with email/password.
 * On success, redirect to dashboard (or the original requested page).
 */
export async function signIn(
  input: LoginInput,
  redirectTo?: string
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("invalid login credentials") ||
      msg.includes("invalid credentials")
    ) {
      return {
        error:
          "Invalid email or password. Please verify your credentials and try again.",
      };
    }
    if (msg.includes("email not confirmed")) {
      return {
        error:
          "Please verify your email address before signing in. Check your inbox for the confirmation link.",
      };
    }
    return { error: error.message };
  }

  // Ensure role synchronization between auth user_metadata and profiles
  // User roles are immutable and determined strictly by registration.
  if (signInData.user) {
    try {
      const admin = await createAdminClient();
      const metaRole = signInData.user.user_metadata?.role as UserRole | undefined;

      // 1. Fetch user profile to read their actual registered role
      const { data: prof } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", signInData.user.id)
        .maybeSingle();

      // Role is fixed based on profile or metadata (default to student only if brand new)
      const registeredRole: UserRole = prof?.role || metaRole || "student";

      // 2. Keep auth user_metadata synchronized with registered role
      if (metaRole !== registeredRole) {
        await admin.auth.admin.updateUserById(signInData.user.id, {
          user_metadata: {
            ...signInData.user.user_metadata,
            role: registeredRole,
          },
        });
      }

      // 3. Ensure profile record exists without altering their role
      if (!prof) {
        await admin.from("profiles").insert({
          id: signInData.user.id,
          email: parsed.data.email,
          full_name:
            signInData.user.user_metadata?.full_name ||
            parsed.data.email.split("@")[0],
          role: registeredRole,
          updated_at: new Date().toISOString(),
        });
      }

      // 4. Initialize role-specific details if academician
      if (registeredRole === "academician") {
        const { data: existingDet } = await admin
          .from("academician_details")
          .select("id")
          .eq("user_id", signInData.user.id)
          .maybeSingle();

        if (!existingDet) {
          await admin.from("academician_details").insert({
            user_id: signInData.user.id,
            department: "Faculty Department",
            designation: "Academician / Faculty",
            areas_of_expertise: [],
            research_interests: [],
            open_for_consultancy: true,
          });
        }
      }
    } catch (syncErr) {
      console.warn("Profile sync error on sign in:", syncErr);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/(portal)", "layout");
  redirect(redirectTo || "/dashboard");
}

/**
 * Role switching is strictly disabled. User roles are permanently fixed.
 */
export async function switchActiveRole(
  _newRole: UserRole
): Promise<AuthActionResult> {
  return { error: "Role switching is disabled. User roles are permanently fixed upon registration." };
}

/**
 * Sign out the current user and redirect to home.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Send a password reset email.
 */
export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Reset password (after clicking the reset link).
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

/**
 * Get the current authenticated user's profile.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      if (
        profile.role === "student" &&
        user.user_metadata?.role &&
        user.user_metadata.role !== "student"
      ) {
        profile.role = user.user_metadata.role;
      }
      return profile;
    }
  } catch {
    // Database query failed
  }

  return {
    id: user.id,
    email: user.email,
    full_name:
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    role: user.user_metadata?.role || "student",
    avatar_url: user.user_metadata?.avatar_url || null,
  };
}
