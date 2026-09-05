-- Migration: 00001_extensions.sql
-- Description: Enable required extensions for the project.

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings and vector similarity search
-- Note: 'vector' is the standard name for pgvector extension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;

-- Enable pg_trgm for trigram based fuzzy search on text columns
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
