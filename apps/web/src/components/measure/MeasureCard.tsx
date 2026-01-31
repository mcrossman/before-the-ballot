import { Vote, PenLine, BarChart3 } from "lucide-react";
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

const typeIcons = {
  proposition: Vote,
  initiative: PenLine,
  measure: BarChart3,
} as const;

export function MeasureCard({ measure }: MeasureCardProps) {
  const Icon = typeIcons[measure.type];

  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="font-serif">{measure.number}</span>
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
