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


-- Profiles: SELECT for all, UPDATE only own, INSERT allowed for registrations & triggers
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

-- Collaborations: SELECT for all authenticated users, INSERT for authenticated
CREATE POLICY "Collaborations viewable by all authenticated users" ON collaborations FOR SELECT USING (auth.uid() IS NOT NULL);
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
