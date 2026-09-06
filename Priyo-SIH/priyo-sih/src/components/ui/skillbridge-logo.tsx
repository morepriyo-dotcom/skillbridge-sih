"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SkillBridgeLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  showTagline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  href?: string | null;
  className?: string;
}

export function SkillBridgeLogo({
  size = "md",
  showWordmark = true,
  showTagline = true,
  showBadge = true,
  badgeText = "SIH",
  href = "/",
  className,
}: SkillBridgeLogoProps) {
  const sizeMap = {
    sm: {
      box: "w-8 h-8 rounded-lg",
      svg: 22,
      title: "text-base tracking-tight",
      tagline: "text-[8px] tracking-[0.15em]",
      badge: "text-[8px] px-1 py-0",
      gap: "gap-2",
    },
    md: {
      box: "w-10 h-10 rounded-xl",
      svg: 26,
      title: "text-[1.18rem] tracking-[-0.03em]",
      tagline: "text-[9px] tracking-[0.16em]",
      badge: "text-[8.5px] px-1.5 py-0.5",
      gap: "gap-2.5",
    },
    lg: {
      box: "w-12 h-12 rounded-2xl",
      svg: 32,
      title: "text-2xl tracking-[-0.035em]",
      tagline: "text-[10.5px] tracking-[0.18em]",
      badge: "text-[9.5px] px-2 py-0.5",
      gap: "gap-3",
    },
  }[size];

  const content = (
    <div className={cn("inline-flex items-center group select-none cursor-pointer", sizeMap.gap, className)}>
      {/* Corporate Emblem Container */}
      <div className="relative">
        {/* Icon Squircle Badge */}
        <div
          className={cn(
            sizeMap.box,
            "relative flex items-center justify-center bg-surface-1 border border-hairline shadow-xs transition-transform duration-200 group-hover:scale-[1.02]"
          )}
        >
          <svg
            width={sizeMap.svg}
            height={sizeMap.svg}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="sb-bridge-span" x1="5" y1="26" x2="31" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="sb-flight-path" x1="6" y1="23" x2="28" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Ground / Foundation Bridge Arch */}
            <path
              d="M 5 26 C 10 19.5, 15 16, 18 16 C 21 16, 26 19.5, 31 26"
              stroke="url(#sb-bridge-span)"
              strokeWidth="2.75"
              strokeLinecap="round"
            />

            {/* Bridge Verticals */}
            <line x1="11.5" y1="18.5" x2="11.5" y2="24" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="18" y1="16" x2="18" y2="22.5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <line x1="24.5" y1="18.5" x2="24.5" y2="24" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Ascending Flight Arc */}
            <path
              d="M 6.5 22 C 10.5 14, 15 7, 26 7"
              stroke="url(#sb-flight-path)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Student Foundation Origin Node */}
            <circle cx="6.5" cy="22" r="2" fill="#2563eb" />

            {/* North Star Apex */}
            <path
              d="M 26 7 L 27.2 3.2 L 28.4 7 L 32.2 8.2 L 28.4 9.4 L 27.2 13.2 L 26 9.4 L 22.2 8.2 Z"
              fill="#3b82f6"
            />
            <circle cx="27.2" cy="8.2" r="1.1" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={cn("font-bold text-ink tracking-tight transition-colors", sizeMap.title)}>
              Skill<span className="text-accent-blue font-extrabold">Bridge</span>
            </span>

            {showBadge && (
              <span
                className={cn(
                  "font-bold uppercase tracking-wider rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/25 leading-none",
                  sizeMap.badge
                )}
              >
                {badgeText}
              </span>
            )}
          </div>

          {showTagline && (
            <span
              className={cn(
                "text-ink-muted font-bold uppercase transition-colors group-hover:text-ink/80 mt-1 leading-tight",
                sizeMap.tagline
              )}
            >
              Campus to Corporate
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="SkillBridge Home">
        {content}
      </Link>
    );
  }

  return content;
}
