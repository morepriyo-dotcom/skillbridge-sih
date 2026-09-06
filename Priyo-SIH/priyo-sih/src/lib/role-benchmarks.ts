/**
 * Industry Role Skill Benchmarks & Dynamic Skill Gap Calculation Engine
 */

export interface RoleBenchmark {
  id: string;
  title: string;
  sector: string;
  description: string;
  coreSkills: Array<{
    name: string;
    minProficiency: "beginner" | "intermediate" | "advanced" | "expert";
    weight: number; // Importance weight 1 - 5
    relatedAssessmentKeywords?: string[];
  }>;
  recommendedCertifications: string[];
}

export const INDUSTRY_ROLE_BENCHMARKS: RoleBenchmark[] = [
  {
    id: "full_stack_dev",
    title: "Full Stack Software Developer",
    sector: "Information Technology",
    description: "Designs, builds, and maintains modern end-to-end web applications, APIs, and scalable databases.",
    coreSkills: [
      { name: "Web Development", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["web", "next.js", "react"] },
      { name: "JavaScript", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["javascript", "typescript", "react"] },
      { name: "SQL", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["sql", "database"] },
      { name: "API Design", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["api", "rest", "backend"] },
      { name: "DevOps", minProficiency: "beginner", weight: 3, relatedAssessmentKeywords: ["devops", "cloud", "docker"] },
      { name: "Cloud Computing", minProficiency: "beginner", weight: 3, relatedAssessmentKeywords: ["cloud", "aws", "azure"] },
    ],
    recommendedCertifications: ["Next.js & React Certified Associate", "AWS Cloud Practitioner", "PostgreSQL Specialist"],
  },
  {
    id: "aiml_engineer",
    title: "AI / Machine Learning Engineer",
    sector: "Information Technology",
    description: "Develops machine learning models, neural networks, and AI algorithms for predictive systems and automation.",
    coreSkills: [
      { name: "Machine Learning", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["machine learning", "ai", "deep learning"] },
      { name: "Python", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["python", "data"] },
      { name: "Data Analysis", minProficiency: "advanced", weight: 4, relatedAssessmentKeywords: ["data", "analytics"] },
      { name: "SQL", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["sql", "query"] },
      { name: "Cloud Computing", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["cloud", "mlops"] },
      { name: "API Design", minProficiency: "beginner", weight: 2, relatedAssessmentKeywords: ["api", "deployment"] },
    ],
    recommendedCertifications: ["TensorFlow Developer Certificate", "Google Cloud ML Engineer", "Azure AI Engineer"],
  },
  {
    id: "data_scientist",
    title: "Data Scientist / Business Intelligence Analyst",
    sector: "Information Technology",
    description: "Translates complex datasets into actionable predictive insights, statistical models, and executive dashboards.",
    coreSkills: [
      { name: "Data Analysis", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["data", "statistics"] },
      { name: "SQL", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["sql", "warehouse"] },
      { name: "Python", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["python", "pandas"] },
      { name: "Machine Learning", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["machine learning"] },
      { name: "Cloud Computing", minProficiency: "beginner", weight: 2, relatedAssessmentKeywords: ["cloud", "bigquery"] },
    ],
    recommendedCertifications: ["Google Data Analytics Professional", "Power BI / Tableau Certified", "SAS Statistical Analyst"],
  },
  {
    id: "clinical_research_associate",
    title: "Ayush Clinical Research Associate",
    sector: "Ayush & Healthcare",
    description: "Monitors clinical trials, ensures ethical compliance with GCP standards, and tracks protocol efficacy for traditional therapies.",
    coreSkills: [
      { name: "Clinical Research", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["clinical", "gcp", "trials"] },
      { name: "Ayush GCP Guidelines", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["gcp", "ayush", "guidelines"] },
      { name: "Pharmacology", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["pharmacology", "drugs"] },
      { name: "Data Analysis", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["data", "statistics"] },
    ],
    recommendedCertifications: ["Ayush GCP Compliance Specialist", "CCRA (Certified Clinical Research Associate)", "Ethical Committee GCP Training"],
  },
  {
    id: "ayurvedic_formulations_specialist",
    title: "Ayurvedic Formulations & Quality Specialist",
    sector: "Ayush & Healthcare",
    description: "Standardizes classical herbal formulations, conducts pharmacognostical testing, and maintains pharmacopoeial standards.",
    coreSkills: [
      { name: "Ayurvedic Formulations", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["formulations", "ayurveda", "rasashastra"] },
      { name: "Pharmacognosy", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["pharmacognosy", "herbal"] },
      { name: "Clinical Research", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["clinical", "research"] },
      { name: "Pharmacology", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["pharmacology"] },
    ],
    recommendedCertifications: ["Ayurvedic Pharmacopoeia Standardizer", "NABL Quality Assurance Lead", "GMP Herbals Auditor"],
  },
  {
    id: "cloud_devops_engineer",
    title: "Cloud Solutions & DevOps Engineer",
    sector: "Information Technology",
    description: "Architects highly available cloud infrastructures, container orchestrations, and automated continuous delivery pipelines.",
    coreSkills: [
      { name: "Cloud Computing", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["cloud", "aws", "gcp"] },
      { name: "DevOps", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["devops", "ci/cd", "docker"] },
      { name: "API Design", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["api", "networking"] },
      { name: "Python", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["python", "scripting"] },
      { name: "SQL", minProficiency: "beginner", weight: 2, relatedAssessmentKeywords: ["sql"] },
    ],
    recommendedCertifications: ["AWS Certified Solutions Architect", "CKA: Certified Kubernetes Administrator", "HashiCorp Terraform Associate"],
  },
  {
    id: "mobile_app_developer",
    title: "Mobile Application Developer",
    sector: "Information Technology",
    description: "Builds cross-platform or native mobile applications with smooth user interfaces and robust offline-first synchronization.",
    coreSkills: [
      { name: "Mobile Development", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["mobile", "react native", "flutter"] },
      { name: "JavaScript", minProficiency: "advanced", weight: 5, relatedAssessmentKeywords: ["javascript", "typescript"] },
      { name: "Web Development", minProficiency: "intermediate", weight: 3, relatedAssessmentKeywords: ["frontend", "web"] },
      { name: "API Design", minProficiency: "intermediate", weight: 4, relatedAssessmentKeywords: ["api", "rest"] },
    ],
    recommendedCertifications: ["Google Associate Android Developer", "Meta React Native Specialization"],
  },
];

