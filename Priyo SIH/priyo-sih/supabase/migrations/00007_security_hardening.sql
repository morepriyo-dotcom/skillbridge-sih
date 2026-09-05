-- Security hardening and organisation ownership.
-- Apply after the existing migrations. Existing partner records must be assigned
-- to their owner through industry_partners.user_id by a trusted administrator.

ALTER TABLE industry_partners
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_industry_partners_user_id ON industry_partners(user_id);

-- Never derive an authority level from editable auth metadata.
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
        role = COALESCE((new.raw_user_meta_data->>'role')::user_role, EXCLUDED.role, 'student'::user_role),
        updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles are private except where a recruiter needs an applicant record.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration and triggers" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Opportunity creators can view their applicants" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN opportunities o ON o.id = a.opportunity_id
        WHERE a.applicant_id = profiles.id AND o.created_by = auth.uid()
    )
);
CREATE POLICY "Mentorship participants can view each other" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM mentorship_sessions ms
        WHERE auth.uid() IN (ms.mentor_id, ms.mentee_id)
          AND profiles.id IN (ms.mentor_id, ms.mentee_id)
    )
);
CREATE POLICY "Users can update permitted own profile fields" ON profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
REVOKE INSERT, DELETE ON profiles FROM anon, authenticated;
REVOKE UPDATE ON profiles FROM anon, authenticated;
GRANT UPDATE (full_name, phone, bio, avatar_url) ON profiles TO authenticated;

-- A user may self-declare a skill, but cannot mint a verification credential.
DROP POLICY IF EXISTS "Users can manage own skills" ON user_skills;
CREATE POLICY "Users can insert unverified own skills" ON user_skills FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND verified = false
    AND verification_source = 'self_declared'
    AND verified_by IS NULL
);
CREATE POLICY "Users can update own skill proficiency" ON user_skills FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON user_skills FOR DELETE USING (auth.uid() = user_id);
REVOKE UPDATE ON user_skills FROM anon, authenticated;
GRANT UPDATE (proficiency) ON user_skills TO authenticated;

-- Questions and submissions are handled exclusively by authenticated server code
-- using the service role after it has validated and graded the attempt.
DROP POLICY IF EXISTS "Questions viewable if assessment is viewable" ON assessment_questions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON assessment_submissions;

DROP POLICY IF EXISTS "Admins and partners can insert opportunities" ON opportunities;
CREATE POLICY "Verified organisations can insert their own opportunities" ON opportunities FOR INSERT WITH CHECK (
  created_by = auth.uid() AND (
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'industry_partner')
      AND EXISTS (SELECT 1 FROM industry_partners ip WHERE ip.id = industry_id AND ip.user_id = auth.uid()))
    OR
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin')))
  )
);

DROP POLICY IF EXISTS "Applicants can insert own applications" ON applications;
CREATE POLICY "Eligible users can apply to active opportunities" ON applications FOR INSERT WITH CHECK (
  applicant_id = auth.uid()
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('student', 'academician'))
  AND EXISTS (
    SELECT 1 FROM opportunities o
    WHERE o.id = opportunity_id AND o.status = 'active'
      AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE)
  )
);

DROP POLICY IF EXISTS "Authenticated users can insert collaborations" ON collaborations;

-- Prevent direct API clients from changing ownership, assessment outcomes, or
-- opportunity provenance; server actions update only the intended fields.
REVOKE UPDATE ON applications, opportunities FROM anon, authenticated;
GRANT UPDATE (status, reviewer_id, feedback, status_history) ON applications TO authenticated;
GRANT UPDATE (status, title, type, description, location, is_remote, stipend_min,
              stipend_max, duration_months, required_skills, preferred_skills,
              min_cgpa, target_degrees, target_departments, openings_count, deadline)
  ON opportunities TO authenticated;

DROP POLICY IF EXISTS "Participants can update collaborations" ON collaborations;
CREATE POLICY "Proposers can cancel their proposals" ON collaborations FOR UPDATE
  USING (auth.uid() = proposed_by)
  WITH CHECK (auth.uid() = proposed_by AND status IN ('proposed', 'cancelled'));

CREATE OR REPLACE FUNCTION increment_views(opp_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.opportunities
  SET views_count = views_count + 1
  WHERE id = opp_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon, authenticated;

-- Institution administrators can only access students in their own affiliation.
DROP POLICY IF EXISTS "Students can view own details, admins can view all" ON student_details;
CREATE POLICY "Students and affiliated admins can view details" ON student_details FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles p
        JOIN academician_details ad ON ad.user_id = p.id
        WHERE p.id = auth.uid()
          AND p.role = 'institution_admin'
          AND ad.institution_id = student_details.institution_id
    )
);

DROP POLICY IF EXISTS "Users view own skills, admins view all" ON user_skills;
CREATE POLICY "Users and affiliated admins can view skills" ON user_skills FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM student_details sd
    JOIN profiles p ON p.id = auth.uid()
    JOIN academician_details ad ON ad.user_id = p.id
    WHERE sd.user_id = user_skills.user_id
      AND p.role = 'institution_admin'
      AND ad.institution_id = sd.institution_id
  )
);

DROP POLICY IF EXISTS "Applicants view own, creators view all for their opps" ON applications;
CREATE POLICY "Applicants, creators and affiliated admins can view applications" ON applications FOR SELECT USING (
  auth.uid() = applicant_id
  OR EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.created_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM student_details sd
    JOIN profiles p ON p.id = auth.uid()
    JOIN academician_details ad ON ad.user_id = p.id
    WHERE sd.user_id = applications.applicant_id
      AND p.role = 'institution_admin'
      AND ad.institution_id = sd.institution_id
  )
);

-- Partners can only maintain their own organisation record.
DROP POLICY IF EXISTS "Industry partners and super admins can update" ON industry_partners;
CREATE POLICY "Partners update their own organisation" ON industry_partners FOR UPDATE USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
) WITH CHECK (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
