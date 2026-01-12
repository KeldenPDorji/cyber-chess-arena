# Set Up Your Own Supabase Project

## Step 1: Create Supabase Account (2 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email
4. Click **"New Project"**
5. Fill in:
   - **Name**: `cyber-chess` (or anything you want)
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click **"Create new project"**
7. Wait ~2 minutes for it to set up

## Step 2: Create the chess_games Table (1 minute)

1. In your new project, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy and paste this ENTIRE SQL:

```sql
-- Create chess_games table with all required columns
CREATE TABLE IF NOT EXISTS public.chess_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  game_code TEXT UNIQUE NOT NULL,
  white_player_name TEXT,
  black_player_name TEXT,
  fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT,
  status TEXT DEFAULT 'waiting',
  turn TEXT DEFAULT 'w',
  white_time INTEGER DEFAULT 600,
  black_time INTEGER DEFAULT 600,
  draw_offered_by TEXT,
  time_control INTEGER DEFAULT 600,
  time_increment INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read/write access
CREATE POLICY "Enable read access for all users" ON public.chess_games
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.chess_games
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.chess_games
  FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chess_games;
```

4. Click **"Run"** (Ctrl+Enter)
5. You should see: **"Success"**

## Step 3: Get Your API Keys (30 seconds)

1. Click **"Settings"** (gear icon in sidebar)
2. Click **"API"**
3. You'll see:
   - **Project URL**: Copy this
   - **anon public key**: Copy this

## Step 4: Update Your .env File (30 seconds)

Replace your `.env` file with:

```env
VITE_SUPABASE_URL="YOUR_PROJECT_URL_HERE"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_ANON_KEY_HERE"
```

Example:
```env
VITE_SUPABASE_URL="https://xyzabc123.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Important:** The key is called `VITE_SUPABASE_PUBLISHABLE_KEY` (not ANON_KEY)

## Step 5: Restart Your App

```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

## Done! ✅

Your chess app is now using YOUR Supabase project with all the required columns already set up!

## Troubleshooting

**Error: "relation chess_games does not exist"**
→ Go back to Step 2 and make sure the SQL ran successfully

**Error: "Invalid API key"**
→ Double-check you copied the correct keys from Settings → API

**Games not syncing**
→ Make sure you ran the "Enable Realtime" part of the SQL

---

That's it! Much simpler than trying to access Lovable's Supabase. Now you have full control! 🚀
