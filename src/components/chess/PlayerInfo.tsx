import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";

interface PlayerInfoProps {
  name: string;
  rating?: number;
  time: number;
  isActive: boolean;
  isWhite: boolean;
  capturedPieces: string[];
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const PlayerInfo = ({
  name,
  rating,
  time,
  isActive,
  isWhite,
  capturedPieces,
}: PlayerInfoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isWhite ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        cyber-card rounded-lg p-4 
        ${isActive ? (isWhite ? "border-glow-cyan" : "border-glow-magenta") : ""}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${isWhite ? "bg-neon-cyan/20 text-neon-cyan" : "bg-neon-magenta/20 text-neon-magenta"}
            ${isActive ? "animate-neon-pulse" : ""}
          `}
        >
          <User className="w-6 h-6" />
        </div>

        {/* Player info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-cyber text-lg text-foreground">{name}</span>
            {rating && (
              <span className="text-sm text-muted-foreground">({rating})</span>
            )}
          </div>
          
          {/* Captured pieces */}
          <div className="flex gap-1 mt-1 min-h-[24px]">
            {capturedPieces.map((piece, i) => (
              <span
                key={i}
                className={`text-lg ${isWhite ? "text-neon-magenta" : "text-neon-cyan"}`}
              >
                {piece}
              </span>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl
            ${isWhite ? "bg-neon-cyan/10 text-neon-cyan" : "bg-neon-magenta/10 text-neon-magenta"}
            ${isActive ? "animate-pulse" : ""}
          `}
        >
          <Clock className="w-5 h-5" />
          <span className={isActive ? "text-glow-cyan" : ""}>{formatTime(time)}</span>
        </div>
      </div>
    </motion.div>
  );
};
