import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Clock, Star, Video, CheckCircle2, MessageSquare } from 'lucide-react';
import { getAvailableMentors, getMyMentorshipSessions } from '@/queries/mentorship';
import { formatDate } from '@/lib/utils';

export default async function MentorshipPage() {
  const [mentors, sessions] = await Promise.all([
    getAvailableMentors(),
    getMyMentorshipSessions(),
  ]);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-display-md text-ink font-medium">Industry Mentorship Program</h1>
        <p className="text-body text-ink-muted mt-1">
          Connect directly with experienced corporate leaders and clinical researchers for 1-on-1 career guidance.
        </p>
      </div>

      {sessions && sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-headline text-ink">My Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session: any) => {
              const mentorName = Array.isArray(session.mentor) ? session.mentor[0]?.full_name : session.mentor?.full_name;
              
              return (
                <Card key={session.id} className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-body font-semibold text-ink">{session.topic}</h3>
                      <p className="text-body-sm text-ink-muted mt-1">Mentor: {mentorName}</p>
                    </div>
                    <Badge variant={session.status === 'scheduled' ? 'accent' : 'muted'} className="capitalize">
                      {session.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-micro text-ink-muted">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(session.scheduled_at)}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-headline text-ink">Available Mentors</h2>
        {mentors && mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((mentor: any) => {
              const mentorName = Array.isArray(mentor.user) ? mentor.user[0]?.full_name : mentor.user?.full_name;
              const instName = Array.isArray(mentor.institution) ? mentor.institution[0]?.name : mentor.institution?.name;

              return (
                <Card key={mentor.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full bg-surface-2 border border-accent-blue/30 flex items-center justify-center text-headline font-bold text-ink">
                        {getInitials(mentorName || '')}
                      </div>
                      <div>
                        <CardTitle className="text-body font-semibold text-ink">{mentorName}</CardTitle>
                        <p className="text-micro text-accent-blue mt-0.5">{mentor.designation}</p>
                        <p className="text-micro text-ink-muted">{instName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-micro text-ink-muted">
                      <span className="flex items-center gap-1 text-ink font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {mentor.rating || 'New'}
                      </span>
                      <span>{mentor.department}</span>
                    </div>
                    <div>
                      <span className="text-micro text-ink-muted block mb-1.5">Focus Areas:</span>
                      <div className="flex flex-wrap gap-1">
                        {mentor.areas_of_expertise?.map((exp: string) => (
                          <span key={exp} className="px-2 py-0.5 rounded bg-surface-2 text-[10px] text-ink-muted">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-hairline pt-4">
                    <Button className="w-full rounded-pill">
                      <Calendar className="w-4 h-4 mr-2" /> Book 1-on-1 Guidance
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-1 rounded-xl border border-hairline">
            <Users className="w-12 h-12 text-ink-muted mb-4 opacity-50" />
            <h3 className="text-headline text-ink">No mentors available</h3>
            <p className="text-body text-ink-muted mt-2">Faculty members who are open for consultancy will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
