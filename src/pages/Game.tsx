import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { PlayerInfo } from "@/components/chess/PlayerInfo";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { GameControls } from "@/components/chess/GameControls";
import { GameStatus } from "@/components/chess/GameStatus";
import { GameLobby } from "@/components/chess/GameLobby";
import { TimerSettings } from "@/components/chess/TimerSettings";
import { QuickJoin } from "@/components/chess/QuickJoin";
import { PromotionDialog } from "@/components/chess/PromotionDialog";
import { VictoryAnimation } from "@/components/chess/VictoryAnimation";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { Cpu, Zap, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { devLog } from "@/lib/devLog";

const Game = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const gameCodeFromUrl = searchParams.get("game");
  
  // Always load saved player name to allow reconnection after refresh
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("chess_player_name") || "";
  });
  
  // Track if this is a new invite link (first time seeing this game code)
  const [isNewInvite, setIsNewInvite] = useState(() => {
    if (!gameCodeFromUrl) return false;
    const lastGameCode = localStorage.getItem("last_game_code");
    return lastGameCode !== gameCodeFromUrl;
  });

  // Debug logging
  devLog.log("🔍 Game.tsx render:", {
    gameCodeFromUrl,
    playerName,
    hasPlayerName: !!playerName,
    shouldShowQuickJoin: !!(gameCodeFromUrl && !playerName)
  });

  const {
    game,
    gameState,
    selectedSquare,
    validMoves,
    lastMove,
    playerColor,
    loading,
    error,
    createGame,
    joinGame,
    handleSquareClick,
    handlePromotion,
    pendingPromotion,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    leaveGame,
    setTimeControl,
    whiteCaptured,
    blackCaptured,
    moveHistory,
    isCheck,
    isCheckmate,
    isDraw,
    turn,
    winner,
    resignedBy,
    leftBy,
    timeoutWinner,
    kingInCheckSquare,
  } = useMultiplayerGame(gameCodeFromUrl, playerName);

  // Save player name and game code (for reconnection after refresh)
  useEffect(() => {
    if (playerName && playerColor) {
      localStorage.setItem("chess_player_name", playerName);
    }
    if (gameCodeFromUrl) {
      localStorage.setItem("last_game_code", gameCodeFromUrl);
    }
  }, [playerName, playerColor, gameCodeFromUrl]);

  // Calculate derived values that need to be available for hooks
  const isMyTurn = playerColor === turn;
  const gameOver = gameState?.status === "finished" || isCheckmate || isDraw;
  const drawOfferedByOpponent = 
    gameState?.draw_offered_by && 
    gameState?.draw_offered_by !== playerColor;
  
  const drawOfferedByMe = 
    gameState?.draw_offered_by && 
    gameState?.draw_offered_by === playerColor;

  // Debug draw offer state
  devLog.log("🎯 Draw offer debug:", {
    draw_offered_by: gameState?.draw_offered_by,
    playerColor,
    drawOfferedByOpponent,
    drawOfferedByMe
  });

  // Track previous draw offer state to detect decline
  const prevDrawOfferedByMe = useRef(drawOfferedByMe);
  
  useEffect(() => {
    // If draw was offered by me, but now it's cleared and game is still active
    if (prevDrawOfferedByMe.current && !gameState?.draw_offered_by && gameState?.status === "active") {
      const opponentName = playerColor === "w" 
        ? gameState.black_player_name 
        : gameState.white_player_name;
      toast.error(`Draw offer declined by ${opponentName || "opponent"}`, {
        duration: 3000,
      });
    }
    prevDrawOfferedByMe.current = drawOfferedByMe;
  }, [gameState?.draw_offered_by, gameState?.status, drawOfferedByMe, playerColor, gameState?.black_player_name, gameState?.white_player_name]);

  // Show toast when timeout occurs
  useEffect(() => {
    if (timeoutWinner) {
      const iWon = timeoutWinner === playerColor;
      if (iWon) {
        toast.success("Your opponent ran out of time! You win!", {
          duration: 5000,
        });
      } else {
        toast.error("You ran out of time!", {
          duration: 5000,
        });
      }
    }
  }, [timeoutWinner, playerColor]);

  // Show toast when draw is offered - MUST be before any early returns
  useEffect(() => {
    if (drawOfferedByOpponent) {
      toast.info("Your opponent has offered a draw!", {
        duration: 10000,
      });
    }
  }, [drawOfferedByOpponent]);

  // Show toast when someone resigns - MUST be before any early returns
  useEffect(() => {
    if (resignedBy) {
      const isOpponent = resignedBy !== playerColor;
      if (isOpponent) {
        toast.success("Your opponent resigned! You win!", {
          duration: 5000,
        });
      }
    }
  }, [resignedBy, playerColor]);

  // Show toast when someone leaves - MUST be before any early returns
  useEffect(() => {
    if (leftBy) {
      const isOpponent = leftBy !== playerColor;
      if (isOpponent) {
        toast.success("Your opponent left the game! You win!", {
          duration: 5000,
        });
      }
    }
  }, [leftBy, playerColor]);

  // Wrap createGame to update URL
  const handleCreateGame = async (preferredColor?: "w" | "b" | "random") => {
    const code = await createGame(preferredColor);
    if (code) {
      devLog.log("Game created, updating URL with code:", code);
      setSearchParams({ game: code });
    }
    return code;
  };

  const handleOfferDraw = async () => {
    devLog.log("Offering draw, current state:", { 
      gameState: gameState?.draw_offered_by, 
      playerColor 
    });
    const result = await offerDraw();
    
    if (result?.error) {
      if (result.migrationNeeded) {
        toast.error(
          "Database migration required! Check console and see DEBUG_DRAW_OFFER.md for instructions.",
          { duration: 8000 }
        );
      } else {
        toast.error("Failed to offer draw: " + result.error, { duration: 5000 });
      }
    } else if (result?.success) {
      toast.success("Draw offer sent to opponent");
    }
  };

  const handleAcceptDraw = () => {
    acceptDraw();
    toast.success("Draw accepted!");
  };

  const handleDeclineDraw = () => {
    declineDraw();
    toast.info("Draw offer declined");
  };

  const handleResign = () => {
    resign();
    toast.info("You resigned");
  };

  const handleNewGame = async () => {
    // If there's an active game, leave it first
    if (gameState && gameState.status !== "finished" && gameState.status !== "draw") {
      await leaveGame();
      toast.info("Left the current game");
    }
    // Clear saved game code
    localStorage.removeItem("last_game_code");
    // Navigate back to lobby
    window.location.href = "/";
  };

  devLog.log("Game state:", {
    gameState, 
    playerColor, 
    loading, 
    error,
    isNewInvite,
    shouldShowLobby: !gameState || (gameState.status === "waiting" && !playerColor)
  });

  // Show QuickJoin ONLY if:
  // 1. Game code in URL
  // 2. This is a new invite link (different from last game)
  // 3. User is not already a player in this game (no playerColor assigned yet)
  if (gameCodeFromUrl && isNewInvite && !playerColor) {
    devLog.log("✅ Showing QuickJoin for NEW invite:", gameCodeFromUrl);
    return (
      <QuickJoin
        gameCode={gameCodeFromUrl}
        onJoin={async (name) => {
          devLog.log("QuickJoin: User clicked join with name:", name);
          setPlayerName(name);
          setIsNewInvite(false);
          // Join the game with the provided name
          const success = await joinGame(gameCodeFromUrl, name);
          devLog.log("Join result:", success);
          if (!success) {
            toast.error("Failed to join game");
          }
        }}
        loading={loading}
      />
    );
  }

  devLog.log("❌ NOT showing QuickJoin because:", {
    hasGameCode: !!gameCodeFromUrl,
    hasPlayerName: !!playerName,
    playerName,
    gameState: gameState?.status,
    playerColor
  });

  // Show lobby if no active game
  // Show lobby if: no gameState exists, OR (game is waiting AND user hasn't joined as a player)
  // BUT if game is waiting and user IS a player (creator), show waiting screen, not lobby
  if (!gameState) {
    devLog.log("Showing lobby - no game state");
    return (
      <GameLobby
        onCreateGame={handleCreateGame}
        onJoinGame={joinGame}
        onSetPlayerName={setPlayerName}
        onSetTimeControl={(minutes, increment) => setTimeControl({ minutes, increment })}
        playerName={playerName}
      />
    );
  }
  
  // If game is waiting and I'm a player (creator), show waiting screen
  if (gameState.status === "waiting" && playerColor) {
    const shareableUrl = window.location.href;
    devLog.log("Showing waiting screen - you created game, waiting for opponent", {
      status: gameState.status,
      white: gameState.white_player_name,
      black: gameState.black_player_name,
      gameCode: gameState.game_code,
      shareableUrl: shareableUrl,
      currentLocation: window.location
    });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card rounded-lg p-8 max-w-md text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-neon-cyan animate-pulse" />
            <h2 className="font-cyber text-2xl text-neon-cyan">Waiting for Opponent</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Share this game code with your friend:
            </p>
            <div className="cyber-card bg-card p-4 rounded">
              <p className="font-mono text-3xl font-bold text-neon-cyan">{gameState.game_code}</p>
            </div>
            <p className="text-sm text-muted-foreground">Or share this link:</p>
            <div className="cyber-card bg-card p-3 rounded">
              <p className="font-mono text-sm text-neon-purple break-all">
                {shareableUrl}
              </p>
            </div>
            <Button
              onClick={async (e) => {
                e.preventDefault();
                const linkToCopy = shareableUrl;
                devLog.log("📋 Copy Link clicked:", {
                  url: linkToCopy,
                  hasClipboard: !!navigator.clipboard,
                  isSecure: window.isSecureContext
                });
                
                try {
                  // Try modern clipboard API first
                  if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(linkToCopy);
                    devLog.log("✅ Link copied successfully via clipboard API");
                    toast.success("Link copied to clipboard!");
                  } else {
                    // Fallback for older browsers or non-secure contexts
                    devLog.log("⚠️ Using fallback copy method");
                    const textArea = document.createElement("textarea");
                    textArea.value = linkToCopy;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    textArea.style.top = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                      const successful = document.execCommand('copy');
                      textArea.remove();
                      if (successful) {
                        devLog.log("✅ Link copied successfully via execCommand");
                        toast.success("Link copied to clipboard!");
                      } else {
                        throw new Error("Copy command failed");
                      }
                    } catch (cmdErr) {
                      textArea.remove();
                      throw cmdErr;
                    }
                  }
                } catch (err) {
                  devLog.error("❌ Failed to copy:", err);
                  toast.error("Failed to copy link. Please copy manually.");
                }
              }}
              className="w-full cyber-button"
            >
              Copy Link
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              You are playing as <span className="text-neon-cyan font-cyber">
                {playerColor === "w" ? "White" : "Black"}
              </span>
            </p>
          </div>
          
          <Button
            onClick={handleNewGame}
            variant="outline"
            className="w-full"
          >
            Cancel & New Game
          </Button>
        </motion.div>
      </div>
    );
  }
  
  // If game is waiting and I'm NOT a player, show lobby to join
  if (gameState.status === "waiting" && !playerColor) {
    devLog.log("Showing lobby - game waiting, not a player");
    return (
      <GameLobby
        onCreateGame={handleCreateGame}
        onJoinGame={joinGame}
        onSetPlayerName={setPlayerName}
        onSetTimeControl={(minutes, increment) => setTimeControl({ minutes, increment })}
        playerName={playerName}
      />
    );
  }

  devLog.log("Showing game board");

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neon-cyan font-cyber">Loading game...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="cyber-card rounded-lg p-8 max-w-md text-center">
          <p className="text-destructive font-cyber text-xl mb-4">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.href = "/"}>
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Safety check
  if (!game || !gameState) {
    devLog.error("Missing game or gameState:", { game, gameState });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neon-cyan font-cyber">Initializing game...</p>
        </div>
      </div>
    );
  }

  devLog.log("Draw offer status:", {
    draw_offered_by: gameState.draw_offered_by,
    playerColor,
    drawOfferedByOpponent
  });

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 md:mb-8"
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan animate-pulse" />
          <h1 className="font-cyber text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
            NEON CHESS
          </h1>
          <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-magenta animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-muted-foreground font-mono text-xs sm:text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            Game: {gameState.game_code}
          </span>
          {playerColor && (
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              You are {playerColor === "w" ? "White" : "Black"}
            </span>
          )}
        </div>
      </motion.header>

      {/* Turn indicator */}
      {!gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center mb-3 md:mb-4 font-cyber text-base md:text-lg ${
            isMyTurn ? "text-neon-cyan" : "text-muted-foreground"
          }`}
        >
          {isMyTurn ? "⚡ YOUR TURN ⚡" : "Waiting for opponent..."}
        </motion.div>
      )}

      {/* Main game layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-start">
        {/* Top section on mobile - Black player */}
        <div className="lg:hidden space-y-3">
          <PlayerInfo
            name={gameState.black_player_name || "Waiting..."}
            rating={1200}
            time={gameState.black_time}
            isActive={turn === "b" && !gameOver}
            isWhite={false}
            capturedPieces={blackCaptured}
          />
        </div>

        {/* Left sidebar - Desktop only */}
        <div className="hidden lg:block space-y-4 order-2 lg:order-1">
          <PlayerInfo
            name={gameState.black_player_name || "Waiting..."}
            rating={1200}
            time={gameState.black_time}
            isActive={turn === "b" && !gameOver}
            isWhite={false}
            capturedPieces={blackCaptured}
          />
          
          <GameStatus
            isCheck={isCheck}
            isCheckmate={isCheckmate}
            isDraw={isDraw}
            turn={turn}
            winner={winner}
            resignedBy={resignedBy}
            leftBy={leftBy}
            timeoutWinner={timeoutWinner}
          />

          <PlayerInfo
            name={gameState.white_player_name || "Waiting..."}
            rating={1200}
            time={gameState.white_time}
            isActive={turn === "w" && !gameOver}
            isWhite={true}
            capturedPieces={whiteCaptured}
          />
        </div>

        {/* Chess board (center) */}
        <div className="order-1 lg:order-2 flex justify-center px-2 sm:px-0">
          <div className="w-full max-w-[95vw] sm:max-w-[500px] md:max-w-[600px]">
            <ChessBoard
              game={game}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
              flipped={playerColor === "b"}
              kingInCheckSquare={kingInCheckSquare}
            />
          </div>
        </div>

        {/* Bottom section on mobile - White player */}
        <div className="lg:hidden space-y-3">
          <PlayerInfo
            name={gameState.white_player_name || "Waiting..."}
            rating={1200}
            time={gameState.white_time}
            isActive={turn === "w" && !gameOver}
            isWhite={true}
            capturedPieces={whiteCaptured}
          />
        </div>

        {/* Right sidebar - Move history & controls */}
        <div className="space-y-3 md:space-y-4 order-3">
          {/* Game status on mobile */}
          <div className="lg:hidden">
            <GameStatus
              isCheck={isCheck}
              isCheckmate={isCheckmate}
              isDraw={isDraw}
              turn={turn}
              winner={winner}
              resignedBy={resignedBy}
              leftBy={leftBy}
              timeoutWinner={timeoutWinner}
            />
          </div>
          
          <MoveHistory moves={moveHistory} />
          <GameControls
            onNewGame={handleNewGame}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onAcceptDraw={drawOfferedByOpponent ? handleAcceptDraw : undefined}
            onDeclineDraw={drawOfferedByOpponent ? handleDeclineDraw : undefined}
            gameOver={gameOver}
            drawOffered={drawOfferedByOpponent}
          />
        </div>
      </div>

      {/* Footer decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta opacity-50"
      />

      {/* Pawn Promotion Dialog */}
      <PromotionDialog
        open={!!pendingPromotion}
        onSelect={handlePromotion}
        isWhite={playerColor === "w"}
      />

      {/* Victory Animation */}
      <VictoryAnimation
        show={gameOver}
        winner={winner || (timeoutWinner ? timeoutWinner : (resignedBy ? (resignedBy === "w" ? "b" : "w") : null))}
        playerColor={playerColor}
        reason={
          isCheckmate ? "checkmate" :
          isDraw ? "draw" :
          timeoutWinner ? "timeout" :
          resignedBy ? "resignation" :
          leftBy ? "abandoned" :
          "checkmate"
        }
      />
    </div>
  );
};

export default Game;
