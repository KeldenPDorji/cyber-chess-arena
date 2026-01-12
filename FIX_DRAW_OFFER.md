# 🔧 Fix Draw Offer Feature - Database Migration Required

## ⚠️ Issue
The draw offer feature isn't working because the `draw_offered_by` column doesn't exist in your Supabase database yet.

---

## ✅ Solution: Apply Database Migration

### Step 1: Go to Supabase Dashboard
1. Open your browser
2. Go to https://supabase.com
3. Sign in to your account
4. Select your project

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Run This Migration SQL
Copy and paste this SQL into the editor:

```sql
-- Add draw_offered_by column to chess_games table
ALTER TABLE public.chess_games 
ADD COLUMN IF NOT EXISTS draw_offered_by TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chess_games' 
AND column_name = 'draw_offered_by';
```

### Step 4: Execute
1. Click the **"RUN"** button (or press `Cmd+Enter`)
2. You should see confirmation that the column was added
3. The second query should return:
   ```
   column_name      | data_type
   -----------------|----------
   draw_offered_by  | text
   ```

---

## 🧪 Test Draw Offer Feature

After applying the migration:

### Test 1: Offer Draw
1. Start your dev server: `npm run dev`
2. Create a game
3. Join with a friend (or open incognito window)
4. Click **"Offer Draw"** button
5. ✅ Should see toast: "Draw offer sent to opponent"

### Test 2: Opponent Sees Offer
1. On opponent's screen
2. ✅ Should see pulsing **"Draw Offered!"** button
3. ✅ Should see toast: "Your opponent has offered a draw!"

### Test 3: Accept Draw
1. Click **"Draw Offered!"** button
2. Click **"Accept Draw"**
3. ✅ Game should end
4. ✅ Both players see "Draw!" status

### Test 4: Decline Draw
1. Player A offers draw
2. Player B clicks **"Draw Offered!"**
3. Player B clicks **"Decline"**
4. ✅ Player A sees toast: "Draw offer declined by opponent"
5. ✅ Game continues normally

---

## 🔍 Debug: Check if Column Exists

If you're not sure if the migration was applied:

### Check in Supabase Dashboard:
1. Go to **Table Editor**
2. Select **chess_games** table
3. Look for **draw_offered_by** column in the columns list

### Check via SQL:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chess_games';
```

Should show all columns including:
- `draw_offered_by` (text)
- `white_player_name` (text)
- `black_player_name` (text)
- etc.

---

## 📊 Expected Console Logs

Once working, you should see these logs:

### When Offering Draw:
```javascript
Offering draw, playerColor: w, gameState.id: uuid-here
Draw offer successful, updated data: [{...}]
```

### In Game.tsx:
```javascript
Draw offer status: {
  draw_offered_by: "w",  // or "b"
  playerColor: "b",      // opposite player
  drawOfferedByOpponent: true
}
```

---

## ❌ Common Issues

### Issue 1: "column 'draw_offered_by' does not exist"
**Solution:** Run the migration SQL above

### Issue 2: Permission denied
**Solution:** Make sure you're signed in to Supabase and have owner/admin access

### Issue 3: Button doesn't appear
**Solution:** 
1. Check browser console for errors
2. Make sure both players are in an active game
3. Verify database was updated (check Table Editor)

### Issue 4: Can't click Accept/Decline
**Solution:** 
1. Refresh both browsers
2. Clear cache
3. Check if gameState is updating via Realtime

---

## 🚀 Quick Test Script

Run this in your browser console to check if the feature is working:

```javascript
// Check game state
const gameCode = "YOUR_GAME_CODE"; // Get from URL

// This will show if draw_offered_by is in the database
supabase
  .from("chess_games")
  .select("draw_offered_by, status")
  .eq("game_code", gameCode)
  .single()
  .then(({data, error}) => {
    if (error) {
      console.error("Error:", error.message);
      if (error.message.includes("draw_offered_by")) {
        console.error("❌ draw_offered_by column doesn't exist!");
        console.log("👉 Apply the migration in Supabase Dashboard");
      }
    } else {
      console.log("✅ Game state:", data);
      console.log("Draw offered by:", data.draw_offered_by || "none");
    }
  });
```

---

## 📋 Checklist

Before testing:
- [ ] Applied SQL migration in Supabase Dashboard
- [ ] Verified column exists in Table Editor
- [ ] Dev server is running (`npm run dev`)
- [ ] Two browsers/windows ready for testing

After applying migration:
- [ ] Offer draw works
- [ ] Opponent sees pulsing button
- [ ] Toast notifications appear
- [ ] Accept draw ends game
- [ ] Decline draw continues game
- [ ] Decline notification appears

---

## 💡 Why This Happens

The `draw_offered_by` column is a new feature we added to track draw offers. Your database was created before this column existed, so you need to add it manually via migration.

This is a **one-time setup** - once you run the migration, the feature will work forever!

---

## ✅ Summary

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run the migration SQL** (add draw_offered_by column)
3. **Test the feature** (offer, accept, decline)
4. **✨ Draw offers now work!**

---

**Once you apply the migration, come back and we'll test it together! 🎮♟️**
