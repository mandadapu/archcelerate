-- Enable required extensions for AI/ML workloads
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Note: pgvector extension needs to be installed separately
-- For local development, you may need to:
-- docker exec -it aicelerate-db psql -U aicelerate -c "CREATE EXTENSION vector;"

-- Create indexes for common queries (migrations will create tables)
-- These will be created after Prisma migrations run

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aicelerate;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aicelerate;
GRANT ALL PRIVILEGES ON SCHEMA public TO aicelerate;
