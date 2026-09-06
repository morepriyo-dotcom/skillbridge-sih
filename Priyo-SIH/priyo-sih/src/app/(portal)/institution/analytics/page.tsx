import React from "react";
import { getInstitutionAnalytics } from "@/queries/analytics";
import {
  getNaacPlacementRecords,
  getNirfCohortMetrics,
  getAccreditationSummary,
} from "@/queries/accreditation";
import { AccreditationManager } from "./accreditation-manager";

export const dynamic = "force-dynamic";

export default async function InstitutionAnalyticsPage() {
  const [analytics, naacRecords, nirfCohorts, summary] = await Promise.all([
    getInstitutionAnalytics(),
    getNaacPlacementRecords(),
    getNirfCohortMetrics(),
    getAccreditationSummary(),
  ]);

  return (
    <AccreditationManager
      initialRecords={naacRecords}
      initialNirfCohorts={nirfCohorts}
      initialSummary={summary}
      institutionAnalytics={analytics}
    />
  );
}
