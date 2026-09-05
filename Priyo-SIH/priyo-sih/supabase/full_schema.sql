-- ========================================================
-- COMPLETE DATABASE SCHEMA: PS 26044 COLLABORATION PORTAL
-- Run this in Supabase SQL Editor
-- ========================================================

-- ========================================================
-- FILE: 00001_extensions.sql
-- ========================================================

-- Migration: 00001_extensions.sql
-- Description: Enable required extensions for the project.

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings and vector similarity search
-- Note: 'vector' is the standard name for pgvector extension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- Enable pg_trgm for trigram based fuzzy search on text columns
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ========================================================
-- FILE: 00002_enums.sql
-- ========================================================

-- Migration: 00002_enums.sql
-- Description: Define all custom ENUM types for the schema.

-- user_role
CREATE TYPE user_role AS ENUM (
    'student', 
    'academician', 
    'industry_partner', 
    'institution_admin', 
    'super_admin'
);

-- opportunity_type
CREATE TYPE opportunity_type AS ENUM (
    'student_internship', 
    'faculty_internship', 
    'full_time_job', 
    'apprenticeship', 
    'fdp', 
    'research_consultancy'
);

-- opportunity_status
CREATE TYPE opportunity_status AS ENUM (
    'draft', 
    'active', 
    'closed', 
    'archived'
);

-- application_status
CREATE TYPE application_status AS ENUM (
    'applied', 
    'under_review', 
    'shortlisted', 
    'assessment', 
    'interview_scheduled', 
    'offered', 
    'rejected', 
    'hired', 
    'completed'
);

-- proficiency_level
CREATE TYPE proficiency_level AS ENUM (
    'beginner', 
    'intermediate', 
    'advanced', 
    'expert'
);

-- verification_source
CREATE TYPE verification_source AS ENUM (
    'assessment', 
    'faculty', 
    'certificate', 
    'self_declared'
);

-- collab_status
CREATE TYPE collab_status AS ENUM (
    'proposed', 
    'approved', 
    'in_progress', 
    'completed', 
    'cancelled'
);


-- ========================================================
-- FILE: 00003_tables.sql
-- ========================================================

-- Migration: 00003_tables.sql
-- Description: Create all tables, constraints, and indexes.

-- 1. profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. institutions
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- AISHE code
    type TEXT,
    state TEXT,
    city TEXT,
    website TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. industry_partners
CREATE TABLE industry_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    industry_sector TEXT,
    registration_no TEXT UNIQUE,
    website TEXT,
    headquarters TEXT,
    description TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. student_details
CREATE TABLE student_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    roll_number TEXT,
    department TEXT,
    degree TEXT,
    graduation_year INT,
    cgpa NUMERIC(4,2) CHECK (cgpa >= 0 AND cgpa <= 10),
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_student_details_institution_id ON student_details(institution_id);

-- 5. academician_details
CREATE TABLE academician_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    department TEXT,
    designation TEXT,
    areas_of_expertise TEXT[],
    research_interests TEXT[],
    google_scholar_url TEXT,
    open_for_consultancy BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_academician_details_institution_id ON academician_details(institution_id);

-- 6. skills_master
CREATE TABLE skills_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    sector TEXT,
    embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- GIN index for fuzzy search on skill name
CREATE INDEX idx_skills_master_name_trgm ON skills_master USING GIN (name gin_trgm_ops);

-- 7. user_skills
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    proficiency proficiency_level NOT NULL,
    verified BOOLEAN DEFAULT false,
    verification_source verification_source,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_user_skills_verified_by ON user_skills(verified_by);
CREATE INDEX idx_user_skills_user_verified ON user_skills(user_id, verified);

-- 8. assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sector TEXT,
    duration_minutes INT,
    passing_score NUMERIC(5,2),
    total_marks INT,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assessments_created_by ON assessments(created_by);

-- 9. assessment_questions
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('mcq', 'multi_select', 'true_false')),
    options JSONB,
    marks INT DEFAULT 1,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    related_skill_id UUID REFERENCES skills_master(id) ON DELETE SET NULL,
    sort_order INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX idx_assessment_questions_related_skill_id ON assessment_questions(related_skill_id);

