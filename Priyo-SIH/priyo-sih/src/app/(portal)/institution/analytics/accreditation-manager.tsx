"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import {
  Download,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit2,
  Building2,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  addNaacPlacementRecord,
  updateNaacPlacementRecord,
  deleteNaacPlacementRecord,
  bulkImportNaacRecords,
  syncPlatformPlacementsToNaac,
  saveNirfCohortMetric,
  type NaacPlacementInput,
  type NirfCohortInput,
} from "@/actions/accreditation";
import type {
  NaacPlacementRecord,
  NirfCohortMetric,
  AccreditationSummary,
} from "@/queries/accreditation";
import { useRouter } from "next/navigation";

interface AccreditationManagerProps {
  initialRecords: NaacPlacementRecord[];
  initialNirfCohorts: NirfCohortMetric[];
  initialSummary: AccreditationSummary;
  institutionAnalytics: any;
}

export function AccreditationManager({
  initialRecords,
  initialNirfCohorts,
  initialSummary,
  institutionAnalytics,
}: AccreditationManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "naac-records" | "nirf-trends">("overview");

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddNaacOpen, setIsAddNaacOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NaacPlacementRecord | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isNirfModalOpen, setIsNirfModalOpen] = useState(false);
  const [editingNirf, setEditingNirf] = useState<NirfCohortMetric | null>(null);
  const [isPrintDossierOpen, setIsPrintDossierOpen] = useState(false);

  // Form States - NAAC Record
  const [formData, setFormData] = useState<NaacPlacementInput>({
    academic_year: "2024-25",
    student_name: "",
    roll_number: "",
    department: "Ayurveda & Traditional Medicine",
    degree: "BAMS",
    progression_type: "campus_placement",
    employer_or_institution: "",
    designation_or_program: "",
    package_inr: 700000,
    offer_reference_no: "",
    contact_email: "",
    contact_phone: "",
  });

  // Form States - NIRF Cohort
  const [nirfFormData, setNirfFormData] = useState<NirfCohortInput>({
    academic_year: "2024-25",
    program_level: "UG",
    sanctioned_intake: 720,
    total_admitted: 710,
    graduated_stipulated_time: 690,
    students_placed: 585,
    median_salary_inr: 750000,
    higher_studies_count: 75,
  });

  // Bulk CSV Text
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkParsedCount, setBulkParsedCount] = useState(0);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  // Unique departments for filter
  const departments = [
    "All",
    ...Array.from(new Set(initialRecords.map((r) => r.department).filter(Boolean))),
  ];

  // Unique academic years
  const academicYears = [
    "All",
    ...Array.from(new Set(initialRecords.map((r) => r.academic_year).filter(Boolean))).sort().reverse(),
  ];

  // Filtered NAAC records
  const filteredRecords = initialRecords.filter((r) => {
    const matchesYear = selectedYear === "All" || r.academic_year === selectedYear;
    const matchesDept = selectedDept === "All" || r.department === selectedDept;
    const matchesType = selectedType === "All" || r.progression_type === selectedType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.student_name.toLowerCase().includes(q) ||
      r.employer_or_institution.toLowerCase().includes(q) ||
      (r.roll_number && r.roll_number.toLowerCase().includes(q)) ||
      r.designation_or_program.toLowerCase().includes(q);
    return matchesYear && matchesDept && matchesType && matchesSearch;
  });

  // =========================================================================
  // CSV EXPORT ROUTINES
  // =========================================================================
  const exportNaacCsv = () => {
    const rows = [
      [
        "S.No",
        "Academic Year",
        "Name of Student Placed / Progressing",
        "Roll / Registration No.",
        "Program Graduated From",
        "Degree",
        "Progression Category",
        "Name of Employer / Admitting Institution",
        "Pay Package (INR) / Program Admitted",
        "Appointment Order / Reference No.",
        "Contact Details",
      ],
      ...filteredRecords.map((r, idx) => [
        idx + 1,
        `"${r.academic_year}"`,
        `"${r.student_name}"`,
        `"${r.roll_number || "N/A"}"`,
        `"${r.department}"`,
        `"${r.degree}"`,
        `"${r.progression_type === "campus_placement" ? "Campus Placement" : r.progression_type === "off_campus_placement" ? "Off-Campus Placement" : "Higher Education"}"`,
        `"${r.employer_or_institution}"`,
        `"${r.progression_type === "higher_studies" ? r.designation_or_program : `INR ${r.package_inr?.toLocaleString("en-IN") || 0} (${r.package_lpa} LPA)`}"`,
        `"${r.offer_reference_no || "N/A"}"`,
        `"${r.contact_email || r.contact_phone || "N/A"}"`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NAAC_Metric_5.2.1_Student_Progression_${selectedYear === "All" ? "Consolidated" : selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportNirfCsv = () => {
    const rows = [
      [
        "S.No",
        "Academic Year",
        "Program Level",
        "Sanctioned Intake",
        "Total Students Admitted",
        "Graduated in Minimum Stipulated Time",
        "Students Placed Through Campus",
        "Median Salary of Placed Graduates (INR)",
        "Students Selected for Higher Studies",
        "GPH Score (%)",
      ],
      ...initialNirfCohorts.map((n, idx) => [
        idx + 1,
        `"${n.academic_year}"`,
        `"${n.program_level}"`,
        n.sanctioned_intake,
        n.total_admitted,
        n.graduated_stipulated_time,
        n.students_placed,
        `"${n.median_salary_inr?.toLocaleString("en-IN")}"`,
        n.higher_studies_count,
        `"${n.gph_percentage}%"`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NIRF_Graduation_Outcomes_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleSaveNaacRecord = async () => {
    if (!formData.student_name.trim() || !formData.employer_or_institution.trim()) {
      setFormError("Student Name and Employer/Institution are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingRecord) {
        const res = await updateNaacPlacementRecord(editingRecord.id, formData);
        if (res.error) throw new Error(res.error);
        setActionSuccessMsg("NAAC placement record updated successfully.");
      } else {
        const res = await addNaacPlacementRecord(formData);
        if (res.error) throw new Error(res.error);
        setActionSuccessMsg("New NAAC 5.2.1 placement record added successfully.");
      }

      setTimeout(() => {
        setIsAddNaacOpen(false);
        setEditingRecord(null);
        setActionSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to remove this NAAC 5.2.1 record?")) return;
    try {
      const res = await deleteNaacPlacementRecord(recordId);
      if (res.error) alert(res.error);
      else startTransition(() => router.refresh());
    } catch (_err) {
      alert("Failed to delete record.");
    }
  };

  const handleSaveNirfCohort = async () => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await saveNirfCohortMetric(nirfFormData);
      if (res.error) throw new Error(res.error);

      setActionSuccessMsg("NIRF cohort statistics updated successfully.");
      setTimeout(() => {
        setIsNirfModalOpen(false);
        setEditingNirf(null);
        setActionSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || "Failed to save NIRF metrics.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncPlatformPlacements = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPlatformPlacementsToNaac();
      if (res.error) {
        alert(res.error);
      } else {
        alert(`Platform sync complete! Added ${res.data?.syncedCount || 0} student placement records.`);
        startTransition(() => router.refresh());
      }
    } catch (_err) {
      alert("Failed to sync platform placements.");
    } finally {
      setIsSyncing(false);
    }
  };

  const parseBulkCsv = (text: string) => {
    setBulkCsvText(text);
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    setBulkParsedCount(Math.max(0, lines.length - 1));
  };

  const handleExecuteBulkImport = async () => {
    const lines = bulkCsvText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setFormError("Please provide CSV headers and at least one student row.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Expect CSV: student_name, roll_number, department, degree, progression_type, employer_or_institution, designation_or_program, package_inr, academic_year
      const recordsToImport: NaacPlacementInput[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 4) {
          recordsToImport.push({
            student_name: parts[0] || "Student",
            roll_number: parts[1] || "",
            department: parts[2] || "Ayurveda & Traditional Medicine",
            degree: parts[3] || "BAMS",
            progression_type: (parts[4] as any) || "campus_placement",
            employer_or_institution: parts[5] || "Industry Partner",
            designation_or_program: parts[6] || "Clinical Specialist",
            package_inr: parts[7] ? Number(parts[7]) : 650000,
            academic_year: parts[8] || "2024-25",
          });
        }
      }

      const res = await bulkImportNaacRecords(recordsToImport);
      if (res.error) throw new Error(res.error);

      setActionSuccessMsg(`Successfully imported ${res.data?.count} NAAC records.`);
      setTimeout(() => {
        setIsBulkImportOpen(false);
        setBulkCsvText("");
        setActionSuccessMsg("");
        startTransition(() => router.refresh());
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || "Failed to process bulk import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-micro font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
              IQAC Accreditation &amp; Statutory Ranking Desk
            </span>
            <Badge variant="accent" className="text-micro">
              AISHE: U-01234 • NAAC Grade A++ Ready
            </Badge>
          </div>
          <h1 className="text-display-md text-ink font-medium">
            Institutional Analytics &amp; NAAC / NIRF Reports
          </h1>
          <p className="text-body text-ink-muted mt-1 max-w-2xl">
            Audit-ready data pipeline capturing student placement orders, higher education progression,
            and 5-year NIRF Graduation Outcomes (GO) matrices.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={exportNaacCsv}
            className="rounded-pill border border-hairline text-ink hover:bg-surface-2 flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export NAAC Metric 5.2</span>
          </Button>

          <Button
            onClick={exportNirfCsv}
            className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-ink" />
            <span>Download NIRF Placement Report</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsPrintDossierOpen(true)}
            className="rounded-pill border border-hairline text-ink hover:bg-surface-2 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-semantic-success" />
            <span>Print IQAC Dossier</span>
          </Button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
        <Card className="p-5 bg-surface-1 border-hairline">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            Total Placed Students
          </span>
          <div className="text-display-md text-ink font-bold mt-1 font-mono">
            {initialSummary.totalPlaced}
          </div>
          <span className="text-micro text-semantic-success mt-1 inline-block">
            {initialSummary.campusPlacedCount} Campus • {initialSummary.offCampusPlacedCount} Off-Campus
          </span>
        </Card>

        <Card className="p-5 bg-surface-1 border-hairline">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            Higher Studies Progression
          </span>
          <div className="text-display-md text-ink font-bold mt-1 font-mono">
            {initialSummary.totalHigherStudies}
          </div>
          <span className="text-micro text-purple-400 mt-1 inline-block">
            AIIMS, IITs, NIPER &amp; Central Univs
          </span>
        </Card>

        <Card className="p-5 bg-surface-1 border-hairline">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            NAAC 5.2.1 Compliance Rate
          </span>
          <div className="text-display-md text-semantic-success font-bold mt-1 font-mono">
            {initialSummary.naacComplianceRate}%
          </div>
          <span className="text-micro text-ink-muted mt-1 inline-block">
            Benchmark: &gt;80% for A++
          </span>
        </Card>

        <Card className="p-5 bg-surface-1 border-hairline">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            NIRF Median Package
          </span>
          <div className="text-display-md text-ink font-bold mt-1 font-mono">
            ₹{initialSummary.medianPackageLpa} LPA
          </div>
          <span className="text-micro text-accent-blue mt-1 inline-block">
            Highest: ₹{initialSummary.highestPackageLpa} LPA
          </span>
        </Card>

        <Card className="p-5 bg-surface-1 border-hairline">
          <span className="text-micro text-ink-muted uppercase tracking-wider">
            Audit-Ready Records
          </span>
          <div className="text-display-md text-ink font-bold mt-1 font-mono">
            {initialSummary.totalRecords}
          </div>
          <span className="text-micro text-ink-muted mt-1 inline-block">
            Digital Orders Documented
          </span>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-surface-2 text-ink border border-hairline shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-1"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-accent-blue" />
          <span>Accreditation Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("naac-records")}
          className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "naac-records"
              ? "bg-surface-2 text-ink border border-hairline shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-1"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          <span>NAAC Metric 5.2.1 Register</span>
          <span className="text-micro bg-surface-3 px-2 py-0.5 rounded-full text-ink font-mono">
            {initialRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("nirf-trends")}
          className={`px-4 py-2 rounded-pill text-body-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "nirf-trends"
              ? "bg-surface-2 text-ink border border-hairline shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-1"
          }`}
        >
          <Award className="w-4 h-4 text-semantic-success" />
          <span>NIRF 5-Year Cohorts</span>
          <span className="text-micro bg-surface-3 px-2 py-0.5 rounded-full text-ink font-mono">
            {initialNirfCohorts.length} Yrs
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACCREDITATION OVERVIEW                                             */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAAC Card */}
            <Card className="p-6 border-hairline bg-surface-1 flex flex-col justify-between">
              <CardHeader className="px-0 pt-0 space-y-1">
                <div className="flex justify-between items-start">
                  <Badge variant="accent" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Criterion 5 • Student Support &amp; Progression
                  </Badge>
                  <span className="text-micro text-semantic-success font-mono font-bold">
                    95.7% Verified
                  </span>
                </div>
                <CardTitle className="text-headline text-ink flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-5 h-5 text-semantic-success" /> NAAC Metric 5.2.1 Compliance
                </CardTitle>
                <CardDescription className="text-body-sm text-ink-muted">
                  Percentage of placement of outgoing students and progression to higher education during the last 5 years.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4 pt-2">
                <div className="p-3 bg-surface-2 rounded-xl border border-hairline space-y-1 text-micro text-ink-muted">
                  <div className="flex justify-between text-ink font-semibold">
                    <span>Statutory Formula:</span>
                    <span>[(P + H) / Total Outgoing] × 100</span>
                  </div>
                  <p>
                    Captures student appointment orders, offer letters, CTC packages, and university admission verification.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={exportNaacCsv}
                    variant="secondary"
                    className="flex-1 rounded-pill text-body-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export Data Sheet
                  </Button>
                  <Button
                    onClick={() => setActiveTab("naac-records")}
                    className="flex-1 rounded-pill bg-purple-600 text-white hover:bg-purple-700 text-body-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" /> View Register ({initialRecords.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* NIRF Card */}
            <Card className="p-6 border-hairline bg-surface-1 flex flex-col justify-between">
              <CardHeader className="px-0 pt-0 space-y-1">
                <div className="flex justify-between items-start">
                  <Badge variant="accent" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    NIRF Parameter • Graduation Outcomes (GO)
                  </Badge>
                  <span className="text-micro text-accent-blue font-mono font-bold">
                    Median: ₹7.5 LPA
                  </span>
                </div>
                <CardTitle className="text-headline text-ink flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-blue" /> NIRF Metric (GPH &amp; Median Salary)
                </CardTitle>
                <CardDescription className="text-body-sm text-ink-muted">
                  Metric for combined percentage of placement and higher studies across graduating cohorts.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4 pt-2">
                <div className="p-3 bg-surface-2 rounded-xl border border-hairline space-y-1 text-micro text-ink-muted">
                  <div className="flex justify-between text-ink font-semibold">
                    <span>DCS Ranking Parameter:</span>
                    <span>GPH = 40 × (Np/100) + 60 × (Nh/100)</span>
                  </div>
                  <p>
                    Tracks annual sanctioned intake, enrolled students, actual graduates, placed numbers, and median compensation.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={exportNirfCsv}
                    variant="secondary"
                    className="flex-1 rounded-pill text-body-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export DCS Table
                  </Button>
                  <Button
                    onClick={() => setActiveTab("nirf-trends")}
                    className="flex-1 rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> 5-Year Trend ({initialNirfCohorts.length} Yrs)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown & Top Recruiters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Placement Readiness */}
            <Card className="lg:col-span-2 p-6 border-hairline bg-surface-1">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-headline text-ink">Department Placement &amp; Progression Breakdown</CardTitle>
                <CardDescription>Comparative cohort distribution across major academic disciplines</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-5 pt-2">
                {initialSummary.departmentStats.map((dept) => {
                  const total = dept.placed + dept.higherStudies;
                  const pct = Math.min(100, Math.round((total / (initialSummary.totalRecords || 1)) * 100));
                  return (
                    <div key={dept.department} className="space-y-1.5">
                      <div className="flex justify-between items-center text-body-sm">
                        <div className="font-semibold text-ink">{dept.department}</div>
                        <div className="text-micro text-ink-muted font-mono">
                          <span className="text-semantic-success font-semibold">{dept.placed} Placed</span> •{" "}
                          <span className="text-purple-400 font-semibold">{dept.higherStudies} Higher Studies</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-surface-2 rounded-pill overflow-hidden border border-hairline">
                        <div
                          className="h-full bg-accent-blue rounded-pill transition-all duration-500"
                          style={{ width: `${Math.max(15, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Recruiters */}
            <Card className="p-6 border-hairline bg-surface-1">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-headline text-ink">Top Corporate Recruiters</CardTitle>
                <CardDescription>Industry partners with highest recruitment volume</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-3 pt-2">
                {initialSummary.topRecruiters.map((rec, idx) => (
                  <div
                    key={rec.name}
                    className="p-3 bg-surface-2 rounded-xl border border-hairline flex justify-between items-center text-body-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-accent-blue/10 text-accent-blue font-bold text-micro flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-ink font-medium">{rec.name}</span>
                    </div>
                    <Badge variant="accent" className="text-micro font-mono">
                      {rec.count} Hires
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NAAC METRIC 5.2.1 REGISTER                                         */}
      {/* ========================================================================= */}
      {activeTab === "naac-records" && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-surface-1 p-4 rounded-xl border border-hairline">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, employer, roll no..."
                  className="pl-9 bg-surface-2 border-hairline text-ink rounded-pill text-body-sm"
                />
              </div>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-surface-2 border border-hairline text-ink rounded-pill px-3 py-1.5 text-body-sm"
              >
                {academicYears.map((y) => (
                  <option key={y} value={y}>
                    {y === "All" ? "All Academic Years" : `Year: ${y}`}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-surface-2 border border-hairline text-ink rounded-pill px-3 py-1.5 text-body-sm max-w-[200px] truncate"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Departments" : d}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-surface-2 border border-hairline text-ink rounded-pill px-3 py-1.5 text-body-sm"
              >
                <option value="All">All Progression Types</option>
                <option value="campus_placement">Campus Placement</option>
                <option value="off_campus_placement">Off-Campus Placement</option>
                <option value="higher_studies">Higher Studies</option>
              </select>
            </div>

            {/* Management Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleSyncPlatformPlacements}
                disabled={isSyncing}
                className="rounded-pill text-body-sm"
                title="Automatically import all students who got hired through SkillBridge job postings"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-accent-blue" />
                )}
                Auto-Sync Hires
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setBulkCsvText("");
                  setFormError("");
                  setIsBulkImportOpen(true);
                }}
                className="rounded-pill text-body-sm"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Bulk CSV Import
              </Button>

              <Button
                onClick={() => {
                  setEditingRecord(null);
                  setFormData({
                    academic_year: selectedYear !== "All" ? selectedYear : "2024-25",
                    student_name: "",
                    roll_number: "",
                    department: "Ayurveda & Traditional Medicine",
                    degree: "BAMS",
                    progression_type: "campus_placement",
                    employer_or_institution: "",
                    designation_or_program: "",
                    package_inr: 700000,
                    offer_reference_no: "",
                    contact_email: "",
                    contact_phone: "",
                  });
                  setFormError("");
                  setIsAddNaacOpen(true);
                }}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Student Record
              </Button>
            </div>
          </div>

          {/* Records Table */}
          <Card className="bg-surface-1 border-hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-2 border-b border-hairline text-micro uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="p-3.5 font-semibold">Student Name &amp; Roll</th>
                    <th className="p-3.5 font-semibold">Year &amp; Degree</th>
                    <th className="p-3.5 font-semibold">Progression Category</th>
                    <th className="p-3.5 font-semibold">Employer / University</th>
                    <th className="p-3.5 font-semibold">Package / Program</th>
                    <th className="p-3.5 font-semibold">Offer / Ref No.</th>
                    <th className="p-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-ink-muted">
                        No placement or progression records matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-semibold text-ink">{rec.student_name}</div>
                          <div className="text-micro text-ink-muted font-mono">{rec.roll_number || "N/A"}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-ink">{rec.degree}</div>
                          <div className="text-micro text-ink-muted">{rec.department} • {rec.academic_year}</div>
                        </td>
                        <td className="p-3.5">
                          {rec.progression_type === "campus_placement" ? (
                            <Badge variant="success" className="text-micro">Campus Placement</Badge>
                          ) : rec.progression_type === "off_campus_placement" ? (
                            <Badge variant="accent" className="text-micro bg-purple-500/20 text-purple-300">Off-Campus</Badge>
                          ) : (
                            <Badge variant="accent" className="text-micro bg-blue-500/20 text-blue-300">Higher Studies</Badge>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-ink">{rec.employer_or_institution}</div>
                          <div className="text-micro text-ink-muted">{rec.designation_or_program}</div>
                        </td>
                        <td className="p-3.5">
                          {rec.progression_type === "higher_studies" ? (
                            <span className="text-micro text-purple-300 font-mono">Admission Verified</span>
                          ) : (
                            <div>
                              <span className="font-bold text-ink font-mono">₹{rec.package_lpa} LPA</span>
                              <span className="text-micro text-ink-muted block font-mono">
                                ₹{rec.package_inr?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="text-micro font-mono bg-surface-2 px-2 py-0.5 rounded border border-hairline text-ink-muted">
                            {rec.offer_reference_no || "VERIFIED"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingRecord(rec);
                              setFormData({
                                academic_year: rec.academic_year,
                                student_name: rec.student_name,
                                roll_number: rec.roll_number || "",
                                department: rec.department,
                                degree: rec.degree,
                                progression_type: rec.progression_type,
                                employer_or_institution: rec.employer_or_institution,
                                designation_or_program: rec.designation_or_program,
                                package_inr: rec.package_inr || 0,
                                offer_reference_no: rec.offer_reference_no || "",
                                contact_email: rec.contact_email || "",
                                contact_phone: rec.contact_phone || "",
                              });
                              setFormError("");
                              setIsAddNaacOpen(true);
                            }}
                            className="p-1 text-ink-muted hover:text-ink transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1 text-ink-muted hover:text-semantic-error transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NIRF 5-YEAR COHORT TRENDS                                         */}
      {/* ========================================================================= */}
      {activeTab === "nirf-trends" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-headline text-ink font-medium">NIRF Graduation Outcomes (GO) Trend Data</h2>
              <p className="text-body-sm text-ink-muted">
                Standard DCS Table for Combined Metric for Placement &amp; Higher Studies (GPH)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={exportNirfCsv}
                className="rounded-pill text-body-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export NIRF DCS Table
              </Button>
              <Button
                onClick={() => {
                  setEditingNirf(null);
                  setNirfFormData({
                    academic_year: "2025-26",
                    program_level: "UG",
                    sanctioned_intake: 780,
                    total_admitted: 770,
                    graduated_stipulated_time: 750,
                    students_placed: 650,
                    median_salary_inr: 800000,
                    higher_studies_count: 80,
                  });
                  setFormError("");
                  setIsNirfModalOpen(true);
                }}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 text-body-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Cohort Year
              </Button>
            </div>
          </div>

          <Card className="bg-surface-1 border-hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-2 border-b border-hairline text-micro uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="p-3.5 font-semibold">Academic Year</th>
                    <th className="p-3.5 font-semibold">Level</th>
                    <th className="p-3.5 font-semibold">Sanctioned Intake</th>
                    <th className="p-3.5 font-semibold">Admitted</th>
                    <th className="p-3.5 font-semibold">Graduated in Time</th>
                    <th className="p-3.5 font-semibold">Placed</th>
                    <th className="p-3.5 font-semibold">Median Salary</th>
                    <th className="p-3.5 font-semibold">Higher Studies</th>
                    <th className="p-3.5 font-semibold">GPH Score</th>
                    <th className="p-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono text-body-sm">
                  {initialNirfCohorts.map((cohort) => (
                    <tr key={cohort.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3.5 font-sans font-semibold text-ink">{cohort.academic_year}</td>
                      <td className="p-3.5">
                        <Badge variant="accent" className="text-micro font-sans">{cohort.program_level}</Badge>
                      </td>
                      <td className="p-3.5 text-ink">{cohort.sanctioned_intake}</td>
                      <td className="p-3.5 text-ink">{cohort.total_admitted}</td>
                      <td className="p-3.5 text-ink">{cohort.graduated_stipulated_time}</td>
                      <td className="p-3.5 font-bold text-semantic-success">{cohort.students_placed}</td>
                      <td className="p-3.5 font-bold text-ink">
                        ₹{(cohort.median_salary_inr / 100000).toFixed(2)} LPA
                      </td>
                      <td className="p-3.5 text-purple-400 font-bold">{cohort.higher_studies_count}</td>
                      <td className="p-3.5">
                        <Badge variant="success" className="text-micro font-mono">
                          {cohort.gph_percentage}%
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={() => {
                            setEditingNirf(cohort);
                            setNirfFormData({
                              academic_year: cohort.academic_year,
                              program_level: cohort.program_level,
                              sanctioned_intake: cohort.sanctioned_intake,
                              total_admitted: cohort.total_admitted,
                              graduated_stipulated_time: cohort.graduated_stipulated_time,
                              students_placed: cohort.students_placed,
                              median_salary_inr: cohort.median_salary_inr,
                              higher_studies_count: cohort.higher_studies_count,
                            });
                            setFormError("");
                            setIsNirfModalOpen(true);
                          }}
                          className="text-accent-blue hover:underline text-micro"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NAAC STUDENT RECORD                                      */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddNaacOpen}
        onClose={() => {
          if (!isSubmitting) setIsAddNaacOpen(false);
        }}
        title={editingRecord ? "Edit NAAC 5.2.1 Record" : "Add Student Placement / Progression Record"}
        description="Records will be integrated into the NAAC Criterion 5.2 data template and export sheets."
      >
        {actionSuccessMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{actionSuccessMsg}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Academic Year *</label>
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="2025-26">2025-26 (Ongoing)</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                  <option value="2021-22">2021-22</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Progression Category *</label>
                <select
                  value={formData.progression_type}
                  onChange={(e) => setFormData({ ...formData, progression_type: e.target.value as any })}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="campus_placement">Campus Placement</option>
                  <option value="off_campus_placement">Off-Campus Placement</option>
                  <option value="higher_studies">Higher Studies Progression</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Student Full Name *</label>
                <Input
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="bg-surface-2 border-hairline text-ink"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Roll / Registration No.</label>
                <Input
                  value={formData.roll_number || ""}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  placeholder="e.g. AYU/2021/042"
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="Ayurveda & Traditional Medicine">Ayurveda &amp; Traditional Medicine</option>
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Biotechnology & Life Sciences">Biotechnology &amp; Life Sciences</option>
                  <option value="Pharmacognosy & Herbal Formulations">Pharmacognosy &amp; Herbal Formulations</option>
                  <option value="Clinical Research & Public Health">Clinical Research &amp; Public Health</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Graduating Degree *</label>
                <Input
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. BAMS, B.Tech, B.Pharm, MD"
                  className="bg-surface-2 border-hairline text-ink"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink">
                {formData.progression_type === "higher_studies"
                  ? "Admitting University / Institution *"
                  : "Employer / Company Name *"}
              </label>
              <Input
                value={formData.employer_or_institution}
                onChange={(e) => setFormData({ ...formData, employer_or_institution: e.target.value })}
                placeholder={
                  formData.progression_type === "higher_studies"
                    ? "e.g. All India Institute of Ayurveda, IIT Bombay"
                    : "e.g. Himalaya Wellness, TCS, Biocon, Dabur"
                }
                className="bg-surface-2 border-hairline text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">
                  {formData.progression_type === "higher_studies"
                    ? "Program Enrolled"
                    : "Job Designation / Role"}
                </label>
                <Input
                  value={formData.designation_or_program}
                  onChange={(e) => setFormData({ ...formData, designation_or_program: e.target.value })}
                  placeholder={
                    formData.progression_type === "higher_studies"
                      ? "e.g. MD (Kayachikitsa), M.Tech"
                      : "e.g. Clinical Research Associate"
                  }
                  className="bg-surface-2 border-hairline text-ink"
                />
              </div>

              {formData.progression_type !== "higher_studies" && (
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink flex justify-between">
                    <span>Annual CTC Package (INR)</span>
                    {formData.package_inr ? (
                      <span className="text-accent-blue font-mono">
                        {(formData.package_inr / 100000).toFixed(2)} LPA
                      </span>
                    ) : null}
                  </label>
                  <Input
                    type="number"
                    step={25000}
                    value={formData.package_inr || 0}
                    onChange={(e) => setFormData({ ...formData, package_inr: Number(e.target.value) })}
                    placeholder="e.g. 750000"
                    className="bg-surface-2 border-hairline text-ink font-mono"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Offer / Admission Reference ID</label>
                <Input
                  value={formData.offer_reference_no || ""}
                  onChange={(e) => setFormData({ ...formData, offer_reference_no: e.target.value })}
                  placeholder="e.g. HIM-CR-2025-089"
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">HR / Contact Email</label>
                <Input
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="hr@employer.com"
                  className="bg-surface-2 border-hairline text-ink"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsAddNaacOpen(false)}
                disabled={isSubmitting}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNaacRecord}
                disabled={isSubmitting}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save NAAC Record</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: BULK CSV IMPORT                                                    */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isBulkImportOpen}
        onClose={() => {
          if (!isSubmitting) setIsBulkImportOpen(false);
        }}
        title="Bulk Import NAAC Metric 5.2.1 Records"
        description="Paste comma-separated data to batch import dozens or hundreds of student placement records."
      >
        {actionSuccessMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{actionSuccessMsg}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-micro text-ink-muted">
              <span>Expected Columns:</span>
              <button
                type="button"
                onClick={() =>
                  parseBulkCsv(
                    "student_name,roll_number,department,degree,progression_type,employer_or_institution,designation_or_program,package_inr,academic_year\n" +
                      "Kavita Sen,AYU/2021/088,Ayurveda & Traditional Medicine,BAMS,campus_placement,Dabur India,Clinical Associate,680000,2024-25\n" +
                      "Manish Roy,CS/2021/045,Computer Science & Engineering,B.Tech,campus_placement,Wipro Technologies,Project Engineer,720000,2024-25\n" +
                      "Ankita Paul,BT/2021/014,Biotechnology & Life Sciences,B.Tech,higher_studies,AIIMS New Delhi,MD Clinical Research,0,2024-25"
                  )
                }
                className="text-accent-blue underline hover:opacity-80"
              >
                Insert Sample Template
              </button>
            </div>

            <Textarea
              rows={8}
              value={bulkCsvText}
              onChange={(e) => parseBulkCsv(e.target.value)}
              placeholder="student_name,roll_number,department,degree,progression_type,employer_or_institution,designation_or_program,package_inr,academic_year"
              className="font-mono text-micro bg-surface-2 border-hairline text-ink"
            />

            {bulkParsedCount > 0 && (
              <div className="text-micro text-semantic-success flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{bulkParsedCount} record(s) detected and ready for audit ingest.</span>
              </div>
            )}

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsBulkImportOpen(false)}
                disabled={isSubmitting}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteBulkImport}
                disabled={isSubmitting || bulkParsedCount === 0}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Execute Import ({bulkParsedCount})</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NIRF COHORT YEAR                                        */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isNirfModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsNirfModalOpen(false);
        }}
        title={editingNirf ? `Edit NIRF Cohort (${editingNirf.academic_year})` : "Add Annual NIRF Cohort"}
        description="Update annual intake, graduating students, campus placements, and median salary for NIRF DCS parameters."
      >
        {actionSuccessMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-body font-medium text-ink">{actionSuccessMsg}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Academic Year *</label>
                <Input
                  value={nirfFormData.academic_year}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, academic_year: e.target.value })}
                  placeholder="e.g. 2024-25"
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Program Level</label>
                <select
                  value={nirfFormData.program_level || "UG"}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, program_level: e.target.value as any })}
                  className="w-full bg-surface-2 border border-hairline text-ink rounded-lg p-2.5 text-body-sm"
                >
                  <option value="UG">Undergraduate (UG 4-Year / 5-Year)</option>
                  <option value="PG">Postgraduate (PG 2-Year / 3-Year)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Sanctioned Intake</label>
                <Input
                  type="number"
                  value={nirfFormData.sanctioned_intake}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, sanctioned_intake: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Total Admitted</label>
                <Input
                  type="number"
                  value={nirfFormData.total_admitted}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, total_admitted: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Graduated in Time</label>
                <Input
                  type="number"
                  value={nirfFormData.graduated_stipulated_time}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, graduated_stipulated_time: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Students Placed</label>
                <Input
                  type="number"
                  value={nirfFormData.students_placed}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, students_placed: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Higher Studies</label>
                <Input
                  type="number"
                  value={nirfFormData.higher_studies_count}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, higher_studies_count: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-ink">Median Salary (INR)</label>
                <Input
                  type="number"
                  step={25000}
                  value={nirfFormData.median_salary_inr}
                  onChange={(e) => setNirfFormData({ ...nirfFormData, median_salary_inr: Number(e.target.value) })}
                  className="bg-surface-2 border-hairline text-ink font-mono"
                />
              </div>
            </div>

            {/* Live GPH Preview */}
            <div className="p-3 bg-surface-2 rounded-xl border border-hairline flex justify-between items-center text-body-sm">
              <span className="text-ink-muted">Calculated GPH Score:</span>
              <span className="font-bold text-semantic-success font-mono text-headline">
                {nirfFormData.graduated_stipulated_time > 0
                  ? (
                      ((nirfFormData.students_placed + nirfFormData.higher_studies_count) /
                        nirfFormData.graduated_stipulated_time) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsNirfModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNirfCohort}
                disabled={isSubmitting}
                className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save NIRF Metrics</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: PRINT / VIEW OFFICIAL IQAC AUDIT DOSSIER                            */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isPrintDossierOpen}
        onClose={() => setIsPrintDossierOpen(false)}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        title="Official IQAC Statutory Accreditation Dossier"
        description="Comprehensive compliance certificate ready for NAAC Peer Team Review and NIRF DCS Verification."
      >
        <div className="space-y-6 pt-4 text-ink">
          {/* Official Letterhead Header */}
          <div className="text-center border-b-2 border-hairline pb-5 space-y-1">
            <h2 className="text-display-sm font-serif font-bold uppercase tracking-wider text-ink">
              National Institute of Ayurveda &amp; Technology
            </h2>
            <p className="text-micro text-ink-muted">
              Ministry of Ayush / AICTE Approved • AISHE Code: U-01234 • NAAC Accredited &apos;A++&apos; Grade
            </p>
            <div className="text-body-sm font-semibold text-accent-blue pt-1">
              INTERNAL QUALITY ASSURANCE CELL (IQAC) STATUTORY AUDIT COMPLIANCE
            </div>
            <div className="text-micro text-ink-muted font-mono">
              Report Generated on: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </div>
          </div>

          {/* Key Audit Summary Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-surface-2 rounded-lg border border-hairline">
              <div className="text-micro text-ink-muted">NAAC Metric 5.2.1 Compliance</div>
              <div className="text-headline font-bold text-semantic-success mt-1 font-mono">
                {initialSummary.naacComplianceRate}%
              </div>
            </div>
            <div className="p-3 bg-surface-2 rounded-lg border border-hairline">
              <div className="text-micro text-ink-muted">NIRF 5-Year Median Salary</div>
              <div className="text-headline font-bold text-ink mt-1 font-mono">
                ₹{initialSummary.medianPackageLpa} LPA
              </div>
            </div>
            <div className="p-3 bg-surface-2 rounded-lg border border-hairline">
              <div className="text-micro text-ink-muted">Audited Student Progression</div>
              <div className="text-headline font-bold text-purple-400 mt-1 font-mono">
                {initialSummary.totalRecords} Records
              </div>
            </div>
          </div>

          {/* 5-Year Table */}
          <div className="space-y-2">
            <h3 className="text-body font-semibold text-ink">Table 1: NIRF 5-Year Graduation Outcomes (GO)</h3>
            <div className="border border-hairline rounded-lg overflow-hidden">
              <table className="w-full text-left text-micro font-mono">
                <thead className="bg-surface-2 border-b border-hairline text-ink-muted font-sans font-semibold">
                  <tr>
                    <th className="p-2">Academic Year</th>
                    <th className="p-2">Sanctioned Intake</th>
                    <th className="p-2">Admitted</th>
                    <th className="p-2">Graduated in Time</th>
                    <th className="p-2">Placed</th>
                    <th className="p-2">Higher Studies</th>
                    <th className="p-2">Median Package</th>
                    <th className="p-2">GPH %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {initialNirfCohorts.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2 font-sans font-medium text-ink">{c.academic_year}</td>
                      <td className="p-2">{c.sanctioned_intake}</td>
                      <td className="p-2">{c.total_admitted}</td>
                      <td className="p-2">{c.graduated_stipulated_time}</td>
                      <td className="p-2 text-semantic-success font-semibold">{c.students_placed}</td>
                      <td className="p-2 text-purple-400 font-semibold">{c.higher_studies_count}</td>
                      <td className="p-2">₹{(c.median_salary_inr / 100000).toFixed(2)} LPA</td>
                      <td className="p-2 font-bold">{c.gph_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Signoff Footer */}
          <div className="pt-8 border-t border-hairline grid grid-cols-2 gap-8 text-center text-body-sm">
            <div className="space-y-1">
              <div className="h-10 border-b border-dashed border-hairline w-48 mx-auto" />
              <div className="font-semibold text-ink pt-1">IQAC Coordinator</div>
              <div className="text-micro text-ink-muted">Internal Quality Assurance Cell</div>
            </div>
            <div className="space-y-1">
              <div className="h-10 border-b border-dashed border-hairline w-48 mx-auto" />
              <div className="font-semibold text-ink pt-1">Principal / Vice-Chancellor</div>
              <div className="text-micro text-ink-muted">Head of Institution &amp; Seal</div>
            </div>
          </div>

          {/* Print Action */}
          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="secondary" onClick={() => setIsPrintDossierOpen(false)} className="rounded-pill">
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="rounded-pill bg-accent-blue text-ink hover:bg-accent-blue/90 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
