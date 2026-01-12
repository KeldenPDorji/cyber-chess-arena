import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface MoveHistoryProps {
  moves: string[];
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const movePairs: { white: string; black?: string }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-neon-cyan" />
        <h3 className="font-cyber text-lg text-neon-cyan">Move History</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {moves.length} moves
        </span>
      </div>

      <ScrollArea className="h-[280px]" ref={scrollRef}>
        {movePairs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-2">
              No moves yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Make your first move to start the game!
            </p>
          </div>
        ) : (
          <div className="space-y-1 pr-4">
            {movePairs.map((pair, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
                className={`flex items-center text-sm font-mono rounded px-2 py-1.5 transition-colors ${
                  index === movePairs.length - 1
                    ? "bg-neon-cyan/10 border border-neon-cyan/20"
                    : "hover:bg-neon-cyan/5"
                }`}
              >
                <span className="w-8 text-muted-foreground font-bold">{index + 1}.</span>
                <span className={`w-20 ${index === movePairs.length - 1 && !pair.black ? "text-neon-cyan font-bold" : "text-neon-cyan"}`}>
                  {pair.white}
                </span>
                {pair.black ? (
                  <span className={`w-20 ${index === movePairs.length - 1 ? "text-neon-magenta font-bold" : "text-neon-magenta"}`}>
                    {pair.black}
                  </span>
                ) : (
                  <span className="w-20 text-muted-foreground/50 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 animate-pulse" />
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};
