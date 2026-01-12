-- Add draw offer and time control fields to chess_games table
ALTER TABLE public.chess_games 
ADD COLUMN IF NOT EXISTS draw_offered_by TEXT,
ADD COLUMN IF NOT EXISTS time_control INTEGER DEFAULT 600,
ADD COLUMN IF NOT EXISTS time_increment INTEGER DEFAULT 0;

-- Update existing games to have default values
UPDATE public.chess_games 
SET time_control = 600, time_increment = 0 
WHERE time_control IS NULL;
