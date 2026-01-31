import { action } from "../_generated/server";
import { v } from "convex/values";
import { fetchWithRetry } from "../lib/fetch";
import { extractPdfText } from "../lib/pdf";
import { parseCaSosListing, type CaMeasureLink } from "../lib/parsers";
import crypto from "crypto";

export interface ScrapeResult {
  processed: number;
  new: number;
  updated: number;
  failed: string[];
}

export const scrapeCaSos = action({
  args: {},
  handler: async (ctx): Promise<ScrapeResult> => {
    // Create job record
    const jobId = await ctx.runMutation(api.ingestionJobs.create, {
      source: "ca-sos",
      status: "running",
      startedAt: Date.now(),
    });

    const results: ScrapeResult = {
      processed: 0,
      new: 0,
      updated: 0,
      failed: [],
    };

    try {
      // Fetch listing page
      const response = await fetchWithRetry(
        "https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures"
      );
      const listingHtml = await response.text();

      // Parse measure links
      const measureLinks = parseCaSosListing(listingHtml);
      console.log(`Found ${measureLinks.length} measures on CA SoS`);

      // Process each measure
      for (const link of measureLinks) {
        try {
          const action = await processCaMeasure(ctx, link, jobId);
          results.processed++;

          if (action === "created") {
            results.new++;
          } else if (action === "updated") {
            results.updated++;
          }
        } catch (err) {
          results.failed.push(link.url);
          console.error(`Failed to process measure ${link.url}:`, err);
        }
      }

      // Mark job complete
      await ctx.runMutation(api.ingestionJobs.complete, {
        jobId,
        status: "completed",
        completedAt: Date.now(),
        measuresProcessed: results.processed,
        measuresNew: results.new,
        measuresUpdated: results.updated,
        measuresFailed: results.failed,
      });

      return results;
    } catch (err) {
      // Mark job failed
      const errorType = isStructuralError(err)
        ? "structure"
        : err instanceof Error && err.message.includes("Network")
        ? "network"
        : "unknown";

      await ctx.runMutation(api.ingestionJobs.complete, {
        jobId,
        status: "failed",
        completedAt: Date.now(),
        error: err instanceof Error ? err.message : String(err),
        errorType,
        measuresProcessed: results.processed,
        measuresNew: results.new,
        measuresUpdated: results.updated,
        measuresFailed: results.failed,
      });

      throw err;
    }
  },
});

async function processCaMeasure(
  ctx: any,
  link: CaMeasureLink,
  jobId: string
): Promise<"created" | "updated" | "unchanged"> {
  // Download PDF
  const pdfResponse = await fetchWithRetry(link.url);
  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

  // Extract text
  const text = await extractPdfText(pdfBuffer);

  // Calculate hash
  const textHash = crypto.createHash("sha256").update(text).digest("hex");

  // Check existing
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, {
    sourceUrl: link.url,
  });

  if (existing) {
    if (existing.textHash === textHash) {
      // No change
      return "unchanged";
    } else {
      // Update (rare)
      await ctx.runMutation(api.measures.update, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    // New measure
    await ctx.runMutation(api.measures.create, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
      sourceUrl: link.url,
      sourceType: "ca-sos",
      jurisdiction: { type: "state", name: "California" },
      status: "upcoming",
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
    });
    return "created";
  }
}

function isStructuralError(err: unknown): boolean {
  if (err instanceof Error) {
    // If we can't find expected patterns, likely structure changed
    return (
      err.message.includes("Cannot read") ||
      err.message.includes("undefined") ||
      err.message.includes("null")
    );
  }
  return false;
}

// Import api for mutations
import { api } from "../_generated/api";
