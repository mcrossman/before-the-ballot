import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Citation {
  textSpan: string;
  startOffset: number;
  endOffset: number;
  context?: string;
  sectionLabel?: string;
}

interface CitationBlockProps {
  citation: Citation;
  onViewInContext?: (citation: Citation) => void;
}

export function CitationBlock({ citation, onViewInContext }: CitationBlockProps) {
  return (
    <blockquote className="rounded-r-md border-l-4 border-citation-border bg-citation-bg p-3">
      <p className="font-serif text-sm italic text-foreground">
        &ldquo;{citation.textSpan}&rdquo;
      </p>
      <footer className="mt-2 flex items-center gap-2 font-sans text-xs text-muted-foreground">
        <Quote className="h-3 w-3" />
        <span>{citation.sectionLabel ?? `Offset ${citation.startOffset}`}</span>
        {onViewInContext && (
          <Button
            variant="link"
            size="sm"
            className="ml-auto h-auto p-0 text-xs"
            onClick={() => onViewInContext(citation)}
          >
            View in context
          </Button>
        )}
      </footer>
    </blockquote>
  );
}
