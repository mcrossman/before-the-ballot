import { MessageCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PositionBarProps {
  currentStance?: "support" | "oppose" | "undecided";
  onStanceChange?: (stance: "support" | "oppose" | "undecided") => void;
  onAskQuestion?: () => void;
}

export function PositionBar({
  currentStance,
  onStanceChange,
  onAskQuestion,
}: PositionBarProps) {
  const getStanceButtonClass = (stance: "support" | "oppose" | "undecided") => {
    const baseClass = "flex-1";
    if (currentStance === stance) {
      switch (stance) {
        case "support":
          return `${baseClass} bg-green-600 hover:bg-green-700 text-white`;
        case "oppose":
          return `${baseClass} bg-red-600 hover:bg-red-700 text-white`;
        case "undecided":
          return `${baseClass} bg-yellow-600 hover:bg-yellow-700 text-white`;
      }
    }
    return baseClass;
  };

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <Button
            variant={currentStance === "support" ? "default" : "outline"}
            className={getStanceButtonClass("support")}
            onClick={() => onStanceChange?.("support")}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Support
          </Button>
          <Button
            variant={currentStance === "oppose" ? "default" : "outline"}
            className={getStanceButtonClass("oppose")}
            onClick={() => onStanceChange?.("oppose")}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Oppose
          </Button>
          <Button
            variant={currentStance === "undecided" ? "default" : "outline"}
            className={getStanceButtonClass("undecided")}
            onClick={() => onStanceChange?.("undecided")}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Undecided
          </Button>
        </div>

        <Button variant="secondary" onClick={onAskQuestion}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask a Question
        </Button>
      </div>
    </div>
  );
}