export interface SkillGapEvaluation {
  desiredRole: string;
  sector: string;
  roleDescription: string;
  overallReadiness: number; // 0 - 100
  gapScore: number; // 100 - readiness
  totalRequiredSkills: number;
  masteredCount: number;
  inProgressCount: number;
  missingCount: number;
  assessmentBoost: number; // Points gained from attempted assessments
  masteredSkills: Array<{
    name: string;
    studentProficiency: string;
    requiredProficiency: string;
    verified: boolean;
    validatedByAssessment?: string;
  }>;
  inProgressSkills: Array<{
    name: string;
    studentProficiency: string;
    requiredProficiency: string;
    reason: string;
  }>;
  missingSkills: Array<{
    name: string;
    requiredProficiency: string;
    importance: "Critical" | "High" | "Medium";
  }>;
  recommendedAssessments: Array<{
    assessmentId?: string;
    title: string;
    category: string;
    targetSkill: string;
  }>;
  careerRoadmap: string[];
}

const PROFICIENCY_NUMERIC: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

/**
 * Calculates a comprehensive skill gap analysis comparing a student's
 * skills & assignment attempts against their desired industry role.
 */
export function calculateSkillGap(params: {
  desiredRole: string;
  userSkills: Array<{
    skill?: { name: string; category?: string; sector?: string };
    proficiency: string;
    verified: boolean;
  }>;
  assessmentSubmissions: Array<{
    score: number;
    passed: boolean;
    assessment?: { id?: string; title?: string; category?: string; sector?: string };
  }>;
  publishedAssessments?: Array<{
    id: string;
    title: string;
    category: string;
    sector: string;
  }>;
}): SkillGapEvaluation {
  const { desiredRole, userSkills, assessmentSubmissions, publishedAssessments = [] } = params;

  // 1. Find or construct the role benchmark
  const normalizedRole = desiredRole.trim().toLowerCase();
  const matchedBenchmark =
    INDUSTRY_ROLE_BENCHMARKS.find(
      (b) =>
        b.title.toLowerCase() === normalizedRole ||
        b.id.toLowerCase() === normalizedRole ||
        normalizedRole.includes(b.title.toLowerCase())
    ) ||
    // Fallback: If custom role, infer from keywords
    INDUSTRY_ROLE_BENCHMARKS.find((b) =>
      b.coreSkills.some((s) => normalizedRole.includes(s.name.toLowerCase()))
    ) ||
    INDUSTRY_ROLE_BENCHMARKS[0]; // Default to Full Stack

  const roleTitle = desiredRole.trim() || matchedBenchmark.title;
  const sector = matchedBenchmark.sector;
  const roleDescription = matchedBenchmark.description;

  // Map user's skills for quick lookup (normalized names)
  const userSkillMap = new Map<
    string,
    { proficiency: string; verified: boolean; originalName: string }
  >();

  for (const us of userSkills) {
    const name = us.skill?.name || "";
    if (name) {
      userSkillMap.set(name.toLowerCase(), {
        proficiency: us.proficiency?.toLowerCase() || "beginner",
        verified: us.verified,
        originalName: name,
      });
    }
  }

  // Assess assessment submissions: which domains were attempted and passed?
  let assessmentBonusPoints = 0;
  const validatedSkillsFromAssessments = new Map<string, string>();

  for (const sub of assessmentSubmissions) {
    const title = (sub.assessment?.title || "").toLowerCase();
    const category = (sub.assessment?.category || "").toLowerCase();

    if (sub.passed) {
      assessmentBonusPoints += 5; // Direct competency validation boost
      // Correlate with benchmark skills
      for (const core of matchedBenchmark.coreSkills) {
        const skillNameLower = core.name.toLowerCase();
        const keywords = core.relatedAssessmentKeywords || [skillNameLower];
        const matches = keywords.some((kw) => title.includes(kw) || category.includes(kw));

        if (matches && !validatedSkillsFromAssessments.has(skillNameLower)) {
          validatedSkillsFromAssessments.set(skillNameLower, sub.assessment?.title || "Assessment Passed");
        }
      }
    }
  }

  let totalWeightedMax = 0;
  let studentWeightedScore = 0;

  const masteredSkills: SkillGapEvaluation["masteredSkills"] = [];
  const inProgressSkills: SkillGapEvaluation["inProgressSkills"] = [];
  const missingSkills: SkillGapEvaluation["missingSkills"] = [];

  for (const req of matchedBenchmark.coreSkills) {
    const skillNameLower = req.name.toLowerCase();
    const reqLevelNum = PROFICIENCY_NUMERIC[req.minProficiency] || 2;
    const maxSkillScore = reqLevelNum * req.weight;
    totalWeightedMax += maxSkillScore;

    const userEntry = userSkillMap.get(skillNameLower);
    const assessmentValidation = validatedSkillsFromAssessments.get(skillNameLower);

    if (userEntry) {
      let studentLevelNum = PROFICIENCY_NUMERIC[userEntry.proficiency] || 1;
      
      // If assessment passed for this skill, boost effective proficiency by 1 level
      if (assessmentValidation && studentLevelNum < 4) {
        studentLevelNum = Math.min(4, studentLevelNum + 1);
      }

      const scoreEarned = Math.min(studentLevelNum, reqLevelNum) * req.weight;
      studentWeightedScore += scoreEarned;

      if (studentLevelNum >= reqLevelNum || assessmentValidation) {
        masteredSkills.push({
          name: req.name,
          studentProficiency: userEntry.proficiency,
          requiredProficiency: req.minProficiency,
          verified: userEntry.verified || Boolean(assessmentValidation),
          validatedByAssessment: assessmentValidation,
        });
      } else {
        inProgressSkills.push({
          name: req.name,
          studentProficiency: userEntry.proficiency,
          requiredProficiency: req.minProficiency,
          reason: `Current level (${userEntry.proficiency}) is below the required ${req.minProficiency} benchmark.`,
        });
      }
    } else {
      // Skill missing from profile
      if (assessmentValidation) {
        // Candidate passed assessment even without manually adding the skill
        studentWeightedScore += reqLevelNum * req.weight * 0.9;
        masteredSkills.push({
          name: req.name,
          studentProficiency: "Intermediate (Demonstrated)",
          requiredProficiency: req.minProficiency,
          verified: true,
          validatedByAssessment: assessmentValidation,
        });
      } else {
        missingSkills.push({
          name: req.name,
          requiredProficiency: req.minProficiency,
          importance: req.weight >= 5 ? "Critical" : req.weight >= 4 ? "High" : "Medium",
        });
      }
    }
  }

  // Calculate raw readiness
  let calculatedReadiness =
    totalWeightedMax > 0 ? Math.round((studentWeightedScore / totalWeightedMax) * 100) : 50;

  // Add assessment bonus (max 15% boost, cap at 100%)
  const cappedBonus = Math.min(15, assessmentBonusPoints);
  calculatedReadiness = Math.min(100, calculatedReadiness + cappedBonus);
  const gapScore = Math.max(0, 100 - calculatedReadiness);

  // Recommend relevant assessments for missing or in-progress skills
  const recommendedAssessments: SkillGapEvaluation["recommendedAssessments"] = [];
  const targetNeeds = [...missingSkills.map((m) => m.name), ...inProgressSkills.map((i) => i.name)];

  for (const pub of publishedAssessments) {
    const pubTitle = pub.title.toLowerCase();
    const pubCat = pub.category.toLowerCase();

    for (const need of targetNeeds) {
      if (
        pubTitle.includes(need.toLowerCase()) ||
        pubCat.includes(need.toLowerCase()) ||
        pub.sector.toLowerCase().includes(sector.toLowerCase())
      ) {
        if (!recommendedAssessments.some((r) => r.title === pub.title)) {
          recommendedAssessments.push({
            assessmentId: pub.id,
            title: pub.title,
            category: pub.category,
            targetSkill: need,
          });
        }
      }
    }
  }

  // Fallback recommendations if no direct match
  if (recommendedAssessments.length === 0 && targetNeeds.length > 0) {
    for (const need of targetNeeds.slice(0, 2)) {
      recommendedAssessments.push({
        title: `${need} Competency & Problem Solving Assessment`,
        category: "Skill Certification",
        targetSkill: need,
      });
    }
  }

  // Generate actionable career roadmap steps
  const careerRoadmap: string[] = [];
  if (missingSkills.length > 0) {
    careerRoadmap.push(`Prioritize mastering foundational ${missingSkills[0].name} through hands-on labs.`);
  }
  if (inProgressSkills.length > 0) {
    careerRoadmap.push(`Elevate ${inProgressSkills[0].name} to ${inProgressSkills[0].requiredProficiency} level by completing real-world projects.`);
  }
  if (recommendedAssessments.length > 0) {
    careerRoadmap.push(`Take the "${recommendedAssessments[0].title}" test to earn an official verified badge.`);
  }
  careerRoadmap.push(`Update your SkillBridge portfolio with your verified credentials to match recruiter filters for ${roleTitle}.`);

  return {
    desiredRole: roleTitle,
    sector,
    roleDescription,
    overallReadiness: calculatedReadiness,
    gapScore,
    totalRequiredSkills: matchedBenchmark.coreSkills.length,
    masteredCount: masteredSkills.length,
    inProgressCount: inProgressSkills.length,
    missingCount: missingSkills.length,
    assessmentBoost: cappedBonus,
    masteredSkills,
    inProgressSkills,
    missingSkills,
    recommendedAssessments: recommendedAssessments.slice(0, 4),
    careerRoadmap,
  };
}
