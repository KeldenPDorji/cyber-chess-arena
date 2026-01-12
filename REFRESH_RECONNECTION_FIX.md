# Refresh Reconnection Fix

## Problem
When a player refreshed the browser during an active game, they would see:
> "Game Not Available - This game is no longer available or has already started."

This happened because the player's name was being cleared from state on refresh, making the app think they weren't part of the game.

## Root Cause
The original code had this logic:
```tsx
const [playerName, setPlayerName] = useState(() => {
  if (gameCodeFromUrl) {
    return ""; // ❌ Cleared saved name when URL had game code!
  }
  return localStorage.getItem("chess_player_name") || "";
});
```

This meant that every time you refreshed during a game (with game code in URL), your saved player name was lost.

## Solution

### 1. Always Load Saved Player Name
```tsx
const [playerName, setPlayerName] = useState(() => {
  return localStorage.getItem("chess_player_name") || "";
});
```
Now the saved name is **always** loaded, allowing reconnection.

### 2. Track New Invites
```tsx
const [isNewInvite, setIsNewInvite] = useState(() => {
  if (!gameCodeFromUrl) return false;
  const lastGameCode = localStorage.getItem("last_game_code");
  return lastGameCode !== gameCodeFromUrl;
});
```
We track if this is a **new game link** that the user hasn't seen before.

### 3. Show QuickJoin Only for New Invites
```tsx
if (gameCodeFromUrl && isNewInvite && !playerName && !playerColor) {
  // Show QuickJoin
}
```
QuickJoin now only appears for:
- ✅ New invite links you haven't joined yet
- ❌ NOT for refreshing an active game

### 4. Save Game Code for Reconnection
```tsx
if (gameCodeFromUrl) {
  localStorage.setItem("last_game_code", gameCodeFromUrl);
}
```
Saves the current game code to detect returning vs new invites.

### 5. Clear on Leave
```tsx
localStorage.removeItem("last_game_code");
```
Clears saved game code when starting a new game.

## How It Works Now

### Scenario 1: New Invite Link
1. Friend sends you: `http://localhost:8080/?game=ABC123`
2. You haven't seen this game code before
3. → Shows QuickJoin screen ✅

### Scenario 2: Refresh During Game
1. You're playing game `ABC123`
2. You refresh the page
3. Game code matches `last_game_code` in localStorage
4. Your `playerName` is loaded from localStorage
5. → Reconnects to active game ✅
6. Board shows your current position ✅

### Scenario 3: New Game
1. Click "New Game" button
2. Clears `last_game_code`
3. Creates fresh game
4. → Ready for new match ✅

## Benefits

✅ **Refresh-Proof** - Can refresh without losing game connection
✅ **Smart QuickJoin** - Only shows for new invites
✅ **Auto-Reconnect** - Automatically rejoins your active games
✅ **No Zustand Needed** - Uses localStorage (simpler, works across tabs)
✅ **Persistent State** - Player name and game persist across refreshes

## Technical Details

**Storage Keys:**
- `chess_player_name` - Your display name
- `last_game_code` - Most recent game you joined

**Flow:**
1. Load saved name from localStorage on mount
2. Check if game code in URL matches last saved game
3. If match → reconnect as saved player
4. If new → show QuickJoin
5. On join → save both name and game code
6. On leave → clear game code (keep name for next game)

## Common Issue This Fixes

This is a **very common issue** in multiplayer web apps. Without persistent state management:
- Players lose connection on refresh
- Have to rejoin games manually
- Poor user experience

This solution provides a seamless experience where refreshing feels natural, just like desktop apps!
