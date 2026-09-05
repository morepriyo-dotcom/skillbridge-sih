import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMyApplications } from '@/queries/applications';
import { APPLICATION_STATUSES } from '@/lib/constants';
import { Building2, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export default async function ApplicationsPage() {
  const applications = await getMyApplications();
  const stages = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'offered'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-display-md text-ink font-medium">Application Tracker</h1>
        <p className="text-body text-ink-muted mt-1">
          Monitor your application lifecycle, interviews, and offer letters in real-time.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Browse opportunities and submit your first application."
        />
      ) : (
        <div className="space-y-6">
          {applications.map((app: any) => {
            const statusConfig =
              APPLICATION_STATUSES[app.status as keyof typeof APPLICATION_STATUSES] || {
                label: app.status,
                color: 'bg-surface-2 text-ink',
              };

            const currentStageIdx = stages.indexOf(app.status);
            const industry = Array.isArray(app.opportunity?.industry)
              ? app.opportunity?.industry[0]
              : app.opportunity?.industry;

            return (
              <Card key={app.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-hairline">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-micro text-accent-blue font-medium flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {industry?.company_name || 'Industry Partner'}
                      </span>
                      <span className="text-micro text-ink-muted">
                        &bull; Applied on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-headline text-ink">{app.opportunity?.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.match_score && (
                      <div className="px-3 py-1 rounded-pill bg-accent-blue/10 text-accent-blue font-bold text-body-sm flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {app.match_score}% Match
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-pill text-caption font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="py-6 border-b border-hairline">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { key: 'applied', label: 'Applied' },
                      { key: 'under_review', label: 'Under Review' },
                      { key: 'shortlisted', label: 'Shortlisted' },
                      { key: 'interview_scheduled', label: 'Interview' },
                      { key: 'offered', label: 'Offer Letter' },
                    ].map((stage, idx) => {
                      const isCompleted = currentStageIdx >= idx;
                      const isCurrent = currentStageIdx === idx;

                      return (
                        <div key={stage.key} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-micro font-bold mb-1.5 transition-all ${
                              isCurrent
                                ? 'bg-accent-blue text-white ring-4 ring-accent-blue/20'
                                : isCompleted
                                  ? 'bg-semantic-success text-white'
                                  : 'bg-surface-2 text-ink-muted border border-hairline'
                            }`}
                          >
                            {isCompleted && !isCurrent ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-micro ${
                              isCurrent
                                ? 'text-accent-blue font-bold'
                                : isCompleted
                                  ? 'text-ink font-medium'
                                  : 'text-ink-muted'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recruiter Feedback / Next Action */}
                <div className="pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <span className="text-micro text-ink-muted uppercase tracking-wider block">
                      Recruiter Note / Status Update
                    </span>
                    <p className="text-body-sm text-ink mt-0.5">
                      {app.feedback || 'No pending feedback from hiring team.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/opportunities/${app.opportunity?.id || ''}`}>
                      <Button variant="secondary" className="rounded-pill text-body-sm">
                        View Posting
                      </Button>
                    </Link>
                    {app.status === 'offered' && (
                      <Button className="rounded-pill text-body-sm bg-semantic-success text-white hover:bg-semantic-success/90">
                        Accept Offer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
