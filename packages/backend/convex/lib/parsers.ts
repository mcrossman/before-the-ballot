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
  const foundUrls = new Set<string>();

  // Pattern 1: Look for "Proposition N" followed by title and PDF link
  const propositionPattern =
    /Proposition\s+(\d+)[\s\S]*?([^\n]+)[\s\S]*?href="([^"]+\.pdf)"/gi;

  let match;
  while ((match = propositionPattern.exec(html)) !== null) {
    const measureNumber = `Proposition ${match[1]}`;
    const title = cleanTitle(match[2]);
    const url = normalizeCaUrl(match[3]);

    if (!foundUrls.has(url)) {
      foundUrls.add(url);
      measures.push({
        url,
        measureNumber,
        title,
      });
    }
  }

  // Pattern 2: Look for links to elections.cdn.sos.ca.gov ballot-measures PDFs
  // These are the actual measure URLs like: sca-1-24.pdf, aca-13.pdf, sb-42.pdf
  const pdfLinkPattern = /href="([^"]*ballot-measures[^"]*\.pdf)"/gi;

  while ((match = pdfLinkPattern.exec(html)) !== null) {
    const url = normalizeCaUrl(match[1]);
    if (!foundUrls.has(url)) {
      foundUrls.add(url);
      
      // Extract measure identifier from URL
      // Examples: sca-1-24.pdf -> SCA 1, aca-13.pdf -> ACA 13, sb-42.pdf -> SB 42
      const urlMatch = url.match(/\/([^\/]+)\.pdf$/);
      if (urlMatch) {
        const fileName = urlMatch[1];
        // Convert filename to measure number
        // sca-1-24 -> SCA 1, prop-1 -> Proposition 1
        const measureMatch = fileName.match(/^(sca|aca|sb|ab|prop)[-_]?(\d+)(?:[-_]\d+)?$/i);
        if (measureMatch) {
          const type = measureMatch[1].toUpperCase();
          const number = measureMatch[2];
          let measureNumber: string;
          
          if (type === "PROP") {
            measureNumber = `Proposition ${number}`;
          } else {
            measureNumber = `${type} ${number}`;
          }
          
          // Try to find title near this link in the HTML
          const title = extractTitleNearLink(html, match.index);
          
          measures.push({
            url,
            measureNumber,
            title,
          });
        }
      }
    }
  }

  // Pattern 3: Look for any .pdf links on elections.cdn.sos.ca.gov
  const cdnPattern = /href="([^"]*elections\.cdn\.sos\.ca\.gov[^"]*\.pdf)"/gi;

  while ((match = cdnPattern.exec(html)) !== null) {
    const url = match[1]; // Already absolute
    if (!foundUrls.has(url)) {
      foundUrls.add(url);
      
      // Try to extract measure info from URL
      const urlMatch = url.match(/\/([^\/]+)\.pdf$/);
      if (urlMatch) {
        const fileName = urlMatch[1];
        const measureMatch = fileName.match(/^(sca|aca|sb|ab|prop)[-_]?(\d+)(?:[-_]\d+)?$/i);
        if (measureMatch) {
          const type = measureMatch[1].toUpperCase();
          const number = measureMatch[2];
          const measureNumber = type === "PROP" ? `Proposition ${number}` : `${type} ${number}`;
          const title = extractTitleNearLink(html, match.index);
          
          measures.push({
            url,
            measureNumber,
            title,
          });
        }
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
 * Normalize CA SOS URLs to absolute URLs
 * Handles both www.sos.ca.gov and elections.cdn.sos.ca.gov
 */
function normalizeCaUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `https://www.sos.ca.gov${url}`;
  }
  return `https://www.sos.ca.gov/${url}`;
}

/**
 * Extract measure title from HTML near a link position
 */
function extractTitleNearLink(html: string, linkPosition: number): string {
  // Look at text before the link for title/context
  const beforeText = html.substring(Math.max(0, linkPosition - 500), linkPosition);
  
  // Try to find a title pattern
  // Look for text between tags that's reasonably long
  const titleMatch = beforeText.match(/>([^<]{10,200})</g);
  if (titleMatch) {
    // Get the last (closest) match
    const lastMatch = titleMatch[titleMatch.length - 1];
    const title = lastMatch.replace(/[><]/g, "").trim();
    if (title.length > 5) {
      return cleanTitle(title);
    }
  }
  
  return "Pending Title";
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
