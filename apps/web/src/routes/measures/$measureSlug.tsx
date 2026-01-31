import { createFileRoute } from "@tanstack/react-router";
import { MeasureSummary } from "@/components/measure/MeasureSummary";
import {
  demoMeasure,
  demoInsights,
  demoElection,
} from "@/lib/demo-data";

export const Route = createFileRoute("/measures/$measureSlug")({
  component: MeasureDetailPage,
  loader: async ({ params }) => {
    // For demo purposes, we always return the ACA 13 measure
    // regardless of the slug
    return { slug: params.measureSlug };
  },
});

function MeasureDetailPage() {
  // Use demo data for now
  const electionLabel = `${demoMeasure.jurisdiction.name} • ${new Date(demoElection.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  
  return (
    <MeasureSummary
      measureNumber={demoMeasure.measureNumber}
      title={demoMeasure.title}
      jurisdictionName={demoMeasure.jurisdiction.name}
      electionLabel={electionLabel}
      status={demoMeasure.status}
      measureType={demoMeasure.measureType}
      insights={demoInsights}
    />
  );
}
