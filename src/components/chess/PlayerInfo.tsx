import { motion, AnimatePresence } from "framer-motion";
import { Clock, User } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [prevTime, setPrevTime] = useState(time);
  const [showIncrement, setShowIncrement] = useState(false);
  
  // Detect time increment
  useEffect(() => {
    if (time > prevTime && prevTime > 0) {
      const increment = time - prevTime;
      if (increment > 1 && increment < 30) {
        setShowIncrement(true);
        setTimeout(() => setShowIncrement(false), 1000);
      }
    }
    setPrevTime(time);
  }, [time, prevTime]);

  const isLowTime = time <= 30 && time > 0;
  const isCriticalTime = time <= 10 && time > 0;
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
        <div className="relative">
          <div
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl
              transition-all duration-300
              ${isWhite ? "bg-neon-cyan/10 text-neon-cyan" : "bg-neon-magenta/10 text-neon-magenta"}
              ${isLowTime && isActive ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-400/50" : ""}
              ${isCriticalTime && isActive ? "bg-red-500/30 text-red-400 ring-2 ring-red-400/70" : ""}
            `}
          >
            <Clock className="w-5 h-5" />
            <span className={isLowTime && isActive ? "font-bold" : ""}>
              {formatTime(time)}
            </span>
          </div>
          
          {/* Increment notification - subtle */}
          <AnimatePresence>
            {showIncrement && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -15, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-6 right-0 bg-green-500/90 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg"
              >
                +{time - prevTime}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
