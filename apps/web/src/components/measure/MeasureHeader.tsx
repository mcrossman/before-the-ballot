import { ArrowLeft, Share2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeasureHeaderProps {
  measureNumber: string;
  title: string;
  jurisdictionName: string;
  electionLabel: string;
  shareUrl?: string;
}

export function MeasureHeader({
  measureNumber,
  title,
  jurisdictionName,
  electionLabel,
  shareUrl,
}: MeasureHeaderProps) {
  const handleShare = async () => {
    const text = `${title} - ${shareUrl ?? window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <header className="space-y-2 border-b pb-6">
      <Link
        to="/measures"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Measures
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            {measureNumber}
          </h1>
          <h2 className="font-serif text-xl text-muted-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {jurisdictionName} &bull; {electionLabel}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </header>
  );
}
