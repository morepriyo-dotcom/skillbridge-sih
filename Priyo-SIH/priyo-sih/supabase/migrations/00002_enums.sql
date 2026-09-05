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
