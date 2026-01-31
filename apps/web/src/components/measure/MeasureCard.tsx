import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface Measure {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "proposition" | "measure" | "initiative";
}

interface MeasureCardProps {
  measure: Measure;
}

export function MeasureCard({ measure }: MeasureCardProps) {
  const icon = measure.type === "proposition" ? "📋" : measure.type === "initiative" ? "📝" : "📊";

  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{measure.number}</span>
        </CardTitle>
        <CardDescription className="font-medium text-foreground">
          {measure.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">{measure.description}</p>
      </CardContent>
    </Card>
  );
}
