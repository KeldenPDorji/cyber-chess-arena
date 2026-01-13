import { Square } from "chess.js";

export const pieceSymbols: Record<string, { w: string; b: string }> = {
  k: { w: "♔", b: "♚" },
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
  p: { w: "♙", b: "♟" },
};

export const getKingSquare = (game: any, color: "w" | "b"): Square | null => {
  const board = game.board();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === "k" && piece.color === color) {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
        return `${files[file]}${ranks[rank]}` as Square;
      }
    }
  }
  return null;
};
