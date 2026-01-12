# 🚨 DRAW OFFER NOT WORKING? - Quick Fix Guide

## 🔴 The Problem
When you click "Offer Draw", nothing happens or you see errors in the console.

## ✅ The Solution (2 minutes)

### Step 1: Check if Migration is Needed
1. Open your game in a browser
2. Press `F12` to open Developer Tools
3. Click on the **Console** tab
4. Click "Offer Draw" button
5. Look for this message:
   ```
   🚨 DATABASE MIGRATION NEEDED!
   The 'draw_offered_by' column doesn't exist in your database.
   ```

**If you see this message:** Continue to Step 2  
**If you don't see this message:** See "Other Issues" section below

### Step 2: Apply the Migration

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy & Paste This SQL**
   ```sql
   ALTER TABLE public.chess_games 
   ADD COLUMN IF NOT EXISTS draw_offered_by TEXT,
   ADD COLUMN IF NOT EXISTS time_control INTEGER DEFAULT 600,
   ADD COLUMN IF NOT EXISTS time_increment INTEGER DEFAULT 0;

   UPDATE public.chess_games 
   SET time_control = 600, time_increment = 0 
   WHERE time_control IS NULL;
   ```

4. **Run It**
   - Click "Run" button (or Ctrl+Enter)
   - You should see "Success. No rows returned"

5. **Verify**
   - Go to "Table Editor" → "chess_games"
   - Confirm you see these new columns:
     - `draw_offered_by`
     - `time_control`
     - `time_increment`

### Step 3: Test
1. **Refresh your game** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Click "Offer Draw"** again
3. **Check console** - should now show:
   ```
   🤝 Offering draw... 
   ✅ Draw offer successful!
   ```
4. **You should see toast**: "Draw offer sent to opponent"
5. **Opponent should see**: "Your opponent has offered a draw!" 

## 🎯 That's It!
The draw offer feature should now work perfectly.

---

## 🔍 Other Issues

### Issue: "Cannot offer draw: missing gameState or playerColor"
**Solution:** Make sure you've entered your name in the lobby and joined a game.

### Issue: Button doesn't show up at all
**Solution:** Make sure the game is active (not in lobby) and not finished.

### Issue: Opponent doesn't see the draw offer
**Solution:** 
- Make sure both players have refreshed after the migration
- Check that the game is in "active" status
- Check browser console for real-time subscription errors

### Issue: Toast says "Database migration required"
**Solution:** You see this because the migration hasn't been applied. Follow Step 2 above.

---

## 📊 Diagnostic Tools

### Quick Console Check
Open browser console and run:
```javascript
localStorage.getItem('playerName')
```
Should return your player name. If `null`, go to lobby and enter your name.

### Full Diagnostics
Open this page in your browser:
```
http://localhost:8080/draw-diagnostic.html
```
(Replace port if using different port)

---

## 📝 What the Feature Does

### When YOU offer a draw:
1. Click "Offer Draw" button
2. Toast appears: "Draw offer sent to opponent"
3. Opponent's button changes to animated "Draw Offered!"
4. Opponent can Accept or Decline

### When OPPONENT offers a draw:
1. Your button changes to "Draw Offered!" (animated)
2. Toast appears: "Your opponent has offered a draw!"
3. Click the button to open Accept/Decline dialog
4. **Accept** → Game ends as a draw
5. **Decline** → Button returns to "Offer Draw"

### When draw is declined:
1. Offerer sees toast: "Draw offer declined by opponent"
2. Both players' buttons return to "Offer Draw"
3. Game continues

---

## 🆘 Still Stuck?

1. Check `DEBUG_DRAW_OFFER.md` for detailed troubleshooting
2. Check browser console for ALL error messages
3. Verify your `.env` file has correct Supabase credentials
4. Try creating a new game after applying the migration
5. Hard refresh both browser windows (Ctrl+Shift+R)

---

## ✨ Expected Console Output (Working)

When you click "Offer Draw", you should see:
```
🤝 Offering draw... { playerColor: 'w', gameId: '123', currentDrawOffer: null }
✅ Draw offer successful! [Array(1)]
```

If you see `❌ Error offering draw:`, read the error message carefully - it will tell you what's wrong.
