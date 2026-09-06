import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getUserSkills,
  getSkillTaxonomy,
  getAvailableAssessments,
  getMyAssessmentResults,
} from "@/queries/skills";
import { getStudentCareerGoals } from "@/queries/profile";
import { SkillGapManager } from "./skill-gap-manager";
import { CheckCircle2, AlertCircle, Plus, ShieldCheck, Sparkles, BookOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { removeUserSkill } from "@/actions/skills";

export const metadata = {
  title: "Skill Mapping & Desired Role Gap Analysis | SkillBridge",
  description: "Evaluate your competencies, analyze skill gaps for your desired industry role, and bridge requirements.",
};

export default async function SkillsPage() {
  const [userSkills, taxonomy, availableAssessments, assessmentSubmissions, careerGoals] =
    await Promise.all([
      getUserSkills(),
      getSkillTaxonomy(),
      getAvailableAssessments(),
      getMyAssessmentResults(),
      getStudentCareerGoals(),
    ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-semibold">Skill Mapping & Role Gap Analysis</h1>
          <p className="text-body text-ink-muted mt-1">
            Specify your desired industry role, evaluate competencies from your assessments, and close your skill gaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="secondary" className="rounded-pill">
              Edit Career Profile
            </Button>
          </Link>
          <Link href="/skills/assessments">
            <Button className="rounded-pill bg-accent-blue text-white">
              <Sparkles className="w-4 h-4 mr-2" /> Take Skill Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Skill Gap Manager with Role Selection & Upload Modal */}
      <SkillGapManager
        userSkills={userSkills}
        taxonomy={taxonomy}
        assessmentSubmissions={assessmentSubmissions}
        availableAssessments={availableAssessments}
        initialDesiredRole={careerGoals.desired_role}
        initialDesiredSector={careerGoals.desired_sector}
      />

      {/* User Skills Inventory Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-headline flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-blue" />
                Your Verified & Listed Skills Inventory
              </CardTitle>
              <CardDescription>
                {userSkills.length} competencies registered under your profile
              </CardDescription>
            </div>
            <Link href="/skills/assessments">
              <Badge variant="accent" className="cursor-pointer">
                {userSkills.filter((u: any) => u.verified).length} Verified by Assessment
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {userSkills.length === 0 ? (
            <div className="py-12 text-center text-ink-muted space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto opacity-50 text-amber-500" />
              <p className="text-body font-medium">No skills uploaded yet.</p>
              <p className="text-body-sm text-ink-muted max-w-md mx-auto">
                Use the "Upload Skills" button above to paste your technical competencies, or take an assessment to automatically verify your skills.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((item: any) => {
                const s = Array.isArray(item.skill) ? item.skill[0] : item.skill;
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-surface-2 rounded-xl border border-hairline flex flex-col justify-between shadow-xs transition-all hover:border-accent-blue/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-body font-semibold text-ink">{s?.name || "Skill"}</h4>
                        <p className="text-micro text-ink-muted mt-0.5">
                          {s?.category || "Technical"} &bull; {s?.sector || "Industry"}
                        </p>
                      </div>
                      {item.verified ? (
                        <Badge variant="success" className="flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="text-[11px]">Self Declared</Badge>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-hairline flex justify-between items-center text-micro">
                      <span className="text-ink-muted">
                        Level: <strong className="text-ink capitalize">{item.proficiency}</strong>
                      </span>
                      <span className="text-ink-muted">
                        {item.verification_source === "assessment"
                          ? "Via Assessment"
                          : "Self Reported"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
