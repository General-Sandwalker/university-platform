-- Initial database setup script
-- This script runs when the PostgreSQL container is first initialized

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create custom types (if needed in the future)
-- Example: CREATE TYPE user_role AS ENUM ('student', 'teacher', 'department_head', 'admin');

-- Note: Tables will be created by TypeORM migrations
-- This file is for additional setup only

-- Create indexes for performance (will be handled by TypeORM mostly)
-- But we can add custom ones here if needed later

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;
