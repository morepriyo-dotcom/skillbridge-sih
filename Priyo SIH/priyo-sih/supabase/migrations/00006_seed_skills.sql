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
