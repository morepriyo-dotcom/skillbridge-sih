import React from 'react';
import { redirect } from 'next/navigation';
import {
  getAvailableMentors,
  getMyMentorshipSessions,
  getStudentsList,
  getCurrentMentorshipProfile,
} from '@/queries/mentorship';
import MentorshipView from './mentorship-view';

export default async function MentorshipPage() {
  const profileData = await getCurrentMentorshipProfile();

  if (!profileData || !profileData.user) {
    redirect('/login');
  }

  const isAcademician = profileData.user.role === 'academician';

  const [mentors, sessions, students] = await Promise.all([
    getAvailableMentors(),
    getMyMentorshipSessions(),
    isAcademician ? getStudentsList() : Promise.resolve([]),
  ]);

  return (
    <MentorshipView
      currentUser={{
        id: profileData.user.id,
        email: profileData.user.email || '',
        role: profileData.user.role || 'student',
        full_name: (profileData.user as any).full_name || 'User',
      }}
      initialMentors={mentors as any}
      initialSessions={sessions as any}
      students={students}
      academicianDetails={profileData.academicianDetails}
    />
  );
}
