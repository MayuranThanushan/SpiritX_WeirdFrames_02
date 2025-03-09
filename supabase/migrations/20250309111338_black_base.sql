/*
  # Initial Spirit11 Schema

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text)
      - `university` (text)
      - `role` (text)
      - `total_runs` (integer)
      - `total_balls_faced` (integer)
      - `innings_played` (integer)
      - `total_balls_bowled` (integer)
      - `total_wickets` (integer)
      - `total_runs_conceded` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `teams`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `budget_remaining` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `team_players`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `player_id` (uuid, references players)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  university text NOT NULL,
  role text NOT NULL,
  total_runs integer DEFAULT 0,
  total_balls_faced integer DEFAULT 0,
  innings_played integer DEFAULT 0,
  total_balls_bowled integer DEFAULT 0,
  total_wickets integer DEFAULT 0,
  total_runs_conceded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  budget_remaining integer DEFAULT 9000000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_players table
CREATE TABLE IF NOT EXISTS team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams NOT NULL,
  player_id uuid REFERENCES players NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players are viewable by all authenticated users"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert players"
  ON players
  FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update players"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete players"
  ON players
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Teams policies
CREATE POLICY "Users can view their own teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Team players policies
CREATE POLICY "Users can view their team players"
  ON team_players
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_players.team_id
      AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their team players"
  ON team_players
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_players.team_id
      AND teams.user_id = auth.uid()
    )
  );

-- Create functions for player points and value calculations
CREATE OR REPLACE FUNCTION calculate_player_points(
  p_total_runs integer,
  p_total_balls_faced integer,
  p_innings_played integer,
  p_total_balls_bowled integer,
  p_total_wickets integer,
  p_total_runs_conceded integer
) RETURNS float AS $$
DECLARE
  batting_strike_rate float;
  batting_average float;
  bowling_strike_rate float;
  economy_rate float;
BEGIN
  -- Calculate batting stats
  batting_strike_rate := CASE 
    WHEN p_total_balls_faced > 0 THEN (p_total_runs::float / p_total_balls_faced::float) * 100
    ELSE 0
  END;
  
  batting_average := CASE 
    WHEN p_innings_played > 0 THEN p_total_runs::float / p_innings_played::float
    ELSE 0
  END;

  -- Calculate bowling stats
  bowling_strike_rate := CASE 
    WHEN p_total_wickets > 0 THEN p_total_balls_bowled::float / p_total_wickets::float
    ELSE 999999 -- Large number to handle division by zero
  END;
  
  economy_rate := CASE 
    WHEN p_total_balls_bowled > 0 THEN (p_total_runs_conceded::float / p_total_balls_bowled::float) * 6
    ELSE 999999 -- Large number to handle division by zero
  END;

  -- Calculate total points using the provided formula
  RETURN (
    (batting_strike_rate / 5 + batting_average * 0.8) +
    (500 / NULLIF(bowling_strike_rate, 0) + 140 / NULLIF(economy_rate, 0))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate player value
CREATE OR REPLACE FUNCTION calculate_player_value(points float) 
RETURNS integer AS $$
BEGIN
  -- Round to nearest 50,000
  RETURN ROUND(((9 * points + 100) * 1000) / 50000) * 50000;
END;
$$ LANGUAGE plpgsql;

-- Create view for player statistics with points and value
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  p.*,
  calculate_player_points(
    p.total_runs,
    p.total_balls_faced,
    p.innings_played,
    p.total_balls_bowled,
    p.total_wickets,
    p.total_runs_conceded
  ) as points,
  calculate_player_value(
    calculate_player_points(
      p.total_runs,
      p.total_balls_faced,
      p.innings_played,
      p.total_balls_bowled,
      p.total_wickets,
      p.total_runs_conceded
    )
  ) as value
FROM players p;

-- Create tournament summary view
CREATE OR REPLACE VIEW tournament_summary AS
SELECT 
  SUM(total_runs) as overall_runs,
  SUM(total_wickets) as overall_wickets,
  (
    SELECT name 
    FROM players 
    ORDER BY total_runs DESC 
    LIMIT 1
  ) as highest_run_scorer,
  (
    SELECT name 
    FROM players 
    ORDER BY total_wickets DESC 
    LIMIT 1
  ) as highest_wicket_taker
FROM players;