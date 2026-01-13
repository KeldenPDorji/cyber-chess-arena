import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { devLog } from "@/lib/devLog";

interface ChatMessage {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface GameChatProps {
  gameId: string;
  playerName: string;
}

export const GameChat = ({ gameId, playerName }: GameChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true });

      if (error) {
        devLog.error("Error fetching chat messages:", error);
        return;
      }

      if (data) {
        setMessages(data as ChatMessage[]);
      }
    };

    fetchMessages();
  }, [gameId]);

  // Subscribe to new messages
  useEffect(() => {
    const channelName = `chat-${gameId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          devLog.log("📨 New chat message:", payload.new);
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          
          // Increment unread count if chat is closed and message is from opponent
          if (!isOpen && newMsg.sender_name !== playerName) {
            setUnreadCount((prev) => Math.min(prev + 1, 9)); // Cap at 9
          }
        }
      )
      .subscribe((status) => {
        devLog.log("Chat subscription status:", status);
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [gameId, isOpen, playerName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      // Clear unread count when chat is opened
      setUnreadCount(0);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        game_id: gameId,
        sender_name: playerName,
        message: newMessage.trim(),
      });

    if (error) {
      devLog.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating chat button - Enhanced visibility */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative cyber-card h-16 w-16 rounded-full shadow-2xl
            transition-all duration-300 hover:scale-110
            ${isOpen 
              ? "border-glow-purple bg-gradient-to-br from-purple-500/20 to-pink-500/20" 
              : "border-glow-cyan bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
            }
          `}
          size="icon"
        >
          <motion.div
            animate={unreadCount > 0 ? { 
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: 0.5,
              repeat: unreadCount > 0 ? Infinity : 0,
              repeatDelay: 1,
            }}
          >
            <MessageCircle className={`h-7 w-7 ${isOpen ? "text-purple-300" : "text-cyan-300"}`} />
          </motion.div>
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background shadow-lg"
            >
              {unreadCount}
            </motion.div>
          )}
          
          {/* Pulsing ring for unread */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-red-400"
            />
          )}
        </Button>
      </motion.div>

      {/* Chat panel - Enhanced mobile responsiveness */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-40 w-[400px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="cyber-card border-glow-purple h-[500px] max-h-[70vh] flex flex-col shadow-2xl">
              <CardHeader className="border-b border-border/50 pb-3 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <CardTitle className="text-lg font-cyber flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  Game Chat
                  <span className="ml-auto text-xs text-muted-foreground">
                    {messages.length} {messages.length === 1 ? "message" : "messages"}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Messages area */}
                <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`
                            flex flex-col gap-1
                            ${msg.sender_name === playerName ? "items-end" : "items-start"}
                          `}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={`font-medium ${msg.sender_name === playerName ? "text-cyan-400" : "text-purple-400"}`}>
                              {msg.sender_name}
                            </span>
                            <span>{formatTime(msg.created_at)}</span>
                          </div>
                          <div
                            className={`
                              px-3 py-2 rounded-lg max-w-[80%] break-words
                              ${msg.sender_name === playerName 
                                ? "bg-cyan-500/10 border border-cyan-500/20" 
                                : "bg-purple-500/10 border border-purple-500/20"
                              }
                            `}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Input area */}
                <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={500}
                    className="flex-1 cyber-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="cyber-button shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