-- 10. assessment_submissions
CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    total_marks INT,
    passed BOOLEAN,
    time_taken_secs INT,
    answers JSONB,
    skill_breakdown JSONB,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assessment_id, user_id)
);
CREATE INDEX idx_assessment_submissions_assessment_id ON assessment_submissions(assessment_id);
CREATE INDEX idx_assessment_submissions_user_id ON assessment_submissions(user_id);

-- 11. opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES industry_partners(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type opportunity_type NOT NULL,
    description TEXT,
    location TEXT,
    is_remote BOOLEAN DEFAULT false,
    stipend_min INT,
    stipend_max INT,
    currency TEXT DEFAULT 'INR',
    duration_months INT,
    required_skills UUID[] DEFAULT '{}',
    preferred_skills UUID[] DEFAULT '{}',
    min_cgpa NUMERIC(4,2),
    target_degrees TEXT[],
    target_departments TEXT[],
    openings_count INT DEFAULT 1,
    deadline DATE,
    status opportunity_status DEFAULT 'draft',
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunities_industry_id ON opportunities(industry_id);
CREATE INDEX idx_opportunities_institution_id ON opportunities(institution_id);
CREATE INDEX idx_opportunities_created_by ON opportunities(created_by);
CREATE INDEX idx_opportunities_status_deadline ON opportunities(status, deadline);
CREATE INDEX idx_opportunities_required_skills ON opportunities USING GIN (required_skills);

-- 12. applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    match_score NUMERIC(5,2),
    status application_status DEFAULT 'applied',
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    feedback TEXT,
    status_history JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(opportunity_id, applicant_id)
);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_reviewer_id ON applications(reviewer_id);
CREATE INDEX idx_applications_opp_score ON applications(opportunity_id, match_score DESC);

-- 13. collaborations
CREATE TABLE collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    proposed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES industry_partners(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    category TEXT,
    domain TEXT,
    status collab_status DEFAULT 'proposed',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_collaborations_proposed_by ON collaborations(proposed_by);
CREATE INDEX idx_collaborations_industry_id ON collaborations(industry_id);
CREATE INDEX idx_collaborations_institution_id ON collaborations(institution_id);

-- 14. mentorship_sessions
CREATE TABLE mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT,
    status TEXT CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    meeting_link TEXT,
    notes TEXT,
    rating INT CHECK(rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mentorship_sessions_mentor_id ON mentorship_sessions(mentor_id);
CREATE INDEX idx_mentorship_sessions_mentee_id ON mentorship_sessions(mentee_id);

-- 15. internship_logs
CREATE TABLE internship_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    log_date DATE NOT NULL,
    activities TEXT NOT NULL,
    learnings TEXT,
    mentor_feedback TEXT,
    mentor_rating INT CHECK(mentor_rating >= 1 AND mentor_rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(application_id, week_number)
);
CREATE INDEX idx_internship_logs_application_id ON internship_logs(application_id);

-- 16. audit_log
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_performed_at ON audit_log(performed_at DESC);
CREATE INDEX idx_audit_log_performed_by ON audit_log(performed_by);


-- ========================================================
-- FILE: 00004_rls_policies.sql
-- ========================================================

-- Migration: 00004_rls_policies.sql
-- Description: Enable Row Level Security (RLS) on all tables and create appropriate policies.

-- Enable RLS on ALL tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE academician_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;


-- Profiles: SELECT for all, UPDATE only own, INSERT allowed for new users/triggers
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for registration and triggers" ON profiles FOR INSERT WITH CHECK (true);

-- Institutions: SELECT for all, INSERT/UPDATE for institution_admin and super_admin
CREATE POLICY "Institutions are viewable by everyone" ON institutions FOR SELECT USING (true);
CREATE POLICY "Institution admins and super admins can insert institutions" ON institutions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin'))
);
CREATE POLICY "Institution admins and super admins can update institutions" ON institutions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin'))
);

-- Industry Partners: SELECT for all, INSERT/UPDATE for industry_partner and super_admin
CREATE POLICY "Industry partners are viewable by everyone" ON industry_partners FOR SELECT USING (true);
CREATE POLICY "Industry partners and super admins can insert" ON industry_partners FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('industry_partner', 'super_admin'))
);
CREATE POLICY "Industry partners and super admins can update" ON industry_partners FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('industry_partner', 'super_admin'))
);

