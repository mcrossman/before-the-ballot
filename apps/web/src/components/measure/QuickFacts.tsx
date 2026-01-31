import { Badge } from "@/components/ui/badge";
import type { Measure, Election } from "@/lib/demo-data";

interface QuickFactsProps {
  measure: Measure;
  election?: Election;
}

export function QuickFacts({ measure, election }: QuickFactsProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (measure.status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "passed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{measure.status}</Badge>;
    }
  };

  const formatCost = () => {
    if (!measure.estimatedCost) return "N/A";
    const { amount, unit, timeframe } = measure.estimatedCost;
    return `$${amount} ${unit} ${timeframe}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 border-y py-4 sm:grid-cols-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Status</p>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Type</p>
        <p className="text-sm font-medium">{measure.measureType}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Estimated Cost</p>
        <p className="text-sm font-medium">{formatCost()}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Voting Deadline</p>
        <p className="text-sm font-medium">
          {election ? formatDate(election.date) : "TBD"}
        </p>
      </div>
    </div>
  );
}
