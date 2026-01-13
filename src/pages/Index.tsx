import { motion } from "framer-motion";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { PlayerInfo } from "@/components/chess/PlayerInfo";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { GameControls } from "@/components/chess/GameControls";
import { GameStatus } from "@/components/chess/GameStatus";
import { useChessGame } from "@/hooks/useChessGame";
import { Cpu, Zap } from "lucide-react";

const Index = () => {
  const {
    game,
    selectedSquare,
    validMoves,
    lastMove,
    moveHistory,
    whiteTime,
    blackTime,
    whiteCaptured,
    blackCaptured,
    gameOver,
    handleSquareClick,
    newGame,
    resign,
    isCheck,
    isCheckmate,
    isDraw,
    turn,
    winner,
    kingInCheckSquare,
  } = useChessGame(600);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="w-8 h-8 text-neon-cyan animate-pulse" />
          <h1 className="font-cyber text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
            NEON CHESS
          </h1>
          <Zap className="w-8 h-8 text-neon-magenta animate-pulse" />
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          <Cpu className="w-4 h-4 inline mr-2" />
          Cyberpunk Chess Experience
        </p>
      </motion.header>

      {/* Main game layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Left sidebar - Player info & controls */}
        <div className="space-y-4 order-2 lg:order-1">
          <PlayerInfo
            name="Player 2"
            rating={1200}
            time={blackTime}
            isActive={turn === "b" && !gameOver}
            isWhite={false}
            capturedPieces={blackCaptured}
          />
          
          <GameStatus
            isCheck={isCheck}
            isCheckmate={isCheckmate}
            isDraw={isDraw}
            turn={turn}
            winner={winner}
          />

          <PlayerInfo
            name="Player 1"
            rating={1200}
            time={whiteTime}
            isActive={turn === "w" && !gameOver}
            isWhite={true}
            capturedPieces={whiteCaptured}
          />
        </div>

        {/* Chess board (center) */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="w-full max-w-[600px]">
            <ChessBoard
              game={game}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
              kingInCheckSquare={kingInCheckSquare}
            />
          </div>
        </div>

        {/* Right sidebar - Move history & controls */}
        <div className="space-y-4 order-3">
          <MoveHistory moves={moveHistory} />
          <GameControls
            onNewGame={newGame}
            onResign={resign}
            onOfferDraw={() => {}}
            gameOver={gameOver}
          />
        </div>
      </div>

      {/* Footer decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta opacity-50"
      />
    </div>
  );
};

export default Index;
