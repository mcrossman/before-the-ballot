import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MeasureHeader } from "./MeasureHeader";
import { QuickFacts } from "./QuickFacts";
import { InsightAccordion } from "./InsightAccordion";
import { PositionBar } from "./PositionBar";
import type { Measure, Insight, Election } from "@/lib/demo-data";

interface MeasureSummaryProps {
  measure: Measure;
  insights: Insight[];
  election?: Election;
}

export function MeasureSummary({ measure, insights, election }: MeasureSummaryProps) {
  // Find summary insight
  const summaryInsight = insights.find((i) => i.type === "summary");

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Link to="/measures">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Measures
              </Button>
            </Link>
          </div>

          {/* Header */}
          <MeasureHeader
            measureNumber={measure.measureNumber}
            title={measure.title}
            jurisdiction={measure.jurisdiction}
            election={election}
          />

          {/* Summary Section */}
          {summaryInsight && (
            <div className="my-6 rounded-lg border bg-card p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h2 className="font-semibold">Summary</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {summaryInsight.content}
              </p>
            </div>
          )}

          {/* Quick Facts */}
          <QuickFacts measure={measure} election={election} />

          {/* Insight Accordions */}
          <div className="mt-6">
            <InsightAccordion insights={insights} />
          </div>
        </div>
      </div>

      {/* Position Bar */}
      <PositionBar />
    </div>
  );
}
