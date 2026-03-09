-- ============================================
-- Price Guessing Game — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Game Sessions: stores active game state (replaces in-memory Map)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  total_rounds SMALLINT NOT NULL CHECK (total_rounds IN (5, 10)),
  products JSONB NOT NULL,
  current_round SMALLINT NOT NULL DEFAULT 0,
  rounds_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_score INTEGER NOT NULL DEFAULT 0,
  lifelines_used JSONB NOT NULL DEFAULT '{"category": false, "range": false}'::jsonb,
  lifelines_used_this_round JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Index for expired session cleanup/filtering
CREATE INDEX idx_sessions_expires ON game_sessions (expires_at);

-- Leaderboard: stores submitted scores (replaces in-memory array)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 30),
  score INTEGER NOT NULL DEFAULT 0,
  rounds_played SMALLINT NOT NULL,
  game_mode SMALLINT NOT NULL CHECK (game_mode IN (5, 10)),
  country_code TEXT NOT NULL DEFAULT 'XX',
  country_name TEXT NOT NULL DEFAULT 'Unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboard query indexes
CREATE INDEX idx_lb_score ON leaderboard (score DESC);
CREATE INDEX idx_lb_mode_score ON leaderboard (game_mode, score DESC);
CREATE INDEX idx_lb_country ON leaderboard (country_code);

-- Optional: cleanup function for expired sessions
-- Can be scheduled with pg_cron on Supabase Pro plan
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM game_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
