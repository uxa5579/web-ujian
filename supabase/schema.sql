-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_color TEXT DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Grant schema and table access to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant schema and table access to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "users_select_public" ON users;
DROP POLICY IF EXISTS "users_insert_public" ON users;
DROP POLICY IF EXISTS "users_update_public" ON users;
DROP POLICY IF EXISTS "scores_select_public" ON scores;
DROP POLICY IF EXISTS "scores_insert_public" ON scores;
DROP POLICY IF EXISTS "scores_update_public" ON scores;

-- Users policies: allow public read, insert, update
CREATE POLICY "users_select_public" ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "users_insert_public" ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_public" ON users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Scores policies: allow public read, insert, update
CREATE POLICY "scores_select_public" ON scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "scores_insert_public" ON scores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "scores_update_public" ON scores
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
