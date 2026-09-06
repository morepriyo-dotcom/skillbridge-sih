import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Check if assessments already exist
  const { data: existing, error: countErr } = await admin
    .from("assessments")
    .select("id, title");

  if (countErr) {
    console.error("Error checking assessments:", countErr);
    return;
  }

  console.log("Current assessments count:", existing?.length);

  // Find an admin, recruiter, or academician profile for created_by
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["recruiter", "academician", "institution_admin"])
    .limit(5);

  console.log("Found creator candidates:", profiles);
  const creatorId = profiles?.[0]?.id || null;

  // Let's seed 3 comprehensive assessments
  const sampleAssessments = [
    {
      title: "Ayush Clinical Research Standards & GCP Guidelines",
      description: "Evaluate your understanding of Good Clinical Practice (GCP) guidelines in Ayush integrative medicine, patient consent ethics, and trial documentation protocols.",
      category: "Clinical Research",
      sector: "Ayush & Healthcare",
      duration_minutes: 25,
      passing_score: 60,
      total_marks: 30,
      is_published: true,
      created_by: creatorId,
      questions: [
        {
          question_text: "According to Good Clinical Practice (GCP) guidelines, which document must be obtained prior to any study-related procedure?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "Informed Consent Form (ICF) signed by participant or legal guardian", is_correct: true },
            { id: "opt_2", text: "Commercial Manufacturing License", is_correct: false },
            { id: "opt_3", text: "Post-marketing surveillance report", is_correct: false },
            { id: "opt_4", text: "Laboratory accreditation certificate only", is_correct: false }
          ]
        },
        {
          question_text: "What is the primary role of an Institutional Ethics Committee (IEC) in Ayush clinical trials?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "To maximize sponsor commercial profits", is_correct: false },
            { id: "opt_2", text: "To safeguard rights, safety, and well-being of trial participants", is_correct: true },
            { id: "opt_3", text: "To formulate marketing pricing for the investigational medicine", is_correct: false },
            { id: "opt_4", text: "To replace the primary investigator in trial execution", is_correct: false }
          ]
        },
        {
          question_text: "In herbal drug standardization, what does HPTLC finger-printing primarily verify?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "Chemical profile identity and phytochemical marker consistency", is_correct: true },
            { id: "opt_2", text: "Total packaging compressive strength", is_correct: false },
            { id: "opt_3", text: "Taste and aromatic sensory acceptance", is_correct: false },
            { id: "opt_4", text: "Radioactive isotope half-life", is_correct: false }
          ]
        },
        {
          question_text: "Under pharmacovigilance guidelines for Ayush interventions, a Serious Adverse Event (SAE) must typically be reported within what timeframe?",
          marks: 5,
          difficulty: "hard",
          options: [
            { id: "opt_1", text: "Within 24 hours of occurrence/knowledge", is_correct: true },
            { id: "opt_2", text: "Within 90 days after trial completion", is_correct: false },
            { id: "opt_3", text: "Only during annual licensing renewal", is_correct: false },
            { id: "opt_4", text: "Reporting is optional for traditional remedies", is_correct: false }
          ]
        },
        {
          question_text: "Which pharmacokinetic parameter represents the extent and rate at which the active moiety is absorbed and becomes available at site of action?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "Bioavailability", is_correct: true },
            { id: "opt_2", text: "Volume of distribution", is_correct: false },
            { id: "opt_3", text: "Renal clearance threshold", is_correct: false },
            { id: "opt_4", text: "Protein dissociation constant", is_correct: false }
          ]
        },
        {
          question_text: "Which of the following bodies is the central statutory body for regulatory standards of Ayush education and practice in India?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "NCISM / NCH under Ministry of Ayush", is_correct: true },
            { id: "opt_2", text: "Telecom Regulatory Authority", is_correct: false },
            { id: "opt_3", text: "National Highway Authority", is_correct: false },
            { id: "opt_4", text: "Central Board of Film Certification", is_correct: false }
          ]
        }
      ]
    },
    {
      title: "Modern Web Architecture with Next.js, React & TypeScript",
      description: "Assess core competencies in Next.js App Router, Server Components vs Client Components, State Management, and TypeScript type safety.",
      category: "Full Stack Development",
      sector: "Information Technology",
      duration_minutes: 20,
      passing_score: 70,
      total_marks: 25,
      is_published: true,
      created_by: creatorId,
      questions: [
        {
          question_text: "In Next.js App Router, what is the default rendering behavior of components inside the app directory?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "React Server Components (RSC)", is_correct: true },
            { id: "opt_2", text: "Client Components with 'use client'", is_correct: false },
            { id: "opt_3", text: "Static HTML pages without React runtime", is_correct: false },
            { id: "opt_4", text: "Web Workers running in service workers", is_correct: false }
          ]
        },
        {
          question_text: "Which directive must be placed at the top of a file to allow hooks like useState and useEffect in Next.js?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "'use client'", is_correct: true },
            { id: "opt_2", text: "'use server'", is_correct: false },
            { id: "opt_3", text: "'use state'", is_correct: false },
            { id: "opt_4", text: "'enable hooks'", is_correct: false }
          ]
        },
        {
          question_text: "What is the primary advantage of Next.js Server Actions?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "They execute asynchronously on the server without needing manual API route boilerplate", is_correct: true },
            { id: "opt_2", text: "They completely bypass browser network requests", is_correct: false },
            { id: "opt_3", text: "They run client-side JavaScript on the user GPU", is_correct: false },
            { id: "opt_4", text: "They can only be called from mobile apps", is_correct: false }
          ]
        },
        {
          question_text: "In TypeScript, which utility type constructs a type with all properties of T set to optional?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "Partial<T>", is_correct: true },
            { id: "opt_2", text: "Required<T>", is_correct: false },
            { id: "opt_3", text: "Readonly<T>", is_correct: false },
            { id: "opt_4", text: "Pick<T, K>", is_correct: false }
          ]
        },
        {
          question_text: "How do you invalidate cached data in Next.js after mutating database records?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "Call revalidatePath('/path') or revalidateTag('tag')", is_correct: true },
            { id: "opt_2", text: "window.location.reload() inside server components", is_correct: false },
            { id: "opt_3", text: "Delete local storage keys in server actions", is_correct: false },
            { id: "opt_4", text: "Restart the node server daemon", is_correct: false }
          ]
        }
      ]
    },
    {
      title: "Ayurvedic Formulations & Pharmacognosy Fundamentals",
      description: "Test your mastery over classical Ayurvedic dosage forms (Kalpana), shelf life regulations, and raw material authentication.",
      category: "Ayurveda & Pharmacognosy",
      sector: "Ayush",
      duration_minutes: 20,
      passing_score: 60,
      total_marks: 20,
      is_published: true,
      created_by: creatorId,
      questions: [
        {
          question_text: "Which of the following classical Ayurvedic formulations contains self-generated alcohol (Sandhana Kalpana)?",
          marks: 5,
          difficulty: "easy",
          options: [
            { id: "opt_1", text: "Asava and Arishta", is_correct: true },
            { id: "opt_2", text: "Vati and Gutika", is_correct: false },
            { id: "opt_3", text: "Churna and Kwatha", is_correct: false },
            { id: "opt_4", text: "Taila and Ghrita", is_correct: false }
          ]
        },
        {
          question_text: "What is the primary ratio of plant drug to water used in classical Kwatha (decoction) preparation?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "1 part coarse powder : 16 parts water reduced to 1/4th", is_correct: true },
            { id: "opt_2", text: "1 part coarse powder : 2 parts water reduced to 1/2", is_correct: false },
            { id: "opt_3", text: "1 part coarse powder : 100 parts water reduced to 1/10th", is_correct: false },
            { id: "opt_4", text: "Equal parts drug and water without boiling", is_correct: false }
          ]
        },
        {
          question_text: "In Panchavidha Kashaya Kalpana (five basic dosage forms), which has the highest potency (guru)?",
          marks: 5,
          difficulty: "medium",
          options: [
            { id: "opt_1", text: "Swarasa (fresh expressed juice)", is_correct: true },
            { id: "opt_2", text: "Phanta (hot infusion)", is_correct: false },
            { id: "opt_3", text: "Hima (cold infusion)", is_correct: false },
            { id: "opt_4", text: "Kwatha (decoction)", is_correct: false }
          ]
        },
        {
          question_text: "Under Rule 161B of the Drugs and Cosmetics Rules, what is mandatory on the label of Ayurvedic proprietary medicines?",
          marks: 5,
          difficulty: "hard",
          options: [
            { id: "opt_1", text: "Complete list of active ingredients, date of manufacture, expiry date, and batch number", is_correct: true },
            { id: "opt_2", text: "Only retail sales price without ingredients", is_correct: false },
            { id: "opt_3", text: "Celebrity endorsement disclaimer", is_correct: false },
            { id: "opt_4", text: "Patent registration certificate number only", is_correct: false }
          ]
        }
      ]
    }
  ];

  for (const item of sampleAssessments) {
    const { questions, ...assessmentData } = item;
    const { data: inserted, error: insErr } = await admin
      .from("assessments")
      .insert(assessmentData)
      .select("id, title")
      .single();

    if (insErr) {
      console.error(`Error inserting ${item.title}:`, insErr.message);
      continue;
    }

    console.log(`Inserted assessment: ${inserted.title} (${inserted.id})`);

    const qRows = questions.map((q, idx) => ({
      assessment_id: inserted.id,
      question_text: q.question_text,
      question_type: "mcq",
      options: q.options,
      marks: q.marks,
      difficulty: q.difficulty,
      sort_order: idx + 1,
    }));

    const { error: qErr } = await admin
      .from("assessment_questions")
      .insert(qRows);

    if (qErr) {
      console.error(`Error inserting questions for ${inserted.title}:`, qErr.message);
    } else {
      console.log(`Inserted ${qRows.length} questions for ${inserted.title}`);
    }
  }

  console.log("Seeding complete!");
}

seed();
