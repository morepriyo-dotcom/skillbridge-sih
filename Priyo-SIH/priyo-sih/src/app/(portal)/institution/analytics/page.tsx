import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Download, CheckCircle2, BarChart3 } from 'lucide-react';
import { getInstitutionAnalytics } from '@/queries/analytics';

export default async function InstitutionAnalyticsPage() {
  const analytics = await getInstitutionAnalytics();

  const {
    totalStudents = 0,
    placedStudents = 0,
    activeOpportunities = 0,
    placementRate = 0,
    skillAssessmentRate = 0,
    departments = [],
  } = analytics || {};

  const noData = totalStudents === 0 && activeOpportunities === 0 && departments.length === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">Institutional Analytics &amp; NAAC / NIRF Reports</h1>
          <p className="text-body text-ink-muted mt-1">
            Real-time batch skill readiness, internship participation rates, and recruitment outcomes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-pill">
            <Download className="w-4 h-4 mr-2" /> Export NAAC Metric 5.2
          </Button>
          <Button className="rounded-pill">
            <Download className="w-4 h-4 mr-2" /> Download NIRF Placement Report
          </Button>
        </div>
      </div>

      {noData ? (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Yet"
          description="Once students enroll and recruiters post opportunities, analytics data will appear here."
        />
      ) : (
        <>
          {/* High-Level Key Performance Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            {[
              { label: 'Total Enrolled Students', value: totalStudents },
              { label: 'Placed Students', value: placedStudents },
              { label: 'Active Opportunities', value: activeOpportunities },
              { label: 'Placement Rate', value: `${placementRate.toFixed(1)}%` },
              { label: 'Skill Assessment Rate', value: `${skillAssessmentRate.toFixed(1)}%` },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5 bg-surface-1">
                <span className="text-micro text-ink-muted">{kpi.label}</span>
                <div className="text-display-md text-ink font-bold mt-1">{kpi.value}</div>
              </Card>
            ))}
          </div>

          {/* Department-wise Placement Readiness Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-headline">Department Breakdown</CardTitle>
                  <CardDescription>Comparative cohort performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-center py-6 text-ink-muted">No department data available.</div>
              ) : (
                <div className="space-y-6">
                  {departments.map((d: any) => {
                    const progress = d.avgCgpa ? (d.avgCgpa * 10) : 0;
                    return (
                      <div key={d.department} className="space-y-2">
                        <div className="flex justify-between items-center text-body-sm">
                          <div>
                            <strong className="text-ink">{d.department}</strong>
                            <span className="text-micro text-ink-muted ml-2">
                              ({d.totalStudents} Students)
                            </span>
                          </div>
                          <span className="font-bold text-accent-blue">Avg CGPA: {d.avgCgpa?.toFixed(2) || 'N/A'}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-surface-2 rounded-pill overflow-hidden border border-hairline">
                          <div
                            className="h-full bg-accent-blue rounded-pill transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Accreditation Compliance Ready Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-hairline">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-headline flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-semantic-success" /> NAAC Metric 5.2.1 Compliance
            </CardTitle>
            <CardDescription>
              Percentage of placement of outgoing students and progression to higher education
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-3 text-body-sm text-ink-muted">
            <p>
              Automated data pipeline captures student offer letters, verified appointment orders, and higher study admissions with verifiable digital signatures.
            </p>
            <div className="p-3 bg-surface-2 rounded-md border border-hairline flex justify-between items-center text-micro">
              <span>Status: Data Pipeline Active</span>
              <Badge variant="success">Documented</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 border-hairline">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-headline flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent-blue" /> NIRF Parameter — Graduation Outcomes (GO)
            </CardTitle>
            <CardDescription>
              Metric for combined percentage for placement and higher studies (GPH)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-3 text-body-sm text-ink-muted">
            <p>
              Calculates metrics across all registered recruiters. Compliant with National Institutional Ranking Framework data standards.
            </p>
            <div className="p-3 bg-surface-2 rounded-md border border-hairline flex justify-between items-center text-micro">
              <span>Status: Tracking Live Data</span>
              <Badge variant="accent">Compliant</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
