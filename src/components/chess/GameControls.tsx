import { motion } from "framer-motion";
import { RotateCcw, Flag, Handshake, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameControlsProps {
  onNewGame: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onAcceptDraw?: () => void;
  onDeclineDraw?: () => void;
  gameOver: boolean;
  drawOffered?: boolean;
}

export const GameControls = ({
  onNewGame,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  gameOver,
  drawOffered = false,
}: GameControlsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-neon-purple" />
        <h3 className="font-cyber text-lg text-neon-purple">Game Controls</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {gameOver ? (
          <Button
            onClick={onNewGame}
            className="cyber-button font-cyber text-neon-cyan hover:text-neon-cyan bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="cyber-button font-cyber text-neon-cyan hover:text-neon-cyan"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Leave & New Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background border-neon-cyan/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-neon-cyan font-cyber">
                  Leave Current Game?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to leave the current game. Your opponent will be notified and will win by default. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-neon-purple/30">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onNewGame}
                  className="bg-neon-cyan text-background hover:bg-neon-cyan/80"
                >
                  Leave Game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!gameOver && (
          <>
            {drawOffered && onAcceptDraw ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-neon-yellow text-neon-yellow hover:bg-neon-yellow/20 hover:text-neon-yellow font-cyber bg-transparent animate-pulse"
                  >
                    <Handshake className="w-4 h-4 mr-2" />
                    Draw Offered!
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-neon-yellow/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-neon-yellow font-cyber">
                      Draw Offer
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Your opponent has offered a draw. Do you want to accept?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      onClick={onDeclineDraw}
                      className="border-destructive/30 hover:bg-destructive/10"
                    >
                      Decline
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onAcceptDraw}
                      className="bg-neon-yellow text-background hover:bg-neon-yellow/80"
                    >
                      Accept Draw
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={onOfferDraw}
                variant="outline"
                className="border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow/10 hover:text-neon-yellow font-cyber bg-transparent"
              >
                <Handshake className="w-4 h-4 mr-2" />
                Offer Draw
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive font-cyber bg-transparent"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Resign
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-destructive/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive font-cyber">
                    Resign Game?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to resign? This will end the game and you will lose.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-neon-cyan/30">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onResign}
                    className="bg-destructive text-white hover:bg-destructive/80"
                  >
                    Resign
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </motion.div>
  );
};
