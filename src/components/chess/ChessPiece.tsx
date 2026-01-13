import { motion } from "framer-motion";
import { pieceSymbols } from "@/lib/chessUtils";

interface ChessPieceProps {
  piece: string;
  color: "w" | "b";
  isSelected?: boolean;
}

export const ChessPiece = ({ piece, color, isSelected }: ChessPieceProps) => {
  const symbol = pieceSymbols[piece.toLowerCase()]?.[color] || "";

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`text-4xl md:text-5xl select-none cursor-pointer transition-all duration-200
        ${color === "w" ? "text-neon-cyan" : "text-neon-magenta"}
        ${isSelected ? "animate-piece-glow scale-110" : ""}
        hover:scale-110`}
      style={{
        filter: `drop-shadow(0 0 8px ${color === "w" ? "hsl(180, 100%, 50%)" : "hsl(300, 100%, 50%)"})`,
      }}
    >
      {symbol}
    </motion.div>
  );
};
