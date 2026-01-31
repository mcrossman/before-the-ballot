import { useState } from "react";
import { FileText, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { Insight, Citation } from "@/lib/demo-data";

interface InsightAccordionProps {
  insights: Insight[];
}

const insightIcons: Record<Insight["type"], string> = {
  summary: "📋",
  fiscal: "💰",
  legal_changes: "⚖️",
  affected_groups: "👥",
  conflicts: "⚠️",
};

const insightLabels: Record<Insight["type"], string> = {
  summary: "Summary",
  fiscal: "Fiscal Impact",
  legal_changes: "Legal Changes",
  affected_groups: "Affected Groups",
  conflicts: "Potential Conflicts",
};

const insightOrder: Insight["type"][] = [
  "fiscal",
  "legal_changes",
  "affected_groups",
  "conflicts",
];

function CitationBlock({ citation }: { citation: Citation }) {
  return (
    <div className="rounded-md bg-muted p-3 text-xs">
      <p className="mb-2 font-medium text-muted-foreground">
        {citation.context || "Source Text"}
      </p>
      <blockquote className="border-l-2 border-primary pl-3 italic">
        "{citation.textSpan}"
      </blockquote>
    </div>
  );
}

function InsightCard({
  insight,
  isExpanded,
  onToggle,
}: {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const getConfidenceBadge = () => {
    switch (insight.confidence) {
      case "high":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            High Confidence
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <HelpCircle className="mr-1 h-3 w-3" />
            Medium Confidence
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Low Confidence
          </Badge>
        );
    }
  };

  return (
    <AccordionItem className="border-b-0">
      <AccordionTrigger
        onClick={onToggle}
        isOpen={isExpanded}
        className="rounded-lg border bg-card px-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{insightIcons[insight.type]}</span>
          <span className="font-semibold">{insightLabels[insight.type]}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent isOpen={isExpanded}>
        <div className="space-y-4 pt-4">
          <p className="text-muted-foreground">{insight.content}</p>

          {insight.uncertaintyFlags && insight.uncertaintyFlags.length > 0 && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                Uncertainties
              </p>
              <ul className="ml-6 list-disc text-sm text-yellow-700 dark:text-yellow-300">
                {insight.uncertaintyFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Citations
            </p>
            <div className="space-y-2">
              {insight.citations.map((citation, idx) => (
                <CitationBlock
                  key={idx}
                  citation={citation}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {getConfidenceBadge()}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function InsightAccordion({ insights }: InsightAccordionProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Get ordered insights (fiscal, legal_changes, affected_groups, conflicts)
  const orderedInsights = insightOrder
    .map((type) => insights.find((i) => i.type === type))
    .filter((insight): insight is Insight => insight !== undefined);

  return (
    <Accordion className="space-y-3 border-0">
      {orderedInsights.map((insight) => (
        <InsightCard
          key={insight._id}
          insight={insight}
          isExpanded={expandedInsight === insight._id}
          onToggle={() =>
            setExpandedInsight(
              expandedInsight === insight._id ? null : insight._id
            )
          }
        />
      ))}
    </Accordion>
  );
}
