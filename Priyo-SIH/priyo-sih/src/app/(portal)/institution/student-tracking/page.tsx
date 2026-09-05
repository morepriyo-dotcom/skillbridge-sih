import { getInstitutionStudents } from "@/queries/institution";
import { StudentTrackingView } from "./student-tracking-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Tracking | Institutional Portal",
  description: "Track student skills, applications, and placement outcomes.",
};

export default async function StudentTrackingPage() {
  const students = await getInstitutionStudents();

  return <StudentTrackingView students={students} />;
}
