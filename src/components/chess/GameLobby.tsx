import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users, Swords, Zap } from "lucide-react";
import { toast } from "sonner";
import { TimerSettings } from "./TimerSettings";
import { devLog } from "@/lib/devLog";

interface GameLobbyProps {
  onCreateGame: (preferredColor?: "w" | "b" | "random") => Promise<string | null>;
  onJoinGame: (code: string) => Promise<boolean>;
  onSetPlayerName: (name: string) => void;
  onSetTimeControl?: (minutes: number, increment: number) => void;
  playerName: string;
}

export const GameLobby = ({
  onCreateGame,
  onJoinGame,
  onSetPlayerName,
  onSetTimeControl,
  playerName,
}: GameLobbyProps) => {
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [preferredColor, setPreferredColor] = useState<"w" | "b" | "random">("random");

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    devLog.log("Creating game with preferred color:", preferredColor);
    setIsCreating(true);
    try {
      const code = await onCreateGame(preferredColor);
      devLog.log("Game created with code:", code);
      if (code) {
        setCreatedCode(code);
        toast.success(`Game created! Code: ${code}`);
      } else {
        toast.error("Failed to create game - no code returned");
      }
    } catch (error) {
      devLog.error("Error creating game:", error);
      toast.error("Error creating game");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    if (!joinCode.trim()) {
      toast.error("Please enter a game code");
      return;
    }
    setIsJoining(true);
    const success = await onJoinGame(joinCode);
    if (!success) {
      toast.error("Game not found or already full");
    }
    setIsJoining(false);
  };

  const copyGameLink = () => {
    if (createdCode) {
      const link = `${window.location.origin}?game=${createdCode}`;
      navigator.clipboard.writeText(link);
      toast.success("Game link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cyber-card rounded-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-neon-cyan animate-pulse" />
            <h1 className="font-cyber text-3xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
              NEON CHESS
            </h1>
            <Zap className="w-8 h-8 text-neon-magenta animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">
            Play with friends in real-time
          </p>
        </div>

        {/* Player Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-neon-cyan mb-2">
            Your Name
          </label>
          <Input
            value={playerName}
            onChange={(e) => onSetPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan font-mono"
          />
        </div>

        {/* Timer Settings */}
        {onSetTimeControl && !createdCode && (
          <div className="mb-6">
            <TimerSettings 
              onTimeSelect={onSetTimeControl}
              disabled={!!createdCode}
            />
          </div>
        )}

        {/* Color Preference */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-neon-cyan mb-2">
            Preferred Color
          </label>
          <div className="flex gap-2">
            <Button
              onClick={() => setPreferredColor("w")}
              variant={preferredColor === "w" ? "default" : "outline"}
              className="flex-1 bg-white text-black font-mono"
            >
              White
            </Button>
            <Button
              onClick={() => setPreferredColor("b")}
              variant={preferredColor === "b" ? "default" : "outline"}
              className="flex-1 bg-black text-white font-mono"
            >
              Black
            </Button>
            <Button
              onClick={() => setPreferredColor("random")}
              variant={preferredColor === "random" ? "default" : "outline"}
              className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-transparent bg-clip-text font-mono"
            >
              Random
            </Button>
          </div>
        </div>

        {/* Created Game Display */}
        {createdCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30"
          >
            <p className="text-sm text-neon-cyan mb-2">
              Share this code with your friend:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background/50 px-4 py-2 rounded font-mono text-xl text-center text-neon-magenta">
                {createdCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyGameLink}
                className="border-neon-cyan/30 hover:bg-neon-cyan/20"
              >
                <Copy className="w-4 h-4 text-neon-cyan" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Waiting for opponent to join...
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {!createdCode && (
            <Button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 font-cyber text-lg py-6"
            >
              <Swords className="w-5 h-5 mr-2" />
              {isCreating ? "Creating..." : "Create New Game"}
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neon-purple/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter game code..."
              className="bg-background/50 border-neon-magenta/30 focus:border-neon-magenta font-mono uppercase"
              maxLength={6}
            />
            <Button
              onClick={handleJoinGame}
              disabled={isJoining || !joinCode.trim()}
              className="bg-neon-magenta hover:bg-neon-magenta/80 font-cyber"
            >
              <Users className="w-4 h-4 mr-2" />
              {isJoining ? "..." : "Join"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Footer decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta opacity-50" />
    </div>
  );
};
