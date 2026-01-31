/**
 * HTML parsing utilities for ballot measure sources
 */

export interface CaMeasureLink {
  url: string;
  measureNumber: string;
  title: string;
  electionDate?: string;
}

export interface LocalMeasureLink {
  url: string;
  measureNumber: string;
  title: string;
  jurisdiction: {
    type: "county" | "city";
    name: string;
  };
}

/**
 * Parse CA Secretary of State ballot measures listing page
 */
export function parseCaSosListing(html: string): CaMeasureLink[] {
  const measures: CaMeasureLink[] = [];

  // Use regex to find measure patterns
  // Look for "Proposition N" followed by title and PDF link
  const measurePattern =
    /Proposition\s+(\d+)[\s\S]*?([^\n]+)[\s\S]*?href="([^"]+\.pdf)"/gi;

  let match;
  while ((match = measurePattern.exec(html)) !== null) {
    const measureNumber = `Proposition ${match[1]}`;
    const title = cleanTitle(match[2]);
    const url = normalizeUrl(match[3], "https://www.sos.ca.gov");

    measures.push({
      url,
      measureNumber,
      title,
    });
  }

  // Alternative: Look for structured HTML
  // Look for links containing "prop" or "proposition"
  const linkPattern = /href="([^"]*(?:prop|proposition)[^"]*\.pdf)"/gi;
  const foundUrls = new Set(measures.map((m) => m.url));

  while ((match = linkPattern.exec(html)) !== null) {
    const url = normalizeUrl(match[1], "https://www.sos.ca.gov");
    if (!foundUrls.has(url)) {
      // Try to extract measure number from URL
      const numberMatch = url.match(/prop(?:osition)?[\-_]?(\d+)/i);
      if (numberMatch) {
        measures.push({
          url,
          measureNumber: `Proposition ${numberMatch[1]}`,
          title: "Unknown Title", // Will need manual review
        });
      }
    }
  }

  return measures;
}

/**
 * Parse Santa Clara County measures listing
 */
export function parseSantaClaraListing(html: string): LocalMeasureLink[] {
  const measures: LocalMeasureLink[] = [];

  // Look for measure listings
  // Pattern: Measure X - Title
  const measurePattern =
    /Measure\s+([A-Z])[\s\-:]+([^\n<]+)[\s\S]*?href="([^"]+\.pdf)"/gi;

  let match;
  while ((match = measurePattern.exec(html)) !== null) {
    const measureNumber = `Measure ${match[1]}`;
    const title = cleanTitle(match[2]);
    const url = normalizeUrl(match[3], "https://vote.santaclaracounty.gov");

    // Determine jurisdiction from context
    const jurisdiction = determineJurisdiction(html, match.index);

    measures.push({
      url,
      measureNumber,
      title,
      jurisdiction,
    });
  }

  return measures;
}

/**
 * Clean up extracted title text
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/^[-\s]+|[-\s]+$/g, "")
    .trim();
}

/**
 * Normalize relative URLs to absolute
 */
function normalizeUrl(url: string, base: string): string {
  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${base}${url}`;
  }
  return `${base}/${url}`;
}

/**
 * Determine jurisdiction from HTML context
 */
function determineJurisdiction(
  html: string,
  position: number
): { type: "county" | "city"; name: string } {
  // Look for jurisdiction headings before this measure
  const beforeText = html.substring(0, position);

  // Check for county indicators
  if (/County Measures|County of Santa Clara/i.test(beforeText)) {
    return { type: "county", name: "Santa Clara County" };
  }

  // Check for city indicators
  const cityMatch = beforeText.match(/([A-Za-z\s]+) City Measures/i);
  if (cityMatch) {
    return { type: "city", name: cityMatch[1].trim() };
  }

  // Default to county
  return { type: "county", name: "Santa Clara County" };
}
