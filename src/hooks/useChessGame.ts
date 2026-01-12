import { useState, useCallback, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";

const pieceSymbols: Record<string, { w: string; b: string }> = {
  k: { w: "♔", b: "♚" },
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
  p: { w: "♙", b: "♟" },
};

export const useChessGame = (initialTime = 600) => {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Timer logic
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, gameOver]);

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (gameOver) return;

      const piece = game.get(square);

      // If a piece is already selected
      if (selectedSquare) {
        // Try to make a move
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: "q", // Auto-promote to queen
          });

          if (move) {
            // Track captured pieces
            if (move.captured) {
              const capturedSymbol = pieceSymbols[move.captured][move.color === "w" ? "b" : "w"];
              if (move.color === "w") {
                setWhiteCaptured((prev) => [...prev, capturedSymbol]);
              } else {
                setBlackCaptured((prev) => [...prev, capturedSymbol]);
              }
            }

            setGame(new Chess(game.fen()));
            setLastMove({ from: move.from as Square, to: move.to as Square });
            setMoveHistory(game.history());
            setSelectedSquare(null);
            setValidMoves([]);

            // Check for game over
            if (game.isGameOver()) {
              setGameOver(true);
            }
            return;
          }
        } catch {
          // Invalid move, continue to piece selection logic
        }

        // If clicking on own piece, select it instead
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true }) as Move[];
          setValidMoves(moves.map((m) => m.to as Square));
          return;
        }

        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Select a piece
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }) as Move[];
        setValidMoves(moves.map((m) => m.to as Square));
      }
    },
    [game, selectedSquare, gameOver]
  );

  const newGame = useCallback(() => {
    const newChess = new Chess();
    setGame(newChess);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setMoveHistory([]);
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setGameOver(false);
  }, [initialTime]);

  const resign = useCallback(() => {
    setGameOver(true);
  }, []);

  return {
    game,
    selectedSquare,
    validMoves,
    lastMove,
    moveHistory,
    whiteTime,
    blackTime,
    whiteCaptured,
    blackCaptured,
    gameOver,
    handleSquareClick,
    newGame,
    resign,
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
    turn: game.turn(),
    winner: game.isCheckmate() ? (game.turn() === "w" ? "b" : "w") as "w" | "b" : null,
  };
};
