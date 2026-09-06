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
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import {
  generateAssignmentQuestionsWithAI,
  type GeneratedQuestion,
} from "@/actions/ai-assessment";
import {
  publishAssignment,
  reviewSubmission,
  getSubmissionDetails,
} from "@/actions/assessments";
import {
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  Users,
  FileText,
  AlertCircle,
  Eye,
  Check,
  UserCheck,
  UserX,
  Award,
  BookOpen,
  ArrowLeft,
  Loader2,
  Trash2,
  HelpCircle,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AssessmentManagerProps {
  userRole?: string;
  userId?: string;
  availableAssessments: any[];
  pastResults: any[];
  myCreatedAssessments?: any[];
  submissionsForMyAssessments?: any[];
}

export function AssessmentManager({
  userRole = "student",
  userId: _userId,
  availableAssessments = [],
  pastResults = [],
  myCreatedAssessments = [],
  submissionsForMyAssessments = [],
}: AssessmentManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const isCreator =
    userRole === "academician" ||
    userRole === "recruiter" ||
    userRole === "industry_partner" ||
    userRole === "institution_admin" ||
    userRole === "admin" ||
    userRole === "super_admin";

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "available" | "my-created" | "submissions" | "history"
  >("available");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("All");

  // Create Assignment Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [aiStep, setAiStep] = useState<"configure" | "preview">("configure");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentTopic, setAssignmentTopic] = useState("");
  const [assignmentSector, setAssignmentSector] = useState("Ayush");
  const [assignmentCategory, setAssignmentCategory] = useState("Technical");
  const [assignmentDifficulty, setAssignmentDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passingScore, setPassingScore] = useState(60);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState("");

  // Inspect Submission Modal State
  const [inspectSubmissionId, setInspectSubmissionId] = useState<string | null>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState(false);
  const [inspectData, setInspectData] = useState<any | null>(null);
  const [inspectError, setInspectError] = useState("");

  // Candidate Selection / Review Modal State
  const [reviewSubmissionTarget, setReviewSubmissionTarget] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<
    "shortlisted" | "selected" | "rejected" | "reviewed"
  >("shortlisted");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Filter available assessments
  const sectors = [
    "All",
    ...Array.from(
      new Set(
        availableAssessments
          .map((a) => a.sector)
          .filter(Boolean)
      )
    ),
  ];

  const filteredAssessments = availableAssessments.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector =
      selectedSector === "All" || a.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Handle AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!assignmentTopic.trim()) {
      setGenerationError("Please enter a subject or topic for the assignment.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      const res = await generateAssignmentQuestionsWithAI({
        topic: assignmentTopic,
        sector: assignmentSector,
        difficulty: assignmentDifficulty,
        count: questionCount,
        apiKey: geminiApiKey.trim() || undefined,
      });

      if (res.error || !res.data) {
        setGenerationError(res.error || "Failed to generate questions.");
        setIsGenerating(false);
        return;
      }

      setGeneratedQuestions(res.data.questions);
      if (!assignmentTitle.trim()) {
        setAssignmentTitle(
          `${assignmentTopic} Assessment - ${
            assignmentDifficulty.charAt(0).toUpperCase() +
            assignmentDifficulty.slice(1)
          } Level`
        );
      }
      if (!assignmentDescription.trim()) {
        setAssignmentDescription(
          `Standardized evaluation on ${assignmentTopic} (${assignmentSector}). Complete within ${durationMinutes} minutes.`
        );
      }
      setAiStep("preview");
    } catch (_err) {
      setGenerationError("An unexpected error occurred while generating questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Publish Assignment
  const handlePublishAssignment = async () => {
    if (!assignmentTitle.trim()) {
      setGenerationError("Please provide an assignment title.");
      return;
    }
    if (generatedQuestions.length === 0) {
      setGenerationError("Please generate or include at least one question.");
      return;
    }

    setIsPublishing(true);
    setGenerationError("");

    try {
      const res = await publishAssignment({
        title: assignmentTitle,
        description: assignmentDescription,
        category: assignmentCategory,
        sector: assignmentSector,
        durationMinutes,
        passingScore,
        questions: generatedQuestions,
      });

      if (res.error) {
        setGenerationError(res.error);
        setIsPublishing(false);
        return;
      }

      setPublishSuccessMsg(
        `Assignment "${assignmentTitle}" published successfully! Students and faculty can now attempt it.`
      );
      setIsPublishing(false);

      setTimeout(() => {
        setIsCreateOpen(false);
        setPublishSuccessMsg("");
        setAiStep("configure");
        setGeneratedQuestions([]);
        setAssignmentTitle("");
        setAssignmentTopic("");
        startTransition(() => {
          router.refresh();
          setActiveTab("my-created");
        });
      }, 1500);
    } catch (_err) {
      setGenerationError("Failed to publish assignment. Please try again.");
      setIsPublishing(false);
    }
  };

  // Handle Open Inspect Modal
  const handleOpenInspect = async (subId: string) => {
    setInspectSubmissionId(subId);
    setIsLoadingInspect(true);
    setInspectError("");
    setInspectData(null);

    try {
      const res = await getSubmissionDetails(subId);
      if (res.error || !res.data) {
        setInspectError(res.error || "Failed to load submission details.");
      } else {
        setInspectData(res.data);
      }
    } catch (_err) {
      setInspectError("Failed to load submission details.");
    } finally {
      setIsLoadingInspect(false);
    }
  };

  // Handle Review & Selection Save
  const handleSaveReview = async () => {
    if (!reviewSubmissionTarget) return;

    setIsSubmittingReview(true);
    setReviewSuccessMsg("");

    try {
      const res = await reviewSubmission(
        reviewSubmissionTarget.id,
        reviewStatus,
        reviewFeedback
      );

      if (res.error) {
        alert(res.error);
        setIsSubmittingReview(false);
        return;
      }

      setReviewSuccessMsg("Candidate review and selection status updated!");
      setTimeout(() => {
        setReviewSubmissionTarget(null);
        setReviewSuccessMsg("");
        setIsSubmittingReview(false);
        startTransition(() => {
          router.refresh();
        });
      }, 1000);
    } catch (_err) {
      alert("Failed to update candidate review status.");
      setIsSubmittingReview(false);
    }
  };

  // Update a question in generated list
  const handleUpdateQuestionText = (index: number, text: string) => {
    setGeneratedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], question_text: text };
      return updated;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-micro font-semibold uppercase tracking-wider text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full">
              Assessment &amp; Coursework Engine
            </span>
            {isCreator && (
              <Badge variant="accent" className="text-micro">
                {userRole === "academician"
                  ? "Academic Faculty View"
                  : userRole === "industry_partner" || userRole === "recruiter"
                  ? "Industry Partner View"
                  : "Institution Admin View"}
              </Badge>
            )}
          </div>
          <h1 className="text-display-md text-ink font-medium">
            Assignments &amp; Skill Assessments
          </h1>
          <p className="text-body text-ink-muted mt-1 max-w-2xl">
            Complete standardized tests created with Google AI, verify competencies,
            and review candidate coursework submissions for shortlisting and selection.
          </p>
        </div>

        {/* Creator AI Action Button */}
        {isCreator && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setAiStep("configure");
                setGenerationError("");
                setIsCreateOpen(true);
              }}
              className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-ink" />
              <span>Create Assignment with Google AI</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "available"
              ? "bg-surface-2 text-ink border border-hairline shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-1"
          }`}
        >
          <BookOpen className="w-4 h-4 text-accent-blue" />
          <span>Available Assessments</span>
          <span className="text-micro bg-surface-3 px-2 py-0.5 rounded-full text-ink font-mono">
            {availableAssessments.length}
          </span>
        </button>

        {isCreator && (
          <>
            <button
              onClick={() => setActiveTab("my-created")}
              className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "my-created"
                  ? "bg-surface-2 text-ink border border-hairline shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-surface-1"
              }`}
            >
              <FileText className="w-4 h-4 text-semantic-success" />
              <span>My Published Assignments</span>
              <span className="text-micro bg-surface-3 px-2 py-0.5 rounded-full text-ink font-mono">
                {myCreatedAssessments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "submissions"
                  ? "bg-surface-2 text-ink border border-hairline shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-surface-1"
              }`}
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Candidate Submissions &amp; Selection</span>
              <span className="text-micro bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                {submissionsForMyAssessments.length}
              </span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-surface-2 text-ink border border-hairline shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-1"
          }`}
        >
          <Award className="w-4 h-4 text-yellow-400" />
          <span>My Results &amp; Verified Badges</span>
          <span className="text-micro bg-surface-3 px-2 py-0.5 rounded-full text-ink font-mono">
            {pastResults.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AVAILABLE ASSESSMENTS                                  */}
      {/* ============================================================== */}
      {activeTab === "available" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments by title or topic..."
                className="pl-9 bg-surface-1 border-hairline text-ink rounded-pill"
              />
            </div>

            {/* Sector Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {sectors.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSector(s)}
                  className={`px-3 py-1 rounded-full text-micro font-medium transition-colors ${
                    selectedSector === s
                      ? "bg-accent-blue text-ink"
                      : "bg-surface-2 text-ink-muted hover:text-ink border border-hairline"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center border-hairline bg-surface-1">
              <BookOpen className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <h3 className="text-headline text-ink font-medium">
                No matching assessments found
              </h3>
              <p className="text-body text-ink-muted mt-1 max-w-md mx-auto">
                {searchQuery || selectedSector !== "All"
                  ? "Try adjusting your search terms or sector filter."
                  : "No published assessments are available yet. Create one with Google AI above to get started."}
              </p>
              {isCreator && (
                <Button
                  onClick={() => {
                    setAiStep("configure");
                    setIsCreateOpen(true);
                  }}
                  className="mt-4 rounded-pill bg-accent-blue text-ink"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create First Assignment
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment: any) => (
                <Card
                  key={assessment.id}
                  className="flex flex-col justify-between hover:border-accent-blue/40 transition-all bg-surface-1 border-hairline shadow-sm group"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="accent" className="text-micro font-medium">
                        {assessment.sector || "General"}
                      </Badge>
                      <span className="text-micro text-ink-muted flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-accent-blue" />
                        {assessment.duration_minutes} mins
                      </span>
                    </div>
                    <CardTitle className="text-headline font-semibold text-ink leading-snug group-hover:text-accent-blue transition-colors">
                      {assessment.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-body-sm text-ink-muted">
                      {assessment.description ||
                        "Standardized assessment covering core domains and applied skills."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-surface-2 rounded-xl border border-hairline text-center text-micro">
                      <div>
                        <div className="text-ink-muted">Pass Mark</div>
                        <div className="font-semibold text-ink mt-0.5">
                          {assessment.passing_score}%
                        </div>
                      </div>
                      <div>
                        <div className="text-ink-muted">Marks</div>
                        <div className="font-semibold text-ink mt-0.5">
                          {assessment.total_marks || 100}
                        </div>
                      </div>
                      <div>
                        <div className="text-ink-muted">Category</div>
                        <div className="font-semibold text-ink mt-0.5 truncate px-1">
                          {assessment.category || "Technical"}
                        </div>
                      </div>
                    </div>

                    {assessment.creator?.full_name && (
                      <div className="text-micro text-ink-muted flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-accent-blue" />
                        <span>
                          By {assessment.creator.full_name} (
                          {assessment.creator.role || "Instructor"})
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Link
                      href={`/skills/assessments/${assessment.id}`}
                      className="w-full"
                    >
                      <Button className="w-full rounded-pill bg-surface-2 text-ink hover:bg-accent-blue hover:text-ink border border-hairline transition-all flex items-center justify-center gap-1.5 group-hover:border-accent-blue">
                        <span>Attempt Assessment</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY PUBLISHED ASSIGNMENTS (FOR CREATORS)                 */}
      {/* ============================================================== */}
      {isCreator && activeTab === "my-created" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-headline text-ink font-medium">
                Assignments You Published
              </h2>
              <p className="text-body-sm text-ink-muted mt-0.5">
                Manage your assessments, track candidate attempts, and review results.
              </p>
            </div>
            <Button
              onClick={() => {
                setAiStep("configure");
                setIsCreateOpen(true);
              }}
              className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Publish New
            </Button>
          </div>

          {myCreatedAssessments.length === 0 ? (
            <Card className="p-12 text-center border-hairline bg-surface-1">
              <FileText className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <h3 className="text-headline text-ink font-medium">
                No assignments published yet
              </h3>
              <p className="text-body text-ink-muted mt-1 max-w-md mx-auto">
                Generate questions with Google AI and publish assignments for learners
                to attempt. Submissions will appear in your review queue.
              </p>
              <Button
                onClick={() => {
                  setAiStep("configure");
                  setIsCreateOpen(true);
                }}
                className="mt-4 rounded-pill bg-accent-blue text-ink"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create with Google AI
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCreatedAssessments.map((item: any) => {
                const questionCount =
                  item.assessment_questions?.[0]?.count ??
                  (Array.isArray(item.assessment_questions)
                    ? item.assessment_questions.length
                    : 0);
                const submissionCount =
                  item.assessment_submissions?.[0]?.count ??
                  (Array.isArray(item.assessment_submissions)
                    ? item.assessment_submissions.length
                    : 0);

                return (
                  <Card
                    key={item.id}
                    className="bg-surface-1 border-hairline flex flex-col justify-between"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="accent">{item.sector || "General"}</Badge>
                        <Badge variant="success" className="text-micro font-mono">
                          Active &amp; Published
                        </Badge>
                      </div>
                      <CardTitle className="text-headline font-semibold text-ink mt-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-body-sm text-ink-muted">
                        {item.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 p-3 bg-surface-2 rounded-xl border border-hairline text-center text-micro">
                        <div>
                          <div className="text-ink-muted">Questions</div>
                          <div className="font-semibold text-ink mt-0.5 text-body-sm font-mono">
                            {questionCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted">Submissions</div>
                          <div className="font-semibold text-accent-blue mt-0.5 text-body-sm font-mono">
                            {submissionCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted">Passing</div>
                          <div className="font-semibold text-ink mt-0.5 text-body-sm font-mono">
                            {item.passing_score}%
                          </div>
                        </div>
                        <div>
                          <div className="text-ink-muted">Duration</div>
                          <div className="font-semibold text-ink mt-0.5 text-body-sm font-mono">
                            {item.duration_minutes}m
                          </div>
                        </div>
                      </div>
                      <div className="text-micro text-ink-muted">
                        Published on {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-2 border-t border-hairline">
                      <Link
                        href={`/skills/assessments/${item.id}`}
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          className="w-full rounded-pill text-body-sm"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview Test
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setActiveTab("submissions")}
                        className="flex-1 rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        View Candidates ({submissionCount})
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CANDIDATE SUBMISSIONS & SELECTION (FOR CREATORS)        */}
      {/* ============================================================== */}
      {isCreator && activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-headline text-ink font-medium">
                Candidate Coursework Submissions
              </h2>
              <p className="text-body-sm text-ink-muted">
                Review question-by-question responses, inspect answers, and select or
                shortlist qualified students and faculty.
              </p>
            </div>
            <span className="text-micro text-ink-muted bg-surface-2 px-3 py-1.5 rounded-pill border border-hairline font-mono">
              Total Submissions: {submissionsForMyAssessments.length}
            </span>
          </div>

          {submissionsForMyAssessments.length === 0 ? (
            <Card className="p-12 text-center border-hairline bg-surface-1">
              <Users className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <h3 className="text-headline text-ink font-medium">
                No submissions received yet
              </h3>
              <p className="text-body text-ink-muted mt-1 max-w-md mx-auto">
                When students or faculty take your published assignments, their
                scores and answer sheets will arrive here for your evaluation.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissionsForMyAssessments.map((sub: any) => {
                const evalStatus = sub.evaluation?.selection_status;
                const applicantName =
                  sub.applicant?.full_name || sub.applicant?.email || "Candidate";
                const assessmentTitle =
                  sub.assessment?.title || "Skill Assessment";

                return (
                  <Card
                    key={sub.id}
                    className="p-5 bg-surface-1 border-hairline hover:border-hairline-soft transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Applicant & Assessment Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-headline font-medium text-ink">
                            {applicantName}
                          </h4>
                          <Badge variant="accent" className="text-micro">
                            {sub.applicant?.role || "student"}
                          </Badge>
                          {evalStatus === "selected" && (
                            <Badge
                              variant="success"
                              className="text-micro flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            >
                              <UserCheck className="w-3 h-3" /> Selected
                            </Badge>
                          )}
                          {evalStatus === "shortlisted" && (
                            <Badge
                              variant="accent"
                              className="text-micro flex items-center gap-1 bg-purple-500/20 text-purple-300 border-purple-500/30"
                            >
                              <Sparkles className="w-3 h-3" /> Shortlisted
                            </Badge>
                          )}
                          {evalStatus === "rejected" && (
                            <Badge
                              variant="error"
                              className="text-micro flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" /> Not Selected
                            </Badge>
                          )}
                          {!evalStatus && (
                            <Badge
                              variant="muted"
                              className="text-micro text-ink-muted"
                            >
                              Pending Review
                            </Badge>
                          )}
                        </div>

                        <div className="text-body-sm text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>
                            Assignment:{" "}
                            <strong className="text-ink font-medium">
                              {assessmentTitle}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Completed:{" "}
                            {new Date(sub.completed_at).toLocaleString()}
                          </span>
                          {sub.time_taken_secs && (
                            <>
                              <span>•</span>
                              <span>
                                Time: {Math.round(sub.time_taken_secs / 60)} mins
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Score Metrics */}
                      <div className="flex items-center gap-4 bg-surface-2 px-4 py-2.5 rounded-xl border border-hairline">
                        <div className="text-right">
                          <div className="text-micro text-ink-muted">Score</div>
                          <div className="text-headline font-bold text-ink">
                            {Math.round(sub.score)}%
                          </div>
                        </div>
                        <div className="h-8 w-px bg-hairline" />
                        <div>
                          {sub.passed ? (
                            <Badge
                              variant="success"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                            </Badge>
                          ) : (
                            <Badge variant="error">Did Not Pass</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review Feedback Preview if present */}
                    {sub.evaluation?.feedback && (
                      <div className="p-3 bg-surface-2 rounded-lg border border-hairline text-body-sm text-ink-muted">
                        <span className="font-semibold text-ink">
                          Reviewer Feedback:
                        </span>{" "}
                        &quot;{sub.evaluation.feedback}&quot;
                        <span className="text-micro text-ink-muted ml-2 font-mono">
                          — {sub.evaluation.reviewer_name || "Reviewer"} on{" "}
                          {new Date(sub.evaluation.reviewed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-hairline justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => handleOpenInspect(sub.id)}
                        className="rounded-pill text-body-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect Answers
                      </Button>

                      <Button
                        onClick={() => {
                          setReviewSubmissionTarget(sub);
                          setReviewStatus(
                            sub.evaluation?.selection_status || "shortlisted"
                          );
                          setReviewFeedback(sub.evaluation?.feedback || "");
                        }}
                        className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        {evalStatus ? "Update Selection" : "Review & Select"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MY ASSESSMENT HISTORY & VERIFIED CREDENTIALS            */}
      {/* ============================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-headline text-ink font-medium">
              Your Completed Assessments
            </h2>
            <p className="text-body-sm text-ink-muted">
              Credentials and verified competency badges earned across taken tests.
            </p>
          </div>

          {pastResults.length === 0 ? (
            <Card className="p-12 text-center border-hairline bg-surface-1">
              <Award className="w-12 h-12 text-ink-muted mx-auto mb-4" />
              <h3 className="text-headline text-ink font-medium">
                No assessments completed yet
              </h3>
              <p className="text-body text-ink-muted mt-1 max-w-md mx-auto">
                Explore available assessments and complete a test to verify your skills
                and receive automated portfolio badges.
              </p>
              <Button
                onClick={() => setActiveTab("available")}
                className="mt-4 rounded-pill bg-accent-blue text-ink"
              >
                Browse Assessments
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastResults.map((res: any) => {
                const assessmentTitle = Array.isArray(res.assessment)
                  ? res.assessment[0]?.title
                  : res.assessment?.title;
                const category = Array.isArray(res.assessment)
                  ? res.assessment[0]?.category
                  : res.assessment?.category;

                return (
                  <div
                    key={res.id}
                    className="p-4 bg-surface-1 rounded-xl border border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-hairline-soft transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-body font-semibold text-ink">
                          {assessmentTitle || "Assessment"}
                        </h4>
                        {category && (
                          <Badge variant="accent" className="text-micro">
                            {category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-micro text-ink-muted">
                        Completed on{" "}
                        {new Date(res.completed_at).toLocaleDateString()} at{" "}
                        {new Date(res.completed_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-display-sm font-bold text-ink font-mono">
                          {Math.round(res.score)}%
                        </span>
                      </div>
                      {res.passed ? (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1.5 py-1 px-3"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Passed &amp; Verified</span>
                        </Badge>
                      ) : (
                        <Badge variant="error" className="py-1 px-3">
                          Did Not Pass
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE ASSIGNMENT WITH GOOGLE AI                        */}
      {/* ============================================================== */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          if (!isPublishing && !isGenerating) setIsCreateOpen(false);
        }}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        title={
          <div className="flex items-center gap-2 text-headline font-semibold text-ink">
            <Sparkles className="w-5 h-5 text-accent-blue" />
            <span>Create Assignment with Google AI</span>
          </div>
        }
        description="Generate curriculum-aligned questions automatically using Google Gemini AI or the intelligent domain knowledge engine."
      >
        {publishSuccessMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-headline text-ink font-medium">Published!</h3>
            <p className="text-body text-ink-muted">{publishSuccessMsg}</p>
          </div>
        ) : aiStep === "configure" ? (
          <div className="space-y-4 pt-2">
            {generationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                Subject / Topic to Assess *
              </label>
              <Input
                placeholder="e.g. Good Clinical Practice (GCP) in Ayush, Next.js App Router, Ayurvedic Kalpana"
                value={assignmentTopic}
                onChange={(e) => setAssignmentTopic(e.target.value)}
                className="bg-surface-2 border-hairline text-ink"
              />
              <p className="text-micro text-ink-muted">
                Google AI will generate balanced multiple-choice questions tailored to this topic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Sector / Domain</label>
                <select
                  value={assignmentSector}
                  onChange={(e) => setAssignmentSector(e.target.value)}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="Ayush">Ayush &amp; Traditional Medicine</option>
                  <option value="Healthcare & Pharma">Healthcare &amp; Pharma</option>
                  <option value="Information Technology">Information Technology &amp; CS</option>
                  <option value="Biotechnology">Biotechnology &amp; Life Sciences</option>
                  <option value="General Aptitude">General Aptitude &amp; Reasoning</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Difficulty Level</label>
                <select
                  value={assignmentDifficulty}
                  onChange={(e) =>
                    setAssignmentDifficulty(
                      e.target.value as "beginner" | "intermediate" | "advanced"
                    )
                  }
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="beginner">Beginner / Fundamentals</option>
                  <option value="intermediate">Intermediate / Applied</option>
                  <option value="advanced">Advanced / Clinical Mastery</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Questions</label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Duration (mins)</label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Pass Score (%)</label>
                <Input
                  type="number"
                  min={30}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink flex items-center justify-between">
                <span>Google Gemini API Key (Optional)</span>
                <span className="text-micro text-ink-muted">Optional Override</span>
              </label>
              <Input
                type="password"
                placeholder="AIzaSy... (Leave blank to use pre-configured system Google AI)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="bg-surface-2 border-hairline text-ink font-mono"
              />
              <p className="text-micro text-ink-muted">
                If omitted, the platform uses its built-in Google AI service and domain knowledge engine.
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-hairline">
              <Button
                variant="secondary"
                onClick={() => setIsCreateOpen(false)}
                disabled={isGenerating}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !assignmentTopic.trim()}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating with Google AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-ink" />
                    <span>Generate Questions</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* PREVIEW & EDIT QUESTIONS */
          <div className="space-y-4 pt-2">
            {generationError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-body-sm font-medium text-ink">
                  Assignment Title
                </label>
                <Input
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="bg-surface-2 border-hairline text-ink font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-body-sm font-medium text-ink">
                  Assignment Description
                </label>
                <Textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="bg-surface-2 border-hairline text-ink text-body-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <h4 className="text-body-sm font-semibold text-ink">
                Generated Questions ({generatedQuestions.length})
              </h4>
              <span className="text-micro text-ink-muted">
                Edit text inline or delete questions if needed
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {generatedQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 bg-surface-2 rounded-xl border border-hairline space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-micro font-mono bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded">
                      Q{qIdx + 1} • {q.marks || 1} pt(s) • {q.difficulty || "medium"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-ink-muted hover:text-semantic-error p-1 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Input
                    value={q.question_text}
                    onChange={(e) =>
                      handleUpdateQuestionText(qIdx, e.target.value)
                    }
                    className="bg-surface-1 border-hairline text-ink font-medium text-body-sm"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={opt.id || optIdx}
                        className={`p-2.5 rounded-lg border text-micro flex items-start gap-2 ${
                          opt.is_correct
                            ? "border-semantic-success bg-semantic-success/10 text-ink"
                            : "border-hairline bg-surface-1 text-ink-muted"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-micro flex-shrink-0 mt-0.5 ${
                            opt.is_correct
                              ? "bg-semantic-success text-white font-bold"
                              : "border border-hairline text-ink-muted"
                          }`}
                        >
                          {opt.is_correct ? "✓" : String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="text-micro text-ink-muted italic bg-surface-1 p-2 rounded border border-hairline">
                      💡 Reason: {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-hairline">
              <Button
                variant="secondary"
                onClick={() => setAiStep("configure")}
                disabled={isPublishing}
                className="rounded-pill"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Parameters
              </Button>

              <Button
                onClick={handlePublishAssignment}
                disabled={isPublishing || generatedQuestions.length === 0}
                className="rounded-pill bg-semantic-success text-white hover:bg-semantic-success/90 flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Assignment...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publish Assignment for All Learners</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: INSPECT CANDIDATE ANSWERS                               */}
      {/* ============================================================== */}
      <Dialog
        isOpen={Boolean(inspectSubmissionId)}
        onClose={() => setInspectSubmissionId(null)}
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        title="Candidate Submission Details"
        description="Detailed question-by-question breakdown of candidate responses."
      >
        {isLoadingInspect ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent-blue mx-auto" />
            <p className="text-body-sm text-ink-muted">Loading submission answer sheet...</p>
          </div>
        ) : inspectError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm">
            {inspectError}
          </div>
        ) : inspectData ? (
          <div className="space-y-4 pt-2">
            {/* Header summary */}
            <div className="p-4 bg-surface-2 rounded-xl border border-hairline flex justify-between items-center">
              <div>
                <h4 className="text-headline font-semibold text-ink">
                  {inspectData.applicant?.full_name || "Candidate"}
                </h4>
                <p className="text-micro text-ink-muted">
                  {inspectData.applicant?.email} • {inspectData.assessment?.title}
                </p>
              </div>
              <div className="text-right">
                <div className="text-headline font-bold text-ink font-mono">
                  {Math.round(inspectData.score)}%
                </div>
                <div>
                  {inspectData.passed ? (
                    <Badge variant="success" className="text-micro">
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="error" className="text-micro">
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {(inspectData.detailedQuestions || []).map(
                (dq: any, idx: number) => (
                  <div
                    key={dq.id || idx}
                    className={`p-3.5 rounded-xl border space-y-2 ${
                      dq.is_correct
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-micro font-mono text-ink-muted">
                        Question {idx + 1} ({dq.marks} pt)
                      </span>
                      {dq.is_correct ? (
                        <span className="text-micro font-medium text-semantic-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-micro font-medium text-semantic-error flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-body-sm font-medium text-ink">
                      {dq.question_text}
                    </div>

                    {/* Options list */}
                    <div className="space-y-1.5 pt-1">
                      {dq.options.map((opt: any) => {
                        const isSelected = dq.selected_option_ids.includes(opt.id);
                        const isCorrectOpt = opt.is_correct;

                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded text-micro flex items-center gap-2 ${
                              isSelected && isCorrectOpt
                                ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                                : isSelected && !isCorrectOpt
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : isCorrectOpt
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-surface-1 text-ink-muted border border-hairline"
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-micro">
                              {isSelected ? (
                                isCorrectOpt ? "✓" : "✗"
                              ) : isCorrectOpt ? (
                                "✓"
                              ) : (
                                "•"
                              )}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {isSelected && (
                              <span className="text-micro font-mono uppercase bg-surface-3 px-1.5 py-0.5 rounded text-ink">
                                Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setInspectSubmissionId(null)}
                className="rounded-pill"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const targetSub = inspectData;
                  setInspectSubmissionId(null);
                  setReviewSubmissionTarget(targetSub);
                  setReviewStatus(
                    targetSub.evaluation?.selection_status || "shortlisted"
                  );
                  setReviewFeedback(targetSub.evaluation?.feedback || "");
                }}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90"
              >
                <UserCheck className="w-4 h-4 mr-1.5" /> Proceed to Select / Shortlist
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL: SELECT / SHORTLIST CANDIDATE                           */}
      {/* ============================================================== */}
      <Dialog
        isOpen={Boolean(reviewSubmissionTarget)}
        onClose={() => {
          if (!isSubmittingReview) setReviewSubmissionTarget(null);
        }}
        title="Candidate Selection & Evaluation"
        description="Select the candidate's stage and provide constructive feedback."
      >
        {reviewSuccessMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{reviewSuccessMsg}</p>
          </div>
        ) : reviewSubmissionTarget ? (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-surface-2 rounded-xl border border-hairline text-body-sm">
              <div className="font-semibold text-ink">
                {reviewSubmissionTarget.applicant?.full_name || "Candidate"}
              </div>
              <div className="text-micro text-ink-muted">
                {reviewSubmissionTarget.assessment?.title} • Score:{" "}
                {Math.round(reviewSubmissionTarget.score)}%
              </div>
            </div>

            {/* Selection Stage */}
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                Selection Decision *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewStatus("shortlisted")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewStatus === "shortlisted"
                      ? "border-purple-500 bg-purple-500/20 text-ink"
                      : "border-hairline bg-surface-2 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                    <Sparkles className="w-4 h-4" /> Shortlist
                  </div>
                  <div className="text-micro text-ink-muted mt-0.5">
                    Advance to interview or next round
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus("selected")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewStatus === "selected"
                      ? "border-emerald-500 bg-emerald-500/20 text-ink"
                      : "border-hairline bg-surface-2 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                    <UserCheck className="w-4 h-4" /> Select Student
                  </div>
                  <div className="text-micro text-ink-muted mt-0.5">
                    Accept into program or position
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus("reviewed")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewStatus === "reviewed"
                      ? "border-accent-blue bg-accent-blue/20 text-ink"
                      : "border-hairline bg-surface-2 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-accent-blue">
                    <CheckCircle2 className="w-4 h-4" /> Under Review
                  </div>
                  <div className="text-micro text-ink-muted mt-0.5">
                    Marks coursework as evaluated
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus("rejected")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewStatus === "rejected"
                      ? "border-red-500 bg-red-500/20 text-ink"
                      : "border-hairline bg-surface-2 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-red-400">
                    <UserX className="w-4 h-4" /> Reject
                  </div>
                  <div className="text-micro text-ink-muted mt-0.5">
                    Does not meet current threshold
                  </div>
                </button>
              </div>
            </div>

            {/* Reviewer Feedback / Notes */}
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                Reviewer Feedback / Comments
              </label>
              <Textarea
                placeholder="Share feedback on technical clarity, strength in specific clinical areas, or next steps..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="bg-surface-2 border-hairline text-ink"
                rows={3}
              />
              <p className="text-micro text-ink-muted">
                Feedback will be recorded on the candidate&apos;s submission record.
              </p>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setReviewSubmissionTarget(null)}
                disabled={isSubmittingReview}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReview}
                disabled={isSubmittingReview}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Decision...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Decision</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
