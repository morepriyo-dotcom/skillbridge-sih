'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOpportunity } from '@/actions/opportunities';
import { Briefcase, Send, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PostOpportunityPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'student_internship' as any,
    description: '',
    location: '',
    isRemote: false,
    stipendMin: 0,
    stipendMax: 0,
    durationMonths: 1,
    minCgpa: 0,
    openingsCount: 1,
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await createOpportunity({
        ...formData,
        requiredSkills: [],
        preferredSkills: [],
        targetDegrees: [],
        targetDepartments: [],
      });

      if (res?.error) {
        setStatus('error');
        setErrorMsg(res.error);
      } else {
        setStatus('success');
        setTimeout(() => router.push('/opportunities'), 2000);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-display-md text-ink font-medium">Post Industry Opportunity</h1>
        <p className="text-body text-ink-muted mt-1">
          Publish internships, apprenticeships, full-time vacancies, or Faculty Development Programs (FDPs).
        </p>
      </div>

      <Card className="p-8">
        {status === 'success' ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-semantic-success mx-auto" />
            <h2 className="text-headline text-ink">Opportunity Published Successfully!</h2>
            <p className="text-body text-ink-muted">
              Students matching your skill prerequisites will receive automated notifications. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-body-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-caption text-ink block mb-1.5">Opportunity Title</label>
              <Input
                placeholder="e.g. Clinical Pharmacology & Pharmacovigilance Associate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-caption text-ink block mb-1.5">Engagement Type</label>
                <select
                  className="w-full p-2.5 bg-surface-1 rounded-md text-ink border border-hairline text-body-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="student_internship">Student Internship</option>
                  <option value="full_time_job">Full-Time Job</option>
                  <option value="faculty_internship">Faculty Industrial Training / FDP</option>
                  <option value="apprenticeship">Apprenticeship</option>
                  <option value="research_consultancy">Research Consultancy</option>
                </select>
              </div>

              <div>
                <label className="text-caption text-ink block mb-1.5">Workplace Location</label>
                <Input
                  placeholder="e.g. New Delhi, AIIA Campus or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-caption text-ink block mb-1.5">Full Job / Internship Description</label>
              <textarea
                className="w-full p-3 bg-surface-1 rounded-md text-ink border border-hairline text-body-sm focus:ring-1 focus:ring-accent-blue/20"
                rows={5}
                placeholder="Detail the project scope, methodologies, lab equipment to be handled, and training milestones..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-caption text-ink block mb-1.5">Min Stipend (₹/mo)</label>
                <Input
                  type="number"
                  value={formData.stipendMin}
                  onChange={(e) => setFormData({ ...formData, stipendMin: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-caption text-ink block mb-1.5">Max Stipend (₹/mo)</label>
                <Input
                  type="number"
                  value={formData.stipendMax}
                  onChange={(e) => setFormData({ ...formData, stipendMax: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-caption text-ink block mb-1.5">Openings Count</label>
                <Input
                  type="number"
                  value={formData.openingsCount}
                  onChange={(e) => setFormData({ ...formData, openingsCount: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-caption text-ink block mb-1.5">Min CGPA Eligibility</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-caption text-ink block mb-1.5">Application Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex justify-end">
              <Button type="submit" className="rounded-pill px-8" disabled={status === 'submitting'}>
                <Send className="w-4 h-4 mr-2" />
                {status === 'submitting' ? 'Publishing...' : 'Publish Opportunity'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
