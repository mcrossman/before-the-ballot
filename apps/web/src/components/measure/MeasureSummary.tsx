import { MeasureHeader } from "./MeasureHeader";
import { QuickFacts } from "./QuickFacts";
import { InsightAccordion, type Insight } from "./InsightAccordion";
import { HistoricalOutcome } from "./HistoricalOutcome";
import { PositionBar } from "./PositionBar";

interface MeasureOutcome {
  result: "passed" | "failed";
  percentYes: number;
  percentNo: number;
  yesVotes?: number;
  noVotes?: number;
}

interface MeasureSummaryProps {
  measureNumber: string;
  title: string;
  jurisdictionName: string;
  electionLabel: string;
  status: string;
  measureType?: string;
  estimatedCost?: string;
  votingDeadline?: string;
  insights: Insight[];
  outcome?: MeasureOutcome;
}

const insightOrder = [
  "summary",
  "fiscal",
  "legal_changes",
  "affected_groups",
  "conflicts",
] as const;

export function MeasureSummary({
  measureNumber,
  title,
  jurisdictionName,
  electionLabel,
  status,
  measureType,
  estimatedCost,
  votingDeadline,
  insights,
  outcome,
}: MeasureSummaryProps) {
  const insightsByType = Object.fromEntries(
    insights.map((insight) => [insight.type, insight]),
  );

  const summaryInsight = insightsByType["summary"];
  const accordionInsights = insightOrder
    .filter((type) => type !== "summary")
    .map((type) => insightsByType[type])
    .filter(Boolean);

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <MeasureHeader
        measureNumber={measureNumber}
        title={title}
        jurisdictionName={jurisdictionName}
        electionLabel={electionLabel}
      />

      {outcome && (
        <HistoricalOutcome
          outcome={outcome.result}
          percentYes={outcome.percentYes}
          percentNo={outcome.percentNo}
          yesVotes={outcome.yesVotes}
          noVotes={outcome.noVotes}
        />
      )}

      {summaryInsight && (
        <InsightAccordion insight={summaryInsight} defaultExpanded />
      )}

      <QuickFacts
        status={status}
        measureType={measureType}
        estimatedCost={estimatedCost}
        votingDeadline={votingDeadline}
      />

      <div className="space-y-4">
        {accordionInsights.map((insight) => (
          <InsightAccordion key={insight.type} insight={insight} />
        ))}
      </div>

      <PositionBar />
    </div>
  );
}
