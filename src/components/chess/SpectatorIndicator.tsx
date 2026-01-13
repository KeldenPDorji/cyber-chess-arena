import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { devLog } from "@/lib/devLog";

interface SpectatorIndicatorProps {
  gameId: string | null;
}

interface Spectator {
  id: string;
  spectator_name: string;
  joined_at: string;
}

export const SpectatorIndicator = ({ gameId }: SpectatorIndicatorProps) => {
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    // Fetch initial spectators
    const fetchSpectators = async () => {
      const { data, error } = await supabase
        .from("game_spectators")
        .select("*")
        .eq("game_id", gameId)
        .order("joined_at", { ascending: true });

      if (error) {
        devLog.error("Error fetching spectators:", error);
        return;
      }

      devLog.log("👁️ Initial spectators loaded:", data?.length || 0);
      setSpectators(data || []);
    };

    fetchSpectators();

    // Subscribe to spectator changes with immediate updates
    const channel = supabase
      .channel(`spectators:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_spectators",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          devLog.log("👁️ Spectator change detected:", payload.eventType);
          
          if (payload.eventType === "INSERT") {
            const newSpectator = payload.new as Spectator;
            setSpectators((prev) => {
              // Prevent duplicates
              if (prev.some(s => s.id === newSpectator.id)) {
                return prev;
              }
              devLog.log("👁️ Spectator joined:", newSpectator.spectator_name);
              return [...prev, newSpectator];
            });
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setSpectators((prev) => {
              const filtered = prev.filter((s) => s.id !== deletedId);
              devLog.log("👁️ Spectator left, remaining:", filtered.length);
              return filtered;
            });
          } else if (payload.eventType === "UPDATE") {
            // Update heartbeat timestamp
            setSpectators((prev) =>
              prev.map((s) => (s.id === payload.new.id ? (payload.new as Spectator) : s))
            );
          }
        }
      )
      .subscribe((status) => {
        devLog.log("👁️ Spectator subscription status:", status);
      });

    // Periodic refresh to ensure accuracy (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchSpectators();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
      devLog.log("👁️ Spectator tracking cleaned up");
    };
  }, [gameId]);

  if (!gameId || spectators.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <button
        onClick={() => setShowList(!showList)}
        className="cyber-button flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-neon-purple/30 hover:border-neon-purple/60 transition-all"
        title="Spectators watching"
      >
        <Eye className="w-5 h-5 text-neon-purple animate-pulse" />
        <span className="font-cyber text-sm text-neon-purple">
          {spectators.length}
        </span>
      </button>

      {/* Spectator list dropdown */}
      {showList && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 right-0 cyber-card rounded-lg p-3 min-w-[200px] z-50 border border-neon-purple/30 shadow-lg shadow-neon-purple/20"
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neon-purple/20">
            <Eye className="w-4 h-4 text-neon-purple" />
            <h4 className="font-cyber text-sm text-neon-purple">
              Spectators ({spectators.length})
            </h4>
          </div>
          <ul className="space-y-1 max-h-[200px] overflow-y-auto">
            {spectators.map((spectator) => (
              <li
                key={spectator.id}
                className="text-sm text-muted-foreground py-1 px-2 rounded hover:bg-neon-purple/10 transition-colors"
              >
                {spectator.spectator_name}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};
