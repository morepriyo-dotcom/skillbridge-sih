import Link from "next/link";
import { GraduationCap, PlusCircle } from "lucide-react";
import { getMyOpportunities } from "@/queries/opportunities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const trainingTypes = new Set(["fdp", "faculty_internship", "apprenticeship"]);

export default async function TrainingProgramsPage() {
  const programs = (await getMyOpportunities()).filter((program) => trainingTypes.has(program.type));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-md font-medium text-ink">Training Programs</h1>
          <p className="mt-1 text-body text-ink-muted">Manage faculty development, apprenticeship, and industry training programs.</p>
        </div>
        <Link href="/recruiter/post-opportunity"><Button className="rounded-pill"><PlusCircle className="mr-2 h-4 w-4" />Create program</Button></Link>
      </div>
      {programs.length === 0 ? (
        <Card className="py-14 text-center"><CardContent className="space-y-3"><GraduationCap className="mx-auto h-12 w-12 text-ink-muted" /><CardTitle>No training programs yet</CardTitle><CardDescription>Create an FDP, faculty internship, or apprenticeship to start receiving applications.</CardDescription></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle>{program.title}</CardTitle>
                <CardDescription className="capitalize">{program.type.replaceAll("_", " ")} · {program.status}</CardDescription>
              </CardHeader>
              <CardContent className="text-body-sm text-ink-muted">
                Deadline: {program.deadline || "Not set"} · {program.openings_count} opening{program.openings_count === 1 ? "" : "s"}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
