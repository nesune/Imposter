-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(4) UNIQUE NOT NULL,
  host_id VARCHAR(255) NOT NULL,
  host_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'waiting',
  category JSONB,
  word_pair JSONB,
  players JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create room_players table
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(255) NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  is_imposter BOOLEAN,
  word VARCHAR(255),
  user_id VARCHAR(255),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- Create room_chats table
CREATE TABLE IF NOT EXISTS room_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(255) NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create room_votes table
CREATE TABLE IF NOT EXISTS room_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  voter_id VARCHAR(255) NOT NULL,
  voted_player_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, voter_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_chats_room_id ON room_chats(room_id);
CREATE INDEX IF NOT EXISTS idx_room_votes_room_id ON room_votes(room_id);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a game, we allow public read/write)
-- In production, you might want to add authentication
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to rooms" ON rooms
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to rooms" ON rooms
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to room_players" ON room_players
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to room_players" ON room_players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to room_players" ON room_players
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to room_players" ON room_players
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to room_chats" ON room_chats
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to room_chats" ON room_chats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to room_votes" ON room_votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to room_votes" ON room_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete to room_votes" ON room_votes
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
