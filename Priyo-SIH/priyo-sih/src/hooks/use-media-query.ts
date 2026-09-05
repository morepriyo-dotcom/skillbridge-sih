"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Media query hook for responsive behavior in client components.
 * Uses useSyncExternalStore for tear-free, SSR-safe execution without cascading renders.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Convenience: is the viewport at least 810px (tablet breakpoint from DESIGN.md)? */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 810px)");
}
