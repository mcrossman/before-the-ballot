import { internalAction } from "../_generated/server";
import { fetchWithRetry } from "../lib/fetch";
import {
  parseSantaClaraListing,
  type LocalMeasureLink,
} from "../lib/parsers";
import { api } from "../_generated/api";
import { internal } from "../_generated/api";

export const scrapeSantaClara = internalAction({
  args: {},
  handler: async (ctx) => {
    // Create job record
    const jobId = await ctx.runMutation(api.ingestionJobs.create, {
      source: "santa-clara",
      status: "running",
      startedAt: Date.now(),
    });

    const results = {
      processed: 0,
      new: 0,
      updated: 0,
      failed: [] as string[],
    };

    try {
      // Fetch listing page
      const response = await fetchWithRetry(
        "https://vote.santaclaracounty.gov/list-local-measures-2"
      );
      const listingHtml = await response.text();

      // Parse measure links
      const measureLinks = parseSantaClaraListing(listingHtml);
      console.log(`Found ${measureLinks.length} measures in Santa Clara County`);

      // Process each measure
      for (const link of measureLinks) {
        try {
          const action = await processLocalMeasure(ctx, link, jobId);
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
      const errorType =
        err instanceof Error && err.message.includes("Network")
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

async function processLocalMeasure(
  ctx: any,
  link: LocalMeasureLink,
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
      sourceType: "santa-clara-county",
      jurisdiction: link.jurisdiction,
      status: "upcoming",
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
    });
    return "created";
  }
}
