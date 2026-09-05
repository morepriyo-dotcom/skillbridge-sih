import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-xxl",
        "text-display-xl",
        "text-display-lg",
        "text-display-md",
        "text-headline",
        "text-subhead",
        "text-body-lg",
        "text-body",
        "text-body-sm",
        "text-caption",
        "text-micro",
        "text-button",
      ],
      "text-color": [
        "text-canvas",
        "text-surface-1",
        "text-surface-2",
        "text-hairline",
        "text-hairline-soft",
        "text-ink",
        "text-ink-muted",
        "text-accent-blue",
        "text-gradient-magenta",
        "text-gradient-violet",
        "text-gradient-orange",
        "text-gradient-coral",
        "text-semantic-success",
        "text-semantic-error",
        "text-semantic-warning",
      ],
      "bg-color": [
        "bg-canvas",
        "bg-surface-1",
        "bg-surface-2",
        "bg-hairline",
        "bg-hairline-soft",
        "bg-ink",
        "bg-ink-muted",
        "bg-accent-blue",
        "bg-gradient-magenta",
        "bg-gradient-violet",
        "bg-gradient-orange",
        "bg-gradient-coral",
        "bg-semantic-success",
        "bg-semantic-error",
        "bg-semantic-warning",
      ],
      "border-color": [
        "border-canvas",
        "border-surface-1",
        "border-surface-2",
        "border-hairline",
        "border-hairline-soft",
        "border-ink",
        "border-ink-muted",
        "border-accent-blue",
        "border-semantic-success",
        "border-semantic-error",
        "border-semantic-warning",
      ],
      rounded: [
        "rounded-xs",
        "rounded-sm",
        "rounded-md",
        "rounded-lg",
        "rounded-xl",
        "rounded-2xl",
        "rounded-pill",
        "rounded-full",
      ],
    },
  },
});

/**
 * Merge Tailwind classes with clsx — prevents class conflicts.
 * Usage: cn("bg-canvas", isActive && "bg-surface-1", className)
 */
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a number as Indian currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Generate initials from a full name (e.g., "Ashwith Kumar" → "AK").
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Compute a proficiency level's numeric weight for sorting/scoring.
 */
export function proficiencyWeight(
  level: "beginner" | "intermediate" | "advanced" | "expert"
): number {
  const weights = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  return weights[level];
}
