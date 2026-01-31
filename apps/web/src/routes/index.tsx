import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidCaliforniaZip, lookupZipCity, useLocation } from "@/hooks/useLocation";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const navigate = useNavigate();
  const { setLocation } = useLocation();
  const [zipInput, setZipInput] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleZipChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 5);
    setZipInput(sanitized);
    setIsValid(isValidCaliforniaZip(sanitized));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const city = await lookupZipCity(zipInput);

      if (city) {
        setLocation(zipInput, city);
        navigate({ to: "/measures" });
      } else {
        setError("Unable to find location for this ZIP code.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Before the Ballot
          </h1>
          <p className="text-muted-foreground text-lg">
            Understand California ballot measures
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Enter your ZIP code"
              value={zipInput}
              onChange={(e) => handleZipChange(e.target.value)}
              maxLength={5}
              className="h-12 text-center text-lg"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            {!isValid && zipInput.length === 5 && !error && (
              <p className="text-destructive text-sm">
                Please enter a valid California ZIP code (starts with 9)
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Loading..." : "Find My Measures"}
          </Button>
        </form>
      </div>
    </div>
  );
}
