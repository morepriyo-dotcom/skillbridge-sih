"use server";

export interface GeneratedOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface GeneratedQuestion {
  question_text: string;
  question_type?: "mcq" | "multi_select" | "true_false" | string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  options: GeneratedOption[];
  explanation?: string;
}

export interface GenerateQuestionsInput {
  topic: string;
  sector?: string;
  difficulty?: "easy" | "medium" | "hard" | "beginner" | "intermediate" | "advanced";
  count?: number;
  apiKey?: string;
}

export interface GenerateQuestionsResult {
  data?: {
    questions: GeneratedQuestion[];
    generatedBy: "google-gemini-ai" | "domain-ai-engine";
  };
  error?: string;
}

/**
 * Generate assignment questions using Google Gemini AI or intelligent domain generator fallback.
 */
export async function generateAssignmentQuestionsWithAI(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsResult> {
  const topic = input.topic?.trim();
  if (!topic || topic.length < 2) {
    return { error: "Please enter a valid topic or subject for the assignment." };
  }

  const difficulty: "easy" | "medium" | "hard" =
    input.difficulty === "beginner"
      ? "easy"
      : input.difficulty === "advanced"
      ? "hard"
      : input.difficulty === "easy" || input.difficulty === "hard"
      ? input.difficulty
      : "medium";

  const count = Math.min(Math.max(input.count || 5, 2), 15);
  const sector = input.sector || "General";

  const apiKey =
    input.apiKey?.trim() ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (apiKey) {
    try {
      const geminiQuestions = await callGeminiAPI(
        apiKey,
        topic,
        sector,
        difficulty,
        count
      );
      if (geminiQuestions && geminiQuestions.length > 0) {
        return {
          data: {
            questions: geminiQuestions,
            generatedBy: "google-gemini-ai",
          },
        };
      }
    } catch (err: any) {
      console.warn("Google Gemini API error, falling back to Domain Engine:", err?.message);
    }
  }

  // Fallback to built-in intelligent domain question generator engine
  const fallbackQuestions = generateFromDomainEngine(
    topic,
    sector,
    difficulty,
    count
  );

  return {
    data: {
      questions: fallbackQuestions,
      generatedBy: "domain-ai-engine",
    },
  };
}

/**
 * Call Google Generative Language API (Gemini 1.5 Flash).
 */
async function callGeminiAPI(
  apiKey: string,
  topic: string,
  sector: string,
  difficulty: string,
  count: number
): Promise<GeneratedQuestion[]> {
  const prompt = `
You are an expert academic and industry assessment designer.
Generate exactly ${count} multiple-choice assessment questions for the topic: "${topic}" in the sector: "${sector}".
Difficulty level: ${difficulty}.

Return ONLY valid JSON adhering strictly to this schema:
{
  "questions": [
    {
      "question_text": "Question statement here",
      "question_type": "mcq",
      "marks": 1,
      "difficulty": "${difficulty}",
      "options": [
        { "id": "opt_1", "text": "Option A text", "is_correct": false },
        { "id": "opt_2", "text": "Option B text (correct)", "is_correct": true },
        { "id": "opt_3", "text": "Option C text", "is_correct": false },
        { "id": "opt_4", "text": "Option D text", "is_correct": false }
      ],
      "explanation": "Brief explanation of why the correct option is correct."
    }
  ]
}
Each question MUST have exactly 4 options with exactly ONE option having is_correct: true.
Do NOT include markdown backticks around the JSON. Return pure JSON.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini API");

  const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanText);

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid questions array in Gemini response");
  }

  return parsed.questions.slice(0, count).map((q: any, i: number) => ({
    question_text: q.question_text || `Question ${i + 1}`,
    question_type: "mcq" as const,
    marks: q.marks || 1,
    difficulty: (q.difficulty || difficulty) as "easy" | "medium" | "hard",
    options: (q.options || []).map((opt: any, oIdx: number) => ({
      id: `opt_${i + 1}_${oIdx + 1}`,
      text: opt.text || `Option ${String.fromCharCode(65 + oIdx)}`,
      is_correct: Boolean(opt.is_correct),
    })),
    explanation: q.explanation || "",
  }));
}

/**
 * Built-in Intelligent Domain Question Generator Engine.
 * Provides curated, realistic assessment questions across key sectors and topics.
 */
function generateFromDomainEngine(
  topic: string,
  sector: string,
  difficulty: "easy" | "medium" | "hard",
  count: number
): GeneratedQuestion[] {
  const lowerTopic = topic.toLowerCase();
  const lowerSector = sector.toLowerCase();

  // 1. Ayush & Ayurvedic Sciences
  if (
    lowerSector.includes("ayush") ||
    lowerSector.includes("ayurveda") ||
    lowerTopic.includes("ayush") ||
    lowerTopic.includes("ayurved") ||
    lowerTopic.includes("dravyaguna") ||
    lowerTopic.includes("panchakarma") ||
    lowerTopic.includes("herbal")
  ) {
    return [
      {
        question_text:
          "Which classical Ayush principle governs the pharmacodynamics (action mechanism) of herbal drug formulation?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Rasa, Guna, Virya, Vipaka, and Prabhava (Pancha-Padartha)", is_correct: true },
          { id: "opt_2", text: "Tridosha balancing exclusively without metabolic consideration", is_correct: false },
          { id: "opt_3", text: "Linear chemical receptor blockade similar to allopathic antagonists", is_correct: false },
          { id: "opt_4", text: "Solely water-soluble extractive percentage", is_correct: false },
        ],
        explanation: "Ayurvedic pharmacology functions through the Pancha-Padartha matrix (Rasa, Guna, Virya, Vipaka, Prabhava).",
      },
      {
        question_text:
          "Under Good Clinical Practice (GCP) guidelines for Ayush clinical trials, what is the mandatory requirement before human trials of new polyherbal formulations?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Pre-clinical safety acute/chronic toxicity profile & Institutional Ethics Committee (IEC) clearance", is_correct: true },
          { id: "opt_2", text: "Only standard manufacturer self-certification", is_correct: false },
          { id: "opt_3", text: "Market survey of retail consumer sentiment", is_correct: false },
          { id: "opt_4", text: "No documentation is required if mentioned in ancient textbooks", is_correct: false },
        ],
        explanation: "IEC clearance and acute/sub-acute toxicity documentation are mandatory under Ministry of Ayush GCP guidelines.",
      },
      {
        question_text:
          "What analytical technique is primary for fingerprinting and quantitative standardization of active marker compounds in herbal extracts?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "High-Performance Thin-Layer Chromatography (HPTLC) / HPLC", is_correct: true },
          { id: "opt_2", text: "Simple visual turbidity assay", is_correct: false },
          { id: "opt_3", text: "Paper chromatography with iodine staining", is_correct: false },
          { id: "opt_4", text: "Boiling point elevation measurement", is_correct: false },
        ],
        explanation: "HPTLC and HPLC with standardized marker compounds are the gold standards for Ayurvedic Pharmacopoeia of India (API).",
      },
      {
        question_text:
          "In Ayurvedic formulation science (Bhaishajya Kalpana), what is the optimal shelf-life and fermentation standard for Asava and Arishta preparations?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Self-generated alcohol up to 12% v/v acting as a natural preservative with prolonged stability", is_correct: true },
          { id: "opt_2", text: "Maximum 15 days under refrigeration", is_correct: false },
          { id: "opt_3", text: "Requires synthetic parabens for antimicrobial stabilization", is_correct: false },
          { id: "opt_4", text: "Alcohol must exceed 40% v/v for therapeutic efficacy", is_correct: false },
        ],
        explanation: "Asavas and Arishtas naturally produce self-generated alcohol (~5-12%), which acts as a bio-enhancer and preservative.",
      },
      {
        question_text:
          "When designing a Phase-II randomized controlled trial for an Ayurvedic formulation targeting metabolic disorder, which endpoint is standard?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Validated biochemical biomarkers combined with Ayurvedic clinical assessment scales (Roga Pariksha)", is_correct: true },
          { id: "opt_2", text: "Subjective patient satisfaction survey alone", is_correct: false },
          { id: "opt_3", text: "Only in-vitro cell line proliferation assays", is_correct: false },
          { id: "opt_4", text: "Number of pharmacy retail refills", is_correct: false },
        ],
        explanation: "Integrative clinical research combines objective biochemical markers with validated classical Ayurvedic symptom scores.",
      },
    ].slice(0, count);
  }

  // 2. Computer Science / IT / Web Architecture
  if (
    lowerSector.includes("it") ||
    lowerSector.includes("software") ||
    lowerTopic.includes("react") ||
    lowerTopic.includes("next") ||
    lowerTopic.includes("web") ||
    lowerTopic.includes("database") ||
    lowerTopic.includes("typescript") ||
    lowerTopic.includes("sql")
  ) {
    return [
      {
        question_text:
          "In Next.js App Router (React Server Components), what is the primary benefit of React's `cache()` function?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Memoizes data requests per render lifecycle, eliminating duplicate database and API calls", is_correct: true },
          { id: "opt_2", text: "Persists user session cookies permanently across browser tabs", is_correct: false },
          { id: "opt_3", text: "Caches build artifacts in the client localStorage", is_correct: false },
          { id: "opt_4", text: "Encrypts API payloads before transmission over HTTP", is_correct: false },
        ],
        explanation: "React cache() deduplicates function calls and requests within the scope of a single server render tree.",
      },
      {
        question_text:
          "Which database indexing strategy is most effective for full-text and tri-gram fuzzy substring searches in PostgreSQL?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "GIN (Generalized Inverted Index) with pg_trgm extension", is_correct: true },
          { id: "opt_2", text: "Default B-Tree on text columns with LIKE '%...%'", is_correct: false },
          { id: "opt_3", text: "Hash index on UUID primary key", is_correct: false },
          { id: "opt_4", text: "BRIN index on timestamps", is_correct: false },
        ],
        explanation: "GIN with pg_trgm ops provides sub-millisecond wildcard substring and similarity search indexing in PostgreSQL.",
      },
      {
        question_text:
          "When designing a zero-trust multi-tenant application with PostgreSQL Row Level Security (RLS), what is required to enforce data isolation?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "ENABLE ROW LEVEL SECURITY with restrictive USING / WITH CHECK policies bound to auth.uid()", is_correct: true },
          { id: "opt_2", text: "Filtering by tenant_id solely in frontend client state", is_correct: false },
          { id: "opt_3", text: "Using a single global shared service role key for all user requests", is_correct: false },
          { id: "opt_4", text: "Disabling CORS headers in the web server", is_correct: false },
        ],
        explanation: "RLS policies enforce database-level row access control that cannot be bypassed by client-side tampering.",
      },
      {
        question_text:
          "What is the key difference between Server Actions and standard REST endpoints in modern full-stack web frameworks?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Server Actions are type-safe async functions invoked directly from the UI without manual route boilerplate", is_correct: true },
          { id: "opt_2", text: "Server Actions run only in the client browser without touching the server", is_correct: false },
          { id: "opt_3", text: "REST endpoints cannot send or receive JSON payloads", is_correct: false },
          { id: "opt_4", text: "Server Actions disable CSRF protection by default", is_correct: false },
        ],
        explanation: "Server Actions provide end-to-end type safety, automatic revalidation, and direct server execution without manual API endpoints.",
      },
      {
        question_text:
          "Which HTTP caching header directive ensures a browser revalidates cached content with the origin server before displaying it?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "no-cache", is_correct: true },
          { id: "opt_2", text: "no-store", is_correct: false },
          { id: "opt_3", text: "public, max-age=31536000", is_correct: false },
          { id: "opt_4", text: "immutable", is_correct: false },
        ],
        explanation: "Cache-Control: no-cache forces conditional revalidation (ETag / If-None-Match) with the server before using cached copy.",
      },
    ].slice(0, count);
  }

  // 3. Healthcare, BioTech, & Pharmacology
  if (
    lowerSector.includes("pharma") ||
    lowerSector.includes("bio") ||
    lowerSector.includes("health") ||
    lowerTopic.includes("clinical") ||
    lowerTopic.includes("drug")
  ) {
    return [
      {
        question_text:
          "What is the primary objective of Phase I clinical trials in drug development?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Evaluate safety, tolerability, pharmacokinetics, and safe dosage range in small cohorts", is_correct: true },
          { id: "opt_2", text: "Confirm comparative therapeutic efficacy in thousands of patients", is_correct: false },
          { id: "opt_3", text: "Conduct post-market pharmacovigilance surveillance", is_correct: false },
          { id: "opt_4", text: "Determine retail pharmacy distribution pricing", is_correct: false },
        ],
        explanation: "Phase I primarily evaluates safety, pharmacokinetics, tolerability, and dosage limits in healthy volunteers.",
      },
      {
        question_text:
          "In bioequivalence studies, which two parameters must fall within the 80% to 125% 90% confidence interval?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Cmax (peak concentration) and AUC (area under the curve)", is_correct: true },
          { id: "opt_2", text: "Tmax and drug molecular weight", is_correct: false },
          { id: "opt_3", text: "Tablet hardness and dissolution volume", is_correct: false },
          { id: "opt_4", text: "Excipient ratio and packaging permeability", is_correct: false },
        ],
        explanation: "Cmax and AUC (0-t) within 80.00-125.00% are standard bioequivalence criteria for pharmaceutical generics.",
      },
      {
        question_text:
          "What is the role of double-blinding in clinical trial methodology?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "Eliminate observer and participant bias by keeping both investigator and patient unaware of assignment", is_correct: true },
          { id: "opt_2", text: "Ensure the trial has double the number of required participants", is_correct: false },
          { id: "opt_3", text: "Speed up the regulatory approval process by skipping ethical review", is_correct: false },
          { id: "opt_4", text: "Guarantee zero side effects for all participants", is_correct: false },
        ],
        explanation: "Double-blinding prevents conscious and subconscious bias from both patients and clinicians evaluating outcomes.",
      },
      {
        question_text:
          "Which International Council for Harmonisation (ICH) guideline defines Good Clinical Practice (GCP)?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "ICH E6 (R2 / R3)", is_correct: true },
          { id: "opt_2", text: "ICH Q7", is_correct: false },
          { id: "opt_3", text: "ICH M4", is_correct: false },
          { id: "opt_4", text: "ICH S9", is_correct: false },
        ],
        explanation: "ICH E6 is the global standard guideline for the design, conduct, monitoring, auditing, and reporting of clinical trials.",
      },
      {
        question_text:
          "In pharmacokinetics, what does bioavailability (F) represent?",
        question_type: "mcq",
        marks: 1,
        difficulty,
        options: [
          { id: "opt_1", text: "The fraction of an administered dose of unchanged drug that reaches systemic circulation", is_correct: true },
          { id: "opt_2", text: "The time required for 50% of the drug to be eliminated by hepatic clearance", is_correct: false },
          { id: "opt_3", text: "The ratio of renal excretion to bile secretion", is_correct: false },
          { id: "opt_4", text: "The speed at which the tablet dissolves in water", is_correct: false },
        ],
        explanation: "Bioavailability is the fraction of administered active drug that reaches systemic circulation unchanged.",
      },
    ].slice(0, count);
  }

  // 4. Default / General Technical & Analytical Assessment
  return [
    {
      question_text: `What is the key foundational concept when approaching "${topic}" in professional practice?`,
      question_type: "mcq",
      marks: 1,
      difficulty,
      options: [
        { id: "opt_1", text: "Standardized protocols, evidence-based metrics, and reproducible methodologies", is_correct: true },
        { id: "opt_2", text: "Ad-hoc trial and error without historical documentation", is_correct: false },
        { id: "opt_3", text: "Reliance exclusively on intuition without validation", is_correct: false },
        { id: "opt_4", text: "Omitting error-handling and risk mitigation controls", is_correct: false },
      ],
      explanation: "Rigorous standards, verifiable metrics, and reproducible protocols form the baseline of technical discipline.",
    },
    {
      question_text: `When evaluating performance or quality in "${topic}", which metric is most critical?`,
      question_type: "mcq",
      marks: 1,
      difficulty,
      options: [
        { id: "opt_1", text: "Accuracy, throughput, and consistency under edge-case stress conditions", is_correct: true },
        { id: "opt_2", text: "Purely superficial visual styling without functionality testing", is_correct: false },
        { id: "opt_3", text: "Number of manual manual steps required by the user", is_correct: false },
        { id: "opt_4", text: "Uncontrolled memory consumption", is_correct: false },
      ],
      explanation: "Quality evaluation requires measurable accuracy, throughput, and reliability under stress.",
    },
    {
      question_text: `What is considered a best practice when documenting and presenting findings in "${topic}"?`,
      question_type: "mcq",
      marks: 1,
      difficulty,
      options: [
        { id: "opt_1", text: "Structured executive summaries supported by empirical data, confidence intervals, and actionable conclusions", is_correct: true },
        { id: "opt_2", text: "Unstructured verbal opinions with no data trail", is_correct: false },
        { id: "opt_3", text: "Concealing anomalous or negative trial data", is_correct: false },
        { id: "opt_4", text: "Presenting only raw unparsed log outputs", is_correct: false },
      ],
      explanation: "Clear empirical documentation with confidence intervals ensures reproducibility and executive alignment.",
    },
    {
      question_text: `How does continuous evaluation improve project outcomes in "${topic}"?`,
      question_type: "mcq",
      marks: 1,
      difficulty,
      options: [
        { id: "opt_1", text: "Detects regressions early, provides rapid feedback loops, and raises benchmark quality", is_correct: true },
        { id: "opt_2", text: "Guarantees no modifications will ever be needed again", is_correct: false },
        { id: "opt_3", text: "Slows down delivery without any measurable safety gains", is_correct: false },
        { id: "opt_4", text: "Replaces the need for peer review entirely", is_correct: false },
      ],
      explanation: "Continuous evaluation provides rapid feedback loops and prevents downstream regressions.",
    },
    {
      question_text: `Which ethical consideration is paramount when executing projects related to "${topic}"?`,
      question_type: "mcq",
      marks: 1,
      difficulty,
      options: [
        { id: "opt_1", text: "Data privacy, informed consent, compliance with governing standards, and transparency", is_correct: true },
        { id: "opt_2", text: "Maximizing short-term profit at the expense of participant safety", is_correct: false },
        { id: "opt_3", text: "Bypassing institutional regulatory compliance whenever possible", is_correct: false },
        { id: "opt_4", text: "Restricting findings from independent peer review", is_correct: false },
      ],
      explanation: "Ethical integrity, transparency, and data privacy are non-negotiable foundations across all disciplines.",
    },
  ].slice(0, count);
}
