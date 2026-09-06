'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Clock,
  Star,
  Video,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/empty-state';
import { formatDate } from '@/lib/utils';
import {
  bookMentorshipSession,
  updateMentorshipStatus,
  toggleConsultancyAvailability,
} from '@/actions/mentorship';

interface MentorItem {
  id: string;
  user_id: string;
  department: string;
  designation: string;
  areas_of_expertise: string[] | null;
  research_interests: string[] | null;
  open_for_consultancy: boolean;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role?: string;
  };
  institution: {
    name: string;
  } | null;
}

interface SessionItem {
  id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
  mentor: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
  mentee: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
}

interface StudentItem {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface MentorshipViewProps {
  currentUser: {
    id: string;
    email: string;
    role: string;
    full_name?: string;
  };
  initialMentors: MentorItem[];
  initialSessions: SessionItem[];
  students: StudentItem[];
  academicianDetails: {
    open_for_consultancy?: boolean;
    department?: string;
    designation?: string;
  } | null;
}

const TOPIC_PRESETS = [
  'Research Project Mentorship',
  'Career & Higher Education Guidance',
  'Skill Development & Assessment Review',
  'Internship & Placement Advisory',
  'Clinical Research & Ayush Innovation',
];

export default function MentorshipView({
  currentUser,
  initialMentors,
  initialSessions,
  students,
  academicianDetails,
}: MentorshipViewProps) {
  const isAcademician = currentUser.role === 'academician';

  const [mentors] = useState<MentorItem[]>(initialMentors);
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'as_mentor' | 'as_mentee'>('all');
  const [mentorSearch, setMentorSearch] = useState('');

  // Consultancy toggle state
  const [isOpenConsultancy, setIsOpenConsultancy] = useState(
    academicianDetails?.open_for_consultancy ?? true
  );
  const [isToggling, setIsToggling] = useState(false);

  // Booking with mentor modal
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorDateTime, setMentorDateTime] = useState('');
  const [mentorDuration, setMentorDuration] = useState('45');
  const [mentorNotes, setMentorNotes] = useState('');
  const [mentorMeetingLink, setMentorMeetingLink] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Schedule student guidance modal (for academician)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [studentTopic, setStudentTopic] = useState('');
  const [studentDateTime, setStudentDateTime] = useState('');
  const [studentDuration, setStudentDuration] = useState('45');
  const [studentNotes, setStudentNotes] = useState('');
  const [studentMeetingLink, setStudentMeetingLink] = useState('');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');

