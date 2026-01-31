import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MeasureCard, type Measure } from "@/components/measure/MeasureCard";
import { useLocation } from "@/hooks/useLocation";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/measures/")({
  component: MeasuresComponent,
});

const mockMeasures: Measure[] = [
  {
    id: "demo-aca-13",
    number: "ACA 13",
    title: "Protect and Retain the Majority Vote Act",
    description: "Amends the California Constitution to require ballot initiatives seeking to increase voting thresholds to be approved by that same higher threshold. Also authorizes local advisory votes on governance issues.",
    type: "constitutional-amendment",
  },
  {
    id: "1",
    number: "Proposition 1",
    title: "Housing Bond Measure",
    description: "Authorizes $10 billion in general obligation bonds for affordable housing programs, homeownership assistance, and supportive housing for people experiencing homelessness.",
    type: "proposition",
  },
  {
    id: "2",
    number: "Proposition 2",
    title: "Rent Control Initiative",
    description: "Expands local government authority to implement rent control on residential properties, including single-family homes and condominiums.",
    type: "initiative",
  },
  {
    id: "3",
    number: "Measure A",
    title: "School Facilities Bond",
    description: "Issues $500 million in bonds to modernize aging school facilities, upgrade technology infrastructure, and improve energy efficiency.",
    type: "measure",
  },
];

function MeasuresComponent() {
  const { location, isLoading: isLocationLoading } = useLocation();
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeasures = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMeasures(mockMeasures);
      setIsLoading(false);
    };

    if (!isLocationLoading) {
      loadMeasures();
    }
  }, [isLocationLoading]);

  if (isLocationLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">
          Please set your location to view ballot measures.
        </p>
        <Link to="/">
          <Button>Set Location</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold">
          Measures for {location.city}, {location.state}
        </h1>
        <p className="text-muted-foreground">
          ZIP Code: {location.zip}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : measures.length > 0 ? (
        <div className="space-y-4">
          {measures.map((measure) => (
            <MeasureCard key={measure.id} measure={measure} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-4">
            No measures found for this location.
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/">
          <Button variant="outline">Change Location</Button>
        </Link>
      </div>
    </div>
  );
}
