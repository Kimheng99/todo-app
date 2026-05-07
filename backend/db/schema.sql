-- ============================================================
-- schema.sql
-- Run this file to create the database tables.
-- 
-- How to run:
--   psql -U postgres -d todoapp -f schema.sql
-- ============================================================

-- Create users table
-- This stores all registered user accounts.
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,           -- Auto-incrementing unique ID
  name        VARCHAR(100) NOT NULL,        -- User's display name
  email       VARCHAR(255) UNIQUE NOT NULL, -- Email must be unique (no duplicates)
  password    VARCHAR(255) NOT NULL,        -- Hashed password (NEVER plain text)
  created_at  TIMESTAMP DEFAULT NOW()       -- When the account was created
);

-- Create todos table
-- Each todo belongs to a user via the user_id foreign key.
CREATE TABLE IF NOT EXISTS todos (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              -- ON DELETE CASCADE means: if a user is deleted,
              -- all their todos are automatically deleted too.
  title       VARCHAR(500) NOT NULL,        -- The todo text
  completed   BOOLEAN DEFAULT FALSE,        -- Done or not done
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Index on todos.user_id for faster queries
-- Without this index, every "get my todos" query would scan the whole table.
-- With the index, PostgreSQL can jump directly to the right rows.
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Optional: verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
