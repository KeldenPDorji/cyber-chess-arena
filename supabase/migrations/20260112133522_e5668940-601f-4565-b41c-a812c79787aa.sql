-- Create chess_games table for multiplayer
CREATE TABLE public.chess_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_code TEXT NOT NULL UNIQUE,
  white_player_name TEXT,
  black_player_name TEXT,
  fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  turn TEXT NOT NULL DEFAULT 'w',
  white_time INTEGER NOT NULL DEFAULT 600,
  black_time INTEGER NOT NULL DEFAULT 600,
  last_move_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;

-- Allow public read access (games are shareable via link)
CREATE POLICY "Anyone can view games" 
ON public.chess_games 
FOR SELECT 
USING (true);

-- Allow public insert (anyone can create a game)
CREATE POLICY "Anyone can create games" 
ON public.chess_games 
FOR INSERT 
WITH CHECK (true);

-- Allow public update (players can make moves)
CREATE POLICY "Anyone can update games" 
ON public.chess_games 
FOR UPDATE 
USING (true);

-- Enable realtime for games table
ALTER TABLE public.chess_games REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_games;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chess_games_updated_at
BEFORE UPDATE ON public.chess_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();