  // Helpers
  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || '??'
    );
  };

  // Get tomorrow's default ISO date for inputs
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  // Open booking modal for a mentor
  const handleOpenBooking = (mentor: MentorItem) => {
    setSelectedMentor(mentor);
    setMentorTopic('Career & Research Guidance');
    setMentorDateTime(getDefaultDateTime());
    setMentorDuration('45');
    setMentorNotes('');
    setMentorMeetingLink(`https://meet.jit.si/skillbridge-${Math.random().toString(36).substring(2, 9)}`);
    setBookingError('');
    setBookingSuccess('');
  };

  // Submit booking with mentor
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setIsSubmittingBooking(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await bookMentorshipSession({
        mentorId: selectedMentor.user_id,
        topic: mentorTopic,
        scheduledAt: new Date(mentorDateTime).toISOString(),
        durationMinutes: parseInt(mentorDuration, 10) || 45,
        notes: mentorNotes,
        meetingLink: mentorMeetingLink,
      });

      if (res.error) {
        setBookingError(res.error);
      } else if (res.data) {
        setBookingSuccess('Guidance session booked successfully!');
        // Optimistically add session to list
        const newSessionItem: SessionItem = {
          id: res.data.id,
          mentor_id: selectedMentor.user_id,
          mentee_id: currentUser.id,
          topic: mentorTopic,
          scheduled_at: new Date(mentorDateTime).toISOString(),
          duration_minutes: parseInt(mentorDuration, 10) || 45,
          status: 'scheduled',
          meeting_link: mentorMeetingLink || null,
          notes: mentorNotes || null,
          rating: null,
          created_at: new Date().toISOString(),
          mentor: {
            id: selectedMentor.user_id,
            full_name: selectedMentor.user?.full_name || 'Mentor',
            email: selectedMentor.user?.email || '',
            avatar_url: selectedMentor.user?.avatar_url || null,
            role: 'academician',
          },
          mentee: {
            id: currentUser.id,
            full_name: currentUser.full_name || 'You',
            email: currentUser.email,
            avatar_url: null,
            role: currentUser.role,
          },
        };

        setSessions((prev) => [newSessionItem, ...prev]);
        setTimeout(() => {
          setSelectedMentor(null);
        }, 1200);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book mentorship session.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Open schedule student guidance modal
  const handleOpenStudentModal = () => {
    setIsStudentModalOpen(true);
    setSelectedStudentId(students[0]?.id || '');
    setStudentTopic('Student Research & Career Guidance');
    setStudentDateTime(getDefaultDateTime());
    setStudentDuration('45');
    setStudentNotes('');
    setStudentMeetingLink(`https://meet.jit.si/skillbridge-${Math.random().toString(36).substring(2, 9)}`);
    setStudentError('');
    setStudentSuccess('');
  };

  // Submit schedule student guidance
  const handleConfirmStudentGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setStudentError('Please select a student.');
      return;
    }

    setIsSubmittingStudent(true);
    setStudentError('');
    setStudentSuccess('');

    try {
      const studentObj = students.find((s) => s.id === selectedStudentId);

      const res = await bookMentorshipSession({
        mentorId: currentUser.id,
        menteeId: selectedStudentId,
        topic: studentTopic,
        scheduledAt: new Date(studentDateTime).toISOString(),
        durationMinutes: parseInt(studentDuration, 10) || 45,
        notes: studentNotes,
        meetingLink: studentMeetingLink,
      });

      if (res.error) {
        setStudentError(res.error);
      } else if (res.data) {
        setStudentSuccess('Guidance session scheduled successfully!');
        const newSessionItem: SessionItem = {
          id: res.data.id,
          mentor_id: currentUser.id,
          mentee_id: selectedStudentId,
          topic: studentTopic,
          scheduled_at: new Date(studentDateTime).toISOString(),
          duration_minutes: parseInt(studentDuration, 10) || 45,
          status: 'scheduled',
          meeting_link: studentMeetingLink || null,
          notes: studentNotes || null,
          rating: null,
          created_at: new Date().toISOString(),
          mentor: {
            id: currentUser.id,
            full_name: currentUser.full_name || 'You',
            email: currentUser.email,
            avatar_url: null,
            role: 'academician',
          },
          mentee: {
            id: selectedStudentId,
            full_name: studentObj?.full_name || 'Student',
            email: studentObj?.email || '',
            avatar_url: studentObj?.avatar_url || null,
            role: 'student',
          },
        };

        setSessions((prev) => [newSessionItem, ...prev]);
        setTimeout(() => {
          setIsStudentModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      setStudentError(err.message || 'Failed to schedule student session.');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Update session status (completed / cancelled)
  const handleUpdateStatus = async (
    sessionId: string,
    status: 'completed' | 'cancelled'
  ) => {
    const prevSessions = [...sessions];
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status } : s))
    );

    try {
      const res = await updateMentorshipStatus(sessionId, status);
      if (res.error) {
        setSessions(prevSessions);
        alert(res.error);
      }
    } catch (err: any) {
      setSessions(prevSessions);
      alert(err.message || 'Failed to update session.');
    }
  };

  // Toggle consultancy availability
  const handleToggleConsultancy = async () => {
    const nextState = !isOpenConsultancy;
    setIsToggling(true);
    setIsOpenConsultancy(nextState);

    try {
      const res = await toggleConsultancyAvailability(nextState);
      if (res.error) {
        setIsOpenConsultancy(!nextState);
        alert(res.error);
      }
    } catch {
      setIsOpenConsultancy(!nextState);
    } finally {
      setIsToggling(false);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (sessionFilter === 'as_mentor') {
      return session.mentor_id === currentUser.id;
    }
    if (sessionFilter === 'as_mentee') {
      return session.mentee_id === currentUser.id;
    }
    return true;
  });

  // Filter mentors
  const filteredMentors = mentors.filter((m) => {
    const name = m.user?.full_name?.toLowerCase() || '';
    const dept = m.department?.toLowerCase() || '';
    const q = mentorSearch.toLowerCase().trim();
    if (!q) return true;
    const areas = m.areas_of_expertise?.join(' ').toLowerCase() || '';
    return name.includes(q) || dept.includes(q) || areas.includes(q);
  });

  const asMentorCount = sessions.filter((s) => s.mentor_id === currentUser.id).length;
  const asMenteeCount = sessions.filter((s) => s.mentee_id === currentUser.id).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md text-ink font-medium">
            {isAcademician ? 'Student & Peer Mentorship' : 'Industry & Academic Mentorship'}
          </h1>
          <p className="text-body text-ink-muted mt-1">
            {isAcademician
              ? 'Guide students through 1-on-1 career & research mentorship, and connect with faculty peers.'
              : 'Connect directly with experienced corporate leaders and clinical researchers for 1-on-1 guidance.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAcademician && (
            <>
              <button
                type="button"
                onClick={handleToggleConsultancy}
                disabled={isToggling}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isOpenConsultancy
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-surface-2 text-ink-muted border-hairline hover:text-ink'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpenConsultancy ? 'bg-emerald-400 animate-pulse' : 'bg-ink-muted'
                  }`}
                />
                {isOpenConsultancy ? 'Available for Guidance' : 'Mentorship Offline'}
              </button>

              <Button
                className="rounded-pill bg-accent-blue text-white hover:opacity-90 shadow-sm"
                onClick={handleOpenStudentModal}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Schedule Student Guidance
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Guidance Sessions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-headline text-ink">My Guidance Sessions</h2>
            <Badge variant="accent" className="text-xs">
              {sessions.length}
            </Badge>
          </div>

          {isAcademician && sessions.length > 0 && (
            <div className="flex items-center gap-1 bg-surface-1 p-1 rounded-pill border border-hairline text-xs">
              <button
                type="button"
                onClick={() => setSessionFilter('all')}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  sessionFilter === 'all'
                    ? 'bg-ink text-canvas font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                All ({sessions.length})
              </button>
              <button
                type="button"
                onClick={() => setSessionFilter('as_mentor')}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  sessionFilter === 'as_mentor'
                    ? 'bg-ink text-canvas font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Guiding Students ({asMentorCount})
              </button>
              <button
                type="button"
                onClick={() => setSessionFilter('as_mentee')}
                className={`px-3 py-1 rounded-pill font-medium transition-colors ${
                  sessionFilter === 'as_mentee'
                    ? 'bg-ink text-canvas font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                My Mentors ({asMenteeCount})
              </button>
            </div>
          )}
        </div>

        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => {
              const isMentorForSession = session.mentor_id === currentUser.id;
              const otherUser = isMentorForSession ? session.mentee : session.mentor;
              const otherRoleLabel = isMentorForSession ? 'Student / Mentee' : 'Mentor';

              return (
                <Card
                  key={session.id}
                  className="p-5 bg-surface-1 border-hairline flex flex-col justify-between hover:border-hairline-soft transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-micro font-bold uppercase tracking-wider ${
                              isMentorForSession
                                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                                : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {isMentorForSession ? 'Guiding Student' : 'Guided by Mentor'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-micro font-semibold capitalize ${
                              session.status === 'scheduled'
                                ? 'bg-blue-500/10 text-blue-400'
                                : session.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-surface-2 text-ink-muted'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <h3 className="text-body font-semibold text-ink mt-2">
                          {session.topic}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2/60 border border-hairline">
                      <div className="w-8 h-8 rounded-full bg-surface-1 flex items-center justify-center font-bold text-xs text-ink shrink-0">
                        {getInitials(otherUser?.full_name || 'User')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-caption font-medium text-ink truncate">
                          {otherUser?.full_name || 'Participant'}
                        </p>
                        <p className="text-micro text-ink-muted truncate">
                          {otherRoleLabel} · {otherUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-micro text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                        {formatDate(session.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ink-muted" />
                        {session.duration_minutes || 45} mins
                      </span>
                    </div>

                    {session.notes && (
                      <p className="text-micro text-ink-muted bg-canvas p-2.5 rounded-md border border-hairline">
                        <span className="font-medium text-ink block mb-0.5">Notes / Agenda:</span>
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between gap-2 flex-wrap">
                    {session.meeting_link && session.status === 'scheduled' ? (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-pill bg-accent-blue text-white hover:opacity-90"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Video Call
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    ) : (
                      <div />
                    )}

                    {session.status === 'scheduled' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-pill text-micro text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 h-7 px-2.5"
                          onClick={() => handleUpdateStatus(session.id, 'completed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-pill text-micro text-semantic-error hover:bg-semantic-error/10 h-7 px-2.5"
                          onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-1 rounded-xl border border-hairline space-y-3">
            <Calendar className="w-10 h-10 text-ink-muted mx-auto opacity-50" />
            <p className="text-body font-medium text-ink">No guidance sessions scheduled</p>
            <p className="text-caption text-ink-muted max-w-md mx-auto">
              {isAcademician
                ? 'You can schedule a 1-on-1 session with a student using the button above, or book guidance with faculty peers below.'
                : 'Browse available faculty and corporate mentors below to book your first 1-on-1 guidance session.'}
            </p>
          </div>
        )}
      </div>

      {/* Available Mentors Directory */}
      <div className="space-y-4 pt-4 border-t border-hairline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline text-ink">Available Faculty & Industry Mentors</h2>
            <p className="text-body-sm text-ink-muted">
              Discover verified mentors offering 1-on-1 academic guidance, career roadmaps, and research consulting.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mentors..."
              value={mentorSearch}
              onChange={(e) => setMentorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-1 border border-hairline rounded-pill text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent-blue"
            />
          </div>
        </div>

        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => {
              const mentorName = mentor.user?.full_name || 'Academic Mentor';
              const instName = mentor.institution?.name || 'Academic Institution';
              const isSelf = mentor.user_id === currentUser.id;

              return (
                <Card
                  key={mentor.id}
                  className="flex flex-col justify-between bg-surface-1 border-hairline hover:border-accent-blue/40 transition-all rounded-xl p-5"
                >
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-full bg-surface-2 border border-accent-blue/30 flex items-center justify-center text-body font-bold text-ink shrink-0">
                        {getInitials(mentorName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CardTitle className="text-body-sm font-semibold text-ink truncate">
                            {mentorName}
                          </CardTitle>
                          {isSelf && (
                            <span className="px-2 py-0.2 rounded-full bg-accent-blue/15 text-accent-blue text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-micro text-accent-blue mt-0.5 truncate">
                          {mentor.designation || 'Faculty Member'}
                        </p>
                        <p className="text-micro text-ink-muted truncate">{instName}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-4 text-micro text-ink-muted">
                      <span className="flex items-center gap-1 text-ink font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9
                      </span>
                      <span className="truncate">{mentor.department || 'Department'}</span>
                    </div>

                    {mentor.areas_of_expertise && mentor.areas_of_expertise.length > 0 && (
                      <div>
                        <span className="text-micro text-ink-muted block mb-1">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1">
                          {mentor.areas_of_expertise.map((exp: string) => (
                            <span
                              key={exp}
                              className="px-2 py-0.5 rounded bg-surface-2 text-[10px] text-ink-muted"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t border-hairline pt-4 mt-4 p-0">
                    {isSelf ? (
                      <div className="w-full text-center py-2 text-micro text-ink-muted bg-surface-2 rounded-pill font-medium">
                        Your Mentorship Profile
                      </div>
                    ) : (
                      <Button
                        className="w-full rounded-pill bg-ink text-canvas hover:opacity-90 font-medium"
                        onClick={() => handleOpenBooking(mentor)}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Book 1-on-1 Guidance
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No mentors found"
            description={
              mentorSearch
                ? 'No faculty mentors matched your search query.'
                : 'Faculty members who are open for consultancy will appear here.'
            }
          />
        )}
      </div>

      {/* Modal: Book 1-on-1 Guidance with Mentor */}
      <Dialog
        isOpen={Boolean(selectedMentor)}
        onClose={() => setSelectedMentor(null)}
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-blue" />
            <span>Book 1-on-1 Guidance</span>
          </div>
        }
        description={
          selectedMentor
            ? `Schedule a 1-on-1 consultation session with ${selectedMentor.user?.full_name || 'Mentor'} (${selectedMentor.department}).`
            : undefined
        }
      >
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          {bookingError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          {/* Quick preset chips */}
          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Guidance Topic / Objective
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {TOPIC_PRESETS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setMentorTopic(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    mentorTopic === t
                      ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/40 font-semibold'
                      : 'bg-surface-2 text-ink-muted border-hairline hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input
              value={mentorTopic}
              onChange={(e) => setMentorTopic(e.target.value)}
              placeholder="e.g. Research Paper Review or Career Guidance"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-body-sm font-medium text-ink block mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={mentorDateTime}
                onChange={(e) => setMentorDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full bg-surface-1 text-ink border border-hairline rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink block mb-1.5">
                Duration
              </label>
              <select
                value={mentorDuration}
                onChange={(e) => setMentorDuration(e.target.value)}
                className="w-full bg-surface-1 text-ink border border-hairline rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-accent-blue"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Virtual Meeting Link (Auto-Generated)
            </label>
            <Input
              value={mentorMeetingLink}
              onChange={(e) => setMentorMeetingLink(e.target.value)}
              placeholder="https://meet.jit.si/..."
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Agenda & Notes for Mentor
            </label>
            <Textarea
              value={mentorNotes}
              onChange={(e) => setMentorNotes(e.target.value)}
              placeholder="Outline specific questions, current research goals, or topics you want to cover..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-hairline">
            <Button
              type="button"
              variant="secondary"
              className="rounded-pill"
              onClick={() => setSelectedMentor(null)}
              disabled={isSubmittingBooking}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-pill bg-accent-blue text-white hover:opacity-90"
              disabled={isSubmittingBooking}
            >
              {isSubmittingBooking ? 'Booking...' : 'Confirm Guidance Booking'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Schedule Student Guidance (for Academician) */}
      <Dialog
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent-blue" />
            <span>Schedule 1-on-1 Student Guidance</span>
          </div>
        }
        description="Select a student to schedule personalized mentoring, project feedback, or career advisory."
      >
        <form onSubmit={handleConfirmStudentGuidance} className="space-y-4">
          {studentError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{studentError}</span>
            </div>
          )}

          {studentSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{studentSuccess}</span>
            </div>
          )}

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Select Student
            </label>
            {students.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-surface-1 text-ink border border-hairline rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-accent-blue"
                required
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name} ({st.email})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-caption text-ink-muted">No students registered yet.</p>
            )}
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Guidance Subject / Focus
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'Project Review & Guidance',
                'Internship Preparation',
                'Academic Assessment Advisory',
                'Research Grant & Paper Writing',
              ].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setStudentTopic(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    studentTopic === t
                      ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/40 font-semibold'
                      : 'bg-surface-2 text-ink-muted border-hairline hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input
              value={studentTopic}
              onChange={(e) => setStudentTopic(e.target.value)}
              placeholder="e.g. Major Project Review & Thesis Structure"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-body-sm font-medium text-ink block mb-1.5">
                Session Date & Time
              </label>
              <input
                type="datetime-local"
                value={studentDateTime}
                onChange={(e) => setStudentDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full bg-surface-1 text-ink border border-hairline rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-accent-blue"
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink block mb-1.5">
                Duration
              </label>
              <select
                value={studentDuration}
                onChange={(e) => setStudentDuration(e.target.value)}
                className="w-full bg-surface-1 text-ink border border-hairline rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-accent-blue"
              >
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Virtual Meeting Link
            </label>
            <Input
              value={studentMeetingLink}
              onChange={(e) => setStudentMeetingLink(e.target.value)}
              placeholder="https://meet.jit.si/..."
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink block mb-1.5">
              Preparation Instructions for Student
            </label>
            <Textarea
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Share pre-reading materials, project deliverables to bring, or meeting focus..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-hairline">
            <Button
              type="button"
              variant="secondary"
              className="rounded-pill"
              onClick={() => setIsStudentModalOpen(false)}
              disabled={isSubmittingStudent}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-pill bg-accent-blue text-white hover:opacity-90"
              disabled={isSubmittingStudent}
            >
              {isSubmittingStudent ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
