import { internalAction } from "../_generated/server";
import { fetchWithRetry } from "../lib/fetch";
import { parseCaSosListing, type CaMeasureLink } from "../lib/parsers";
import { api } from "../_generated/api";
import { internal } from "../_generated/api";

export interface ScrapeResult {
  processed: number;
  new: number;
  updated: number;
  failed: string[];
}

export const scrapeCaSos = internalAction({
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
  // Extract full document content via internal action (uses "use node")
  // Note: internal.lib.pdfExtraction will be available after Convex code generation
  const extraction = await ctx.runAction(internal.lib.pdfExtraction.extractPdfFull, {
    url: link.url,
  });

  // Check existing
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, {
    sourceUrl: link.url,
  });

  if (existing) {
    if (existing.textHash === extraction.textHash) {
      // No change
      return "unchanged";
    } else {
      // Update with full extraction data
      await ctx.runMutation(api.measures.updateFull, {
        id: existing._id,
        fullText: extraction.fullText,
        pages: extraction.pages,
        metadata: extraction.metadata,
        stats: extraction.stats,
        textHash: extraction.textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    // New measure with full extraction data
    await ctx.runMutation(api.measures.createFull, {
      measureNumber: link.measureNumber,
      title: link.title,
      fullText: extraction.fullText,
      pages: extraction.pages,
      metadata: extraction.metadata,
      stats: extraction.stats,
      textHash: extraction.textHash,
      officialTextUrl: link.url,
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
