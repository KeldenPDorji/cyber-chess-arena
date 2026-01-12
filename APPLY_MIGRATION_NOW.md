# 🎯 INSTANT FIX - Apply Migration Now

## Copy This SQL and Run It in Supabase

### 1. Open This Link:
**https://supabase.com/dashboard/project/_/sql/new**

(Replace `_` with your project ID, or just navigate: Dashboard → Your Project → SQL Editor → New Query)

### 2. Copy and Paste This Exact SQL:

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

### 3. Click "Run" (or press Ctrl+Enter / Cmd+Enter)

### 4. You should see: "Success. No rows returned"

### 5. Refresh your app (Ctrl+Shift+R / Cmd+Shift+R)

### 6. Test: Click "Offer Draw" → Should see "Draw offer sent to opponent" ✅

---

## That's It! 

Once you've done this, come back and let me know what the next issue is! 🚀

---

## Visual Guide:

```
Supabase Dashboard
    ↓
[SQL Editor] (in left sidebar)
    ↓
[+ New Query] (top right button)
    ↓
[Paste the SQL above]
    ↓
[Click "Run" button]
    ↓
See "Success. No rows returned"
    ↓
Done! ✅
```

---

## Can't Find SQL Editor?

1. Make sure you're logged into Supabase
2. Select your project from the dashboard
3. Look in the left sidebar for "SQL Editor"
4. If you don't see it, check your project permissions

---

## Need Help?

If you get any errors when running the SQL:
- Copy the exact error message
- Let me know what it says
- We'll troubleshoot together

Otherwise, once this is done, we can move on to the next issue! 🎯
