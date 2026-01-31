import { useState } from "react";
import { Bookmark, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Stance = "support" | "oppose" | "undecided";

interface PositionBarProps {
  initialStance?: Stance;
  onStanceChange?: (stance: Stance) => void;
  isAuthenticated?: boolean;
}

const stanceOptions: { value: Stance; label: string; icon: typeof ThumbsUp }[] = [
  { value: "support", label: "Support", icon: ThumbsUp },
  { value: "oppose", label: "Oppose", icon: ThumbsDown },
  { value: "undecided", label: "Undecided", icon: HelpCircle },
];

export function PositionBar({
  initialStance,
  onStanceChange,
  isAuthenticated = false,
}: PositionBarProps) {
  const [stance, setStance] = useState<Stance | undefined>(initialStance);

  const handleSelect = (value: Stance) => {
    setStance(value);
    onStanceChange?.(value);
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Bookmark className="h-4 w-4" />
        Save Your Position
      </div>
      <div className="flex gap-2">
        {stanceOptions.map((option) => {
          const Icon = option.icon;
          const selected = stance === option.value;
          return (
            <Button
              key={option.value}
              variant={selected ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1",
                selected && option.value === "support" && "bg-confidence-high text-white hover:bg-confidence-high/90",
                selected && option.value === "oppose" && "bg-destructive text-white hover:bg-destructive/90",
                selected && option.value === "undecided" && "bg-accent-warning text-white hover:bg-accent-warning/90",
              )}
              onClick={() => handleSelect(option.value)}
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          Sign in to save your positions across devices
        </p>
      )}
    </div>
  );
}
