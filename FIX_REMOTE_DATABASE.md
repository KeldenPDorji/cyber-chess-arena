# Fix: Add last_move_at Column to Remote Database

## The Problem
Your local migration file defines `last_move_at`, but it was never applied to your **remote** Supabase database.

## Quick Fix (Add just the missing column)

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Add the missing column
ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS last_move_at TIMESTAMP WITH TIME ZONE;
```

## Full Fix (Apply entire migration - SAFER)

If you want to ensure everything matches, run the entire migration from your file:

```sql
-- If the table already exists, this will fail safely
-- You can drop and recreate, or just add missing columns

-- Add missing columns if they don't exist
ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS last_move_at TIMESTAMP WITH TIME ZONE;

-- Add any other missing columns
ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS time_control_minutes INTEGER;

ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS time_increment INTEGER;

ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS draw_offered_by TEXT;

ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS resigned_by TEXT;

ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS left_by TEXT;

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chess_games'
ORDER BY ordinal_position;
```

## After Running

1. **Hard refresh your browser**: `Cmd + Shift + R`
2. **Test a move** - it should sync now!

## Why This Happened

You created the table directly in Supabase Dashboard (or via an older method) before the migration file existed. The migration file was added later but never applied to your remote database.

**IMPORTANT**: Don't delete the migration file! Keep it for future deployments and documentation.
