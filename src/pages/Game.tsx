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
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { Cpu, Zap, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Game = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerName, setPlayerName] = useState(() => 
    localStorage.getItem("chess_player_name") || ""
  );
  const gameCodeFromUrl = searchParams.get("game");

  // Debug logging
  console.log("🔍 Game.tsx render:", {
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
  } = useMultiplayerGame(gameCodeFromUrl, playerName);

  // Save player name
  useEffect(() => {
    if (playerName) {
      localStorage.setItem("chess_player_name", playerName);
    }
  }, [playerName]);

  // Auto-join if game code in URL
  useEffect(() => {
    if (gameCodeFromUrl && playerName && !playerColor) {
      console.log("Auto-joining game from URL:", gameCodeFromUrl);
      joinGame(gameCodeFromUrl);
    }
  }, [gameCodeFromUrl, playerName, playerColor, joinGame]);

  // Calculate derived values that need to be available for hooks
  const isMyTurn = playerColor === turn;
  const gameOver = gameState?.status === "finished" || isCheckmate || isDraw;
  const drawOfferedByOpponent = 
    gameState?.draw_offered_by && 
    gameState?.draw_offered_by !== playerColor;
  
  const drawOfferedByMe = 
    gameState?.draw_offered_by && 
    gameState?.draw_offered_by === playerColor;

  // Track previous draw offer state to detect decline
  const prevDrawOfferedByMe = useRef(drawOfferedByMe);
  
  useEffect(() => {
    // If draw was offered by me, but now it's cleared and game is still active
    if (prevDrawOfferedByMe.current && !gameState?.draw_offered_by && gameState?.status === "active") {
      toast.error("Draw offer declined by opponent", {
        duration: 3000,
      });
    }
    prevDrawOfferedByMe.current = drawOfferedByMe;
  }, [gameState?.draw_offered_by, gameState?.status, drawOfferedByMe]);

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
      console.log("Game created, updating URL with code:", code);
      setSearchParams({ game: code });
    }
    return code;
  };

  const handleOfferDraw = () => {
    console.log("Offering draw, current state:", { 
      gameState: gameState?.draw_offered_by, 
      playerColor 
    });
    offerDraw();
    toast.success("Draw offer sent to opponent");
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
    // Navigate back to lobby
    window.location.href = "/";
  };

  console.log("Game state:", {
    gameState, 
    playerColor, 
    loading, 
    error,
    shouldShowLobby: !gameState || (gameState.status === "waiting" && !playerColor)
  });

  // Show QuickJoin if game code in URL but no player name
  if (gameCodeFromUrl && !playerName) {
    console.log("✅ Showing QuickJoin for game:", gameCodeFromUrl);
    return (
      <QuickJoin
        gameCode={gameCodeFromUrl}
        onJoin={(name) => {
          console.log("QuickJoin: User entered name:", name);
          setPlayerName(name);
          // After setting name, the useEffect will auto-join
        }}
        loading={loading}
      />
    );
  }

  console.log("❌ NOT showing QuickJoin because:", {
    hasGameCode: !!gameCodeFromUrl,
    hasPlayerName: !!playerName,
    playerName,
    gameState: gameState?.status,
    playerColor
  });

  // Show lobby if no active game
  // Only show lobby if: no gameState exists, OR (game is waiting AND user hasn't joined as a player)
  if (!gameState || (gameState.status === "waiting" && !playerColor)) {
    console.log("Showing lobby");
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

  console.log("Showing game board");

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
    console.error("Missing game or gameState:", { game, gameState });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neon-cyan font-cyber">Initializing game...</p>
        </div>
      </div>
    );
  }

  console.log("Draw offer status:", {
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
            rating={1500}
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
            rating={1500}
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
            rating={1450}
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
            />
          </div>
        </div>

        {/* Bottom section on mobile - White player */}
        <div className="lg:hidden space-y-3">
          <PlayerInfo
            name={gameState.white_player_name || "Waiting..."}
            rating={1450}
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
    </div>
  );
};

export default Game;
