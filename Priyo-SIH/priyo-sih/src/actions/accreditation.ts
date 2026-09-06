"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

export interface NaacPlacementInput {
  academic_year: string;
  student_name: string;
  roll_number?: string;
  department: string;
  degree: string;
  progression_type: "campus_placement" | "off_campus_placement" | "higher_studies";
  employer_or_institution: string;
  designation_or_program: string;
  package_inr?: number;
  offer_reference_no?: string;
  proof_document_url?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface NirfCohortInput {
  academic_year: string;
  program_level?: "UG" | "PG";
  sanctioned_intake: number;
  total_admitted: number;
  graduated_stipulated_time: number;
  students_placed: number;
  median_salary_inr: number;
  higher_studies_count: number;
}

/**
 * Add an individual student placement or higher studies progression record for NAAC Metric 5.2.1.
 */
export async function addNaacPlacementRecord(
  input: NaacPlacementInput
): Promise<ActionResult<{ id: string }>> {
  if (!input.student_name?.trim()) {
    return { error: "Please provide the student's name." };
  }
  if (!input.employer_or_institution?.trim()) {
    return { error: "Please provide the employer or admitting institution name." };
  }
  if (!input.department?.trim()) {
    return { error: "Please select or provide a department." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in as an institution administrator." };
  }

  const admin = await createAdminClient();
  const recordId = crypto.randomUUID();

  const packageInr = input.package_inr ? Number(input.package_inr) : 0;
  const packageLpa = packageInr > 0 ? Number((packageInr / 100000).toFixed(2)) : 0;

  const recordPayload = {
    id: recordId,
    academic_year: input.academic_year || "2024-25",
    student_name: input.student_name.trim(),
    roll_number: input.roll_number?.trim() || null,
    department: input.department.trim(),
    degree: input.degree?.trim() || "B.Tech",
    progression_type: input.progression_type || "campus_placement",
    employer_or_institution: input.employer_or_institution.trim(),
    designation_or_program: input.designation_or_program?.trim() || "Associate",
    package_inr: packageInr,
    package_lpa: packageLpa,
    offer_reference_no: input.offer_reference_no?.trim() || `OFF-${Date.now().toString().slice(-6)}`,
    proof_document_url: input.proof_document_url?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    is_platform_synced: false,
    created_at: new Date().toISOString(),
    created_by: user.id,
  };

  const { error } = await admin.from("audit_log").insert({
    table_name: "naac_metric_5_2",
    record_id: recordId,
    action: "RECORD",
    new_data: recordPayload,
    performed_by: user.id,
  });

  if (error) {
    return { error: error.message || "Failed to save NAAC placement record." };
  }

  revalidatePath("/institution/analytics");
  return { data: { id: recordId } };
}

/**
 * Update an existing NAAC 5.2.1 record.
 */
export async function updateNaacPlacementRecord(
  recordId: string,
  input: Partial<NaacPlacementInput>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // Find existing audit log row
  const { data: existing, error: fetchErr } = await admin
    .from("audit_log")
    .select("id, new_data")
    .eq("table_name", "naac_metric_5_2")
    .eq("record_id", recordId)
    .maybeSingle();

  if (fetchErr || !existing) {
    return { error: "Record not found." };
  }

  const currentData = (existing.new_data as Record<string, any>) || {};
  const packageInr = input.package_inr !== undefined ? Number(input.package_inr) : currentData.package_inr;
  const packageLpa = packageInr > 0 ? Number((packageInr / 100000).toFixed(2)) : 0;

  const updatedPayload = {
    ...currentData,
    ...input,
    package_inr: packageInr,
    package_lpa: packageLpa,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { error: updErr } = await admin
    .from("audit_log")
    .update({
      new_data: updatedPayload,
      action: "UPDATE",
      performed_by: user.id,
    })
    .eq("id", existing.id);

  if (updErr) {
    return { error: updErr.message || "Failed to update record." };
  }

  revalidatePath("/institution/analytics");
  return {};
}

/**
 * Delete a NAAC 5.2.1 record.
 */
export async function deleteNaacPlacementRecord(recordId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  const { error } = await admin
    .from("audit_log")
    .delete()
    .eq("table_name", "naac_metric_5_2")
    .eq("record_id", recordId);

  if (error) {
    return { error: error.message || "Failed to delete record." };
  }

  revalidatePath("/institution/analytics");
  return {};
}

/**
 * Bulk import multiple NAAC records (e.g. from pasted CSV or parsed table).
 */
export async function bulkImportNaacRecords(
  records: NaacPlacementInput[]
): Promise<ActionResult<{ count: number }>> {
  if (!records || records.length === 0) {
    return { error: "No valid records provided for import." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  const rows = records.map((item) => {
    const recordId = crypto.randomUUID();
    const packageInr = item.package_inr ? Number(item.package_inr) : 0;
    const packageLpa = packageInr > 0 ? Number((packageInr / 100000).toFixed(2)) : 0;

    return {
      table_name: "naac_metric_5_2",
      record_id: recordId,
      action: "BULK_IMPORT",
      new_data: {
        id: recordId,
        academic_year: item.academic_year || "2024-25",
        student_name: item.student_name?.trim() || "Candidate",
        roll_number: item.roll_number?.trim() || null,
        department: item.department?.trim() || "General",
        degree: item.degree?.trim() || "B.Tech",
        progression_type: item.progression_type || "campus_placement",
        employer_or_institution: item.employer_or_institution?.trim() || "Industry Partner",
        designation_or_program: item.designation_or_program?.trim() || "Graduate Trainee",
        package_inr: packageInr,
        package_lpa: packageLpa,
        offer_reference_no: item.offer_reference_no?.trim() || `IMP-${Date.now().toString().slice(-6)}`,
        proof_document_url: item.proof_document_url?.trim() || null,
        is_platform_synced: false,
        created_at: new Date().toISOString(),
        created_by: user.id,
      },
      performed_by: user.id,
    };
  });

  const { error } = await admin.from("audit_log").insert(rows);

  if (error) {
    return { error: error.message || "Failed to batch import records." };
  }

  revalidatePath("/institution/analytics");
  return { data: { count: records.length } };
}

/**
 * Auto-sync platform placements: Queries `applications` where status = 'hired'
 * and copies them into NAAC 5.2.1 records if not already added.
 */
export async function syncPlatformPlacementsToNaac(): Promise<ActionResult<{ syncedCount: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();

  // 1. Fetch hired applications
  const { data: hiredApps, error: appsErr } = await admin
    .from("applications")
    .select(`
      id,
      applicant_id,
      status,
      created_at,
      applicant:profiles!applicant_id(id, full_name, email),
      opportunity:opportunities!opportunity_id(
        id,
        title,
        stipend_max,
        partner:industry_partners(company_name)
      )
    `)
    .eq("status", "hired");

  if (appsErr || !hiredApps || hiredApps.length === 0) {
    return { data: { syncedCount: 0 } };
  }

  // 2. Fetch existing synced application IDs to prevent duplicates
  const { data: existingRecords } = await admin
    .from("audit_log")
    .select("new_data")
    .eq("table_name", "naac_metric_5_2");

  const existingAppIds = new Set<string>();
  for (const r of existingRecords || []) {
    const data = r.new_data as any;
    if (data?.application_id) {
      existingAppIds.add(data.application_id);
    }
  }

  // 3. Fetch student details for departments
  const applicantIds = hiredApps.map((a) => a.applicant_id);
  const { data: studentDetails } = await admin
    .from("student_details")
    .select("user_id, roll_number, department, degree")
    .in("user_id", applicantIds);

  const studentMap = new Map((studentDetails || []).map((s) => [s.user_id, s]));

  const newRows = [];
  for (const app of hiredApps) {
    if (existingAppIds.has(app.id)) continue;

    const applicant = (app as any).applicant;
    const opp = (app as any).opportunity;
    const sDetail = studentMap.get(app.applicant_id);

    const recordId = crypto.randomUUID();
    const annualCtc = (opp?.stipend_max ? opp.stipend_max * 12 : 500000);
    const ctcLpa = Number((annualCtc / 100000).toFixed(2));

    newRows.push({
      table_name: "naac_metric_5_2",
      record_id: recordId,
      action: "PLATFORM_SYNC",
      new_data: {
        id: recordId,
        application_id: app.id,
        academic_year: "2024-25",
        student_name: applicant?.full_name || "Student Graduate",
        roll_number: sDetail?.roll_number || null,
        department: sDetail?.department || "Integrated Sciences",
        degree: sDetail?.degree || "B.Tech",
        progression_type: "campus_placement",
        employer_or_institution: opp?.partner?.company_name || opp?.title || "Industry Partner",
        designation_or_program: opp?.title || "Associate Trainee",
        package_inr: annualCtc,
        package_lpa: ctcLpa,
        offer_reference_no: `SKB-${app.id.slice(0, 8).toUpperCase()}`,
        proof_document_url: null,
        is_platform_synced: true,
        created_at: new Date().toISOString(),
        created_by: user.id,
      },
      performed_by: user.id,
    });
  }

  if (newRows.length > 0) {
    await admin.from("audit_log").insert(newRows);
  }

  revalidatePath("/institution/analytics");
  return { data: { syncedCount: newRows.length } };
}

/**
 * Save or update NIRF cohort annual metric (Sanctioned Intake, Placed, Median Salary, Higher Studies).
 */
export async function saveNirfCohortMetric(
  input: NirfCohortInput
): Promise<ActionResult<{ id: string }>> {
  if (!input.academic_year?.trim()) {
    return { error: "Academic year is required (e.g. 2024-25)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const admin = await createAdminClient();
  const programLevel = input.program_level || "UG";
  const recordKey = `nirf_${input.academic_year.trim()}_${programLevel}`;

  // Find existing NIRF row for this year
  const { data: existing } = await admin
    .from("audit_log")
    .select("id, record_id, new_data")
    .eq("table_name", "nirf_cohort_metrics")
    .eq("action", recordKey)
    .maybeSingle();

  const recordId = existing?.record_id || crypto.randomUUID();

  const intake = Number(input.sanctioned_intake) || 0;
  const admitted = Number(input.total_admitted) || 0;
  const graduated = Number(input.graduated_stipulated_time) || 0;
  const placed = Number(input.students_placed) || 0;
  const medianSalary = Number(input.median_salary_inr) || 0;
  const higherStudies = Number(input.higher_studies_count) || 0;

  const gphPercentage = graduated > 0
    ? Number((((placed + higherStudies) / graduated) * 100).toFixed(1))
    : 0;

  const nirfPayload = {
    id: recordId,
    academic_year: input.academic_year.trim(),
    program_level: programLevel,
    sanctioned_intake: intake,
    total_admitted: admitted,
    graduated_stipulated_time: graduated,
    students_placed: placed,
    median_salary_inr: medianSalary,
    higher_studies_count: higherStudies,
    gph_percentage: gphPercentage,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  if (existing) {
    const { error: updErr } = await admin
      .from("audit_log")
      .update({
        new_data: nirfPayload,
        performed_by: user.id,
      })
      .eq("id", existing.id);

    if (updErr) return { error: updErr.message };
  } else {
    const { error: insErr } = await admin.from("audit_log").insert({
      table_name: "nirf_cohort_metrics",
      record_id: recordId,
      action: recordKey,
      new_data: nirfPayload,
      performed_by: user.id,
    });

    if (insErr) return { error: insErr.message };
  }

  revalidatePath("/institution/analytics");
  return { data: { id: recordId } };
}
