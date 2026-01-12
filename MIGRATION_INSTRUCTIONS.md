# Apply Database Migration

To apply the new database migration that adds draw offers and time control features:

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project: `bcykhixunoaxyjjhijoq`
3. Go to **SQL Editor**
4. Create a new query and paste:

```sql
-- Add draw offer and time control fields to chess_games table
ALTER TABLE public.chess_games 
ADD COLUMN IF NOT EXISTS draw_offered_by TEXT,
ADD COLUMN IF NOT EXISTS time_control INTEGER DEFAULT 600,
ADD COLUMN IF NOT EXISTS time_increment INTEGER DEFAULT 0;

-- Update existing games to have default values
UPDATE public.chess_games 
SET time_control = 600, time_increment = 0 
WHERE time_control IS NULL;
```

5. Click **Run** to execute the migration

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/keldendrac/Desktop/cyber/cyber-chess-arena
supabase db push
```

## Verify Migration

After running, verify in the SQL Editor:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'chess_games';
```

You should see the new columns: `draw_offered_by`, `time_control`, `time_increment`
