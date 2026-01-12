# Blank Screen Fix - Game Creation Issue

## Problem
After clicking "Create New Game", the screen would go blank instead of showing the chess board.

## Root Cause
The issue was a **missing URL update** after game creation. Here's what was happening:

1. User clicks "Create New Game"
2. `createGame()` function in `useMultiplayerGame.ts` creates the game in Supabase and sets `playerColor` to "w"
3. Game state updates locally, but **the URL doesn't get updated** with the game code
4. The `Game.tsx` component checks `gameCodeFromUrl = searchParams.get("game")` which is still `null`
5. Without a game code in the URL, the component couldn't properly track the game state
6. The lobby/game board visibility logic got confused, causing a blank screen

## Solution
Updated the game creation flow to properly update the URL with the game code:

### 1. Added `setSearchParams` to Game.tsx
```tsx
const [searchParams, setSearchParams] = useSearchParams();
```

### 2. Created wrapper function that updates URL after game creation
```tsx
const handleCreateGame = async () => {
  const code = await createGame();
  if (code) {
    console.log("Game created, updating URL with code:", code);
    setSearchParams({ game: code });
  }
  return code;
};
```

### 3. Improved the lobby visibility logic
```tsx
// Only show lobby if: no gameState exists, OR (game is waiting AND user hasn't joined as a player)
if (!gameState || (gameState.status === "waiting" && !playerColor)) {
  return <GameLobby ... />;
}
```

### 4. Added debug logging
Added console.log statements to track:
- When the lobby should be shown
- When the game board should be shown
- Current game state and player color

## Result
Now when you create a game:
1. Game is created in Supabase ✅
2. URL is updated to include `?game=ABC123` ✅
3. Component re-renders with the game code ✅
4. Game board is displayed correctly ✅
5. "Share game link" button works properly ✅

## Testing
To verify the fix:
1. Enter your name
2. Click "Create New Game"
3. You should immediately see the chess board (not a blank screen)
4. The URL should show `?game=XXXXXX` with your game code
5. You can copy the link and share it with another player

## Related Files Changed
- `/src/pages/Game.tsx` - Added URL update logic and improved visibility conditions
- `/src/components/chess/GameLobby.tsx` - Removed redundant URL update attempt
- `/src/hooks/useMultiplayerGame.ts` - Already had proper game creation logic

## Developer Notes
This fix ensures that:
- The URL always reflects the current game state
- The component can properly track which game the user is in
- Navigation between lobby and game board works smoothly
- Browser refresh maintains the game state (via URL parameter)
- Share links work correctly
