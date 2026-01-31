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
  return (
    <MeasureSummary
      measure={demoMeasure}
      insights={demoInsights}
      election={demoElection}
    />
  );
}
