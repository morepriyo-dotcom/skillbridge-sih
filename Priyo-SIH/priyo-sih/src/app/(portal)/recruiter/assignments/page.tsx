import React from "react";
import { getMyOpportunitiesWithAssignments } from "@/queries/role-assignments";
import { getAvailableAssessments } from "@/queries/skills";
import { RoleAssignmentManager } from "./role-assignment-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Task Assignments | Recruiter Portal",
  description: "Assign screening assessments and tasks to open opportunities based on role requirements.",
};

export const dynamic = "force-dynamic";

export default async function RecruiterAssignmentsPage() {
  const [opportunities, assessments] = await Promise.all([
    getMyOpportunitiesWithAssignments(),
    getAvailableAssessments(),
  ]);

  return (
    <RoleAssignmentManager
      opportunities={opportunities}
      availableAssessments={assessments}
    />
  );
}
