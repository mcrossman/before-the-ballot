import { action } from "../_generated/server";
import { v } from "convex/values";
import { fetchWithRetry } from "../lib/fetch";
import { extractPdfText } from "../lib/pdf";
import {
  parseSantaClaraListing,
  type LocalMeasureLink,
} from "../lib/parsers";
import crypto from "crypto";
import { api } from "../_generated/api";

export const scrapeSantaClara = action({
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
      return "unchanged";
    } else {
      await ctx.runMutation(api.measures.update, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    await ctx.runMutation(api.measures.create, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
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
