"use client";

import React, { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  assignTaskToOpportunity,
  unassignTaskFromOpportunity,
  createAndAssignRoleTaskWithGoogleAI,
  fetchRoleCandidatesWithTaskResultsAction,
} from "@/actions/role-assignments";
import { updateApplicationStatus } from "@/actions/applications";
import type { OpportunityWithTask, RoleCandidateTaskResult } from "@/queries/role-assignments";
import {
  ClipboardCheck,
  Sparkles,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Check,
  Loader2,
  AlertCircle,
  Search,
  ArrowRight,
  ExternalLink,
  Target,
  FileText,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RoleAssignmentManagerProps {
  opportunities: OpportunityWithTask[];
  availableAssessments: any[];
}

export function RoleAssignmentManager({
  opportunities,
  availableAssessments,
}: RoleAssignmentManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [assignModalOpp, setAssignModalOpp] = useState<OpportunityWithTask | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [isMandatory, setIsMandatory] = useState(true);

  // AI Generation Modal
  const [aiModalOpp, setAiModalOpp] = useState<OpportunityWithTask | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiApiKey, setAiApiKey] = useState("");

  // Candidates Result Modal
  const [viewResultsOpp, setViewResultsOpp] = useState<OpportunityWithTask | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [candidatesList, setCandidatesList] = useState<RoleCandidateTaskResult[]>([]);

  // Processing & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Filtered Opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      opp.title.toLowerCase().includes(q) ||
      opp.assignedTask?.assessment_title.toLowerCase().includes(q) ||
      opp.type.toLowerCase().includes(q)
    );
  });

  // Handle Pick Existing Assignment
  const handleAssignExisting = async () => {
    if (!assignModalOpp || !selectedAssessmentId) {
      setErrorMsg("Please select an assessment to assign.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await assignTaskToOpportunity({
        opportunityId: assignModalOpp.id,
        assessmentId: selectedAssessmentId,
        isMandatory,
      });

      if (res.error) throw new Error(res.error);

      setSuccessMsg(`Screening task assigned to "${assignModalOpp.title}"!`);
      setTimeout(() => {
        setAssignModalOpp(null);
        setSelectedAssessmentId("");
        setSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to assign task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Generate with Google AI
  const handleGenerateAI = async () => {
    if (!aiModalOpp) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createAndAssignRoleTaskWithGoogleAI({
        opportunityId: aiModalOpp.id,
        customTopic: aiTopic.trim() || undefined,
        difficulty: aiDifficulty,
        questionCount: aiQuestionCount,
        apiKey: aiApiKey.trim() || undefined,
      });

      if (res.error) throw new Error(res.error);

      setSuccessMsg(
        `Google AI successfully generated and assigned "${res.data?.title}" to this role!`
      );
      setTimeout(() => {
        setAiModalOpp(null);
        setAiTopic("");
        setSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate AI screening task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unassign
  const handleUnassign = async (opportunityId: string) => {
    if (!confirm("Remove this screening task from the role? Applicants will no longer be required to take it.")) {
      return;
    }

    try {
      const res = await unassignTaskFromOpportunity(opportunityId);
      if (res.error) alert(res.error);
      else startTransition(() => router.refresh());
    } catch (_err) {
      alert("Failed to unassign task.");
    }
  };

  // Fetch Candidates with Task Results
  const handleOpenResults = async (opp: OpportunityWithTask) => {
    setViewResultsOpp(opp);
    setIsLoadingResults(true);
    setCandidatesList([]);

    try {
      const res = await fetchRoleCandidatesWithTaskResultsAction(opp.id);
      setCandidatesList(res.candidates);
    } catch (_err) {
      console.error("Failed to load candidates:", _err);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Shortlist Candidate from Modal
  const handleShortlist = async (candidate: RoleCandidateTaskResult) => {
    try {
      const res = await updateApplicationStatus(candidate.applicationId, "shortlisted");
      if (res?.error) {
        alert(res.error);
      } else {
        setCandidatesList((prev) =>
          prev.map((c) =>
            c.applicationId === candidate.applicationId
              ? { ...c, applicationStatus: "shortlisted" }
              : c
          )
        );
        startTransition(() => router.refresh());
      }
    } catch (_err) {
      alert("Failed to shortlist candidate.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-micro font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              Recruiter Talent Screening
            </span>
            <Badge variant="accent" className="text-micro">
              Industry Partner View
            </Badge>
          </div>
          <h1 className="text-display-md text-ink font-medium">
            Role-Based Task &amp; Assignment Manager
          </h1>
          <p className="text-body text-ink-muted mt-1 max-w-2xl">
            Assign prerequisite screening assessments to your job openings or generate custom tasks
            with Google AI based on role requirements. Students will be required to complete the task when applying.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/recruiter/post-opportunity">
            <Button variant="secondary" className="rounded-pill text-body-sm">
              <Plus className="w-4 h-4 mr-1.5" /> Post New Role
            </Button>
          </Link>
          <Link href="/skills/assessments">
            <Button className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm">
              <Sparkles className="w-4 h-4 mr-1.5" /> AI Question Generator
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-1 p-4 rounded-xl border border-hairline">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or assigned tasks..."
            className="pl-9 bg-surface-2 border-hairline text-ink rounded-pill text-body-sm"
          />
        </div>

        <div className="text-body-sm text-ink-muted flex items-center gap-2">
          <span>Total Opportunities:</span>
          <span className="font-bold text-ink font-mono">{opportunities.length}</span>
          <span>•</span>
          <span>Tasks Assigned:</span>
          <span className="font-bold text-semantic-success font-mono">
            {opportunities.filter((o) => o.assignedTask).length}
          </span>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length === 0 ? (
        <Card className="p-12 text-center border-hairline bg-surface-1">
          <Briefcase className="w-12 h-12 text-ink-muted mx-auto mb-4" />
          <h3 className="text-headline text-ink font-medium">No opportunities found</h3>
          <p className="text-body text-ink-muted mt-1 max-w-md mx-auto">
            {searchQuery
              ? "No roles match your search terms."
              : "Post an opportunity first to assign role screening tasks and assessments."}
          </p>
          <Link href="/recruiter/post-opportunity">
            <Button className="mt-4 rounded-pill bg-accent-blue text-ink">
              <Plus className="w-4 h-4 mr-1.5" /> Post Opportunity
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => {
            const task = opp.assignedTask;

            return (
              <Card
                key={opp.id}
                className="bg-surface-1 border-hairline flex flex-col justify-between hover:border-accent-blue/30 transition-all shadow-sm"
              >
                <CardHeader className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="accent" className="text-micro font-medium">
                      {opp.type.replace("_", " ").toUpperCase()}
                    </Badge>
                    {task ? (
                      <Badge variant="success" className="text-micro flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Task Assigned
                      </Badge>
                    ) : (
                      <Badge variant="muted" className="text-micro text-ink-muted">
                        No Task Assigned
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-headline font-semibold text-ink leading-snug">
                    {opp.title}
                  </CardTitle>

                  <div className="text-micro text-ink-muted flex flex-wrap items-center gap-3">
                    <span>{opp.location || "Multiple Locations"}</span>
                    {opp.isRemote && <span>• Remote Eligible</span>}
                    <span>• {opp.applicantCount} Applicant(s)</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {task ? (
                    <div className="p-4 bg-surface-2 rounded-xl border border-hairline space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-micro text-purple-400 font-semibold uppercase tracking-wider block">
                            Assigned Screening Task
                          </span>
                          <h4 className="text-body font-semibold text-ink mt-0.5">
                            {task.assessment_title}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleUnassign(opp.id)}
                          className="text-ink-muted hover:text-semantic-error p-1 transition-colors"
                          title="Unassign Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-micro text-center pt-1 border-t border-hairline">
                        <div className="bg-surface-1 p-1.5 rounded border border-hairline">
                          <div className="text-ink-muted">Duration</div>
                          <div className="font-bold text-ink font-mono">{task.duration_minutes}m</div>
                        </div>
                        <div className="bg-surface-1 p-1.5 rounded border border-hairline">
                          <div className="text-ink-muted">Pass Mark</div>
                          <div className="font-bold text-ink font-mono">{task.passing_score}%</div>
                        </div>
                        <div className="bg-surface-1 p-1.5 rounded border border-hairline">
                          <div className="text-ink-muted">Marks</div>
                          <div className="font-bold text-ink font-mono">{task.total_marks || 25} pts</div>
                        </div>
                      </div>

                      <div className="text-micro text-ink-muted flex items-center justify-between pt-1">
                        <span>Mandatory for application</span>
                        <Badge variant="accent" className="text-micro">{task.sector}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-surface-2/60 rounded-xl border border-dashed border-hairline text-center space-y-2">
                      <Target className="w-8 h-8 text-ink-muted mx-auto" />
                      <p className="text-body-sm text-ink-muted">
                        No screening task assigned to this role yet. Students can apply without taking a test.
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-hairline flex flex-wrap gap-2">
                  {task ? (
                    <>
                      <Button
                        onClick={() => handleOpenResults(opp)}
                        className="flex-1 rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        View Candidates &amp; Scores ({opp.applicantCount})
                      </Button>
                      <Link href={`/opportunities/${opp.id}`} className="flex-shrink-0">
                        <Button variant="secondary" className="rounded-pill text-body-sm">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setAssignModalOpp(opp);
                          setSelectedAssessmentId(availableAssessments[0]?.id || "");
                          setErrorMsg("");
                        }}
                        className="flex-1 rounded-pill text-body-sm"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-accent-blue" />
                        Pick Test
                      </Button>

                      <Button
                        onClick={() => {
                          setAiModalOpp(opp);
                          setAiTopic(`${opp.title} Core Competencies`);
                          setErrorMsg("");
                        }}
                        className="flex-1 rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Google AI Task
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN EXISTING ASSESSMENT                                         */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(assignModalOpp)}
        onClose={() => {
          if (!isSubmitting) setAssignModalOpp(null);
        }}
        title="Assign Screening Task to Role"
        description={`Select an assessment required for candidates applying to ${assignModalOpp?.title}.`}
      >
        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{successMsg}</p>
          </div>
        ) : assignModalOpp ? (
          <div className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                Select from Published Assessments *
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
              >
                {availableAssessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.sector} • {a.duration_minutes}m • Pass: {a.passing_score}%)
                  </option>
                ))}
              </select>
              <p className="text-micro text-ink-muted">
                Choose any assessment curated by industry partners or faculty in the platform.
              </p>
            </div>

            <div className="p-3 bg-surface-2 rounded-xl border border-hairline flex items-center gap-2.5">
              <input
                type="checkbox"
                id="isMandatoryCheck"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="rounded border-hairline"
              />
              <label htmlFor="isMandatoryCheck" className="text-body-sm text-ink cursor-pointer">
                Make this task mandatory to submit an application
              </label>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setAssignModalOpp(null)}
                disabled={isSubmitting}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignExisting}
                disabled={isSubmitting || !selectedAssessmentId}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Assign Task</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: GENERATE ROLE TASK WITH GOOGLE AI                                  */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(aiModalOpp)}
        onClose={() => {
          if (!isSubmitting) setAiModalOpp(null);
        }}
        title="Generate Role Task with Google AI"
        description={`Create questions tailored directly to ${aiModalOpp?.title} and link it to the role.`}
      >
        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{successMsg}</p>
          </div>
        ) : aiModalOpp ? (
          <div className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                Role Subject / Competency Topic *
              </label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Clinical Pharmacokinetics, Next.js Full Stack, Herbal Formulation QA"
                className="bg-surface-2 border-hairline text-ink"
              />
              <p className="text-micro text-ink-muted">
                Google AI will generate balanced multiple-choice questions testing these specific job requirements.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Difficulty Level</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as any)}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="beginner">Beginner / Foundational</option>
                  <option value="intermediate">Intermediate / Applied</option>
                  <option value="advanced">Advanced / Production</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Questions Count</label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink flex justify-between">
                <span>Google Gemini API Key (Optional)</span>
                <span className="text-micro text-ink-muted">Optional Override</span>
              </label>
              <Input
                type="password"
                placeholder="AIzaSy... (Leave blank to use pre-configured system Google AI)"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                className="bg-surface-2 border-hairline text-ink font-mono"
              />
              <p className="text-micro text-ink-muted">
                If left blank, the platform uses its built-in Google AI service and domain knowledge engine.
              </p>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setAiModalOpp(null)}
                disabled={isSubmitting}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateAI}
                disabled={isSubmitting}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating with Google AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate &amp; Assign to Role</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: VIEW CANDIDATES & TASK SCORES FOR ROLE                             */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={Boolean(viewResultsOpp)}
        onClose={() => setViewResultsOpp(null)}
        className="max-w-3xl max-h-[85vh] overflow-y-auto"
        title={`Candidate Task Results: ${viewResultsOpp?.title}`}
        description="Inspect screening assessment scores for applicants of this role."
      >
        <div className="space-y-4 pt-2">
          {viewResultsOpp?.assignedTask && (
            <div className="p-3 bg-surface-2 rounded-xl border border-hairline flex justify-between items-center text-body-sm">
              <div>
                <span className="text-micro text-purple-400 font-semibold uppercase">Assigned Task</span>
                <div className="font-semibold text-ink">{viewResultsOpp.assignedTask.assessment_title}</div>
              </div>
              <div className="text-right">
                <span className="text-micro text-ink-muted">Pass Threshold</span>
                <div className="font-bold text-ink font-mono">{viewResultsOpp.assignedTask.passing_score}%</div>
              </div>
            </div>
          )}

          {isLoadingResults ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue mx-auto" />
              <p className="text-body-sm text-ink-muted">Loading applicant scores...</p>
            </div>
          ) : candidatesList.length === 0 ? (
            <div className="py-8 text-center text-ink-muted">
              No students have applied to this role yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {candidatesList.map((cand) => (
                <div
                  key={cand.applicationId}
                  className="p-3.5 bg-surface-2 rounded-xl border border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{cand.fullName}</span>
                      <Badge variant="accent" className="text-micro">
                        Stage: {cand.applicationStatus}
                      </Badge>
                    </div>
                    <div className="text-micro text-ink-muted font-mono">
                      {cand.email} • Match: {cand.matchScore}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {cand.hasAttemptedTask ? (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-micro text-ink-muted block">Task Score</span>
                          <span className="font-bold text-ink font-mono text-headline">
                            {cand.taskScore}%
                          </span>
                        </div>
                        {cand.taskPassed ? (
                          <Badge variant="success" className="text-micro">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Qualified
                          </Badge>
                        ) : (
                          <Badge variant="error" className="text-micro">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Not Passed
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="muted" className="text-micro text-ink-muted">
                        Pending Attempt
                      </Badge>
                    )}

                    {cand.applicationStatus !== "shortlisted" && cand.applicationStatus !== "hired" && (
                      <Button
                        size="sm"
                        onClick={() => handleShortlist(cand)}
                        className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-micro"
                      >
                        <UserCheck className="w-3 h-3 mr-1" /> Shortlist
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-hairline flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setViewResultsOpp(null)}
              className="rounded-pill"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
