import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoricalOutcomeProps {
  outcome: "passed" | "failed";
  percentYes: number;
  percentNo: number;
  yesVotes?: number;
  noVotes?: number;
}

function formatVotes(n: number): string {
  return n.toLocaleString("en-US");
}

export function HistoricalOutcome({
  outcome,
  percentYes,
  percentNo,
  yesVotes,
  noVotes,
}: HistoricalOutcomeProps) {
  const passed = outcome === "passed";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg p-4",
        passed ? "bg-confidence-high/10" : "bg-destructive/10",
      )}
    >
      {passed ? (
        <CheckCircle2 className="h-8 w-8 shrink-0 text-confidence-high" />
      ) : (
        <XCircle className="h-8 w-8 shrink-0 text-destructive" />
      )}
      <div>
        <div>
          <span
            className={cn(
              "text-lg font-semibold",
              passed ? "text-confidence-high" : "text-destructive",
            )}
          >
            {passed ? "PASSED" : "FAILED"}
          </span>
          <span className="text-muted-foreground">
            {" "}&mdash; {percentYes.toFixed(1)}% Yes / {percentNo.toFixed(1)}% No
          </span>
        </div>
        {yesVotes != null && noVotes != null && (
          <p className="text-sm text-muted-foreground">
            {formatVotes(yesVotes)} votes for &bull; {formatVotes(noVotes)} votes against
          </p>
        )}
      </div>
    </div>
  );
}
