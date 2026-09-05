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
