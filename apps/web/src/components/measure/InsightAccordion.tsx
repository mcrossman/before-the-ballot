import { useState } from "react";
import {
  FileText,
  DollarSign,
  Scale,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitationBlock, type Citation } from "./CitationBlock";

export type InsightType = "summary" | "fiscal" | "legal_changes" | "affected_groups" | "conflicts";

export interface Insight {
  type: InsightType;
  content: string;
  citations: Citation[];
  confidence: "high" | "medium" | "low";
  uncertaintyFlags?: string[];
}

interface InsightConfig {
  icon: LucideIcon;
  label: string;
  headerClass: string;
  bgClass: string;
}

const insightConfig: Record<InsightType, InsightConfig> = {
  summary: {
    icon: FileText,
    label: "Summary",
    headerClass: "bg-accent-insight-summary",
    bgClass: "bg-insight-summary",
  },
  fiscal: {
    icon: DollarSign,
    label: "Fiscal Impact",
    headerClass: "bg-accent-insight-fiscal",
    bgClass: "bg-insight-fiscal",
  },
  legal_changes: {
    icon: Scale,
    label: "Legal Changes",
    headerClass: "bg-accent-insight-legal",
    bgClass: "bg-insight-legal",
  },
  affected_groups: {
    icon: Users,
    label: "Affected Groups",
    headerClass: "bg-accent-insight-groups",
    bgClass: "bg-insight-groups",
  },
  conflicts: {
    icon: AlertTriangle,
    label: "Potential Conflicts",
    headerClass: "bg-destructive",
    bgClass: "bg-insight-conflicts",
  },
};

interface InsightAccordionProps {
  insight: Insight;
  defaultExpanded?: boolean;
}

export function InsightAccordion({ insight, defaultExpanded = false }: InsightAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const config = insightConfig[insight.type];
  const Icon = config.icon;

  const previewText = insight.content.split(". ").slice(0, 2).join(". ") + ".";

  return (
    <div className="overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3",
          "text-white transition-colors",
          config.headerClass,
        )}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            {config.label}
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <div className={cn("p-4 space-y-4", config.bgClass)}>
        {expanded ? (
          <>
            <p className="text-foreground">{insight.content}</p>

            {insight.citations?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Citations
                </h3>
                {insight.citations.map((citation, i) => (
                  <CitationBlock key={i} citation={citation} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    insight.confidence === "high" && "bg-confidence-high",
                    insight.confidence === "medium" && "bg-confidence-medium",
                    insight.confidence === "low" && "bg-confidence-low",
                  )}
                />
                <span className="text-muted-foreground">
                  Confidence: {insight.confidence}
                </span>
              </span>
              {insight.uncertaintyFlags && insight.uncertaintyFlags.length > 0 && (
                <span className="flex items-center gap-1.5 text-accent-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {insight.uncertaintyFlags.length} uncertainties
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">{previewText}</p>
        )}
      </div>
    </div>
  );
}
