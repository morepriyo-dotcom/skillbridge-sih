"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Global listener that detects password recovery events and tokens.
 * When Supabase redirects recovery links to the Site URL (e.g. http://localhost:3000/#type=recovery),
 * this automatically routes the user to /reset-password.
 */
export function AuthRecoveryListener() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check hash directly for type=recovery
    if (window.location.hash.includes("type=recovery")) {
      router.push(`/reset-password${window.location.hash}`);
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
