import { useState, useEffect } from "react";

const ZIP_STORAGE_KEY = "before-the-ballot:zip";

export interface LocationData {
  zip: string;
  city: string;
  state: string;
}

export function useLocation() {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(ZIP_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LocationData;
        setLocationState(parsed);
      } catch {
        localStorage.removeItem(ZIP_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const setLocation = (zip: string, city: string, state: string = "CA") => {
    const data: LocationData = { zip, city, state };
    localStorage.setItem(ZIP_STORAGE_KEY, JSON.stringify(data));
    setLocationState(data);
  };

  const clearLocation = () => {
    localStorage.removeItem(ZIP_STORAGE_KEY);
    setLocationState(null);
  };

  return {
    location,
    setLocation,
    clearLocation,
    isLoading,
  };
}

export function isValidCaliforniaZip(zip: string): boolean {
  const zipRegex = /^9\d{4}$/;
  return zipRegex.test(zip);
}

export async function lookupZipCity(zip: string): Promise<string | null> {
  if (!isValidCaliforniaZip(zip)) {
    return null;
  }

  const caCities: Record<string, string> = {
    "94102": "San Francisco",
    "94103": "San Francisco",
    "94104": "San Francisco",
    "94105": "San Francisco",
    "90001": "Los Angeles",
    "90002": "Los Angeles",
    "92014": "San Diego",
    "92101": "San Diego",
    "95050": "Santa Clara",
    "95051": "Santa Clara",
    "95110": "San Jose",
    "95112": "San Jose",
    "95814": "Sacramento",
    "95815": "Sacramento",
    "90210": "Beverly Hills",
    "91101": "Pasadena",
    "92602": "Irvine",
    "93001": "Ventura",
    "93101": "Santa Barbara",
    "93901": "Salinas",
    "94040": "Mountain View",
    "94043": "Mountain View",
    "94301": "Palo Alto",
    "94501": "Alameda",
    "94601": "Oakland",
    "94702": "Berkeley",
    "94901": "San Rafael",
    "94925": "Corte Madera",
  };

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (caCities[zip]) {
    return caCities[zip];
  }

  const prefixes: Record<string, string> = {
    "94": "Bay Area",
    "95": "South Bay",
    "90": "Los Angeles Area",
    "91": "Pasadena Area",
    "92": "San Diego Area",
    "93": "Ventura Area",
    "96": "Sacramento Area",
  };

  const prefix = zip.slice(0, 2);
  return prefixes[prefix] || "California";
}
