import { motion } from "framer-motion";
import { ChessSquare } from "./ChessSquare";
import { Chess, Square } from "chess.js";

interface ChessBoardProps {
  game: Chess;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  flipped?: boolean;
  kingInCheckSquare?: Square | null;
}

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

export const ChessBoard = ({
  game,
  selectedSquare,
  validMoves,
  lastMove,
  onSquareClick,
  flipped = false,
  kingInCheckSquare = null,
}: ChessBoardProps) => {
  const displayFiles = flipped ? [...files].reverse() : files;
  const displayRanks = flipped ? [...ranks].reverse() : ranks;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      {/* Outer glow border */}
      <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta rounded-lg opacity-50 blur-sm" />
      
      {/* Board container */}
      <div className="relative cyber-card rounded-lg p-0.5 sm:p-1 overflow-hidden scanlines">
        {/* File labels (top) */}
        <div className="flex justify-around px-3 sm:px-6 py-0.5 sm:py-1">
          {displayFiles.map((file) => (
            <span key={file} className="text-[10px] sm:text-xs font-cyber text-neon-cyan/70 uppercase">
              {file}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Rank labels (left) */}
          <div className="flex flex-col justify-around py-0.5 sm:py-1 px-1 sm:px-2">
            {displayRanks.map((rank) => (
              <span key={rank} className="text-[10px] sm:text-xs font-cyber text-neon-cyan/70">
                {rank}
              </span>
            ))}
          </div>

          {/* Chess board grid */}
          <div className="grid grid-cols-8 gap-0 border border-neon-cyan/30 rounded overflow-hidden flex-1">
            {displayRanks.map((rank, rankIndex) =>
              displayFiles.map((file, fileIndex) => {
                const square = `${file}${rank}` as Square;
                const piece = game.get(square);
                const isLight = (rankIndex + fileIndex) % 2 === (flipped ? 1 : 0);
                const isSelected = selectedSquare === square;
                const isValidMove = validMoves.includes(square);
                const isLastMove =
                  lastMove?.from === square || lastMove?.to === square;
                const isKingInCheck = kingInCheckSquare === square;

                return (
                  <ChessSquare
                    key={square}
                    piece={piece}
                    isLight={isLight}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isLastMove={isLastMove}
                    isKingInCheck={isKingInCheck}
                    onClick={() => onSquareClick(square)}
                    position={square}
                  />
                );
              })
            )}
          </div>

          {/* Rank labels (right) */}
          <div className="flex flex-col justify-around py-0.5 sm:py-1 px-1 sm:px-2">
            {displayRanks.map((rank) => (
              <span key={rank} className="text-[10px] sm:text-xs font-cyber text-neon-cyan/70">
                {rank}
              </span>
            ))}
          </div>
        </div>

        {/* File labels (bottom) */}
        <div className="flex justify-around px-3 sm:px-6 py-0.5 sm:py-1">
          {displayFiles.map((file) => (
            <span key={file} className="text-[10px] sm:text-xs font-cyber text-neon-cyan/70 uppercase">
              {file}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
