import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Swords, Zap, Clock, Crown, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GameInfo {
  white_player_name: string | null;
  black_player_name: string | null;
  white_time: number;
  black_time: number;
  status: string;
}

interface QuickJoinProps {
  gameCode: string;
  onJoin: (playerName: string) => void;
  loading?: boolean;
}

export const QuickJoin = ({ gameCode, onJoin, loading }: QuickJoinProps) => {
  const [name, setName] = useState("");
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [fetchingGame, setFetchingGame] = useState(true);

  // Fetch game details
  useEffect(() => {
    const fetchGameInfo = async () => {
      console.log("Fetching game info for:", gameCode);
      const { data, error } = await supabase
        .from("chess_games")
        .select("white_player_name, black_player_name, white_time, black_time, status")
        .eq("game_code", gameCode)
        .single();

      if (error) {
        console.error("Error fetching game:", error);
      } else {
        console.log("Game info fetched:", data);
        setGameInfo(data);
      }
      setFetchingGame(false);
    };

    fetchGameInfo();
  }, [gameCode]);

  // Determine which color is available and who is the host
  const hostName = gameInfo?.white_player_name || gameInfo?.black_player_name;
  const yourColor = gameInfo?.white_player_name ? "Black" : "White";
  const yourColorCode = yourColor === "White" ? "w" : "b";
  
  // Format time control (convert seconds to minutes+increment format)
  const timeInMinutes = gameInfo?.white_time ? Math.floor(gameInfo.white_time / 60) : 10;
  const timeControlText = `${timeInMinutes}+0`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onJoin(name.trim());
    }
  };

  if (fetchingGame) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neon-cyan font-cyber">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (!gameInfo || gameInfo.status !== "waiting") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="cyber-card border-destructive/30 max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-cyber text-2xl text-destructive">Game Not Available</CardTitle>
            <CardDescription>
              This game is no longer available or has already started.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <Card className="cyber-card border-neon-cyan/30">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <Zap className="w-8 h-8 text-neon-cyan animate-pulse" />
              <CardTitle className="font-cyber text-3xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
                Join Chess Game
              </CardTitle>
              <Zap className="w-8 h-8 text-neon-magenta animate-pulse" />
            </motion.div>
            
            <CardDescription className="text-base">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Swords className="w-5 h-5 text-neon-purple" />
                <span className="font-mono">Game Code: <span className="text-neon-cyan font-bold">{gameCode}</span></span>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Game Details */}
            <div className="cyber-card bg-card/50 p-4 rounded-lg space-y-3">
              <h3 className="font-cyber text-lg text-neon-cyan mb-3 text-center">Match Details</h3>
              
              {/* Host/Opponent */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-neon-purple" />
                  <span className="text-sm text-muted-foreground">Opponent</span>
                </div>
                <span className="font-cyber text-neon-purple">{hostName || "Waiting..."}</span>
              </div>

              {/* Your Color */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-neon-cyan" />
                  <span className="text-sm text-muted-foreground">You Play As</span>
                </div>
                <span className={`font-cyber ${yourColor === "White" ? "text-neon-cyan" : "text-neon-magenta"}`}>
                  {yourColor}
                </span>
              </div>

              {/* Time Control */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-yellow" />
                  <span className="text-sm text-muted-foreground">Time Control</span>
                </div>
                <span className="font-cyber text-neon-yellow">{timeControlText}</span>
              </div>
            </div>

            {/* Name Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="playerName" className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-neon-cyan" />
                  Enter Your Name
                </label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cyber-input text-lg"
                  minLength={2}
                  maxLength={20}
                  required
                  autoFocus
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 2 characters, maximum 20
                </p>
              </div>

              <Button
                type="submit"
                className="w-full cyber-button text-lg py-6"
                disabled={name.trim().length < 2 || loading}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Swords className="w-5 h-5" />
                    </motion.div>
                    Joining Game...
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 mr-2" />
                    Join Game & Play
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                🎮 Ready to challenge <span className="text-neon-purple font-cyber">{hostName}</span>?
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-neon-cyan/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-neon-magenta/20 to-transparent rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  );
};
