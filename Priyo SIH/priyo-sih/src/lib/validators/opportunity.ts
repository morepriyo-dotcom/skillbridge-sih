import { z } from "zod";

export const opportunitySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must not exceed 200 characters"),
    type: z.enum([
      "student_internship",
      "faculty_internship",
      "full_time_job",
      "apprenticeship",
      "fdp",
      "research_consultancy",
    ]),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    location: z
      .string()
      .trim()
      .min(2, "Location is required"),
    isRemote: z.boolean().default(false),
    stipendMin: z.number().int().min(0, "Stipend cannot be negative").optional(),
    stipendMax: z.number().int().min(0, "Stipend cannot be negative").optional(),
    durationMonths: z.number().int().min(1, "Duration must be at least 1 month").max(36, "Duration cannot exceed 36 months").optional(),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    minCgpa: z.number().min(0, "CGPA cannot be negative").max(10, "CGPA cannot exceed 10").default(0),
    targetDegrees: z.array(z.string()).default([]),
    targetDepartments: z.array(z.string()).default([]),
    openingsCount: z.number().int().min(1, "Openings count must be at least 1").default(1),
    deadline: z.string().refine((d) => {
      const parsed = new Date(d);
      return !isNaN(parsed.getTime()) && parsed > new Date();
    }, {
      message: "Deadline must be a valid future date",
    }),
  })
  .refine(
    (d) =>
      d.stipendMin === undefined ||
      d.stipendMax === undefined ||
      d.stipendMin <= d.stipendMax,
    {
      message: "Minimum stipend cannot exceed maximum stipend",
      path: ["stipendMax"],
    }
  );

export const applicationSchema = z.object({
  opportunityId: z.string().uuid("Invalid opportunity identifier"),
  coverLetter: z.string().max(2000, "Cover letter must not exceed 2000 characters").optional(),
  resumeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL (e.g. https://drive.google.com/...)")
    .optional()
    .or(z.literal("")),
});

export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
