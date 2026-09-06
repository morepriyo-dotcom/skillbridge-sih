'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { updateApplicationStatus } from '@/actions/applications';
import {
  Sparkles,
  CheckCircle2,
  Users,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  match_score?: number | null;
  status: string;
  created_at: string;
  applicant?: {
    id?: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | {
    id?: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  }[];
  opportunity?: {
    id?: string;
    title?: string | null;
    type?: string | null;
  } | {
    id?: string;
    title?: string | null;
    type?: string | null;
  }[];
}

export function IndustryApplicationsList({
  initialApplications,
}: {
  initialApplications: ApplicationItem[];
}) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStatusChange = async (applicationId: string, nextStatus: any) => {
    setLoadingId(applicationId);
    setErrorMessage(null);

    // Optimistic update
    const previous = [...applications];
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: nextStatus } : app))
    );

    try {
      const res = await updateApplicationStatus(applicationId, nextStatus);
      if (res?.error) {
        setApplications(previous);
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setApplications(previous);
      setErrorMessage(err?.message || 'Failed to update application status.');
    } finally {
      setLoadingId(null);
    }
  };

  const isTrainingType = (type?: string | null) => {
    return ['fdp', 'faculty_internship', 'apprenticeship'].includes(type || '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Shortlisted
          </span>
        );
      case 'interview_scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Interviewing
          </span>
        );
      case 'offered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            Offer Issued
          </span>
        );
      case 'hired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
            Hired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-2 text-ink-muted border border-hairline capitalize">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  return (
    <Card className="bg-surface-1 border-hairline p-6 rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-hairline">
        <div>
          <h3 className="text-headline text-ink font-semibold">Recent Applications Received</h3>
          <p className="text-caption text-ink-muted">
            Candidates and academicians applied to your hiring & training programs
          </p>
        </div>
        <Link
          href="/recruiter/applicants"
          className="text-caption text-accent-blue font-medium hover:underline inline-flex items-center gap-1"
        >
          Open ATS Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-body-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
            const opp = Array.isArray(app.opportunity) ? app.opportunity[0] : app.opportunity;
            const applicantName = applicant?.full_name || 'Candidate';
            const applicantEmail = applicant?.email || '';
            const oppTitle = opp?.title || 'Opportunity';
            const oppType = opp?.type || '';
            const isTraining = isTrainingType(oppType);
            const isLoading = loadingId === app.id;

            return (
              <div
                key={app.id}
                className="p-4 bg-canvas rounded-xl border border-hairline hover:border-hairline-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Applicant Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-ink text-xs shrink-0">
                      {applicantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-body-sm font-semibold text-ink leading-snug">
                        {applicantName}
                      </h4>
                      {applicantEmail && (
                        <p className="text-micro text-ink-muted leading-none mt-0.5">
                          {applicantEmail}
                        </p>
                      )}
                    </div>

                    {app.match_score !== null && app.match_score !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-bold bg-accent-blue/15 text-accent-blue">
                        <Sparkles className="w-3 h-3" /> {app.match_score}% Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-caption text-ink-muted flex-wrap pt-0.5">
                    <span>Applied for:</span>
                    <span className="font-medium text-ink truncate">{oppTitle}</span>
                    {oppType && (
                      <span className="inline-flex items-center gap-1 text-micro px-2 py-0.5 rounded-md bg-surface-2 text-ink-muted capitalize">
                        {isTraining ? (
                          <GraduationCap className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Briefcase className="w-3 h-3 text-accent-blue" />
                        )}
                        {oppType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div>{getStatusBadge(app.status)}</div>

                  {app.status === 'applied' && (
                    <Button
                      size="sm"
                      className="rounded-pill px-4 h-8 text-xs font-semibold bg-accent-blue text-white hover:opacity-90 shadow-sm"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(app.id, 'shortlisted')}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Shortlisting...
                        </>
                      ) : (
                        'Shortlist Candidate'
                      )}
                    </Button>
                  )}

                  {app.status === 'shortlisted' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-pill px-3.5 h-8 text-xs font-medium border border-hairline"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(app.id, 'interview_scheduled')}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Interview'
                      )}
                    </Button>
                  )}

                  {app.status === 'interview_scheduled' && (
                    <Button
                      size="sm"
                      className="rounded-pill px-3.5 h-8 text-xs font-medium bg-primary text-on-primary"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(app.id, 'offered')}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Make Offer'
                      )}
                    </Button>
                  )}

                  {app.status === 'offered' && (
                    <Button
                      size="sm"
                      className="rounded-pill px-3.5 h-8 text-xs font-medium bg-semantic-success text-white hover:bg-semantic-success/90"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(app.id, 'hired')}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Confirm Hire'
                      )}
                    </Button>
                  )}

                  <Link href="/recruiter/applicants">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-pill px-2.5 h-8 text-xs text-ink-muted hover:text-ink"
                    >
                      Details &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No applications received yet"
          description="Candidates applying to your hiring and training programs will appear here for one-click shortlisting."
        />
      )}
    </Card>
  );
}
