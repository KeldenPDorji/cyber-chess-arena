import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trophy, Swords, Flag } from "lucide-react";

interface GameStatusProps {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  turn: "w" | "b";
  winner?: "w" | "b" | null;
  resignedBy?: "w" | "b" | null;
  leftBy?: "w" | "b" | null;
  timeoutWinner?: "w" | "b" | null;
}

export const GameStatus = ({
  isCheck,
  isCheckmate,
  isDraw,
  turn,
  winner,
  resignedBy,
  leftBy,
  timeoutWinner,
}: GameStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cyber-card rounded-lg p-4 text-center"
    >
      <AnimatePresence mode="wait">
        {timeoutWinner && (
          <motion.div
            key="timeout"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Trophy className={`w-12 h-12 ${timeoutWinner === "w" ? "text-neon-cyan" : "text-neon-magenta"}`} />
            <span className="font-cyber text-2xl text-neon-yellow">
              Time Out!
            </span>
            <span className="text-muted-foreground">
              {timeoutWinner === "w" ? "White" : "Black"} wins
            </span>
          </motion.div>
        )}

        {leftBy && !timeoutWinner && (
          <motion.div
            key="left"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Flag className="w-12 h-12 text-neon-purple" />
            <span className="font-cyber text-2xl text-neon-purple">
              {leftBy === "w" ? "White" : "Black"} Left
            </span>
            <span className="text-muted-foreground">
              {leftBy === "w" ? "Black" : "White"} wins
            </span>
          </motion.div>
        )}

        {resignedBy && !leftBy && !timeoutWinner && (
          <motion.div
            key="resigned"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Flag className="w-12 h-12 text-destructive" />
            <span className="font-cyber text-2xl text-destructive">
              {resignedBy === "w" ? "White" : "Black"} Resigned
            </span>
            <span className="text-muted-foreground">
              {resignedBy === "w" ? "Black" : "White"} wins
            </span>
          </motion.div>
        )}

        {isCheckmate && !resignedBy && !leftBy && !timeoutWinner && (
          <motion.div
            key="checkmate"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Trophy className={`w-12 h-12 ${winner === "w" ? "text-neon-cyan" : "text-neon-magenta"}`} />
            <span className="font-cyber text-2xl text-glow-cyan">
              Checkmate!
            </span>
            <span className="text-muted-foreground">
              {winner === "w" ? "White" : "Black"} wins
            </span>
          </motion.div>
        )}

        {isDraw && !isCheckmate && !resignedBy && !leftBy && !timeoutWinner && (
          <motion.div
            key="draw"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Swords className="w-12 h-12 text-neon-yellow" />
            <span className="font-cyber text-2xl text-neon-yellow">
              Draw!
            </span>
          </motion.div>
        )}

        {isCheck && !isCheckmate && !resignedBy && !leftBy && !timeoutWinner && (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
            <span className="font-cyber text-xl text-destructive">Check!</span>
          </motion.div>
        )}

        {!isCheck && !isCheckmate && !isDraw && !resignedBy && (
          <motion.div
            key="turn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <div
              className={`w-4 h-4 rounded-full ${
                turn === "w" ? "bg-neon-cyan shadow-[0_0_10px_hsl(180,100%,50%)]" : "bg-neon-magenta shadow-[0_0_10px_hsl(300,100%,50%)]"
              }`}
            />
            <span className="font-cyber text-lg">
              {turn === "w" ? (
                <span className="text-neon-cyan">White</span>
              ) : (
                <span className="text-neon-magenta">Black</span>
              )}{" "}
              to move
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
