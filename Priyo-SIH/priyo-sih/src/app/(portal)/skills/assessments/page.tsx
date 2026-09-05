import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAvailableAssessments,
  getMyAssessmentResults,
} from "@/queries/skills";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

export default async function AssessmentsPage() {
  const available = await getAvailableAssessments();
  const pastResults = await getMyAssessmentResults();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-ink font-medium">
          Industry Skill Assessments
        </h1>
        <p className="text-body text-ink-muted mt-1">
          Complete standardized tests curated by industry partners to verify
          competencies and earn digital badges.
        </p>
      </div>

      {/* Available Tests Grid */}
      <div>
        <h2 className="text-headline text-ink mb-4">
          Available Assessments
        </h2>

        {available.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-ink-muted mx-auto mb-4" />
            <h3 className="text-headline text-ink font-medium">
              No assessments available
            </h3>
            <p className="text-body text-ink-muted mt-1">
              New assessments will appear here when published by industry
              partners.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {available.map((assessment: any) => (
              <Card
                key={assessment.id}
                className="flex flex-col justify-between hover:border-hairline transition-colors"
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="accent">
                      {assessment.sector || "General"}
                    </Badge>
                    <span className="text-micro text-ink-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {assessment.duration_minutes} mins
                    </span>
                  </div>
                  <CardTitle className="text-headline mt-2">
                    {assessment.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {assessment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-micro text-ink-muted border-t border-hairline pt-3">
                    <span>
                      Passing Score:{" "}
                      <strong className="text-ink">
                        {assessment.passing_score}%
                      </strong>
                    </span>
                    <span>
                      Total Marks:{" "}
                      <strong className="text-ink">
                        {assessment.total_marks}
                      </strong>
                    </span>
                    <span>
                      Category:{" "}
                      <strong className="text-ink">
                        {assessment.category}
                      </strong>
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/skills/assessments/${assessment.id}`}
                    className="w-full"
                  >
                    <Button className="w-full rounded-pill">
                      Start Assessment{" "}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Assessment History */}
      {pastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-headline">
              Your Assessment History
            </CardTitle>
            <CardDescription>
              Records of completed evaluations and verified badge credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastResults.map((res: any) => {
                const assessmentTitle = Array.isArray(res.assessment)
                  ? res.assessment[0]?.title
                  : res.assessment?.title;
                return (
                  <div
                    key={res.id}
                    className="p-4 bg-surface-2 rounded-xl border border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div>
                      <h4 className="text-body-sm font-medium text-ink">
                        {assessmentTitle || "Assessment"}
                      </h4>
                      <p className="text-micro text-ink-muted mt-0.5">
                        Completed on{" "}
                        {new Date(res.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-body font-bold text-ink">
                        {Math.round(res.score)}%
                      </span>
                      {res.passed ? (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed &amp;
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="error">Did Not Pass</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
