import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOpportunityById } from "@/queries/opportunities";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OPPORTUNITY_TYPES } from "@/lib/constants";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Briefcase,
  ArrowLeft,
  Globe,
  Eye,
  IndianRupee,
  GraduationCap,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { ApplyButton } from "./apply-button";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const opportunity = await getOpportunityById(id);

  if (!opportunity) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <Briefcase className="w-12 h-12 text-ink-muted mx-auto" />
        <h1 className="text-display-md text-ink font-medium">
          Opportunity Not Found
        </h1>
        <p className="text-body text-ink-muted">
          This opportunity may have been removed or the link is invalid.
        </p>
        <Link href="/opportunities">
          <Button variant="secondary" className="rounded-pill mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  // Check if user already applied
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id, status, match_score")
    .eq("opportunity_id", id)
    .eq("applicant_id", user.id)
    .maybeSingle();

  // Get user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const industry = Array.isArray(opportunity.industry)
    ? opportunity.industry[0]
    : opportunity.industry;

  const typeLabel =
    OPPORTUNITY_TYPES[opportunity.type as keyof typeof OPPORTUNITY_TYPES] ||
    opportunity.type;

  const isDeadlinePassed =
    new Date(opportunity.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/opportunities"
        className="inline-flex items-center text-body-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all opportunities
      </Link>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="accent">{typeLabel}</Badge>
              {opportunity.is_remote && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Remote
                </Badge>
              )}
              {isDeadlinePassed && (
                <Badge variant="error">Deadline Passed</Badge>
              )}
            </div>
            <h1 className="text-display-md text-ink font-medium">
              {opportunity.title}
            </h1>
            {industry && (
              <p className="text-body text-ink-muted flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {industry.company_name}
                {industry.industry_sector && (
                  <span className="text-micro">
                    &bull; {industry.industry_sector}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-micro text-ink-muted">
            <Eye className="w-3.5 h-3.5" />
            {opportunity.views_count || 0} views
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-headline">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-ink-muted whitespace-pre-wrap leading-relaxed">
                {opportunity.description}
              </p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {opportunity.required_skills &&
            opportunity.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline">
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.required_skills.map((skill: string) => (
                      <Badge key={skill} variant="accent">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Preferred Skills */}
          {opportunity.preferred_skills &&
            opportunity.preferred_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline">
                    Preferred Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.preferred_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-surface-2 text-body-sm text-ink-muted border border-hairline"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Target Eligibility */}
          {(opportunity.target_degrees?.length > 0 ||
            opportunity.target_departments?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline">
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunity.min_cgpa > 0 && (
                  <div className="text-body-sm text-ink-muted">
                    <strong className="text-ink">Minimum CGPA:</strong>{" "}
                    {opportunity.min_cgpa}
                  </div>
                )}
                {opportunity.target_degrees?.length > 0 && (
                  <div>
                    <span className="text-body-sm text-ink font-medium block mb-1">
                      Target Degrees:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opportunity.target_degrees.map((d: string) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-surface-2 text-micro text-ink-muted"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {opportunity.target_departments?.length > 0 && (
                  <div>
                    <span className="text-body-sm text-ink font-medium block mb-1">
                      Target Departments:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opportunity.target_departments.map((d: string) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-surface-2 text-micro text-ink-muted"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Details Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-caption text-ink font-semibold uppercase tracking-wider">
              Key Details
            </h3>

            <div className="space-y-3 text-body-sm">
              <div className="flex items-start gap-3 text-ink-muted">
                <MapPin className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" />
                <span>{opportunity.location || "Not specified"}</span>
              </div>

              {(opportunity.stipend_min || opportunity.stipend_max) && (
                <div className="flex items-start gap-3 text-ink-muted">
                  <IndianRupee className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" />
                  <span>
                    {opportunity.stipend_min && opportunity.stipend_max
                      ? `${formatCurrency(opportunity.stipend_min)} – ${formatCurrency(opportunity.stipend_max)}/mo`
                      : opportunity.stipend_min
                        ? `From ${formatCurrency(opportunity.stipend_min)}/mo`
                        : `Up to ${formatCurrency(opportunity.stipend_max!)}/mo`}
                  </span>
                </div>
              )}

              {opportunity.duration_months && (
                <div className="flex items-start gap-3 text-ink-muted">
                  <Clock className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" />
                  <span>{opportunity.duration_months} months</span>
                </div>
              )}

              <div className="flex items-start gap-3 text-ink-muted">
                <Calendar className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" />
                <span>
                  Deadline: {formatDate(opportunity.deadline)}
                </span>
              </div>

              <div className="flex items-start gap-3 text-ink-muted">
                <Users className="w-4 h-4 mt-0.5 text-ink flex-shrink-0" />
                <span>{opportunity.openings_count} openings</span>
              </div>
            </div>
          </Card>

          {/* Apply Card */}
          <Card className="p-5">
            {existingApp ? (
              <div className="text-center space-y-2">
                <Badge variant="success" className="text-body-sm px-4 py-1.5">
                  Already Applied
                </Badge>
                {existingApp.match_score !== null && (
                  <p className="text-micro text-ink-muted">
                    Match Score:{" "}
                    <strong className="text-ink">
                      {existingApp.match_score}%
                    </strong>
                  </p>
                )}
                <p className="text-micro text-ink-muted capitalize">
                  Status: {existingApp.status?.replace("_", " ")}
                </p>
              </div>
            ) : profile?.role === "student" ||
              profile?.role === "academician" ? (
              <ApplyButton
                opportunityId={id}
                disabled={isDeadlinePassed}
              />
            ) : (
              <p className="text-body-sm text-ink-muted text-center">
                Only students and academicians can apply.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
