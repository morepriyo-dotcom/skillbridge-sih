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
import {
  updateProfile,
  updateStudentDetails,
  updateAcademicianDetails,
  updateIndustryPartnerDetails,
  updateInstitutionAdminDetails,
} from "@/actions/profile";
import type { UserFullProfile } from "@/queries/profile";
import { INDUSTRY_ROLE_BENCHMARKS } from "@/lib/role-benchmarks";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Building,
  ShieldCheck,
  Globe,
  MapPin,
  ExternalLink,
  Code2,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileEditorProps {
  initialProfile: UserFullProfile;
}

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"general" | "roleSpecific">("roleSpecific");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Common Profile State
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");

  // Student State
  const std = initialProfile.studentDetails || {};
  const goals = (initialProfile.careerGoals || {}) as any;
  const [department, setDepartment] = useState(std.department || "");
  const [degree, setDegree] = useState(std.degree || "");
  const [rollNumber, setRollNumber] = useState(std.roll_number || "");
  const [gradYear, setGradYear] = useState<number>(std.graduation_year || new Date().getFullYear());
  const [cgpa, setCgpa] = useState<string>(std.cgpa ? String(std.cgpa) : "");
  const [desiredRole, setDesiredRole] = useState(goals.desired_role || "Full Stack Software Developer");
  const [desiredSector, setDesiredSector] = useState(goals.desired_sector || "Information Technology");
  const [resumeUrl, setResumeUrl] = useState(std.resume_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(std.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(std.github_url || "");

  // Academician State
  const acad = initialProfile.academicianDetails || {};
  const [acadDept, setAcadDept] = useState(acad.department || "");
  const [designation, setDesignation] = useState(acad.designation || "");
  const [expertise, setExpertise] = useState(
    Array.isArray(acad.areas_of_expertise) ? acad.areas_of_expertise.join(", ") : ""
  );
  const [researchInterests, setResearchInterests] = useState(
    Array.isArray(acad.research_interests) ? acad.research_interests.join(", ") : ""
  );
  const [googleScholarUrl, setGoogleScholarUrl] = useState(acad.google_scholar_url || "");
  const [openForConsultancy, setOpenForConsultancy] = useState<boolean>(
    acad.open_for_consultancy ?? true
  );

  // Industry Partner State
  const partner = initialProfile.partnerProfile || ({} as any);
  const [companyName, setCompanyName] = useState(partner.company_name || initialProfile.full_name || "");
  const [industrySector, setIndustrySector] = useState(partner.industry_sector || "Information Technology & Ayush");
  const [registrationNo, setRegistrationNo] = useState(partner.registration_no || "");
  const [companyWebsite, setCompanyWebsite] = useState(partner.website || "");
  const [headquarters, setHeadquarters] = useState(partner.headquarters || "Bengaluru, India");
  const [companyDescription, setCompanyDescription] = useState(partner.description || "");

  // Institution Admin State
  const inst = initialProfile.institutionProfile || ({} as any);
  const [institutionName, setInstitutionName] = useState(inst.institution_name || "");
  const [aisheCode, setAisheCode] = useState(inst.code || "");
  const [institutionType, setInstitutionType] = useState(inst.type || "Autonomous University");
  const [state, setState] = useState(inst.state || "");
  const [city, setCity] = useState(inst.city || "");
  const [institutionWebsite, setInstitutionWebsite] = useState(inst.website || "");
  const [accreditationStatus, setAccreditationStatus] = useState(
    inst.accreditation_status || "NAAC A++"
  );

  // Save General Profile
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (res.error) throw new Error(res.error);

      setSuccessMessage("General profile details updated successfully!");
      startTransition(() => router.refresh());
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Role-Specific Details
  const handleSaveRoleSpecific = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (initialProfile.role === "student") {
        const res = await updateStudentDetails({
          department: department.trim(),
          degree: degree.trim(),
          graduationYear: Number(gradYear) || new Date().getFullYear(),
          cgpa: cgpa ? parseFloat(cgpa) : undefined,
          rollNumber: rollNumber.trim() || undefined,
          resumeUrl: resumeUrl.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          desiredRole: desiredRole.trim(),
          desiredSector: desiredSector.trim(),
        });
        if (res.error) throw new Error(res.error);
        setSuccessMessage("Student academic credentials & career goals updated!");
      } else if (initialProfile.role === "academician") {
        const expertiseArray = expertise
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        const researchArray = researchInterests
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        const res = await updateAcademicianDetails({
          department: acadDept.trim(),
          designation: designation.trim(),
          areasOfExpertise: expertiseArray,
          researchInterests: researchArray,
          googleScholarUrl: googleScholarUrl.trim() || undefined,
          openForConsultancy,
        });
        if (res.error) throw new Error(res.error);
        setSuccessMessage("Faculty credentials & research profile updated!");
      } else if (initialProfile.role === "industry_partner") {
        const res = await updateIndustryPartnerDetails({
          companyName: companyName.trim(),
          industrySector: industrySector.trim(),
          registrationNo: registrationNo.trim(),
          website: companyWebsite.trim(),
          headquarters: headquarters.trim(),
          description: companyDescription.trim(),
        });
        if (res.error) throw new Error(res.error);
        setSuccessMessage("Enterprise corporate profile updated!");
      } else if (initialProfile.role === "institution_admin") {
        const res = await updateInstitutionAdminDetails({
          institutionName: institutionName.trim(),
          code: aisheCode.trim(),
          type: institutionType.trim(),
          state: state.trim(),
          city: city.trim(),
          website: institutionWebsite.trim(),
          accreditationStatus: accreditationStatus.trim(),
        });
        if (res.error) throw new Error(res.error);
        setSuccessMessage("Institution governance profile updated!");
      }

      startTransition(() => router.refresh());
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update role details.");
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabels: Record<string, string> = {
    student: "Student Profile & Career Goals",
    academician: "Faculty & Mentorship Profile",
    industry_partner: "Corporate Partner Profile",
    institution_admin: "Institutional Governance Profile",
    super_admin: "Administrator Profile",
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-1 p-6 rounded-2xl border border-hairline">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-hairline flex items-center justify-center text-ink text-display-sm font-bold shadow-xs">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-display-sm text-ink font-semibold">{fullName || "User Profile"}</h1>
              <Badge variant="accent" className="capitalize">
                {initialProfile.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-body-sm text-ink-muted mt-0.5">{initialProfile.email}</p>
          </div>
        </div>

        {initialProfile.role === "student" && (
          <div className="flex items-center gap-3">
            <Link href="/skills">
              <Button variant="secondary" className="rounded-pill text-body-sm">
                <Sparkles className="w-4 h-4 mr-2 text-accent-blue" />
                View Skill Gap Analysis
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button className="rounded-pill text-body-sm">
                <Award className="w-4 h-4 mr-2" />
                Public Portfolio
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-body-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-body-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-hairline gap-2">
        <button
          onClick={() => setActiveTab("roleSpecific")}
          className={`px-5 py-2.5 text-body-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "roleSpecific"
              ? "border-accent-blue text-ink font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {roleLabels[initialProfile.role] || "Role Profile"}
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-2.5 text-body-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "general"
              ? "border-accent-blue text-ink font-semibold"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Account & Personal Details
        </button>
      </div>

      {/* TAB 1: Role-Specific Details */}
      {activeTab === "roleSpecific" && (
        <form onSubmit={handleSaveRoleSpecific} className="space-y-6">
          {/* STUDENT FORM */}
          {initialProfile.role === "student" && (
            <>
              {/* Desired Role & Career Goals Card */}
              <Card className="border-accent-blue/30 bg-accent-blue/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-headline flex items-center gap-2 text-ink">
                      <Sparkles className="w-5 h-5 text-accent-blue" />
                      Target Role in Industry & Career Goal
                    </CardTitle>
                    <Badge variant="accent">AI Skill Matching</Badge>
                  </div>
                  <CardDescription>
                    Specify the exact role you aim for in the industry. SkillBridge will analyze your listed skills and assessment performance to calculate your exact skill gap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1.5">
                        Target / Desired Role
                      </label>
                      <Input
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        placeholder="e.g. Full Stack Software Developer"
                        className="bg-surface-1"
                        required
                      />
                      {/* Presets */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="text-micro text-ink-muted self-center mr-1">Presets:</span>
                        {INDUSTRY_ROLE_BENCHMARKS.slice(0, 4).map((b) => (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => {
                              setDesiredRole(b.title);
                              setDesiredSector(b.sector);
                            }}
                            className={`text-micro px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                              desiredRole === b.title
                                ? "bg-accent-blue text-white border-accent-blue"
                                : "bg-surface-2 text-ink-muted hover:text-ink border-hairline"
                            }`}
                          >
                            {b.title.split(" ")[0]} {b.title.split(" ")[1]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-caption font-medium text-ink block mb-1.5">
                        Target Industry Sector
                      </label>
                      <select
                        value={desiredSector}
                        onChange={(e) => setDesiredSector(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-surface-1 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      >
                        <option value="Information Technology">Information Technology</option>
                        <option value="Ayush & Healthcare">Ayush & Healthcare</option>
                        <option value="Biotechnology & Pharma">Biotechnology & Pharma</option>
                        <option value="Research & Academia">Research & Academia</option>
                        <option value="Finance & Fintech">Finance & Fintech</option>
                      </select>
                      <p className="text-micro text-ink-muted mt-1.5">
                        Aligns assessment evaluations and recommended upskilling paths with industry expectations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Credentials Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-accent-blue" />
                    Academic Credentials
                  </CardTitle>
                  <CardDescription>
                    Your institutional degree, department, and academic achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Degree / Program
                      </label>
                      <Input
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="e.g. B.Tech, BAMS, M.Sc"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Department / Branch
                      </label>
                      <Input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science, Ayurveda"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Roll Number / Student ID
                      </label>
                      <Input
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 21B81A0501"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Graduation Year
                      </label>
                      <Input
                        type="number"
                        value={gradYear}
                        onChange={(e) => setGradYear(parseInt(e.target.value) || 2026)}
                        min={2020}
                        max={2032}
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        CGPA (out of 10)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        placeholder="e.g. 8.75"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio & Professional Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent-blue" />
                    Portfolio & Professional Profiles
                  </CardTitle>
                  <CardDescription>
                    Provide links to your resume, code repositories, and professional networks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent-blue" />
                      Resume Link / Cloud Storage URL
                    </label>
                    <Input
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or https://domain.com/resume.pdf"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                        LinkedIn Profile URL
                      </label>
                      <Input
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-accent-blue" />
                        GitHub / Project Portfolio URL
                      </label>
                      <Input
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ACADEMICIAN / FACULTY FORM */}
          {initialProfile.role === "academician" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-headline flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    Faculty Designation & Department
                  </CardTitle>
                  <CardDescription>
                    Define your academic ranking, department, and teaching specialization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Designation / Title
                      </label>
                      <Input
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Associate Professor, HOD, Assistant Professor"
                      />
                    </div>
                    <div>
                      <label className="text-caption font-medium text-ink block mb-1">
                        Department
                      </label>
                      <Input
                        value={acadDept}
                        onChange={(e) => setAcadDept(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering, Pharmacology"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-headline flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Research & Consultancy Specializations
                  </CardTitle>
                  <CardDescription>
                    Highlight your research areas, consultancy readiness, and Google Scholar profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Areas of Expertise (Comma-separated)
                    </label>
                    <Input
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. Machine Learning, Clinical Trials, Herbal Standardization, NLP"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Research Interests (Comma-separated)
                    </label>
                    <Input
                      value={researchInterests}
                      onChange={(e) => setResearchInterests(e.target.value)}
                      placeholder="e.g. Ayush GCP Guidelines, Edge Computing, Genomic Data"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Google Scholar Profile URL
                    </label>
                    <Input
                      value={googleScholarUrl}
                      onChange={(e) => setGoogleScholarUrl(e.target.value)}
                      placeholder="https://scholar.google.com/citations?user=..."
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <input
                      type="checkbox"
                      id="consultancy"
                      checked={openForConsultancy}
                      onChange={(e) => setOpenForConsultancy(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="consultancy" className="text-body-sm text-ink font-medium cursor-pointer">
                      Available for Industry Research Consultancy & Mentorship Projects
                    </label>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* INDUSTRY PARTNER / RECRUITER FORM */}
          {initialProfile.role === "industry_partner" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  Corporate Organization Details
                </CardTitle>
                <CardDescription>
                  Your enterprise identity, headquarters, and recruiting sector
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Company / Organization Name
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Himalaya Wellness, Biocon, TCS"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Industry Sector
                    </label>
                    <Input
                      value={industrySector}
                      onChange={(e) => setIndustrySector(e.target.value)}
                      placeholder="e.g. Information Technology, Ayurveda & Wellness"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Registration / Corporate ID (CIN/GST)
                    </label>
                    <Input
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      placeholder="e.g. U72200KA2015PTC081234"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Headquarters Location
                    </label>
                    <Input
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Corporate Website URL
                  </label>
                  <Input
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Company Description & Focus Areas
                  </label>
                  <textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    placeholder="Describe your organization, mission, and the talent competencies you recruit..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* INSTITUTION ADMIN FORM */}
          {initialProfile.role === "institution_admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-headline flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-500" />
                  Educational Institution Governance
                </CardTitle>
                <CardDescription>
                  Your institution's accreditation codes, accreditation status, and official website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Institution Name
                    </label>
                    <Input
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g. National Institute of Technology, CVR College"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      AISHE Institution Code
                    </label>
                    <Input
                      value={aisheCode}
                      onChange={(e) => setAisheCode(e.target.value)}
                      placeholder="e.g. AISHE-C-12345"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Institution Type
                    </label>
                    <Input
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      placeholder="e.g. Autonomous College, Central University"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      Accreditation Status
                    </label>
                    <Input
                      value={accreditationStatus}
                      onChange={(e) => setAccreditationStatus(e.target.value)}
                      placeholder="e.g. NAAC A++ (CGPA 3.82), NBA Tier-1"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      State
                    </label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Telangana, Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-medium text-ink block mb-1">
                      City
                    </label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad, Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Official Website URL
                  </label>
                  <Input
                    value={institutionWebsite}
                    onChange={(e) => setInstitutionWebsite(e.target.value)}
                    placeholder="https://institution.edu.in"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-pill bg-accent-blue text-white px-8 h-11"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: General & Personal Details */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-headline flex items-center gap-2">
                <User className="w-5 h-5 text-accent-blue" />
                Personal Information & Contact
              </CardTitle>
              <CardDescription>
                Basic contact and account identity details across SkillBridge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Full Legal Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Email Address
                  </label>
                  <Input
                    value={initialProfile.email}
                    disabled
                    className="bg-surface-2 cursor-not-allowed opacity-75"
                  />
                  <span className="text-[11px] text-ink-muted">Managed via authentication</span>
                </div>
                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-caption font-medium text-ink block mb-1">
                    Avatar / Photo URL
                  </label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or profile image link"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-medium text-ink block mb-1">
                  Professional Bio / Executive Summary
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-md bg-surface-2 border border-hairline text-ink text-body-sm focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  placeholder="Share your background, passions, and objectives..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-hairline pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-pill bg-accent-blue text-white px-8 h-11"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Account...
                  </>
                ) : (
                  "Update Account Details"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
