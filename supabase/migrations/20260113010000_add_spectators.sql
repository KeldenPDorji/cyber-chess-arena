-- Create game_spectators table for tracking spectators
CREATE TABLE IF NOT EXISTS public.game_spectators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES public.chess_games(id) ON DELETE CASCADE,
  spectator_name text NOT NULL,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_heartbeat timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(game_id, spectator_name)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS game_spectators_game_id_idx ON public.game_spectators(game_id);
CREATE INDEX IF NOT EXISTS game_spectators_heartbeat_idx ON public.game_spectators(last_heartbeat);

-- Enable Row Level Security
ALTER TABLE public.game_spectators ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read spectators
CREATE POLICY "Anyone can read spectators"
  ON public.game_spectators FOR SELECT
  USING (true);

-- Allow anyone to insert spectators (join as spectator)
CREATE POLICY "Anyone can join as spectator"
  ON public.game_spectators FOR INSERT
  WITH CHECK (true);

-- Allow spectators to update their own heartbeat
CREATE POLICY "Spectators can update their heartbeat"
  ON public.game_spectators FOR UPDATE
  USING (true);

-- Allow spectators to delete themselves (leave)
CREATE POLICY "Anyone can leave as spectator"
  ON public.game_spectators FOR DELETE
  USING (true);

-- Enable realtime for game_spectators
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_spectators;

-- Function to clean up inactive spectators (older than 30 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_spectators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.game_spectators
  WHERE last_heartbeat < (now() - interval '30 seconds');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a scheduled job to clean up inactive spectators (optional - can be called manually)
-- This comment shows how to set up the cleanup if needed:
-- SELECT cron.schedule('cleanup-spectators', '*/1 * * * *', 'SELECT public.cleanup_inactive_spectators()');
