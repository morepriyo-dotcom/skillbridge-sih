"use client";

import React, { useState, useMemo } from "react";
import { TrackedStudent } from "@/queries/institution";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import {
  Search,
  Download,
  Users,
  Award,
  CheckCircle2,
  Briefcase,
  ExternalLink,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants";

interface StudentTrackingViewProps {
  students: TrackedStudent[];
}

export function StudentTrackingView({ students }: StudentTrackingViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<TrackedStudent | null>(null);

  // Derived KPI metrics
  const totalStudents = students.length;
  const placedStudents = students.filter(
    (s) => s.placementStatus === "placed" || s.placementStatus === "offered"
  ).length;
  const interviewingStudents = students.filter(
    (s) => s.placementStatus === "interviewing"
  ).length;
  const placementRate =
    totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : "0.0";

  const studentsWithCgpa = students.filter((s) => s.cgpa !== null);
  const avgCgpa =
    studentsWithCgpa.length > 0
      ? (
          studentsWithCgpa.reduce((acc, s) => acc + (s.cgpa || 0), 0) /
          studentsWithCgpa.length
        ).toFixed(2)
      : "N/A";

  // Filter students based on search and dropdowns
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNumber &&
          student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        departmentFilter === "ALL" || student.department === departmentFilter;

      const matchesStatus =
        statusFilter === "ALL" || student.placementStatus === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchQuery, departmentFilter, statusFilter]);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      "Student Name",
      "Email",
      "Phone",
      "Roll Number",
      "Department",
      "Degree",
      "CGPA",
      "Verified Skills Count",
      "Applications Count",
      "Placement Status",
      "Placed Company",
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.phone || "").replace(/"/g, '""')}"`,
      `"${(s.rollNumber || "N/A").replace(/"/g, '""')}"`,
      `"${s.department.replace(/"/g, '""')}"`,
      `"${s.degree.replace(/"/g, '""')}"`,
      s.cgpa !== null ? s.cgpa.toString() : "N/A",
      s.verifiedSkillsCount.toString(),
      s.totalApplications.toString(),
      s.placementStatus,
      `"${(s.placedCompany || "N/A").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `student_tracking_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: TrackedStudent["placementStatus"], company?: string) => {
    switch (status) {
      case "placed":
        return (
          <div className="flex flex-col">
            <Badge variant="success" className="w-fit">Placed</Badge>
            {company && (
              <span className="text-micro text-semantic-success mt-0.5 font-medium truncate max-w-[140px]">
                {company}
              </span>
            )}
          </div>
        );
      case "offered":
        return (
          <div className="flex flex-col">
            <Badge variant="accent" className="w-fit">Offered</Badge>
            {company && (
              <span className="text-micro text-accent-blue mt-0.5 font-medium truncate max-w-[140px]">
                {company}
              </span>
            )}
          </div>
        );
      case "interviewing":
        return <Badge variant="warning">In Interview</Badge>;
      case "applied":
        return <Badge variant="muted">Applied</Badge>;
      case "seeking":
      default:
        return <Badge variant="default" className="text-ink-muted">Seeking</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Student Placement & Skill Tracking</h1>
          <p className="text-body text-ink-muted mt-1">
            Monitor verified skills, recruitment pipeline status, and graduation placement outcomes.
          </p>
        </div>
        <Button onClick={handleExportCsv} variant="secondary" className="rounded-pill">
          <Download className="w-4 h-4 mr-2" /> Export Student Directory (CSV)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Total Students
            </span>
            <Users className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2">{totalStudents}</div>
          <p className="text-micro text-ink-muted mt-1">Registered in institutional portal</p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Placed / Offered
            </span>
            <CheckCircle2 className="w-4 h-4 text-semantic-success" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2 text-semantic-success">
            {placedStudents}
          </div>
          <p className="text-micro text-ink-muted mt-1">
            {placementRate}% of overall student body
          </p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              In Interview Process
            </span>
            <Briefcase className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2 text-orange-400">
            {interviewingStudents}
          </div>
          <p className="text-micro text-ink-muted mt-1">Active interview / assessment rounds</p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Average CGPA
            </span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2">{avgCgpa}</div>
          <p className="text-micro text-ink-muted mt-1">Across reported student records</p>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 bg-surface-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by student name, email, roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Placement Statuses</option>
            <option value="placed">Placed</option>
            <option value="offered">Offered</option>
            <option value="interviewing">Interviewing</option>
            <option value="applied">Applied</option>
            <option value="seeking">Seeking</option>
          </Select>
        </div>
      </Card>

      {/* Students Data Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Students Found"
          description={
            students.length === 0
              ? "No student profiles have been registered yet. Once students register, they will appear here."
              : "No students match the selected search or filter criteria. Try adjusting your filters."
          }
        />
      ) : (
        <Card className="overflow-hidden border-hairline">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Degree & Dept</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Verified Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  {/* Name and email */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center font-medium text-body-sm shrink-0">
                        {student.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-ink truncate">
                          {student.fullName}
                        </span>
                        <span className="text-micro text-ink-muted truncate">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Degree & Dept */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-body-sm text-ink">{student.degree}</span>
                      <span className="text-micro text-ink-muted">{student.department}</span>
                    </div>
                  </TableCell>

                  {/* Roll No */}
                  <TableCell>
                    <span className="text-body-sm text-ink font-mono">
                      {student.rollNumber || "—"}
                    </span>
                  </TableCell>

                  {/* CGPA */}
                  <TableCell>
                    <span className="text-body-sm font-semibold text-ink">
                      {student.cgpa !== null ? student.cgpa.toFixed(2) : "—"}
                    </span>
                  </TableCell>

                  {/* Verified Skills */}
                  <TableCell>
                    {student.verifiedSkillsCount > 0 ? (
                      <Badge variant="accent" className="flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-accent-blue" />
                        <span>{student.verifiedSkillsCount} Verified</span>
                      </Badge>
                    ) : (
                      <span className="text-micro text-ink-muted">0 Verified</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(student.placementStatus, student.placedCompany)}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(student)}
                      className="text-accent-blue hover:text-accent-blue/80"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Student Profile Dialog */}
      {selectedStudent && (
        <Dialog
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          title="Student Profile & Placement Record"
          description="Detailed credentials, academic performance, and placement status."
          className="max-w-2xl"
        >
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-hairline">
              <div className="w-14 h-14 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center font-bold text-headline shrink-0">
                {selectedStudent.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-headline text-ink font-bold">{selectedStudent.fullName}</h3>
                <div className="flex flex-wrap items-center gap-4 text-body-sm text-ink-muted mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedStudent.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-surface-2 rounded-lg border border-hairline">
              <div>
                <span className="text-micro text-ink-muted">Degree</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">{selectedStudent.degree}</p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Department</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">{selectedStudent.department}</p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Roll Number</span>
                <p className="text-body-sm font-medium text-ink mt-0.5 font-mono">
                  {selectedStudent.rollNumber || "Not recorded"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Graduation Year</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedStudent.graduationYear || "—"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">CGPA</span>
                <p className="text-body-sm font-bold text-accent-blue mt-0.5">
                  {selectedStudent.cgpa !== null ? selectedStudent.cgpa.toFixed(2) : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Total Applications</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedStudent.totalApplications} applied
                </p>
              </div>
            </div>

            {/* Placement Status Box */}
            <div className="p-4 bg-surface-2 rounded-lg border border-hairline flex items-center justify-between">
              <div>
                <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
                  Placement Outcome
                </span>
                <div className="mt-1">
                  {getStatusBadge(selectedStudent.placementStatus, selectedStudent.placedCompany)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-micro text-ink-muted">Verified Skill Endorsements</span>
                <div className="text-headline font-bold text-accent-blue mt-1">
                  {selectedStudent.verifiedSkillsCount}
                </div>
              </div>
            </div>

            {/* Links and Attachments */}
            <div className="space-y-2">
              <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
                Attachments & Profiles
              </span>
              <div className="flex flex-wrap gap-3">
                {selectedStudent.resumeUrl ? (
                  <a
                    href={selectedStudent.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-1 border border-hairline hover:bg-surface-2 text-body-sm text-ink transition-colors"
                  >
                    <FileText className="w-4 h-4 text-accent-blue" />
                    <span>View Resume</span>
                    <ExternalLink className="w-3 h-3 text-ink-muted" />
                  </a>
                ) : (
                  <span className="text-micro text-ink-muted italic py-1">No resume attached</span>
                )}

                {selectedStudent.linkedinUrl && (
                  <a
                    href={selectedStudent.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-1 border border-hairline hover:bg-surface-2 text-body-sm text-ink transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-accent-blue" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {selectedStudent.githubUrl && (
                  <a
                    href={selectedStudent.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-1 border border-hairline hover:bg-surface-2 text-body-sm text-ink transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-accent-blue" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-hairline">
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
