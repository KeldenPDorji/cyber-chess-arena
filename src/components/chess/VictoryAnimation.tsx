import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Crown, Zap, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface VictoryAnimationProps {
  show: boolean;
  winner: "w" | "b" | null;
  playerColor: "w" | "b" | null;
  reason?: "checkmate" | "resignation" | "timeout" | "abandoned" | "draw";
  isSpectator?: boolean;
}

export const VictoryAnimation = ({
  show,
  winner,
  playerColor,
  reason = "checkmate",
  isSpectator = false,
}: VictoryAnimationProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (show && winner && !isSpectator) {
      // Only generate confetti for players, not spectators
      const particles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.2,
      }));
      setConfetti(particles);
    }
  }, [show, winner, isSpectator]);

  const isVictory = winner === playerColor;
  const isDraw = reason === "draw";

  const getMessage = () => {
    if (isDraw) return "Draw!";
    if (!winner) return "";
    
    // Spectator view - simple factual message
    if (isSpectator) {
      const winnerColor = winner === "w" ? "White" : "Black";
      switch (reason) {
        case "checkmate":
          return `${winnerColor} Wins by Checkmate`;
        case "resignation":
          return `${winnerColor} Wins by Resignation`;
        case "timeout":
          return `${winnerColor} Wins on Time`;
        case "abandoned":
          return `${winnerColor} Wins - Opponent Left`;
        default:
          return `${winnerColor} Wins`;
      }
    }
    
    // Player view - personalized message
    if (isVictory) {
      switch (reason) {
        case "checkmate":
          return "🎉 Victory by Checkmate!";
        case "resignation":
          return "🎉 Victory by Resignation!";
        case "timeout":
          return "🎉 Victory on Time!";
        case "abandoned":
          return "🎉 Opponent Left!";
        default:
          return "🎉 You Win!";
      }
    } else {
      switch (reason) {
        case "checkmate":
          return "Checkmate - You Lost";
        case "resignation":
          return "You Resigned";
        case "timeout":
          return "Time Out - You Lost";
        case "abandoned":
          return "You Left the Game";
        default:
          return "You Lost";
      }
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* ALL THE CONFETTI AND EFFECTS for victory - ONLY FOR PLAYERS */}
        {isVictory && !isDraw && !isSpectator && (
          <>
            {/* Layer 1: Main BIG confetti - wild horizontal spread */}
            <div className="absolute inset-0 overflow-hidden">
              {confetti.map((particle) => {
                const startX = particle.x;
                const drift = (Math.random() - 0.5) * 90; // MASSIVE horizontal spread
                const endX = Math.max(0, Math.min(100, startX + drift));
                
                return (
                  <motion.div
                    key={particle.id}
                    initial={{ 
                      top: "-40px",
                      left: `${startX}%`,
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    animate={{
                      top: "120vh",
                      left: `${endX}%`,
                      rotate: [0, 250, 500, 750, 1000], // Crazy rotation
                      opacity: [1, 1, 1, 0.7, 0],
                      scale: [1, 1.4, 1.2, 1, 0.7],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2.5,
                      delay: particle.delay,
                      ease: "easeIn",
                    }}
                    className="absolute"
                    style={{
                      width: `${16 + Math.random() * 24}px`, // BIGGER
                      height: `${16 + Math.random() * 24}px`,
                      background: `hsl(${Math.random() * 360}, 100%, ${50 + Math.random() * 30}%)`,
                      borderRadius: Math.random() > 0.5 ? "50%" : Math.random() > 0.5 ? "0%" : "25%",
                      boxShadow: `0 0 ${12 + Math.random() * 20}px currentColor`,
                    }}
                  />
                );
              })}
            </div>

            {/* Layer 2: EXTRA FAST confetti - rapid fall */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 35 }, (_, i) => {
                const startX = Math.random() * 100;
                const drift = (Math.random() - 0.5) * 50;
                return (
                  <motion.div
                    key={`fast-${i}`}
                    initial={{ 
                      top: "-20px",
                      left: `${startX}%`,
                      opacity: 1,
                      rotate: 0
                    }}
                    animate={{
                      top: "110vh",
                      left: `${Math.max(0, Math.min(100, startX + drift))}%`,
                      rotate: Math.random() * 900,
                      opacity: [1, 1, 0.5, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1.5,
                      delay: Math.random() * 0.8,
                      ease: "linear",
                    }}
                    className="absolute"
                    style={{
                      width: `${8 + Math.random() * 12}px`,
                      height: `${8 + Math.random() * 12}px`,
                      background: `hsl(${Math.random() * 360}, 95%, ${55 + Math.random() * 25}%)`,
                      borderRadius: "50%",
                      filter: `blur(${Math.random() * 2}px)`,
                      boxShadow: `0 0 ${8 + Math.random() * 12}px currentColor`,
                    }}
                  />
                );
              })}
            </div>

            {/* Layer 3: Glittery small particles - everywhere */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 50 }, (_, i) => {
                const startX = Math.random() * 100;
                const drift = (Math.random() - 0.5) * 30;
                return (
                  <motion.div
                    key={`glitter-${i}`}
                    initial={{ 
                      top: `${Math.random() * -50}px`,
                      left: `${startX}%`,
                      opacity: 1,
                    }}
                    animate={{
                      top: "110vh",
                      left: `${Math.max(0, Math.min(100, startX + drift))}%`,
                      opacity: [1, 0.8, 0.5, 0],
                      scale: [1, 1.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 1,
                      ease: "easeInOut",
                    }}
                    className="absolute"
                    style={{
                      width: `${3 + Math.random() * 5}px`,
                      height: `${3 + Math.random() * 5}px`,
                      background: `hsl(${Math.random() * 360}, 100%, ${70 + Math.random() * 20}%)`,
                      borderRadius: "50%",
                      boxShadow: `0 0 ${6 + Math.random() * 8}px currentColor`,
                    }}
                  />
                );
              })}
            </div>

            {/* Layer 4: Celebratory stars bursting from center */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }, (_, i) => {
                const angle = (i * 360 / 20) * Math.PI / 180;
                const distance = 45 + Math.random() * 15;
                return (
                  <motion.div
                    key={`star-${i}`}
                    initial={{ 
                      x: "50%", 
                      y: "50%", 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{
                      x: `${50 + Math.cos(angle) * distance}%`,
                      y: `${50 + Math.sin(angle) * distance}%`,
                      scale: [0, 2.5, 0],
                      opacity: [1, 1, 0],
                      rotate: [0, 1440],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: 0.1 + (i * 0.02),
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Star 
                      className={`${i % 2 === 0 ? 'w-10 h-10' : 'w-12 h-12'} text-yellow-300`}
                      fill="currentColor"
                      style={{
                        filter: "drop-shadow(0 0 12px rgba(253, 224, 71, 0.9))"
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Layer 5: Secondary star wave - delayed burst */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 16 }, (_, i) => {
                const angle = (i * 360 / 16 + 15) * Math.PI / 180; // Offset angle
                const distance = 35 + Math.random() * 12;
                return (
                  <motion.div
                    key={`star2-${i}`}
                    initial={{ 
                      x: "50%", 
                      y: "50%", 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{
                      x: `${50 + Math.cos(angle) * distance}%`,
                      y: `${50 + Math.sin(angle) * distance}%`,
                      scale: [0, 2, 0],
                      opacity: [1, 1, 0],
                      rotate: [0, -1080],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.5 + (i * 0.03),
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Star 
                      className="w-6 h-6 text-cyan-300" 
                      fill="currentColor"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(103, 232, 249, 0.9))"
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Layer 6: Sparkle explosions from corners */}
            {[
              { x: "10%", y: "10%" },   // Top-left
              { x: "90%", y: "10%" },   // Top-right
              { x: "10%", y: "90%" },   // Bottom-left
              { x: "90%", y: "90%" },   // Bottom-right
            ].map((pos, idx) => (
              <div key={`corner-${idx}`} className="absolute inset-0">
                {Array.from({ length: 8 }, (_, i) => (
                  <motion.div
                    key={`sparkle-${idx}-${i}`}
                    initial={{ 
                      x: pos.x, 
                      y: pos.y, 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{
                      x: `${parseFloat(pos.x) + (Math.random() - 0.5) * 40}%`,
                      y: `${parseFloat(pos.y) + (Math.random() - 0.5) * 40}%`,
                      scale: [0, 3, 0],
                      opacity: [1, 1, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 0.8,
                      delay: 0.2 + idx * 0.1 + i * 0.05,
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Sparkles 
                      className="w-8 h-8 text-cyan-300" 
                      style={{
                        filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))"
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ))}

            {/* Layer 7: Radiating rings */}
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={`ring-${i}`}
                initial={{
                  width: "0px",
                  height: "0px",
                  opacity: 0.8,
                }}
                animate={{
                  width: `${300 + i * 200}px`,
                  height: `${300 + i * 200}px`,
                  opacity: 0,
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-300/40"
                style={{
                  boxShadow: "0 0 20px rgba(253, 224, 71, 0.5)",
                }}
              />
            ))}

            {/* Layer 8: Floating sparkles around the card */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 360 / 12) * Math.PI / 180;
              const radius = 200;
              return (
                <motion.div
                  key={`orbit-${i}`}
                  initial={{
                    x: "50%",
                    y: "50%",
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: `${50 + Math.cos(angle + Date.now() * 0.001) * (radius / window.innerWidth * 100)}%`,
                    y: `${50 + Math.sin(angle + Date.now() * 0.001) * (radius / window.innerHeight * 100)}%`,
                    scale: [0, 1, 1, 0],
                    opacity: [0, 1, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.05,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute"
                >
                  <Sparkles className="w-4 h-4 text-purple-300" />
                </motion.div>
              );
            })}
          </>
        )}

        {/* Main victory/defeat card */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.5 }}
          className={`
            relative cyber-card rounded-2xl p-8 max-w-md mx-4
            ${isSpectator ? "border-neon-purple/50 bg-gradient-to-br from-purple-500/10 to-gray-800/50" : ""}
            ${!isSpectator && isVictory && !isDraw ? "border-glow-cyan bg-gradient-to-br from-cyan-500/10 to-purple-500/10" : ""}
            ${!isSpectator && !isVictory && !isDraw ? "bg-gradient-to-br from-red-500/10 to-gray-800/50" : ""}
            ${isDraw ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10" : ""}
          `}
        >
          {/* Sparkles animation for victory - NOT for spectators */}
          {isVictory && !isDraw && !isSpectator && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-4 -right-4 text-yellow-400"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-4 -left-4 text-yellow-400"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            </>
          )}

          {/* Icon */}
          <motion.div
            animate={isVictory && !isDraw && !isSpectator ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="flex justify-center mb-4"
          >
            {isSpectator ? (
              <Trophy className="w-20 h-20 text-purple-400" />
            ) : (
              <>
                {isVictory && !isDraw && (
                  <Crown className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                )}
                {!isVictory && !isDraw && (
                  <Trophy className="w-20 h-20 text-gray-400" />
                )}
                {isDraw && (
                  <Zap className="w-20 h-20 text-yellow-400" />
                )}
              </>
            )}
          </motion.div>

          {/* Message */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`
              text-3xl md:text-4xl font-cyber text-center mb-4
              ${isSpectator ? "text-purple-400" : ""}
              ${!isSpectator && isVictory && !isDraw ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" : ""}
              ${!isSpectator && !isVictory && !isDraw ? "text-red-400" : ""}
              ${isDraw ? "text-yellow-400" : ""}
            `}
          >
            {getMessage()}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground"
          >
            {isSpectator && "Game Over"}
            {!isSpectator && isVictory && !isDraw && "Congratulations! 🎊"}
            {!isSpectator && !isVictory && !isDraw && "Better luck next time!"}
            {isDraw && "Well played!"}
          </motion.p>

          {/* Glow effect for victory - NOT for spectators */}
          {isVictory && !isDraw && !isSpectator && (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
