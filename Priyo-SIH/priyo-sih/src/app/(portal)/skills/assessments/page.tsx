import React from "react";
import { getCachedProfile } from "@/lib/supabase/server";
import {
  getAvailableAssessments,
  getMyAssessmentResults,
  getMyCreatedAssessments,
  getSubmissionsForMyAssessments,
} from "@/queries/skills";
import { AssessmentManager } from "./assessment-manager";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const profile = await getCachedProfile();
  const userRole = profile?.role || "student";

  const [available, pastResults, myCreated, submissions] = await Promise.all([
    getAvailableAssessments(),
    getMyAssessmentResults(),
    getMyCreatedAssessments(),
    getSubmissionsForMyAssessments(),
  ]);

  return (
    <AssessmentManager
      userRole={userRole}
      userId={profile?.id}
      availableAssessments={available}
      pastResults={pastResults}
      myCreatedAssessments={myCreated}
      submissionsForMyAssessments={submissions}
    />
  );
}
