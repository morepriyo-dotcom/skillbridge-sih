"use client";

import React, { useState, useMemo } from "react";
import { PlacementDrive } from "@/queries/institution";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import {
  Search,
  Building2,
  Calendar,
  MapPin,
  Users,
  Target,
  GraduationCap,
  ExternalLink,
  Award,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { OPPORTUNITY_TYPES } from "@/lib/constants";

interface PlacementDrivesViewProps {
  drives: PlacementDrive[];
}

export function PlacementDrivesView({ drives }: PlacementDrivesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // KPIs
  const totalDrives = drives.length;
  const activeDrives = drives.filter((d) => d.status === "open" || d.status === "active").length;
  const totalApplicants = drives.reduce((acc, d) => acc + d.totalApplicants, 0);
  const totalPlaced = drives.reduce((acc, d) => acc + d.placedCount, 0);

  // Filter logic
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.location && d.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "ALL" || d.type === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        d.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [drives, searchQuery, typeFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "open" || s === "active") {
      return <Badge variant="success">Active Drive</Badge>;
    }
    if (s === "closed" || s === "completed") {
      return <Badge variant="muted">Closed</Badge>;
    }
    return <Badge variant="warning">{status}</Badge>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Campus Placement Drives</h1>
          <p className="text-body text-ink-muted mt-1">
            Active corporate hiring drives, applicant pipelines, and recruitment partnerships.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Total Drives
            </span>
            <Target className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2">{totalDrives}</div>
          <p className="text-micro text-ink-muted mt-1">Partner hiring drives recorded</p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Active Hiring
            </span>
            <CheckCircle2 className="w-4 h-4 text-semantic-success" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2 text-semantic-success">
            {activeDrives}
          </div>
          <p className="text-micro text-ink-muted mt-1">Accepting student applications</p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Total Applications
            </span>
            <Users className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2 text-orange-400">
            {totalApplicants}
          </div>
          <p className="text-micro text-ink-muted mt-1">Student submissions across drives</p>
        </Card>

        <Card className="p-5 bg-surface-1">
          <div className="flex items-center justify-between">
            <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
              Offers & Hires
            </span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-display-md text-ink font-bold mt-2">{totalPlaced}</div>
          <p className="text-micro text-ink-muted mt-1">Students placed via drives</p>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 bg-surface-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by company, role title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Opportunity Types</option>
            {Object.entries(OPPORTUNITY_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Drive Statuses</option>
            <option value="open">Active / Open</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </Card>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Placement Drives Found"
          description={
            drives.length === 0
              ? "Industry partners have not posted any placement opportunities yet."
              : "No placement drives match your filter criteria. Try adjusting your search."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => (
            <Card
              key={drive.id}
              className="flex flex-col justify-between border-hairline hover:border-accent-blue/40 transition-colors"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center font-bold text-ink shrink-0">
                      {drive.companyLogo ? (
                        <img
                          src={drive.companyLogo}
                          alt={drive.companyName}
                          className="w-full h-full object-contain rounded-lg p-1"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-ink-muted" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink leading-snug line-clamp-1">
                        {drive.companyName}
                      </h3>
                      <span className="text-micro text-ink-muted">
                        {drive.isRemote ? "Remote" : drive.location || "On-site"}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                <div>
                  <h4 className="text-headline font-semibold text-ink line-clamp-2">
                    {drive.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="accent">
                      {OPPORTUNITY_TYPES[drive.type as keyof typeof OPPORTUNITY_TYPES] ||
                        drive.type}
                    </Badge>
                    {drive.minCgpa && (
                      <span className="text-micro text-ink-muted">
                        Min CGPA: <strong>{drive.minCgpa}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-2 gap-2 p-3 bg-surface-2 rounded-md border border-hairline text-micro">
                  <div>
                    <span className="text-ink-muted block">Applicants</span>
                    <strong className="text-ink text-body-sm">{drive.totalApplicants}</strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Placed / Selected</span>
                    <strong className="text-semantic-success text-body-sm">
                      {drive.placedCount}
                    </strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Openings</span>
                    <strong className="text-ink text-body-sm">{drive.openingsCount}</strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Deadline</span>
                    <span className="text-ink font-medium">
                      {drive.deadline
                        ? new Date(drive.deadline).toLocaleDateString()
                        : "Open"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full rounded-pill"
                  onClick={() => setSelectedDrive(drive)}
                >
                  View Drive Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drive Details Dialog */}
      {selectedDrive && (
        <Dialog
          isOpen={Boolean(selectedDrive)}
          onClose={() => setSelectedDrive(null)}
          title="Placement Drive Details"
          description="Eligibility criteria, remuneration, and recruitment statistics."
          className="max-w-2xl"
        >
          <div className="space-y-6 pt-2">
            <div className="flex items-start justify-between pb-4 border-b border-hairline">
              <div>
                <h3 className="text-headline text-ink font-bold">{selectedDrive.title}</h3>
                <p className="text-body-sm text-ink-muted mt-0.5">{selectedDrive.companyName}</p>
              </div>
              {getStatusBadge(selectedDrive.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-surface-2 rounded-lg border border-hairline">
              <div>
                <span className="text-micro text-ink-muted">Role Type</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {OPPORTUNITY_TYPES[selectedDrive.type as keyof typeof OPPORTUNITY_TYPES] ||
                    selectedDrive.type}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Location</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedDrive.isRemote ? "Remote" : selectedDrive.location || "On-site"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Total Openings</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedDrive.openingsCount}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Stipend / CTC</span>
                <p className="text-body-sm font-semibold text-accent-blue mt-0.5">
                  {selectedDrive.stipendMin
                    ? `₹${selectedDrive.stipendMin.toLocaleString()} - ₹${(
                        selectedDrive.stipendMax || selectedDrive.stipendMin
                      ).toLocaleString()}`
                    : "As per industry standards"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Min CGPA Required</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedDrive.minCgpa ? selectedDrive.minCgpa : "No cutoff"}
                </p>
              </div>
              <div>
                <span className="text-micro text-ink-muted">Application Deadline</span>
                <p className="text-body-sm font-medium text-ink mt-0.5">
                  {selectedDrive.deadline
                    ? new Date(selectedDrive.deadline).toLocaleDateString()
                    : "No deadline specified"}
                </p>
              </div>
            </div>

            {/* Target Criteria */}
            <div className="space-y-3">
              <div>
                <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
                  Eligible Departments
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {selectedDrive.targetDepartments && selectedDrive.targetDepartments.length > 0 ? (
                    selectedDrive.targetDepartments.map((dept) => (
                      <Badge key={dept} variant="muted">
                        {dept}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-micro text-ink-muted">Open to all departments</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-micro text-ink-muted uppercase tracking-wider font-semibold">
                  Eligible Degrees
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {selectedDrive.targetDegrees && selectedDrive.targetDegrees.length > 0 ? (
                    selectedDrive.targetDegrees.map((deg) => (
                      <Badge key={deg} variant="muted">
                        {deg}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-micro text-ink-muted">Open to all degrees</span>
                  )}
                </div>
              </div>
            </div>

            {/* Application Pipeline Summary */}
            <div className="p-4 bg-surface-2 rounded-lg border border-hairline flex items-center justify-between">
              <div>
                <span className="text-micro text-ink-muted">Total Applicants</span>
                <div className="text-headline font-bold text-ink mt-0.5">
                  {selectedDrive.totalApplicants}
                </div>
              </div>
              <div className="text-right">
                <span className="text-micro text-ink-muted">Students Hired / Offered</span>
                <div className="text-headline font-bold text-semantic-success mt-0.5">
                  {selectedDrive.placedCount}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-hairline">
              {selectedDrive.companyWebsite ? (
                <a
                  href={selectedDrive.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-body-sm text-accent-blue hover:underline"
                >
                  <span>Company Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}
              <Button variant="secondary" onClick={() => setSelectedDrive(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
