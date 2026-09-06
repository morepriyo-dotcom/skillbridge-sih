'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { updateApplicationStatus } from '@/actions/applications';
import { Users, Sparkles, Phone, Mail, CheckCircle2, Briefcase } from 'lucide-react';

const COLUMNS = [
  { key: 'applied', label: 'New Applicants' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interviewing' },
  { key: 'offered', label: 'Offer Issued' },
  { key: 'hired', label: 'Hired & Onboarded' },
];

export default function RecruiterKanban({ initialApplicants }: { initialApplicants: any[] }) {
  const [candidates, setCandidates] = useState<any[]>(initialApplicants);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const moveStatus = async (candidateId: string, nextStatus: string) => {
    // Optimistic update
    const previous = [...candidates];
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: nextStatus } : c))
    );
    setErrorMsg('');

    try {
      const res = await updateApplicationStatus(candidateId, nextStatus as any);
      if (res?.error) {
        setCandidates(previous);
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setCandidates(previous);
      setErrorMsg(err.message || 'Failed to update application status.');
    }
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-display-md text-ink font-medium">Recruitment Pipeline (ATS)</h1>
          <p className="text-body text-ink-muted mt-1">
            Review AI-ranked candidates and advance applicants through the screening stages.
          </p>
        </div>
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Your posted opportunities will receive applications here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Recruitment Pipeline (ATS)</h1>
          <p className="text-body text-ink-muted mt-1">
            Review AI-ranked candidates and advance applicants through the screening stages.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="accent" className="text-body-sm px-3 py-1">
            Total Candidates: {candidates.length}
          </Badge>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-body-sm">
          {errorMsg}
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colCandidates = candidates.filter((c) => c.status === col.key);

          return (
            <div key={col.key} className="bg-surface-1 rounded-2xl p-4 border border-hairline flex flex-col min-w-[280px]">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-hairline">
                <h3 className="text-caption font-semibold text-ink uppercase tracking-wider">{col.label}</h3>
                <span className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-micro font-bold text-ink-muted">
                  {colCandidates.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colCandidates.map((cand) => {
                  const applicantUser = Array.isArray(cand.applicant) ? cand.applicant[0] : cand.applicant;
                  const opportunity = Array.isArray(cand.opportunity) ? cand.opportunity[0] : cand.opportunity;

                  return (
                    <Card
                      key={cand.id}
                      className="p-4 bg-surface-2 hover:border-accent-blue/50 transition-all cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-body-sm font-semibold text-ink">{applicantUser?.full_name || 'Unknown Candidate'}</h4>
                        <span className="px-2 py-0.5 rounded-pill bg-accent-blue/15 text-accent-blue text-micro font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {cand.match_score || 0}%
                        </span>
                      </div>

                      <p className="text-[11px] text-ink-muted mt-2">
                        Opp: <span className="font-medium text-ink">{opportunity?.title}</span>
                      </p>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-hairline flex justify-between items-center">
                        <span className="text-[11px] text-accent-blue font-medium">View Profile</span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {col.key === 'applied' && (
                            <Button
                              variant="secondary"
                              className="rounded-pill text-micro h-7 px-2.5"
                              onClick={() => moveStatus(cand.id, 'shortlisted')}
                            >
                              Shortlist
                            </Button>
                          )}
                          {col.key === 'shortlisted' && (
                            <Button
                              variant="secondary"
                              className="rounded-pill text-micro h-7 px-2.5"
                              onClick={() => moveStatus(cand.id, 'interview_scheduled')}
                            >
                              Interview
                            </Button>
                          )}
                          {col.key === 'interview_scheduled' && (
                            <Button
                              variant="primary"
                              className="rounded-pill text-micro h-7 px-2.5"
                              onClick={() => moveStatus(cand.id, 'offered')}
                            >
                              Offer
                            </Button>
                          )}
                          {col.key === 'offered' && (
                            <Button
                              className="rounded-pill text-micro h-7 px-2.5 bg-semantic-success text-white hover:bg-semantic-success/90"
                              onClick={() => moveStatus(cand.id, 'hired')}
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Modal / Detail View */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-headline text-ink">
                  {Array.isArray(selectedCandidate.applicant) ? selectedCandidate.applicant[0]?.full_name : selectedCandidate.applicant?.full_name}
                </h3>
                <p className="text-body-sm text-ink-muted">
                  Applied for: {Array.isArray(selectedCandidate.opportunity) ? selectedCandidate.opportunity[0]?.title : selectedCandidate.opportunity?.title}
                </p>
              </div>
              <div className="px-3 py-1 rounded-pill bg-accent-blue/20 text-accent-blue font-bold text-body-sm flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> {selectedCandidate.match_score || 0}% Match
              </div>
            </div>

            <div className="space-y-2 py-3 border-y border-hairline text-body-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-ink" /> 
                {Array.isArray(selectedCandidate.applicant) ? selectedCandidate.applicant[0]?.email : selectedCandidate.applicant?.email}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                {!['rejected', 'hired'].includes(selectedCandidate.status) && (
                  <Button
                    variant="ghost"
                    className="rounded-pill text-xs text-semantic-error hover:bg-semantic-error/10"
                    onClick={() => {
                      moveStatus(selectedCandidate.id, 'rejected');
                      setSelectedCandidate(null);
                    }}
                  >
                    Reject
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-pill" onClick={() => setSelectedCandidate(null)}>
                  Close
                </Button>
                {selectedCandidate.status === 'applied' && (
                  <Button
                    className="rounded-pill bg-accent-blue text-white hover:opacity-90"
                    onClick={() => {
                      moveStatus(selectedCandidate.id, 'shortlisted');
                      setSelectedCandidate(null);
                    }}
                  >
                    Shortlist
                  </Button>
                )}
                {selectedCandidate.status === 'shortlisted' && (
                  <Button
                    className="rounded-pill bg-accent-blue text-white hover:opacity-90"
                    onClick={() => {
                      moveStatus(selectedCandidate.id, 'interview_scheduled');
                      setSelectedCandidate(null);
                    }}
                  >
                    Schedule Interview
                  </Button>
                )}
                {selectedCandidate.status === 'interview_scheduled' && (
                  <Button
                    className="rounded-pill bg-accent-blue text-white hover:opacity-90"
                    onClick={() => {
                      moveStatus(selectedCandidate.id, 'offered');
                      setSelectedCandidate(null);
                    }}
                  >
                    Make Offer
                  </Button>
                )}
                {selectedCandidate.status === 'offered' && (
                  <Button
                    className="rounded-pill bg-semantic-success text-white hover:bg-semantic-success/90"
                    onClick={() => {
                      moveStatus(selectedCandidate.id, 'hired');
                      setSelectedCandidate(null);
                    }}
                  >
                    Confirm Hired
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
