import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Square, Move } from "chess.js";
import { supabase } from "@/integrations/supabase/client";

const pieceSymbols: Record<string, { w: string; b: string }> = {
  k: { w: "♔", b: "♚" },
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
  p: { w: "♙", b: "♟" },
};

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set loading to false if no gameCode on initial mount
  useEffect(() => {
    if (!gameCode) {
      console.log("No gameCode provided, setting loading to false");
      setLoading(false);
    }
  }, []);

  // Generate a random game code
  const generateGameCode = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  // Create a new game
  const createGame = useCallback(async () => {
    const code = generateGameCode();
    const totalSeconds = timeControl.minutes * 60;
    
    console.log("Creating game with code:", code, "player:", playerName);
    
    const { data, error } = await supabase
      .from("chess_games")
      .insert({
        game_code: code,
        white_player_name: playerName,
        status: "waiting",
        white_time: totalSeconds,
        black_time: totalSeconds,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating game:", error);
      setError("Failed to create game: " + error.message);
      return null;
    }

    console.log("Game created successfully:", data);
    setGameState(data as unknown as GameState);
    setPlayerColor("w");
    setLoading(false);
    return code;
  }, [playerName, generateGameCode, timeControl]);

  // Join an existing game
  const joinGame = useCallback(async (code: string) => {
    const { data, error } = await supabase
      .from("chess_games")
      .select("*")
      .eq("game_code", code.toUpperCase())
      .single();

    if (error || !data) {
      setError("Game not found");
      setLoading(false);
      return false;
    }

    // Determine player color
    if (!data.black_player_name && data.white_player_name !== playerName) {
      // Join as black player
      const { error: updateError } = await supabase
        .from("chess_games")
        .update({
          black_player_name: playerName,
          status: "active",
        })
        .eq("id", data.id);

      if (updateError) {
        setError("Failed to join game");
        return false;
      }

      setPlayerColor("b");
    } else if (data.white_player_name === playerName) {
      setPlayerColor("w");
    } else if (data.black_player_name === playerName) {
      setPlayerColor("b");
    } else {
      // Spectator mode
      setPlayerColor(null);
    }

    // Load game from PGN to preserve move history
    const chess = new Chess();
    if (data.pgn) {
      try {
        chess.loadPgn(data.pgn);
        console.log("Joined game with move history:", chess.history());
      } catch (e) {
        console.error("Failed to load PGN on join:", e);
        chess.load(data.fen);
      }
    } else {
      chess.load(data.fen);
    }
    
    setGame(chess);
    setGameState(data as unknown as GameState);
    setLoading(false);
    return true;
  }, [playerName]);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameState?.id) return;

    console.log("Subscribing to game updates for:", gameState.id);

    const channel = supabase
      .channel(`game-${gameState.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chess_games",
          filter: `id=eq.${gameState.id}`,
        },
        (payload) => {
          console.log("Game update received:", payload.new);
          const newState = payload.new as GameState;
          setGameState(newState);
          
          // Load game from PGN to preserve move history
          const chess = new Chess();
          if (newState.pgn) {
            try {
              chess.loadPgn(newState.pgn);
              console.log("Loaded PGN, move history:", chess.history());
            } catch (e) {
              console.error("Failed to load PGN, loading FEN instead:", e);
              chess.load(newState.fen);
            }
          } else {
            chess.load(newState.fen);
          }
          
          setGame(chess);
          
          // Extract last move from history
          const history = chess.history({ verbose: true });
          if (history.length > 0) {
            const lastMoveData = history[history.length - 1];
            setLastMove({ from: lastMoveData.from, to: lastMoveData.to });
          }
        }
      )
      .subscribe();

    return () => {
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

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    console.log("Starting timer for", gameState.turn === "w" ? "white" : "black");

    timerRef.current = setInterval(async () => {
      // Only the player whose turn it is updates their timer
      if (gameState.turn === "w" && playerColor === "w") {
        const newTime = Math.max(0, gameState.white_time - 1);
        console.log("White timer:", newTime);
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
        console.log("Black timer:", newTime);
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
  }, [gameState?.id, gameState?.status, gameState?.turn, gameState?.white_time, gameState?.black_time, playerColor]);

  const handleSquareClick = useCallback(
    async (square: Square) => {
      if (!gameState || gameState.status === "finished") return;
      if (playerColor !== game.turn()) return; // Not player's turn

      const piece = game.get(square);

      if (selectedSquare) {
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: "q",
          });

          if (move) {
            const newFen = game.fen();
            const newPgn = game.pgn();
            const isGameOver = game.isGameOver();

            // Add time increment to the player who just moved
            const timeUpdate: any = {
              fen: newFen,
              pgn: newPgn,
              turn: game.turn(),
              status: isGameOver ? "finished" : "active",
              last_move_at: new Date().toISOString(),
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

            await supabase
              .from("chess_games")
              .update(timeUpdate)
              .eq("id", gameState.id);

            setLastMove({ from: move.from as Square, to: move.to as Square });
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }
        } catch {
          // Invalid move
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
    
    console.log(playerColor, "is resigning");
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
    if (!gameState || !playerColor) return;
    
    await supabase
      .from("chess_games")
      .update({ draw_offered_by: playerColor } as any)
      .eq("id", gameState.id);
  }, [gameState, playerColor]);

  const acceptDraw = useCallback(async () => {
    if (!gameState) return;
    
    await supabase
      .from("chess_games")
      .update({ status: "draw", draw_offered_by: null } as any)
      .eq("id", gameState.id);
  }, [gameState]);

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

  // Detect resignation from PGN
  const resignedBy = gameState?.pgn?.includes("{White resigned}") ? "w" as const :
                     gameState?.pgn?.includes("{Black resigned}") ? "b" as const :
                     null;

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
    resign,
    offerDraw,
    acceptDraw,
    setTimeControl,
    whiteCaptured,
    blackCaptured,
    moveHistory: game.history(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw() || gameState?.status === "draw",
    turn: game.turn(),
    winner: game.isCheckmate() ? (game.turn() === "w" ? "b" : "w") as "w" | "b" : null,
    resignedBy,
  };
};
