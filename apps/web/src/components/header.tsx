import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation, isValidCaliforniaZip, lookupZipCity } from "@/hooks/useLocation";

export default function Header() {
  const { location, setLocation, clearLocation } = useLocation();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [zipInput, setZipInput] = useState(location?.zip || "");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleZipChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 5);
    setZipInput(sanitized);
    setIsValid(isValidCaliforniaZip(sanitized));
  };

  const handleLocationSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    const city = await lookupZipCity(zipInput);
    setIsLoading(false);

    if (city) {
      setLocation(zipInput, city);
      setIsLocationOpen(false);
    }
  };

  const handleClearLocation = () => {
    clearLocation();
    setZipInput("");
    setIsValid(false);
    setIsLocationOpen(false);
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-4 py-3">
        <nav className="flex gap-4 text-lg">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </nav>

        <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-sm">
              {location ? (
                <span className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{location.city}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Set Location</span>
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Your Location</DialogTitle>
              <DialogDescription>
                Enter your California ZIP code to find ballot measures in your area.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="zip" className="text-sm font-medium">
                  ZIP Code
                </label>
                <Input
                  id="zip"
                  placeholder="Enter ZIP code (e.g., 94102)"
                  value={zipInput}
                  onChange={(e) => handleZipChange(e.target.value)}
                  maxLength={5}
                  className={!isValid && zipInput.length === 5 ? "border-destructive" : ""}
                />
                {!isValid && zipInput.length === 5 && (
                  <p className="text-destructive text-xs">
                    Please enter a valid California ZIP code (starts with 9)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleLocationSubmit}
                  disabled={!isValid || isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Loading..." : "Save Location"}
                </Button>
                {location && (
                  <Button variant="outline" onClick={handleClearLocation}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </div>
      <hr />
    </div>
  );
}
