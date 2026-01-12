# React Hooks Order Error Fix

## Problem
After the URL update fix, a new error appeared:
```
Error: Rendered more hooks than during the previous render.
React has detected a change in the order of Hooks called by Game.
```

The screen would go blank and the console showed this critical error.

## Root Cause
**React Rules of Hooks Violation**: All React Hooks (useState, useEffect, useCallback, etc.) must be called in the **exact same order** on every render.

In `Game.tsx`, we had:
1. Some hooks at the top (useState, useEffect)
2. **Early returns** (showing lobby, loading, error states)
3. **More hooks after the early returns** (useEffect for toasts)

This meant:
- **First render**: gameState is null → returns lobby early → only some hooks called
- **Second render**: gameState exists → doesn't return early → ALL hooks called
- React sees different number of hooks → **CRASH** ❌

## The Fix
Moved ALL hooks to the top of the component, **before any conditional returns**:

### Before (BROKEN):
```tsx
const Game = () => {
  // ... some hooks ...
  
  // Early return - shows lobby
  if (!gameState || (gameState.status === "waiting" && !playerColor)) {
    return <GameLobby />;
  }
  
  // ❌ MORE HOOKS AFTER EARLY RETURN - BREAKS RULES!
  useEffect(() => {
    // toast for draw offer
  }, [drawOfferedByOpponent]);
  
  useEffect(() => {
    // toast for resign
  }, [resignedBy]);
```

### After (FIXED):
```tsx
const Game = () => {
  // ✅ ALL hooks at the top
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState(...);
  const { game, gameState, ... } = useMultiplayerGame(...);
  
  useEffect(() => { ... }, [playerName]);
  useEffect(() => { ... }, [gameCodeFromUrl, playerName, playerColor]);
  
  // Calculate values needed for hooks
  const isMyTurn = playerColor === turn;
  const gameOver = gameState?.status === "finished" || isCheckmate || isDraw;
  const drawOfferedByOpponent = gameState?.draw_offered_by && ...;
  
  // ✅ All remaining hooks BEFORE early returns
  useEffect(() => {
    // toast for draw offer
  }, [drawOfferedByOpponent]);
  
  useEffect(() => {
    // toast for resign
  }, [resignedBy]);
  
  // Handler functions
  const handleCreateGame = async () => { ... };
  const handleOfferDraw = () => { ... };
  const handleAcceptDraw = () => { ... };
  const handleResign = () => { ... };
  
  // NOW we can have early returns
  if (!gameState || (gameState.status === "waiting" && !playerColor)) {
    return <GameLobby />;
  }
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // ... rest of component
```

## Key Changes
1. **Moved all `useEffect` hooks** to the top, before any early returns
2. **Moved derived values** (isMyTurn, gameOver, drawOfferedByOpponent) to the top since they're needed in hooks
3. **Moved handler functions** to the top so they're always defined
4. **Used optional chaining** (`gameState?.status`) for safety since gameState might be null
5. **Removed duplicate declarations** that were after early returns

## React Rules of Hooks
These rules MUST be followed:
1. ✅ **Only call hooks at the top level** - Never inside loops, conditions, or nested functions
2. ✅ **Only call hooks from React functions** - Function components or custom hooks
3. ✅ **Call hooks in the same order** - Every render must call the same hooks in the same order

## Result
- ✅ No more "Rendered more hooks than during the previous render" error
- ✅ Blank screen fixed
- ✅ Component follows React best practices
- ✅ Game board displays correctly after creating a game
- ✅ All real-time features (toasts, draw offers, resign) work properly

## Testing
1. Load http://localhost:8080
2. Enter your name
3. Click "Create New Game"
4. You should see the chess board (no blank screen!)
5. No console errors about hooks
6. All toasts and real-time features work

## Developer Notes
This is a common React mistake when refactoring components. Always remember:
- **Hooks first, returns second**
- Use optional chaining when values might be undefined/null in early renders
- Move all conditional logic AFTER all hooks are declared
