import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { PlayerInfo } from "@/components/chess/PlayerInfo";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { GameControls } from "@/components/chess/GameControls";
import { GameStatus } from "@/components/chess/GameStatus";
import { GameLobby } from "@/components/chess/GameLobby";
import { TimerSettings } from "@/components/chess/TimerSettings";
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

  // Wrap createGame to update URL
  const handleCreateGame = async () => {
    const code = await createGame();
    if (code) {
      console.log("Game created, updating URL with code:", code);
      setSearchParams({ game: code });
    }
    return code;
  };

  const handleOfferDraw = () => {
    offerDraw();
    toast.success("Draw offer sent to opponent");
  };

  const handleAcceptDraw = () => {
    acceptDraw();
    toast.success("Draw accepted!");
  };

  const handleResign = () => {
    resign();
    toast.info("You resigned");
  };

  console.log("Game state:", { 
    gameState, 
    playerColor, 
    loading, 
    error,
    shouldShowLobby: !gameState || (gameState.status === "waiting" && !playerColor)
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-neon-cyan animate-pulse" />
          <h1 className="font-cyber text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
            NEON CHESS
          </h1>
          <Zap className="w-8 h-8 text-neon-magenta animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-4 text-muted-foreground font-mono text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Game: {gameState.game_code}
          </span>
          {playerColor && (
            <span className="flex items-center gap-1">
              <Crown className="w-4 h-4" />
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
          className={`text-center mb-4 font-cyber text-lg ${
            isMyTurn ? "text-neon-cyan" : "text-muted-foreground"
          }`}
        >
          {isMyTurn ? "⚡ YOUR TURN ⚡" : "Waiting for opponent..."}
        </motion.div>
      )}

      {/* Main game layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Left sidebar - Player info & controls */}
        <div className="space-y-4 order-2 lg:order-1">
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
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="w-full max-w-[600px]">
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

        {/* Right sidebar - Move history & controls */}
        <div className="space-y-4 order-3">
          <MoveHistory moves={moveHistory} />
          <GameControls
            onNewGame={() => window.location.href = "/"}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onAcceptDraw={drawOfferedByOpponent ? handleAcceptDraw : undefined}
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
