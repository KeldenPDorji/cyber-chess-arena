import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface PromotionDialogProps {
  open: boolean;
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  isWhite: boolean;
}

export const PromotionDialog = ({ open, onSelect, isWhite }: PromotionDialogProps) => {
  const pieces = [
    { value: "q" as const, name: "Queen", symbol: isWhite ? "♕" : "♛" },
    { value: "r" as const, name: "Rook", symbol: isWhite ? "♖" : "♜" },
    { value: "b" as const, name: "Bishop", symbol: isWhite ? "♗" : "♝" },
    { value: "n" as const, name: "Knight", symbol: isWhite ? "♘" : "♞" },
  ];

  return (
    <Dialog open={open}>
      <DialogContent className="cyber-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cyber text-neon-cyan text-center text-xl">
            Choose Promotion Piece
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {pieces.map((piece) => (
            <motion.button
              key={piece.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(piece.value)}
              className="cyber-card bg-card hover:bg-neon-cyan/10 p-6 rounded-lg transition-all border-2 border-neon-cyan/20 hover:border-neon-cyan flex flex-col items-center gap-2"
            >
              <span className="text-6xl">{piece.symbol}</span>
              <span className="font-cyber text-sm text-muted-foreground">
                {piece.name}
              </span>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
