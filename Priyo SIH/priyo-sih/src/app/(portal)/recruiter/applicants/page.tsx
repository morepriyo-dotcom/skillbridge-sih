import React from 'react';
import { getAllMyApplicants } from '@/queries/applications';
import RecruiterKanban from './recruiter-kanban';

export default async function RecruiterApplicantsPage() {
  const applicants = await getAllMyApplicants();
  
  return <RecruiterKanban initialApplicants={applicants} />;
}
