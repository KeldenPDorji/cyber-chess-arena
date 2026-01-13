import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, Move } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { pieceSymbols, getKingSquare } from "@/lib/chessUtils";
import { devLog } from "@/lib/devLog";

interface GameState {
  id: string;
  game_code: string;
  white_player_name: string | null;
  black_player_name: string | null;
  fen: string;
  pgn: string | null;
  status: string;
  turn: string;
  white_time: number;
  black_time: number;
  draw_offered_by?: string | null;
  time_control?: number;
  time_increment?: number;
}

export const useMultiplayerGame = (gameCode: string | null, playerName: string) => {
  const [game, setGame] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeControl, setTimeControl] = useState({ minutes: 10, increment: 0 });
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load: fetch game if gameCode provided (for QuickJoin and spectators)
  useEffect(() => {
    if (!gameCode) {
      devLog.log("No gameCode provided, setting loading to false");
      setLoading(false);
      return;
    }

    // If we have a gameCode but no playerName, just fetch the game data for display
    const fetchInitialGame = async () => {
      devLog.log("🔍 Initial fetch for gameCode:", gameCode);
      const { data, error } = await supabase
        .from("chess_games")
        .select("*")
        .eq("game_code", gameCode.toUpperCase())
        .single();

      if (error || !data) {
        devLog.error("❌ Failed to fetch initial game:", error);
        setError("Game not found");
        setLoading(false);
        return;
      }

      devLog.log("✅ Initial game data loaded:", data);
      
      // Check if this player is already in the game
      if (playerName) {
        if (data.white_player_name === playerName) {
          setPlayerColor("w");
          devLog.log("✅ You are already white player");
        } else if (data.black_player_name === playerName) {
          setPlayerColor("b");
          devLog.log("✅ You are already black player");
        }
      }

      // Load the chess game state
      const chess = new Chess();
      if (data.pgn) {
        try {
          chess.loadPgn(data.pgn);
        } catch (e) {
          devLog.error("Failed to load PGN:", e);
          chess.load(data.fen);
        }
      } else {
        chess.load(data.fen);
      }
      
      setGame(chess);
      setGameState(data as unknown as GameState);
      setLoading(false);
    };

    fetchInitialGame();
  }, [gameCode, playerName]); // Re-run when gameCode or playerName changes

  // Generate a random game code
  const generateGameCode = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  // Create a new game
  const createGame = useCallback(async (preferredColor: "w" | "b" | "random" = "random") => {
    const code = generateGameCode();
    const totalSeconds = timeControl.minutes * 60;
    
    // Determine actual color based on preference
    let actualColor: "w" | "b";
    if (preferredColor === "random") {
      actualColor = Math.random() < 0.5 ? "w" : "b";
    } else {
      actualColor = preferredColor;
    }
    
    devLog.log("Creating game with code:", code, "player:", playerName, "color:", actualColor);
    
    const gameData: any = {
      game_code: code,
      status: "waiting",
      white_time: totalSeconds,
      black_time: totalSeconds,
    };
    
    // Assign player to their preferred color
    if (actualColor === "w") {
      gameData.white_player_name = playerName;
    } else {
      gameData.black_player_name = playerName;
    }
    
    const { data, error } = await supabase
      .from("chess_games")
      .insert(gameData)
      .select()
      .single();

    if (error) {
      devLog.error("Supabase error creating game:", error);
      setError("Failed to create game: " + error.message);
      return null;
    }

    devLog.log("Game created successfully:", data);
    setGameState(data as unknown as GameState);
    setPlayerColor(actualColor);
    setLoading(false);
    return code;
  }, [playerName, generateGameCode, timeControl]);

  // Join an existing game
  const joinGame = useCallback(async (code: string, nameOverride?: string) => {
    const nameToUse = nameOverride || playerName;
    devLog.log("🎮 joinGame called with code:", code, "playerName:", nameToUse);
    const { data, error } = await supabase
      .from("chess_games")
      .select("*")
      .eq("game_code", code.toUpperCase())
      .single();

    if (error || !data) {
      devLog.error("❌ Game not found:", error);
      setError("Game not found");
      setLoading(false);
      return false;
    }
    
    devLog.log("📥 Fetched game data:", data);

    // Determine player color
    let updatedData = data;
    
    // Check if player is already in the game
    if (data.white_player_name === nameToUse) {
      setPlayerColor("w");
      devLog.log("✅ Already white player");
    } else if (data.black_player_name === nameToUse) {
      setPlayerColor("b");
      devLog.log("✅ Already black player");
    }
    // Try to join as white if slot is available
    else if (!data.white_player_name) {
      const { data: updated, error: updateError } = await supabase
        .from("chess_games")
        .update({
          white_player_name: nameToUse,
          status: "active",
        })
        .eq("id", data.id)
        .select()
        .single();

      if (updateError || !updated) {
        devLog.error("Failed to join as white:", updateError);
        setError("Failed to join game");
        return false;
      }

      updatedData = updated;
      setPlayerColor("w");
      devLog.log("✅ Joined as white player, updated data:", updatedData);
    }
    // Try to join as black if slot is available
    else if (!data.black_player_name) {
      const { data: updated, error: updateError } = await supabase
        .from("chess_games")
        .update({
          black_player_name: nameToUse,
          status: "active",
        })
        .eq("id", data.id)
        .select()
        .single();

      if (updateError || !updated) {
        devLog.error("Failed to join as black:", updateError);
        setError("Failed to join game");
        return false;
      }

      updatedData = updated;
      setPlayerColor("b");
      devLog.log("✅ Joined as black player, updated data:", updatedData);
    }
    // Both slots taken - spectator mode
    else {
      setPlayerColor(null);
      devLog.log("👀 Joining as spectator - both slots taken");
    }

    // Load game from PGN to preserve move history
    const chess = new Chess();
    if (updatedData.pgn) {
      try {
        chess.loadPgn(updatedData.pgn);
        devLog.log("Joined game with move history:", chess.history());
      } catch (e) {
        devLog.error("Failed to load PGN on join:", e);
        chess.load(updatedData.fen);
      }
    } else {
      chess.load(updatedData.fen);
    }
    
    setGame(chess);
    setGameState(updatedData as unknown as GameState);
    setLoading(false);
    return true;
  }, [playerName]);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameState?.id) {
      devLog.log("⚠️ No gameState.id, skipping subscription");
      return;
    }

    devLog.log("📡 Setting up real-time subscription for game ID:", gameState.id);
    
    // Create a unique channel name for this game
    const channelName = `game-${gameState.id}-${Date.now()}`;
    devLog.log("📡 Channel name:", channelName);

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false }, // Don't receive our own broadcasts
          presence: { key: '' },
        }
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chess_games",
          filter: `id=eq.${gameState.id}`,
        },
        (payload) => {
          devLog.log("📥 Real-time update received at", new Date().toISOString());
          devLog.log("📥 Update payload:", payload.new);
          
          const newState = payload.new as GameState;
          
          // Load game from PGN to preserve move history
          const chess = new Chess();
          if (newState.pgn) {
            try {
              chess.loadPgn(newState.pgn);
              devLog.log("♟️ Loaded PGN successfully, move count:", chess.history().length);
              devLog.log("♟️ Move history:", chess.history());
            } catch (e) {
              devLog.error("❌ Failed to load PGN, loading FEN instead:", e);
              chess.load(newState.fen);
            }
          } else {
            chess.load(newState.fen);
            devLog.log("♟️ Loaded from FEN");
          }
          
          // Extract last move from history
          const history = chess.history({ verbose: true });
          if (history.length > 0) {
            const lastMoveData = history[history.length - 1];
            setLastMove({ from: lastMoveData.from, to: lastMoveData.to });
            devLog.log("♟️ Last move:", lastMoveData.san, "from", lastMoveData.from, "to", lastMoveData.to);
          }
          
          // Update state
          setGame(chess);
          setGameState(newState);
          devLog.log("✅ Game state updated via real-time subscription");
        }
      )
      .subscribe((status) => {
        devLog.log("📡 Subscription status changed:", status);
        if (status === "SUBSCRIBED") {
          devLog.log("✅ Successfully subscribed to game updates for game ID:", gameState.id);
          devLog.log("✅ Listening for changes on chess_games table");
        } else if (status === "CHANNEL_ERROR") {
          devLog.error("❌ Channel error - real-time updates may not work");
          devLog.error("❌ Please check Supabase Realtime settings");
        } else if (status === "TIMED_OUT") {
          devLog.error("❌ Subscription timed out");
          devLog.error("❌ Please check your network connection and Supabase status");
        } else if (status === "CLOSED") {
          devLog.log("🔴 Subscription closed");
        }
      });

    return () => {
      devLog.log("🔌 Cleaning up subscription for game ID:", gameState.id);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [gameState?.id]);

  // Timer logic
  useEffect(() => {
    if (!gameState || gameState.status !== "active") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Only start timer after first move
    const moveCount = game.history().length;
    if (moveCount === 0) {
      devLog.log("Timer not started - waiting for first move");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    devLog.log("Starting timer for", gameState.turn === "w" ? "white" : "black", "after", moveCount, "moves");

    timerRef.current = setInterval(async () => {
      // Only the player whose turn it is updates their timer
      if (gameState.turn === "w" && playerColor === "w") {
        const newTime = Math.max(0, gameState.white_time - 1);
        devLog.log("White timer:", newTime);
        if (newTime === 0) {
          await supabase
            .from("chess_games")
            .update({ status: "finished", white_time: 0 } as any)
            .eq("id", gameState.id);
        } else {
          await supabase
            .from("chess_games")
            .update({ white_time: newTime } as any)
            .eq("id", gameState.id);
        }
      } else if (gameState.turn === "b" && playerColor === "b") {
        const newTime = Math.max(0, gameState.black_time - 1);
        devLog.log("Black timer:", newTime);
        if (newTime === 0) {
          await supabase
            .from("chess_games")
            .update({ status: "finished", black_time: 0 } as any)
            .eq("id", gameState.id);
        } else {
          await supabase
            .from("chess_games")
            .update({ black_time: newTime } as any)
            .eq("id", gameState.id);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState?.id, gameState?.status, gameState?.turn, gameState?.white_time, gameState?.black_time, playerColor, game]);

  const handleSquareClick = useCallback(
    async (square: Square) => {
      if (!gameState || gameState.status === "finished") return;
      if (playerColor !== game.turn()) {
        devLog.log("❌ Not your turn:", { playerColor, turn: game.turn() });
        return;
      }

      const piece = game.get(square);

      if (selectedSquare) {
        // Check if this is a pawn promotion move
        const movingPiece = game.get(selectedSquare);
        const isPromotion = movingPiece?.type === 'p' && 
          ((movingPiece.color === 'w' && square[1] === '8') || 
           (movingPiece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          // Store the move and wait for user to select promotion piece
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          return;
        }

        // Try to make the move without promotion
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
          });

          if (move) {
            devLog.log("♟️ Move made:", move);
            const newFen = game.fen();
            const newPgn = game.pgn();
            const isGameOver = game.isGameOver();

            // Add time increment to the player who just moved
            const timeUpdate: any = {
              fen: newFen,
              pgn: newPgn,
              turn: game.turn(),
              status: isGameOver ? "finished" : "active",
            };
            
            // Clear draw offer if columns exist
            if (gameState.draw_offered_by !== undefined) {
              timeUpdate.draw_offered_by = null;
            }

            // Add time increment if available
            if (gameState.time_increment && gameState.time_increment > 0) {
              if (playerColor === "w") {
                timeUpdate.white_time = gameState.white_time + gameState.time_increment;
              } else {
                timeUpdate.black_time = gameState.black_time + gameState.time_increment;
              }
            }

            devLog.log("📤 Updating database with:", timeUpdate);
            const { error } = await supabase
              .from("chess_games")
              .update(timeUpdate)
              .eq("id", gameState.id);

            if (error) {
              devLog.error("❌ Failed to update game:", error);
              devLog.error("❌ Error details:", {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
              });
            } else {
              devLog.log("✅ Database updated successfully");
              devLog.log("✅ Move synced: from", move.from, "to", move.to);
            }

            setLastMove({ from: move.from as Square, to: move.to as Square });
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }
        } catch (e) {
          devLog.log("❌ Invalid move attempt:", e);
        }

        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true }) as Move[];
          setValidMoves(moves.map((m) => m.to as Square));
          return;
        }

        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }) as Move[];
        setValidMoves(moves.map((m) => m.to as Square));
      }
    },
    [game, selectedSquare, gameState, playerColor]
  );

  const resign = useCallback(async () => {
    if (!gameState || !playerColor) return;
    
    devLog.log(playerColor, "is resigning");
    // Store resignation info in PGN comment for now
    const resignNote = `{${playerColor === "w" ? "White" : "Black"} resigned}`;
    const updatedPgn = gameState.pgn ? `${gameState.pgn} ${resignNote}` : resignNote;
    
    await supabase
      .from("chess_games")
      .update({ 
        status: "finished",
        pgn: updatedPgn 
      } as any)
      .eq("id", gameState.id);
  }, [gameState, playerColor]);

  const offerDraw = useCallback(async () => {
    if (!gameState || !playerColor) {
      devLog.error("Cannot offer draw: missing gameState or playerColor", { gameState, playerColor });
      return { error: "Cannot offer draw: missing game state or player information" };
    }
    
    devLog.log("🤝 Offering draw...", { 
      playerColor, 
      gameId: gameState.id,
      currentDrawOffer: gameState.draw_offered_by 
    });
    
    const { data, error } = await supabase
      .from("chess_games")
      .update({ draw_offered_by: playerColor } as any)
      .eq("id", gameState.id)
      .select();
    
    if (error) {
      devLog.error("❌ Error offering draw:", error);
      devLog.error("Error details:", {
        message: error.message,
        code: error.code,
        hint: error.hint
      });
      
      // Check if it's a missing column error
      if (error.message.includes("draw_offered_by") || error.message.includes("column")) {
        devLog.error("🚨 DATABASE MIGRATION NEEDED!");
        devLog.error("The 'draw_offered_by' column doesn't exist in your database.");
        devLog.error("👉 See DEBUG_DRAW_OFFER.md for instructions");
        return { 
          error: "Database migration required. Please apply the migration to enable draw offers. See DEBUG_DRAW_OFFER.md",
          migrationNeeded: true 
        };
      }
      return { error: error.message };
    } else {
      devLog.log("✅ Draw offer successful!", data);
      return { success: true };
    }
  }, [gameState, playerColor]);

  const acceptDraw = useCallback(async () => {
    if (!gameState) return;
    
    await supabase
      .from("chess_games")
      .update({ status: "draw", draw_offered_by: null } as any)
      .eq("id", gameState.id);
  }, [gameState]);

  const declineDraw = useCallback(async () => {
    if (!gameState) return;
    
    devLog.log("Declining draw offer");
    await supabase
      .from("chess_games")
      .update({ draw_offered_by: null } as any)
      .eq("id", gameState.id);
  }, [gameState]);

  const leaveGame = useCallback(async () => {
    if (!gameState || !playerColor) return;
    
    devLog.log(playerColor, "is leaving the game");
    // Store leave info in PGN comment
    const leaveNote = `{${playerColor === "w" ? "White" : "Black"} left the game}`;
    const updatedPgn = gameState.pgn ? `${gameState.pgn} ${leaveNote}` : leaveNote;
    
    await supabase
      .from("chess_games")
      .update({ 
        status: "finished",
        pgn: updatedPgn 
      } as any)
      .eq("id", gameState.id);
  }, [gameState, playerColor]);

  // Calculate captured pieces
  const getCapturedPieces = useCallback(() => {
    const whiteCaptured: string[] = [];
    const blackCaptured: string[] = [];
    
    const history = game.history({ verbose: true });
    history.forEach((move) => {
      if (move.captured) {
        const symbol = pieceSymbols[move.captured][move.color === "w" ? "b" : "w"];
        if (move.color === "w") {
          whiteCaptured.push(symbol);
        } else {
          blackCaptured.push(symbol);
        }
      }
    });

    return { whiteCaptured, blackCaptured };
  }, [game]);

  const { whiteCaptured, blackCaptured } = getCapturedPieces();

  // Detect resignation and left game from PGN
  const resignedBy = gameState?.pgn?.includes("{White resigned}") ? "w" as const :
                     gameState?.pgn?.includes("{Black resigned}") ? "b" as const :
                     null;
  
  const leftBy = gameState?.pgn?.includes("{White left the game}") ? "w" as const :
                 gameState?.pgn?.includes("{Black left the game}") ? "b" as const :
                 null;

  // Detect timeout winner
  const timeoutWinner = gameState?.white_time === 0 ? "b" as const :
                        gameState?.black_time === 0 ? "w" as const :
                        null;

  // Determine overall winner
  const winner = game.isCheckmate() 
    ? (game.turn() === "w" ? "b" : "w") as "w" | "b"
    : timeoutWinner
    ? timeoutWinner
    : resignedBy 
    ? (resignedBy === "w" ? "b" : "w") as "w" | "b"
    : leftBy
    ? (leftBy === "w" ? "b" : "w") as "w" | "b"
    : null;

  // Handle pawn promotion piece selection
  const handlePromotion = useCallback(async (piece: "q" | "r" | "b" | "n") => {
    if (!pendingPromotion || !gameState) return;

    try {
      const move = game.move({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: piece,
      });

      if (move) {
        devLog.log("♟️ Promotion move made:", move);
        const newFen = game.fen();
        const newPgn = game.pgn();
        const isGameOver = game.isGameOver();

        const timeUpdate: any = {
          fen: newFen,
          pgn: newPgn,
          turn: game.turn(),
          status: isGameOver ? "finished" : "active",
        };
        
        if (gameState.draw_offered_by !== undefined) {
          timeUpdate.draw_offered_by = null;
        }

        if (gameState.time_increment && gameState.time_increment > 0) {
          if (playerColor === "w") {
            timeUpdate.white_time = gameState.white_time + gameState.time_increment;
          } else {
            timeUpdate.black_time = gameState.black_time + gameState.time_increment;
          }
        }

        devLog.log("📤 Updating database with promotion move:", timeUpdate);
        const { error } = await supabase
          .from("chess_games")
          .update(timeUpdate)
          .eq("id", gameState.id);

        if (error) {
          devLog.error("❌ Failed to update game:", error);
        } else {
          devLog.log("✅ Promotion move synced");
        }

        setLastMove({ from: move.from as Square, to: move.to as Square });
        setPendingPromotion(null);
      }
    } catch (err) {
      devLog.error("Failed to make promotion move:", err);
      setPendingPromotion(null);
    }
  }, [pendingPromotion, gameState, game, playerColor]);

  const kingInCheckSquare = game.isCheck() ? getKingSquare(game, game.turn()) : null;

  return {
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
    moveHistory: game.history(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw() || gameState?.status === "draw",
    turn: game.turn(),
    winner,
    resignedBy,
    leftBy,
    timeoutWinner,
    kingInCheckSquare,
  };
};
