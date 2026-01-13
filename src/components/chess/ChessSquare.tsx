import { motion } from "framer-motion";
import { ChessPiece } from "./ChessPiece";

interface ChessSquareProps {
  piece: { type: string; color: "w" | "b" } | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isKingInCheck: boolean;
  onClick: () => void;
  position: string;
}

export const ChessSquare = ({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  isKingInCheck,
  onClick,
  position,
}: ChessSquareProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center cursor-pointer
        transition-all duration-200 border border-transparent
        ${isLight ? "bg-muted/30" : "bg-card/80"}
        ${isSelected ? "ring-2 ring-neon-cyan border-glow-cyan" : ""}
        ${isLastMove ? "bg-neon-purple/20" : ""}
        ${isKingInCheck ? "ring-2 ring-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] bg-red-500/10" : ""}
        hover:bg-neon-cyan/10
      `}
    >
      {/* Grid overlay effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 text-[8px] text-muted-foreground p-0.5 font-mono">
          {position}
        </div>
      </div>

      {/* Valid move indicator */}
      {isValidMove && !piece && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-3 h-3 rounded-full bg-neon-cyan/50 shadow-[0_0_10px_hsl(180,100%,50%)]"
        />
      )}

      {/* Valid capture indicator */}
      {isValidMove && piece && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-2 rounded-full border-2 border-neon-magenta/50 shadow-[0_0_10px_hsl(300,100%,50%)]"
        />
      )}

      {/* Chess piece */}
      {piece && (
        <ChessPiece
          piece={piece.type}
          color={piece.color}
          isSelected={isSelected}
        />
      )}
    </motion.div>
  );
};
