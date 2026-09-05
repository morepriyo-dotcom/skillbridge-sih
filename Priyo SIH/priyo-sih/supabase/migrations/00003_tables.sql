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
