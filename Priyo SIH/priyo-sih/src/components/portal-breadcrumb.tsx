"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/opportunities": "Opportunities",
  "/applications": "Applications",
  "/portfolio": "Digital Portfolio",
  "/collaborations": "Collaborations",
  "/mentorship": "Mentorship",
  "/skills": "Skills Inventory",
  "/skills/assessments": "Skill Assessments",
  "/institution/analytics": "Institutional Analytics",
  "/recruiter/applicants": "Applicant Pipeline",
  "/recruiter/post-opportunity": "Post Opportunity",
};

export function PortalBreadcrumb() {
  const pathname = usePathname();

  // Match route or derive title from path
  let currentTitle = ROUTE_NAMES[pathname];
  if (!currentTitle) {
    if (pathname.startsWith("/opportunities/")) {
      currentTitle = "Opportunity Details";
    } else if (pathname.startsWith("/skills/assessments/")) {
      currentTitle = "Take Assessment";
    } else {
      const parts = pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1] || "Dashboard";
      currentTitle = last
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return (
    <div className="flex items-center text-body-sm text-ink-muted">
      <span>Portal</span>
      <ChevronRight className="w-4 h-4 mx-2" />
      <span className="text-ink font-medium">{currentTitle}</span>
    </div>
  );
}
