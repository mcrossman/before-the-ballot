import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Election } from "@/lib/demo-data";

interface MeasureHeaderProps {
  measureNumber: string;
  title: string;
  jurisdiction: {
    type: string;
    name: string;
  };
  election?: Election;
  onShare?: () => void;
}

export function MeasureHeader({
  measureNumber,
  title,
  jurisdiction,
  election,
  onShare,
}: MeasureHeaderProps) {
  const handleShare = () => {
    const shareText = `${measureNumber}: ${title} - beforetheballot.com`;
    navigator.clipboard.writeText(shareText);
    onShare?.();
  };

  const formatElectionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const electionTypeLabel = election?.type
    ? election.type.charAt(0).toUpperCase() + election.type.slice(1)
    : "";

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{measureNumber}</h1>
          <p className="text-xl text-muted-foreground">{title}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="shrink-0"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {jurisdiction.name}
        {election && (
          <>
            {" "}
            • {formatElectionDate(election.date)} {electionTypeLabel} Election
          </>
        )}
      </p>
    </div>
  );
}
