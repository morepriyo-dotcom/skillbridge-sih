import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey);

async function seedAccreditation() {
  console.log("Seeding NAAC Metric 5.2.1 and NIRF Placement data...");

  // Check if institution admin exists for attribution
  const { data: adminProfiles } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["institution_admin", "academician", "admin"])
    .limit(1);

  const adminUserId = adminProfiles?.[0]?.id || null;

  // 1. Seed NIRF 5-Year Cohorts
  const nirfCohorts = [
    {
      academic_year: "2020-21",
      program_level: "UG",
      sanctioned_intake: 480,
      total_admitted: 465,
      graduated_stipulated_time: 440,
      students_placed: 330,
      median_salary_inr: 480000,
      higher_studies_count: 45,
      gph_percentage: 85.2,
    },
    {
      academic_year: "2021-22",
      program_level: "UG",
      sanctioned_intake: 540,
      total_admitted: 525,
      graduated_stipulated_time: 505,
      students_placed: 395,
      median_salary_inr: 540000,
      higher_studies_count: 55,
      gph_percentage: 89.1,
    },
    {
      academic_year: "2022-23",
      program_level: "UG",
      sanctioned_intake: 600,
      total_admitted: 590,
      graduated_stipulated_time: 570,
      students_placed: 460,
      median_salary_inr: 600000,
      higher_studies_count: 62,
      gph_percentage: 91.6,
    },
    {
      academic_year: "2023-24",
      program_level: "UG",
      sanctioned_intake: 660,
      total_admitted: 650,
      graduated_stipulated_time: 630,
      students_placed: 525,
      median_salary_inr: 680000,
      higher_studies_count: 68,
      gph_percentage: 94.1,
    },
    {
      academic_year: "2024-25",
      program_level: "UG",
      sanctioned_intake: 720,
      total_admitted: 710,
      graduated_stipulated_time: 690,
      students_placed: 585,
      median_salary_inr: 750000,
      higher_studies_count: 75,
      gph_percentage: 95.7,
    },
  ];

  // Clean old NIRF rows to prevent duplicates
  await admin.from("audit_log").delete().eq("table_name", "nirf_cohort_metrics");

  const nirfRows = nirfCohorts.map((cohort) => ({
    table_name: "nirf_cohort_metrics",
    record_id: crypto.randomUUID(),
    action: `nirf_${cohort.academic_year}_${cohort.program_level}`,
    new_data: {
      id: crypto.randomUUID(),
      ...cohort,
      updated_at: new Date().toISOString(),
      updated_by: adminUserId,
    },
    performed_by: adminUserId,
  }));

  const { error: nirfErr } = await admin.from("audit_log").insert(nirfRows);
  if (nirfErr) {
    console.error("Error inserting NIRF cohorts:", nirfErr.message);
  } else {
    console.log(`Successfully seeded ${nirfRows.length} NIRF 5-year cohort metrics.`);
  }

  // 2. Seed NAAC 5.2.1 Student Records
  await admin.from("audit_log").delete().eq("table_name", "naac_metric_5_2");

  const sampleStudents = [
    {
      academic_year: "2024-25",
      student_name: "Aarav Sharma",
      roll_number: "AYU/2021/042",
      department: "Ayurveda & Traditional Medicine",
      degree: "BAMS",
      progression_type: "campus_placement",
      employer_or_institution: "Himalaya Wellness Company",
      designation_or_program: "Clinical Research Associate",
      package_inr: 720000,
      package_lpa: 7.2,
      offer_reference_no: "HIM-CR-2025-089",
      contact_email: "hr.campus@himalayawellness.com",
      contact_phone: "+91-80-6754-9900",
    },
    {
      academic_year: "2024-25",
      student_name: "Priyanka Deshmukh",
      roll_number: "AYU/2021/018",
      department: "Ayurveda & Traditional Medicine",
      degree: "BAMS",
      progression_type: "higher_studies",
      employer_or_institution: "All India Institute of Ayurveda (AIIA), New Delhi",
      designation_or_program: "MD (Kayachikitsa) & Integrative Clinical Fellow",
      package_inr: 0,
      package_lpa: 0,
      offer_reference_no: "AIIA-PG-ADM-2025-104",
      contact_email: "dean.academic@aiia.gov.in",
    },
    {
      academic_year: "2024-25",
      student_name: "Rahul Nambiar",
      roll_number: "CS/2021/104",
      department: "Computer Science & Engineering",
      degree: "B.Tech",
      progression_type: "campus_placement",
      employer_or_institution: "Tata Consultancy Services (TCS Digital)",
      designation_or_program: "Systems Engineer (Healthcare AI)",
      package_inr: 850000,
      package_lpa: 8.5,
      offer_reference_no: "TCS-DIG-BLR-4412",
      contact_email: "campus.talent@tcs.com",
    },
    {
      academic_year: "2024-25",
      student_name: "Ananya Mukherjee",
      roll_number: "BT/2021/031",
      department: "Biotechnology & Life Sciences",
      degree: "B.Tech",
      progression_type: "campus_placement",
      employer_or_institution: "Biocon Biologics",
      designation_or_program: "Downstream Bioprocess Specialist",
      package_inr: 780000,
      package_lpa: 7.8,
      offer_reference_no: "BBL-RND-2025-502",
      contact_email: "talent.biocon@biocon.com",
    },
    {
      academic_year: "2024-25",
      student_name: "Vikram Patel",
      roll_number: "PH/2021/055",
      department: "Pharmacognosy & Herbal Formulations",
      degree: "B.Pharm",
      progression_type: "campus_placement",
      employer_or_institution: "Dabur Research Foundation",
      designation_or_program: "Phytochemistry QA/QC Officer",
      package_inr: 680000,
      package_lpa: 6.8,
      offer_reference_no: "DRF-QA-0982-25",
      contact_email: "recruitment@dabur.com",
    },
    {
      academic_year: "2024-25",
      student_name: "Meera Krishnan",
      roll_number: "CS/2021/089",
      department: "Computer Science & Engineering",
      degree: "B.Tech",
      progression_type: "higher_studies",
      employer_or_institution: "Indian Institute of Technology (IIT) Bombay",
      designation_or_program: "M.Tech in Biomedical Informatics",
      package_inr: 0,
      package_lpa: 0,
      offer_reference_no: "IITB-MTECH-2025-781",
      contact_email: "pgadmission@iitb.ac.in",
    },
    {
      academic_year: "2024-25",
      student_name: "Rohan Gupta",
      roll_number: "CS/2021/012",
      department: "Computer Science & Engineering",
      degree: "B.Tech",
      progression_type: "off_campus_placement",
      employer_or_institution: "Amazon Web Services (AWS)",
      designation_or_program: "Cloud Support Associate",
      package_inr: 1450000,
      package_lpa: 14.5,
      offer_reference_no: "AMZN-IN-2025-9921",
      contact_email: "aws-campus-india@amazon.com",
    },
    {
      academic_year: "2023-24",
      student_name: "Neha Joshi",
      roll_number: "AYU/2020/029",
      department: "Ayurveda & Traditional Medicine",
      degree: "BAMS",
      progression_type: "campus_placement",
      employer_or_institution: "Patanjali Research Foundation",
      designation_or_program: "Junior Scientist (Herbal Formulations)",
      package_inr: 650000,
      package_lpa: 6.5,
      offer_reference_no: "PRF-JSC-2024-118",
      contact_email: "hr@patanjali.org",
    },
    {
      academic_year: "2023-24",
      student_name: "Karan Verma",
      roll_number: "PH/2020/044",
      department: "Pharmacognosy & Herbal Formulations",
      degree: "B.Pharm",
      progression_type: "higher_studies",
      employer_or_institution: "National Institute of Pharmaceutical Education and Research (NIPER)",
      designation_or_program: "MS (Pharm) in Natural Products",
      package_inr: 0,
      package_lpa: 0,
      offer_reference_no: "NIPER-ADM-2024-652",
      contact_email: "academic@niper.ac.in",
    },
    {
      academic_year: "2023-24",
      student_name: "Sneha Reddy",
      roll_number: "CS/2020/076",
      department: "Computer Science & Engineering",
      degree: "B.Tech",
      progression_type: "campus_placement",
      employer_or_institution: "Infosys Ltd (Power Programmer)",
      designation_or_program: "Specialist Programmer",
      package_inr: 950000,
      package_lpa: 9.5,
      offer_reference_no: "INFY-SP-2024-883",
      contact_email: "campus_hiring@infosys.com",
    },
    {
      academic_year: "2023-24",
      student_name: "Devendra Patil",
      roll_number: "AYU/2020/061",
      department: "Ayurveda & Traditional Medicine",
      degree: "BAMS",
      progression_type: "campus_placement",
      employer_or_institution: "Charak Pharma",
      designation_or_program: "Medical Services Officer",
      package_inr: 620000,
      package_lpa: 6.2,
      offer_reference_no: "CP-MED-2024-301",
      contact_email: "careers@charak.com",
    },
    {
      academic_year: "2023-24",
      student_name: "Tanvi Saxena",
      roll_number: "BT/2020/019",
      department: "Biotechnology & Life Sciences",
      degree: "B.Tech",
      progression_type: "campus_placement",
      employer_or_institution: "Sun Pharmaceutical Industries Ltd",
      designation_or_program: "Associate Analyst (Bioanalytics)",
      package_inr: 700000,
      package_lpa: 7.0,
      offer_reference_no: "SUN-BIO-2024-512",
      contact_email: "talent@sunpharma.com",
    }
  ];

  const studentRows = sampleStudents.map((s) => {
    const id = crypto.randomUUID();
    return {
      table_name: "naac_metric_5_2",
      record_id: id,
      action: "SEED",
      new_data: {
        id,
        ...s,
        is_platform_synced: false,
        created_at: new Date().toISOString(),
        created_by: adminUserId,
      },
      performed_by: adminUserId,
    };
  });

  const { error: stdErr } = await admin.from("audit_log").insert(studentRows);
  if (stdErr) {
    console.error("Error inserting NAAC student records:", stdErr.message);
  } else {
    console.log(`Successfully seeded ${studentRows.length} NAAC Metric 5.2.1 student placement and progression records.`);
  }

  console.log("Accreditation seeding complete!");
}

seedAccreditation();