-- Student Details: SELECT for own + institution admins, INSERT/UPDATE own
CREATE POLICY "Students can view own details, admins can view all" ON student_details FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'institution_admin')
);
CREATE POLICY "Students can insert own details" ON student_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update own details" ON student_details FOR UPDATE USING (auth.uid() = user_id);

-- Academician Details: SELECT for own + institution admins, INSERT/UPDATE own
CREATE POLICY "Academicians can view own details, admins can view all" ON academician_details FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'institution_admin')
);
CREATE POLICY "Academicians can insert own details" ON academician_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Academicians can update own details" ON academician_details FOR UPDATE USING (auth.uid() = user_id);

-- Skills Master: SELECT for all, INSERT/UPDATE/DELETE for super_admin
CREATE POLICY "Skills are viewable by everyone" ON skills_master FOR SELECT USING (true);
CREATE POLICY "Super admins can modify skills master" ON skills_master FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- User Skills: SELECT own + institution admins, INSERT/UPDATE/DELETE own
CREATE POLICY "Users view own skills, admins view all" ON user_skills FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'institution_admin')
);
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

-- Assessments: SELECT published for all, INSERT/UPDATE for creators and admins
CREATE POLICY "Published assessments viewable by everyone, unpublished by creator/admins" ON assessments FOR SELECT USING (
    is_published = true OR auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin', 'industry_partner'))
);
CREATE POLICY "Creators and admins can modify assessments" ON assessments FOR ALL USING (
    auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin', 'industry_partner'))
);

-- Assessment Questions: SELECT via assessment access
CREATE POLICY "Questions viewable if assessment is viewable" ON assessment_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_id AND (a.is_published = true OR a.created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin', 'industry_partner'))))
);
CREATE POLICY "Creators and admins can modify questions" ON assessment_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_id AND (a.created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin', 'industry_partner'))))
);

-- Assessment Submissions: SELECT own, INSERT own
CREATE POLICY "Users view own submissions" ON assessment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON assessment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Opportunities: SELECT active for all + own drafts for creators, INSERT/UPDATE for industry_partner+institution_admin+super_admin
CREATE POLICY "Opportunities viewable by all if active, or by creator" ON opportunities FOR SELECT USING (
    status = 'active' OR auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Admins and partners can insert opportunities" ON opportunities FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('industry_partner', 'institution_admin', 'super_admin'))
);
CREATE POLICY "Creators and admins can update opportunities" ON opportunities FOR UPDATE USING (
    auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Applications: SELECT own (applicant) + opportunity creator's apps, INSERT own, UPDATE for opportunity creator
CREATE POLICY "Applicants view own, creators view all for their opps" ON applications FOR SELECT USING (
    auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.created_by = auth.uid())
);
CREATE POLICY "Applicants can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Opportunity creators can update applications" ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.created_by = auth.uid())
);

-- Collaborations: SELECT for participants, INSERT for authenticated
CREATE POLICY "Participants can view collaborations" ON collaborations FOR SELECT USING (
    auth.uid() = proposed_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'industry_partner', 'super_admin'))
);
CREATE POLICY "Authenticated users can insert collaborations" ON collaborations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Participants can update collaborations" ON collaborations FOR UPDATE USING (auth.uid() = proposed_by);

-- Mentorship Sessions: SELECT for mentor/mentee, INSERT authenticated, UPDATE for mentor/mentee
CREATE POLICY "Mentor and mentee can view sessions" ON mentorship_sessions FOR SELECT USING (auth.uid() IN (mentor_id, mentee_id));
CREATE POLICY "Authenticated users can create sessions" ON mentorship_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Mentor and mentee can update sessions" ON mentorship_sessions FOR UPDATE USING (auth.uid() IN (mentor_id, mentee_id));

-- Internship Logs: SELECT for intern + mentor, INSERT for intern, UPDATE mentor feedback by mentor
CREATE POLICY "Intern and reviewer can view logs" ON internship_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND (a.applicant_id = auth.uid() OR a.reviewer_id = auth.uid()))
);
CREATE POLICY "Intern can insert logs" ON internship_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.applicant_id = auth.uid())
);
CREATE POLICY "Reviewer can update mentor feedback" ON internship_logs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = application_id AND a.reviewer_id = auth.uid())
);

