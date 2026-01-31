import { Clock, FileText, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFactsProps {
  status: string;
  measureType?: string;
  estimatedCost?: string;
  votingDeadline?: string;
}

export function QuickFacts({ status, measureType, estimatedCost, votingDeadline }: QuickFactsProps) {
  const facts = [
    {
      label: "Status",
      value: status,
      icon: Clock,
      iconClass: "text-accent-warning",
    },
    measureType
      ? { label: "Type", value: measureType, icon: FileText, iconClass: "text-muted-foreground" }
      : null,
    estimatedCost
      ? { label: "Estimated Cost", value: estimatedCost, icon: DollarSign, iconClass: "text-accent-insight-fiscal" }
      : null,
    votingDeadline
      ? { label: "Voting Deadline", value: votingDeadline, icon: Calendar, iconClass: "text-accent-insight-summary" }
      : null,
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-4">
      {facts.map((fact) => {
        const Icon = fact!.icon;
        return (
          <div key={fact!.label} className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {fact!.label}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Icon className={cn("h-4 w-4", fact!.iconClass)} />
              {fact!.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
