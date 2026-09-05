"use client";

import { useEffect, useState } from "react";

/**
 * Media query hook for responsive behavior in client components.
 * Use Tailwind responsive classes for most cases — this hook is
 * for JS-driven responsive logic (e.g., changing chart config).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Convenience: is the viewport at least 810px (tablet breakpoint from DESIGN.md)? */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 810px)");
}
