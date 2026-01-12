import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimerSettingsProps {
  onTimeSelect: (minutes: number, increment: number) => void;
  disabled?: boolean;
}

const timeControls = [
  { label: "1 min", value: 1, increment: 0 },
  { label: "1 | 1", value: 1, increment: 1 },
  { label: "3 min", value: 3, increment: 0 },
  { label: "3 | 2", value: 3, increment: 2 },
  { label: "5 min", value: 5, increment: 0 },
  { label: "5 | 3", value: 5, increment: 3 },
  { label: "10 min", value: 10, increment: 0 },
  { label: "10 | 5", value: 10, increment: 5 },
  { label: "15 | 10", value: 15, increment: 10 },
  { label: "30 min", value: 30, increment: 0 },
];

export const TimerSettings = ({ onTimeSelect, disabled }: TimerSettingsProps) => {
  const [selectedTime, setSelectedTime] = useState<string>("10");

  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    const control = timeControls.find((c) => c.value.toString() === value);
    if (control) {
      onTimeSelect(control.value, control.increment);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-neon-purple" />
        <h3 className="font-cyber text-lg text-neon-purple">Time Control</h3>
      </div>

      <div className="space-y-3">
        <Select
          value={selectedTime}
          onValueChange={handleTimeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full bg-background/50 border-neon-purple/30 font-mono text-neon-cyan">
            <SelectValue placeholder="Select time control" />
          </SelectTrigger>
          <SelectContent className="bg-background border-neon-purple/30">
            {timeControls.map((control) => (
              <SelectItem
                key={control.label}
                value={control.value.toString()}
                className="font-mono focus:bg-neon-purple/20 focus:text-neon-cyan"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{control.label}</span>
                  {control.increment > 0 && (
                    <span className="text-xs text-neon-magenta">
                      +{control.increment}s
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-neon-cyan" />
            <span>Blitz: 1-5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Plus className="w-3 h-3 text-neon-magenta" />
            <span>Increment adds seconds per move</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
