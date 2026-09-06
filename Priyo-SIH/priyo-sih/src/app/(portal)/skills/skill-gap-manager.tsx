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
import { SkillRadarChart } from "@/components/skills/skill-radar-chart";
import {
  addUserSkill,
  updateSkillProficiency,
  removeUserSkill,
  bulkAddUserSkills,
  saveStudentDesiredRole,
} from "@/actions/skills";
import {
  INDUSTRY_ROLE_BENCHMARKS,
  calculateSkillGap,
  type SkillGapEvaluation,
} from "@/lib/role-benchmarks";
import type { ProficiencyLevel } from "@/types";
import {
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Upload,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Loader2,
  Check,
  Briefcase,
  Layers,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SkillGapManagerProps {
  userSkills: any[];
  taxonomy: any[];
  assessmentSubmissions: any[];
  availableAssessments: any[];
  initialDesiredRole: string;
  initialDesiredSector: string;
}

export function SkillGapManager({
  userSkills,
  taxonomy,
  assessmentSubmissions,
  availableAssessments,
  initialDesiredRole,
  initialDesiredSector,
}: SkillGapManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState(initialDesiredRole || "Full Stack Software Developer");
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Skill Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [singleProficiency, setSingleProficiency] = useState<ProficiencyLevel>("intermediate");
  const [bulkText, setBulkText] = useState("");
  const [bulkProficiency, setBulkProficiency] = useState<ProficiencyLevel>("intermediate");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  // Calculate dynamic skill gap based on currently selected role
  const evaluation: SkillGapEvaluation = calculateSkillGap({
    desiredRole: selectedRole,
    userSkills,
    assessmentSubmissions,
    publishedAssessments: availableAssessments,
  });

  // Prepare radar chart data comparing user scores vs benchmark
  const radarChartData = evaluation.masteredSkills
    .concat(
      evaluation.inProgressSkills.map((i) => ({
        name: i.name,
        studentProficiency: i.studentProficiency,
        requiredProficiency: i.requiredProficiency,
        verified: false,
      }))
    )
    .concat(
      evaluation.missingSkills.map((m) => ({
        name: m.name,
        studentProficiency: "none",
        requiredProficiency: m.requiredProficiency,
        verified: false,
      }))
    )
    .slice(0, 6)
    .map((item) => {
      const weights: Record<string, number> = {
        none: 0,
        beginner: 40,
        intermediate: 65,
        advanced: 85,
        expert: 98,
      };
      const userLevel = weights[item.studentProficiency.toLowerCase()] || 30;
      return {
        skill: item.name,
        userScore: item.verified ? userLevel : Math.max(10, userLevel - 15),
        industryBenchmark: 85,
      };
    });

  const displayRadar = radarChartData.length >= 3 ? radarChartData : undefined;

  // Handle saving new desired role
  const handleSaveRole = async (newRole: string) => {
    if (!newRole.trim()) return;
    setIsSavingRole(true);

    try {
      const res = await saveStudentDesiredRole(newRole.trim());
      if (res.data) {
        setSelectedRole(res.data.desiredRole);
        setIsChangingRole(false);
        setCustomRoleInput("");
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error("Failed to save desired role:", err);
    } finally {
      setIsSavingRole(false);
    }
  };

  // Handle Single Skill Upload
  const handleAddSingleSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setIsUploading(true);
    setUploadErrorMsg("");
    setUploadSuccessMsg("");

    try {
      const res = await addUserSkill(selectedSkillId, singleProficiency);
      if (res.error) throw new Error(res.error);

      setUploadSuccessMsg("Skill successfully added to your profile!");
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedSkillId("");
        setUploadSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1000);
    } catch (err: any) {
      setUploadErrorMsg(err.message || "Failed to add skill.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Bulk Skill Upload
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSkills = bulkText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);

    if (parsedSkills.length === 0) {
      setUploadErrorMsg("Please enter at least one valid skill name.");
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg("");
    setUploadSuccessMsg("");

    try {
      const payload = parsedSkills.map((name) => ({
        name,
        proficiency: bulkProficiency,
      }));

      const res = await bulkAddUserSkills(payload);
      if (res.error) throw new Error(res.error);

      setUploadSuccessMsg(`Successfully uploaded and indexed ${res.data?.count || parsedSkills.length} skills!`);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setBulkText("");
        setUploadSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1200);
    } catch (err: any) {
      setUploadErrorMsg(err.message || "Failed to upload skills.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Target Role & Skill Gap Header Card */}
      <Card className="p-6 md:p-8 bg-surface-1 border-hairline overflow-hidden relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-accent-blue" />
                Target Industry Role
              </Badge>
              <Badge variant="muted">{evaluation.sector}</Badge>
            </div>

            {isChangingRole ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <select
                  value={selectedRole}
                  onChange={(e) => handleSaveRole(e.target.value)}
                  className="h-10 px-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  disabled={isSavingRole}
                >
                  {INDUSTRY_ROLE_BENCHMARKS.map((b) => (
                    <option key={b.id} value={b.title}>
                      {b.title} ({b.sector})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Or type custom role..."
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    className="h-10 w-48 bg-surface-2 text-body-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveRole(customRoleInput)}
                    disabled={!customRoleInput.trim() || isSavingRole}
                    className="rounded-pill bg-accent-blue text-white"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsChangingRole(false)}
                    className="rounded-pill text-ink-muted"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <h2 className="text-display-md text-ink font-semibold">{evaluation.desiredRole}</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsChangingRole(true)}
                  className="rounded-pill text-caption h-7 px-2.5"
                >
                  Change Role
                </Button>
              </div>
            )}

            <p className="text-body-sm text-ink-muted leading-relaxed">
              {evaluation.roleDescription}
            </p>
          </div>

          {/* Readiness Score Dial Card */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-surface-2 border border-hairline shadow-xs">
            <div className="text-center">
              <div className="text-display-lg font-extrabold text-accent-blue leading-none">
                {evaluation.overallReadiness}%
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mt-1">
                Role Readiness
              </div>
            </div>

            <div className="h-12 w-px bg-hairline" />

            <div className="space-y-1 text-caption">
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Skill Gap: <strong>{evaluation.gapScore}%</strong></span>
              </div>
              {evaluation.assessmentBoost > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+{evaluation.assessmentBoost}% from Tests</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="rounded-pill bg-ink text-canvas hover:opacity-90 ml-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Upload Skills
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Radar & Gap Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-headline flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-blue" />
                  Competency vs Industry Benchmark
                </CardTitle>
                <CardDescription>
                  Your current demonstrated score compared against the 85% industry standard for {evaluation.desiredRole}
                </CardDescription>
              </div>
              <Badge variant="accent">Dynamic Role Radar</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SkillRadarChart data={displayRadar} />
          </CardContent>
        </Card>

        {/* Immediate Bridge Plan & Recommended Assessments */}
        <div className="space-y-6">
          <Card className="border-accent-blue/30 bg-accent-blue/5">
            <CardHeader>
              <CardTitle className="text-headline flex items-center gap-2 text-ink">
                <Zap className="w-5 h-5 text-accent-blue" />
                Bridge Your Skill Gap
              </CardTitle>
              <CardDescription>
                Attempt these assessments to verify missing competencies and boost your role readiness score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.recommendedAssessments.length > 0 ? (
                evaluation.recommendedAssessments.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-surface-1 rounded-xl border border-hairline flex flex-col justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-micro font-semibold text-accent-blue uppercase tracking-wider">
                          Targets: {rec.targetSkill}
                        </span>
                        <Badge variant="muted" className="text-[10px]">
                          {rec.category}
                        </Badge>
                      </div>
                      <h4 className="text-body-sm font-semibold text-ink mt-1">
                        {rec.title}
                      </h4>
                    </div>

                    <Link
                      href={rec.assessmentId ? `/skills/assessments/${rec.assessmentId}` : "/skills/assessments"}
                    >
                      <Button size="sm" variant="secondary" className="w-full rounded-pill text-caption mt-1">
                        Attempt Assessment <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-ink-muted text-body-sm">
                  Great job! You have acquired all core assessments for this role.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Career Roadmap Steps */}
          <Card className="bg-surface-2 border-hairline">
            <CardHeader className="pb-3">
              <CardTitle className="text-headline flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-ink" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {evaluation.careerRoadmap.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-body-sm text-ink-muted">
                  <span className="w-5 h-5 rounded-full bg-surface-1 border border-hairline flex items-center justify-center text-micro font-bold text-accent-blue flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tri-Column Gap Analysis: Mastered vs In-Progress vs Missing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Mastered Competencies */}
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-headline flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                Mastered Competencies
              </CardTitle>
              <Badge variant="success">{evaluation.masteredCount}</Badge>
            </div>
            <CardDescription className="text-ink-muted">
              Skills you possess that meet or exceed the benchmark
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {evaluation.masteredSkills.length > 0 ? (
              evaluation.masteredSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-1 rounded-xl border border-hairline flex flex-col justify-between shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-body-sm font-semibold text-ink">{s.name}</span>
                    <Badge variant="success" className="text-[10px]">
                      {s.verified ? "Verified" : "Sufficient"}
                    </Badge>
                  </div>
                  <div className="text-micro text-ink-muted mt-1.5">
                    Proficiency: <strong className="text-ink capitalize">{s.studentProficiency}</strong>
                  </div>
                  {s.validatedByAssessment && (
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Validated via Assessment
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-body-sm text-ink-muted py-4 text-center">
                No mastered skills yet for this role. Complete assessments or add skills to start.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 2. In Progress / Needs Upskilling */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-headline flex items-center gap-2 text-amber-400">
                <TrendingUp className="w-5 h-5" />
                Needs Improvement
              </CardTitle>
              <Badge variant="warning">{evaluation.inProgressCount}</Badge>
            </div>
            <CardDescription className="text-ink-muted">
              Skills you listed but require a higher proficiency benchmark
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {evaluation.inProgressSkills.length > 0 ? (
              evaluation.inProgressSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-1 rounded-xl border border-hairline flex flex-col justify-between shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-body-sm font-semibold text-ink">{s.name}</span>
                    <Badge variant="warning" className="text-[10px]">
                      Target: {s.requiredProficiency}
                    </Badge>
                  </div>
                  <p className="text-micro text-ink-muted mt-1">{s.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-ink-muted py-4 text-center">
                No skills flagged as below benchmark level.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3. Missing Critical Skills */}
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-headline flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                Missing Core Skills
              </CardTitle>
              <Badge variant="error">{evaluation.missingCount}</Badge>
            </div>
            <CardDescription className="text-ink-muted">
              Mandatory industry requirements absent from your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {evaluation.missingSkills.length > 0 ? (
              evaluation.missingSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-1 rounded-xl border border-hairline flex justify-between items-center shadow-xs"
                >
                  <div>
                    <span className="text-body-sm font-semibold text-ink">{s.name}</span>
                    <div className="text-micro text-ink-muted">
                      Required: <span className="capitalize">{s.requiredProficiency}</span>
                    </div>
                  </div>
                  <Badge variant="error" className="text-[10px]">
                    {s.importance}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-ink-muted py-4 text-center">
                Excellent! All required core skills are present in your profile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* UPLOAD / ADD SKILLS MODAL */}
      <Dialog
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadSuccessMsg("");
          setUploadErrorMsg("");
        }}
        title={
          <span className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent-blue" />
            Upload & Add Skills to Profile
          </span>
        }
        description="Expand your registered competencies or batch import technical skills."
      >
        <div className="space-y-4">

          {uploadSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {uploadSuccessMsg}
            </div>
          )}

          {uploadErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-body-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {uploadErrorMsg}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-surface-2 p-1 border border-hairline">
            <button
              type="button"
              onClick={() => setUploadMode("single")}
              className={`flex-1 py-1.5 text-body-sm rounded-md font-medium transition-all cursor-pointer ${
                uploadMode === "single"
                  ? "bg-surface-1 text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Pick from Taxonomy
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("bulk")}
              className={`flex-1 py-1.5 text-body-sm rounded-md font-medium transition-all cursor-pointer ${
                uploadMode === "bulk"
                  ? "bg-surface-1 text-ink shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Bulk Upload / Paste
            </button>
          </div>

          {/* Single Mode Form */}
          {uploadMode === "single" ? (
            <form onSubmit={handleAddSingleSkill} className="space-y-4">
              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Select Skill from Standard Taxonomy
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  required
                >
                  <option value="">-- Select a Skill ({taxonomy.length} available) --</option>
                  {taxonomy.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category} &bull; {t.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Your Current Proficiency Level
                </label>
                <select
                  value={singleProficiency}
                  onChange={(e) => setSingleProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full h-10 px-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Working Knowledge)</option>
                  <option value="advanced">Advanced (Production Experience)</option>
                  <option value="expert">Expert (Mastery / Architecture)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-pill"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !selectedSkillId}
                  className="rounded-pill bg-accent-blue text-white"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Add Skill
                </Button>
              </div>
            </form>
          ) : (
            /* Bulk Mode Form */
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Paste Multiple Skills (Comma or Newline separated)
                </label>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, SQL, Next.js, Docker, Clinical Research, Pharmacognosy"
                  className="w-full p-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  required
                />
                <span className="text-[11px] text-ink-muted">
                  Skills matching our taxonomy will be indexed automatically; new skills will be registered under your profile.
                </span>
              </div>

              <div>
                <label className="text-caption font-medium text-ink block mb-1.5">
                  Default Proficiency Level for Uploaded Skills
                </label>
                <select
                  value={bulkProficiency}
                  onChange={(e) => setBulkProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full h-10 px-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-pill"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !bulkText.trim()}
                  className="rounded-pill bg-accent-blue text-white"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Upload All Skills
                </Button>
              </div>
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
}
