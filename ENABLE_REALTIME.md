# Enable Realtime for chess_games Table

## Issue
Moves not syncing between players, game freezes, waiting screen doesn't update when opponent joins.

## Root Cause
Supabase Realtime is probably **not enabled** on the `chess_games` table.

## How to Fix

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard
2. Select your project
3. Click on "Database" in the left sidebar
4. Click on "Replication" (or "Publications")

### Step 2: Enable Realtime for chess_games
1. Look for a section called "Replication" or "Publications"
2. Find the `supabase_realtime` publication
3. Make sure `chess_games` table is **checked/enabled**
4. If it's not listed, you need to add it

### Alternative: Run SQL Command
Go to SQL Editor and run:

```sql
-- Enable realtime for chess_games table
ALTER PUBLICATION supabase_realtime ADD TABLE chess_games;
```

### Step 3: Verify in Code
After enabling, refresh your app and check the console:
- You should see: `✅ Successfully subscribed to game updates`
- When opponent joins, you should see: `📥 Game update received:`
- When moves are made, you should see: `📥 Game update received:`

## Testing

1. **Create a game** (Player 1)
   - Console should show: `📡 Subscribing to game updates for: [game-id]`
   - Console should show: `✅ Successfully subscribed to game updates`
   
2. **Join from link** (Player 2)
   - Player 2 console: Same subscription messages
   - **Player 1 console should immediately show**: `📥 Game update received:` with status changing to "active"
   - **Player 1 should auto-redirect to game board**

3. **Make a move** (Player 1)
   - Console shows: `♟️ Move made:`, `📤 Updating database with:`, `✅ Database updated successfully`
   - **Player 2 console should show**: `📥 Game update received:`
   - **Player 2 should see the move appear on the board**

4. **Make a move** (Player 2)
   - Same as step 3, but roles reversed

## If Still Not Working

### Check Supabase Realtime Status
In your Supabase dashboard:
1. Go to Project Settings
2. Check if Realtime is enabled for your project
3. Make sure you're not on a free tier with realtime disabled

### Check RLS Policies
Make sure your Row Level Security policies allow reading updates:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'chess_games';

-- If needed, create a policy for realtime
CREATE POLICY "Anyone can subscribe to games"
ON chess_games FOR SELECT
USING (true);
```

### Alternative: Use Polling (Fallback)
If Realtime absolutely won't work, you can add polling as a fallback:

```typescript
// In useMultiplayerGame.ts, add this useEffect:
useEffect(() => {
  if (!gameState?.id) return;
  
  // Poll every 2 seconds as fallback
  const pollInterval = setInterval(async () => {
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .eq('id', gameState.id)
      .single();
    
    if (data) {
      setGameState(data as GameState);
      // Load chess position...
    }
  }, 2000);
  
  return () => clearInterval(pollInterval);
}, [gameState?.id]);
```

But try enabling Realtime first! It's much better than polling.