-- Audit Log: SELECT for super_admin only, INSERT via trigger only
CREATE POLICY "Only super admins can view audit log" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
-- Note: No INSERT/UPDATE/DELETE policies for audit_log; handled securely via trigger function.


-- ========================================================
-- FILE: 00005_functions.sql
-- ========================================================

-- Migration: 00005_functions.sql
-- Description: Stored procedures and triggers for automated logic.

-- 1. Auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'), 
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- 2. Generic function to set updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_student_details_updated_at BEFORE UPDATE ON student_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_academician_details_updated_at BEFORE UPDATE ON academician_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_collaborations_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_mentorship_sessions_updated_at BEFORE UPDATE ON mentorship_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_internship_logs_updated_at BEFORE UPDATE ON internship_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at();


-- 3. Calculate Match Score (60% req, 20% pref, 10% cgpa, 10% verified skills)
CREATE OR REPLACE FUNCTION calculate_match_score(p_applicant_id UUID, p_opportunity_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    opp RECORD;
    student RECORD;
    req_skills_count INT;
    pref_skills_count INT;
    matched_req_skills INT := 0;
    matched_pref_skills INT := 0;
    verified_bonus NUMERIC := 0;
    cgpa_score NUMERIC := 0;
    final_score NUMERIC := 0;
BEGIN
    -- Get Opportunity details
    SELECT required_skills, preferred_skills, min_cgpa INTO opp
    FROM opportunities WHERE id = p_opportunity_id;

    -- Get Student details
    SELECT cgpa INTO student
    FROM student_details WHERE user_id = p_applicant_id;

    req_skills_count := array_length(opp.required_skills, 1);
    pref_skills_count := array_length(opp.preferred_skills, 1);
    IF req_skills_count IS NULL THEN req_skills_count := 0; END IF;
    IF pref_skills_count IS NULL THEN pref_skills_count := 0; END IF;

    -- Calculate required skills match
    IF req_skills_count > 0 THEN
        SELECT COUNT(*) INTO matched_req_skills
        FROM user_skills 
        WHERE user_id = p_applicant_id 
        AND skill_id = ANY(opp.required_skills);
        
        final_score := final_score + ((matched_req_skills::NUMERIC / req_skills_count) * 60.0);
    ELSE
        final_score := final_score + 60.0; -- Free points if none required
    END IF;

    -- Calculate preferred skills match
    IF pref_skills_count > 0 THEN
        SELECT COUNT(*) INTO matched_pref_skills
        FROM user_skills 
        WHERE user_id = p_applicant_id 
        AND skill_id = ANY(opp.preferred_skills);
        
        final_score := final_score + ((matched_pref_skills::NUMERIC / pref_skills_count) * 20.0);
    ELSE
        final_score := final_score + 20.0;
    END IF;

    -- Calculate CGPA ratio score
    IF opp.min_cgpa IS NOT NULL AND opp.min_cgpa > 0 THEN
        IF student.cgpa IS NOT NULL THEN
            IF student.cgpa >= opp.min_cgpa THEN
                cgpa_score := 10.0;
            ELSE
                cgpa_score := (student.cgpa / opp.min_cgpa) * 10.0;
            END IF;
        END IF;
        final_score := final_score + cgpa_score;
    ELSE
        final_score := final_score + 10.0;
    END IF;

    -- Calculate Verified Skills bonus
    SELECT COUNT(*) INTO verified_bonus
    FROM user_skills
    WHERE user_id = p_applicant_id AND verified = true AND (skill_id = ANY(opp.required_skills) OR skill_id = ANY(opp.preferred_skills));
    
    -- Cap bonus to 10 points max, let's say 2.5 points per verified relevant skill
    final_score := final_score + LEAST(verified_bonus * 2.5, 10.0);

    RETURN LEAST(ROUND(final_score, 2), 100.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Trigger to auto-compute match score on new application
CREATE OR REPLACE FUNCTION trigger_calculate_match_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.match_score := calculate_match_score(NEW.applicant_id, NEW.opportunity_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_application_match_score
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE PROCEDURE trigger_calculate_match_score();


-- 5. Audit Log Trigger
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB := NULL;
    v_new_data JSONB := NULL;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, v_old_data, v_new_data, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, v_old_data, NULL, auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, NULL, v_new_data, auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to key tables
CREATE TRIGGER audit_opportunities AFTER INSERT OR UPDATE OR DELETE ON opportunities FOR EACH ROW EXECUTE PROCEDURE log_audit_event();
CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE PROCEDURE log_audit_event();
CREATE TRIGGER audit_collaborations AFTER INSERT OR UPDATE OR DELETE ON collaborations FOR EACH ROW EXECUTE PROCEDURE log_audit_event();


-- ========================================================
-- FILE: 00006_seed_skills.sql
-- ========================================================

-- Migration: 00006_seed_skills.sql
-- Description: Seed initial skills into skills_master table.

INSERT INTO skills_master (name, category, sector) VALUES
-- Technical
('Python', 'Technical', 'IT'),
('JavaScript', 'Technical', 'IT'),
('Data Analysis', 'Technical', 'IT'),
('Machine Learning', 'Technical', 'IT'),
('SQL', 'Technical', 'IT'),
('Cloud Computing', 'Technical', 'IT'),
('Web Development', 'Technical', 'IT'),
('API Design', 'Technical', 'IT'),
('Mobile Development', 'Technical', 'IT'),
('DevOps', 'Technical', 'IT'),

-- Clinical/Ayush
('Panchakarma', 'Clinical/Ayush', 'Healthcare'),
('Dravyaguna', 'Clinical/Ayush', 'Healthcare'),
('Rasa Shastra', 'Clinical/Ayush', 'Healthcare'),
('Kayachikitsa', 'Clinical/Ayush', 'Healthcare'),
('Shalya Tantra', 'Clinical/Ayush', 'Healthcare'),
('Yoga Therapy', 'Clinical/Ayush', 'Healthcare'),
('Pharmacognosy', 'Clinical/Ayush', 'Healthcare'),
('Herbal Medicine', 'Clinical/Ayush', 'Healthcare'),
('Clinical Research', 'Clinical/Ayush', 'Healthcare'),
('Ayurvedic Diagnostics', 'Clinical/Ayush', 'Healthcare'),

-- Pharma/BioTech
('Drug Formulation', 'Pharma/BioTech', 'Pharmaceuticals'),
('Quality Control', 'Pharma/BioTech', 'Pharmaceuticals'),
('Pharmacology', 'Pharma/BioTech', 'Pharmaceuticals'),
('GMP Compliance', 'Pharma/BioTech', 'Pharmaceuticals'),
('Analytical Chemistry', 'Pharma/BioTech', 'Pharmaceuticals'),
('Molecular Biology', 'Pharma/BioTech', 'Pharmaceuticals'),
('Genomics', 'Pharma/BioTech', 'Pharmaceuticals'),
('Biostatistics', 'Pharma/BioTech', 'Pharmaceuticals'),
('Clinical Trials', 'Pharma/BioTech', 'Pharmaceuticals'),
('Regulatory Affairs', 'Pharma/BioTech', 'Pharmaceuticals'),

-- Soft Skills
('Communication', 'Soft Skills', 'General'),
('Leadership', 'Soft Skills', 'General'),
('Teamwork', 'Soft Skills', 'General'),
('Problem Solving', 'Soft Skills', 'General'),
('Critical Thinking', 'Soft Skills', 'General'),
('Time Management', 'Soft Skills', 'General'),
('Presentation', 'Soft Skills', 'General'),
('Project Management', 'Soft Skills', 'General'),
('Adaptability', 'Soft Skills', 'General'),
('Negotiation', 'Soft Skills', 'General'),

-- Domain (General)
('Research Methodology', 'Domain', 'Academia'),
('Technical Writing', 'Domain', 'General'),
('Patent Drafting', 'Domain', 'Legal'),
('Grant Writing', 'Domain', 'Academia'),
('Literature Review', 'Domain', 'Academia')
ON CONFLICT (name) DO NOTHING;

-- 00007: security hardening (kept in sync with migrations/00007_security_hardening.sql)
ALTER TABLE industry_partners ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_industry_partners_user_id ON industry_partners(user_id);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User'), COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role))
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = COALESCE((new.raw_user_meta_data->>'role')::user_role, EXCLUDED.role, 'student'::user_role), updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration and triggers" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Opportunity creators can view their applicants" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM applications a JOIN opportunities o ON o.id = a.opportunity_id WHERE a.applicant_id = profiles.id AND o.created_by = auth.uid()));
CREATE POLICY "Mentorship participants can view each other" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM mentorship_sessions ms WHERE auth.uid() IN (ms.mentor_id, ms.mentee_id) AND profiles.id IN (ms.mentor_id, ms.mentee_id)));
CREATE POLICY "Users can update permitted own profile fields" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE INSERT, DELETE ON profiles FROM anon, authenticated;
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone, bio, avatar_url) ON profiles TO authenticated;

