import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Handshake } from 'lucide-react';
import { getMyCollaborations, getCollaborationStats } from '@/queries/collaborations';
import { CollaborationForm } from './collaboration-form';

export default async function CollaborationsPage() {
  const [collaborations, stats] = await Promise.all([
    getMyCollaborations(),
    getCollaborationStats(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Academia-Industry Collaboration Hub</h1>
          <p className="text-body text-ink-muted mt-1">
            Foster faculty development programs, sponsored R&amp;D research, and corporate MoUs.
          </p>
        </div>
          <CollaborationForm />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Active Projects', value: stats.active },
          { label: 'Proposed Projects', value: stats.proposed },
          { label: 'Completed Projects', value: stats.completed },
          { label: 'Total Collaborations', value: stats.total },
        ].map((m) => (
          <Card key={m.label} className="p-4 bg-surface-1">
            <span className="text-micro text-ink-muted">{m.label}</span>
            <div className="text-display-md text-ink font-bold mt-1">{m.value}</div>
          </Card>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <h2 className="text-headline text-ink">Active Collaboration Initiatives</h2>
        {collaborations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {collaborations.map((collab: any) => {
              const proposerName = Array.isArray(collab.proposer) ? collab.proposer[0]?.full_name : collab.proposer?.full_name;
              const industryPartner = Array.isArray(collab.industry) ? collab.industry[0]?.company_name : collab.industry?.company_name;
              
              return (
                <Card key={collab.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-hairline">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant="accent">{collab.category}</Badge>
                        {collab.domain && <span className="text-micro text-ink-muted">&bull; {collab.domain}</span>}
                      </div>
                      <h3 className="text-headline text-ink">{collab.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          collab.status === 'in_progress'
                            ? 'success'
                            : collab.status === 'approved'
                            ? 'accent'
                            : 'warning'
                        }
                        className="capitalize text-caption px-3 py-1"
                      >
                        {collab.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="py-4 text-body text-ink-muted leading-relaxed">
                    <p>{collab.description}</p>
                  </div>

                  <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-body-sm">
                    <div className="space-y-1">
                      <p className="text-micro text-ink-muted">
                        Academic Lead: <strong className="text-ink">{proposerName || 'N/A'}</strong>
                      </p>
                      <p className="text-micro text-ink-muted">
                        Industry Partner: <strong className="text-accent-blue">{industryPartner || 'N/A'}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="secondary" className="rounded-pill text-body-sm">
                        View Project Dossier <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-1 rounded-xl border border-hairline">
            <Handshake className="w-12 h-12 text-ink-muted mb-4 opacity-50" />
            <h3 className="text-headline text-ink">No collaborations yet</h3>
            <p className="text-body text-ink-muted mt-2 mb-4">Propose a new collaboration to get started.</p>
            <CollaborationForm />
          </div>
        )}
      </div>
    </div>
  );
}
