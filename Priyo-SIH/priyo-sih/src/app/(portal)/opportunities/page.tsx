import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getActiveOpportunities } from '@/queries/opportunities';
import { Briefcase, MapPin, Calendar, Building2, Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sector?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const typeFilter = resolvedParams?.type as any;
  const sectorFilter = resolvedParams?.sector;
  const searchQuery = resolvedParams?.search;

  const { opportunities, total } = await getActiveOpportunities({
    type: typeFilter,
    sector: sectorFilter,
    search: searchQuery,
    offset: 0,
    limit: 20,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Internships &amp; Placements</h1>
          <p className="text-body text-ink-muted mt-1">
            Browse industry openings with automated skill compatibility matching.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface-1 rounded-pill border border-hairline w-fit">
        {[
          { label: 'All Openings', value: '' },
          { label: 'Student Internships', value: 'student_internship' },
          { label: 'Full-Time Jobs', value: 'full_time_job' },
          { label: 'Faculty Immersion / FDP', value: 'faculty_internship' },
          { label: 'Apprenticeships', value: 'apprenticeship' },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/opportunities?type=${tab.value}` : '/opportunities'}
            className="text-button px-4 py-2 rounded-pill transition-colors text-ink-muted hover:text-ink"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities available yet"
          description="Check back later or explore other sections."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp: any) => {
            const industry = Array.isArray(opp.industry) ? opp.industry[0] : opp.industry;
            return (
              <Card key={opp.id} className="flex flex-col justify-between hover:border-hairline transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-micro text-accent-blue font-medium flex items-center gap-1.5 mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {industry?.company_name || 'Industry Partner'}
                      </span>
                      <CardTitle className="text-headline text-ink">{opp.title}</CardTitle>
                    </div>
                    {opp.match_score && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-pill bg-accent-blue/15 text-accent-blue font-bold text-body-sm">
                          <Sparkles className="w-3.5 h-3.5" /> {opp.match_score}% Match
                        </div>
                        <span className="text-[10px] text-ink-muted mt-0.5">Skill Fit</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {opp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-micro text-ink-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {opp.location} {opp.is_remote && '(Remote)'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {opp.stipend_min
                        ? `₹${opp.stipend_min.toLocaleString()} - ₹${opp.stipend_max?.toLocaleString()}/mo`
                        : 'Performance Stipend'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {opp.deadline}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-hairline pt-4 flex justify-between items-center">
                  <Badge variant="muted" className="capitalize">
                    {opp.type?.replace('_', ' ')}
                  </Badge>
                  <Link href={`/opportunities/${opp.id}`}>
                    <Button className="rounded-pill">
                      View &amp; Apply <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