DROP POLICY IF EXISTS "Users can manage own skills" ON user_skills;
CREATE POLICY "Users can insert unverified own skills" ON user_skills FOR INSERT WITH CHECK (auth.uid() = user_id AND verified = false AND verification_source = 'self_declared' AND verified_by IS NULL);
CREATE POLICY "Users can update own skill proficiency" ON user_skills FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON user_skills FOR DELETE USING (auth.uid() = user_id);
REVOKE UPDATE ON user_skills FROM anon, authenticated;
GRANT UPDATE (proficiency) ON user_skills TO authenticated;

DROP POLICY IF EXISTS "Students can view own details, admins can view all" ON student_details;
CREATE POLICY "Students and affiliated admins can view details" ON student_details FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p JOIN academician_details ad ON ad.user_id = p.id WHERE p.id = auth.uid() AND p.role = 'institution_admin' AND ad.institution_id = student_details.institution_id));
DROP POLICY IF EXISTS "Users view own skills, admins view all" ON user_skills;
CREATE POLICY "Users and affiliated admins can view skills" ON user_skills FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM student_details sd JOIN profiles p ON p.id = auth.uid() JOIN academician_details ad ON ad.user_id = p.id WHERE sd.user_id = user_skills.user_id AND p.role = 'institution_admin' AND ad.institution_id = sd.institution_id));
DROP POLICY IF EXISTS "Applicants view own, creators view all for their opps" ON applications;
CREATE POLICY "Applicants, creators and affiliated admins can view applications" ON applications FOR SELECT USING (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.created_by = auth.uid()) OR EXISTS (SELECT 1 FROM student_details sd JOIN profiles p ON p.id = auth.uid() JOIN academician_details ad ON ad.user_id = p.id WHERE sd.user_id = applications.applicant_id AND p.role = 'institution_admin' AND ad.institution_id = sd.institution_id));
DROP POLICY IF EXISTS "Industry partners and super admins can update" ON industry_partners;
CREATE POLICY "Partners update their own organisation" ON industry_partners FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')) WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "Questions viewable if assessment is viewable" ON assessment_questions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Admins and partners can insert opportunities" ON opportunities;
CREATE POLICY "Verified organisations can insert their own opportunities" ON opportunities FOR INSERT WITH CHECK (created_by = auth.uid() AND ((EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'industry_partner') AND EXISTS (SELECT 1 FROM industry_partners ip WHERE ip.id = industry_id AND ip.user_id = auth.uid())) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin'))));
DROP POLICY IF EXISTS "Applicants can insert own applications" ON applications;
CREATE POLICY "Eligible users can apply to active opportunities" ON applications FOR INSERT WITH CHECK (applicant_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('student', 'academician')) AND EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.status = 'active' AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE)));
DROP POLICY IF EXISTS "Authenticated users can insert collaborations" ON collaborations;
DROP POLICY IF EXISTS "Participants can update collaborations" ON collaborations;
CREATE POLICY "Proposers can cancel their proposals" ON collaborations FOR UPDATE USING (auth.uid() = proposed_by) WITH CHECK (auth.uid() = proposed_by AND status IN ('proposed', 'cancelled'));

REVOKE UPDATE ON applications, opportunities FROM anon, authenticated;
GRANT UPDATE (status, reviewer_id, feedback, status_history) ON applications TO authenticated;
GRANT UPDATE (status, title, type, description, location, is_remote, stipend_min, stipend_max, duration_months, required_skills, preferred_skills, min_cgpa, target_degrees, target_departments, openings_count, deadline) ON opportunities TO authenticated;

CREATE OR REPLACE FUNCTION increment_views(opp_id UUID) RETURNS VOID AS $$
BEGIN UPDATE public.opportunities SET views_count = views_count + 1 WHERE id = opp_id AND status = 'active'; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon, authenticated;
