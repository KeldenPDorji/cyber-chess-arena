# Adding the last_move_at Column

## Problem
The error `Could not find the 'last_move_at' column of 'chess_games' in the schema cache` indicates that your database is missing this column.

## Solution

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
ALTER TABLE chess_games 
ADD COLUMN IF NOT EXISTS last_move_at TIMESTAMP WITH TIME ZONE;
```

4. Click "Run" to execute the query

## Verify
After running the SQL, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chess_games';
```

You should see `last_move_at` listed with type `timestamp with time zone`.

## Alternative: Browser Cache Issue
If the column already exists, the issue might be browser caching. Try:
- Hard refresh: **Cmd + Shift + R** (macOS)
- Or clear browser cache completely
