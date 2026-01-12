# Debug Draw Offer Feature

## Issue
The "Offer Draw" button doesn't appear to be working - nothing happens when clicked.

## Root Cause
The `draw_offered_by` column doesn't exist in your Supabase database yet. The code is working correctly, but the database update is failing silently.

## How to Verify the Problem

### Method 1: Check Browser Console
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the Console tab
3. Click the "Offer Draw" button
4. Look for error messages containing:
   - `❌ Error offering draw:`
   - `column "draw_offered_by" does not exist`
   - `🚨 DATABASE MIGRATION NEEDED!`

### Method 2: Check Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **chess_games** table
3. Check if you see these columns:
   - `draw_offered_by` (text type)
   - `time_control` (integer type)
   - `time_increment` (integer type)
4. If these columns are **missing**, the migration hasn't been applied

## Solution: Apply the Database Migration

### Step 1: Locate the Migration File
The migration SQL is already created at:
```
supabase/migrations/20260112140000_add_draw_and_timer.sql
```

### Step 2: Apply Migration via Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   
2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   
3. **Run the Migration**
   - Click "New Query"
   - Copy and paste this SQL:

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

4. **Execute the Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see "Success. No rows returned"

5. **Verify the Columns Exist**
   - Go to Table Editor → chess_games
   - Confirm the new columns are present

### Step 3: Test the Feature

1. **Refresh your app** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Start a new game** (or join an existing one)
3. **Click "Offer Draw"**
4. **Check the console** - you should now see:
   ```
   🤝 Offering draw... { playerColor: 'w', gameId: '...', currentDrawOffer: null }
   ✅ Draw offer successful! [...]
   ```
5. **Opponent should see** "Your opponent has offered a draw!" notification
6. **Opponent's "Offer Draw" button** should change to "Draw Offered!" with Accept/Decline options

## Expected Behavior After Fix

### When You Offer Draw:
1. Button becomes temporarily disabled
2. Console shows: `✅ Draw offer successful!`
3. Toast notification: "Draw offer sent to opponent"
4. Your opponent sees an animated "Draw Offered!" button
5. Database `draw_offered_by` column is set to your player color ('w' or 'b')

### When Opponent Offers Draw:
1. You see toast: "Your opponent has offered a draw!"
2. "Offer Draw" button changes to animated "Draw Offered!"
3. Clicking it opens Accept/Decline dialog
4. Accept → Game ends as draw
5. Decline → Button returns to "Offer Draw"

### When Draw Offer is Declined:
1. The offerer sees toast: "Draw offer declined by opponent"
2. Button returns to normal "Offer Draw" state
3. Game continues normally

## Still Not Working?

If you've applied the migration and it's still not working:

1. **Check Console for Errors**
   ```javascript
   // Look for any of these in console:
   - "Cannot offer draw: missing gameState or playerColor"
   - "❌ Error offering draw:"
   - Any other error messages
   ```

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Filter by "fetch" or "XHR"
   - Click "Offer Draw"
   - Look for a request to Supabase
   - Click on it and check the Response

3. **Verify Game State**
   - Open console and type:
   ```javascript
   localStorage.getItem('playerName')
   ```
   - Should return your player name
   - If null, you need to set your name in the lobby

4. **Check Supabase Connection**
   - Verify your `.env` file has correct Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Debug Commands

Run these in your browser console to debug:

```javascript
// Check if player is properly set up
console.log({
  playerName: localStorage.getItem('playerName'),
  gameCode: new URLSearchParams(window.location.search).get('game')
});

// After clicking Offer Draw, check the game state
// (This will be logged automatically, just look for it in console)
```

## Alternative: Manual Database Update

If you can't run SQL in Supabase dashboard, use this workaround:

1. Export your current games table
2. Add the three columns manually using the Table Editor UI:
   - `draw_offered_by` - type: text, nullable: yes
   - `time_control` - type: int4, default: 600, nullable: yes
   - `time_increment` - type: int4, default: 0, nullable: yes
3. Refresh your app

## Related Documentation

- `FIX_DRAW_OFFER.md` - Detailed explanation of draw offer implementation
- `WINNER_DISPLAY_AND_DRAW_SYSTEM.md` - How draw system works
- `PROJECT_STATUS.md` - Overall project status
