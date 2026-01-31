/**
 * Insight generation workflow
 *
 * Orchestrates the full pipeline:
 * 1. Extract content from URL (PDF, Markdown, or HTML)
 * 2. Create/find measure in database
 * 3. Generate insights for each category using GPT 5.2
 * 4. Validate citations against source text
 * 5. Store insights in database
 */

"use node";

import { internalAction } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v } from "convex/values";
import { getOpenAIClient, MODEL, PROMPT_VERSION } from "../lib/openai";
import {
  PROMPTS,
  INSIGHT_TYPES,
  type InsightType,
  type InsightResponse,
  type Citation,
} from "../lib/prompts";

/**
 * Run full insight generation pipeline from a URL
 *
 * This is the main entry point for testing and manual runs.
 * Accepts any URL (PDF, Markdown, or HTML) and generates all insights.
 */
export const runFromUrl = internalAction({
  args: {
    url: v.string(),
    // Optional: provide existing measureId to regenerate insights
    measureId: v.optional(v.id("measures")),
    // Optional: metadata for new measures
    measureNumber: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`Starting insight generation for: ${args.url}`);

    let measureId = args.measureId;
    let fullText: string;

    if (!measureId) {
      // Step 1: Extract content from URL
      console.log("Extracting content...");
      const extraction = await ctx.runAction(
        internal.lib.contentExtraction.extractContent,
        { url: args.url }
      );
      console.log(
        `Extracted ${extraction.stats.wordCount} words (${extraction.metadata.sourceType})`
      );

      // Step 2: Create an ingestion job for tracking
      const jobId = await ctx.runMutation(api.ingestionJobs.create, {
        source: "ca-sos", // Default source for manual runs
        status: "running",
        startedAt: Date.now(),
      });

      // Step 3: Create measure record
      measureId = await ctx.runMutation(api.measures.createFull, {
        measureNumber: args.measureNumber || "Manual Import",
        title:
          args.title || extraction.metadata.title || "Untitled Ballot Measure",
        fullText: extraction.fullText,
        pages: extraction.pages,
        metadata: {
          title: extraction.metadata.title,
          author: extraction.metadata.author,
        },
        stats: extraction.stats,
        textHash: extraction.textHash,
        officialTextUrl: args.url,
        sourceUrl: args.url,
        sourceType: "ca-sos",
        jurisdiction: { type: "state", name: "California" },
        status: "upcoming",
        firstSeenAt: Date.now(),
        lastUpdatedAt: Date.now(),
        scrapedAt: Date.now(),
        scrapeJobId: jobId,
      });

      fullText = extraction.fullText;

      // Complete the ingestion job
      await ctx.runMutation(api.ingestionJobs.complete, {
        jobId,
        status: "completed",
        completedAt: Date.now(),
        measuresProcessed: 1,
        measuresNew: 1,
        measuresUpdated: 0,
        measuresFailed: [],
      });
    } else {
      // Use existing measure
      const measure = await ctx.runQuery(api.measures.getById, {
        id: measureId,
      });
      if (!measure) {
        throw new Error(`Measure not found: ${measureId}`);
      }
      fullText = measure.fullText || measure.officialText;
    }

    // Step 4: Delete existing insights (for clean regeneration)
    console.log("Clearing existing insights...");
    await ctx.runMutation(internal.insights.deleteByMeasure, { measureId });

    // Step 5: Generate insights for each type
    const client = getOpenAIClient();
    const results: { type: InsightType; success: boolean; error?: string }[] =
      [];

    for (const insightType of INSIGHT_TYPES) {
      console.log(`Generating ${insightType} insight...`);

      try {
        const prompt = PROMPTS[insightType](fullText);

        const response = await client.chat.completions.create({
          model: MODEL,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a nonpartisan policy analyst. Return only valid JSON matching the specified schema.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from OpenAI");
        }

        // Parse JSON response
        const parsed: InsightResponse = JSON.parse(content);

        // Validate and repair citations
        const validatedCitations = validateCitations(
          parsed.citations,
          fullText
        );

        // Store insight
        await ctx.runMutation(internal.insights.storeInsight, {
          measureId,
          generatedAt: Date.now(),
          model: MODEL,
          promptVersion: PROMPT_VERSION,
          type: insightType,
          content: parsed.content,
          confidence: parsed.confidence,
          uncertaintyFlags: parsed.uncertaintyFlags,
          citations: validatedCitations,
        });

        results.push({ type: insightType, success: true });
        console.log(
          `✓ ${insightType}: ${validatedCitations.length} citations`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({ type: insightType, success: false, error: errorMessage });
        console.error(`✗ ${insightType}: ${errorMessage}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Completed: ${successCount}/${INSIGHT_TYPES.length} insights`);

    return {
      measureId,
      url: args.url,
      insightsGenerated: successCount,
      results,
    };
  },
});

/**
 * Generate insights for an existing measure by ID
 */
export const runForMeasure = internalAction({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    const measure = await ctx.runQuery(api.measures.getById, {
      id: args.measureId,
    });

    if (!measure) {
      throw new Error(`Measure not found: ${args.measureId}`);
    }

    // Delegate to runFromUrl with existing measureId
    return ctx.runAction(internal.jobs.generateInsights.runFromUrl, {
      url: measure.sourceUrl,
      measureId: args.measureId,
    });
  },
});

/**
 * Validate citations against source text and repair offsets if needed
 */
function validateCitations(
  citations: Citation[],
  sourceText: string
): Citation[] {
  return citations.map((citation, index) => {
    const { textSpan, startOffset, endOffset, context } = citation;

    // Check if offsets are correct
    if (startOffset >= 0 && endOffset > startOffset) {
      const atOffset = sourceText.substring(startOffset, endOffset);
      if (atOffset === textSpan) {
        // Offsets are correct
        return citation;
      }
    }

    // Try to find the exact text in source
    const exactIndex = sourceText.indexOf(textSpan);
    if (exactIndex !== -1) {
      return {
        textSpan,
        startOffset: exactIndex,
        endOffset: exactIndex + textSpan.length,
        context,
      };
    }

    // Try normalized whitespace match
    const normalizedSpan = textSpan.replace(/\s+/g, " ").trim();
    const normalizedSource = sourceText.replace(/\s+/g, " ");
    const normalizedIndex = normalizedSource.indexOf(normalizedSpan);

    if (normalizedIndex !== -1) {
      // Found with normalized whitespace - map back to original
      // This is approximate but better than nothing
      let originalIndex = 0;
      let normalizedPos = 0;

      for (let i = 0; i < sourceText.length && normalizedPos < normalizedIndex; i++) {
        if (!/\s/.test(sourceText[i]) || (i > 0 && !/\s/.test(sourceText[i - 1]))) {
          normalizedPos++;
        }
        originalIndex = i + 1;
      }

      return {
        textSpan,
        startOffset: originalIndex,
        endOffset: originalIndex + textSpan.length,
        context: `[WHITESPACE_NORMALIZED] ${context || ""}`.trim(),
      };
    }

    // Could not find - mark as unverified
    console.warn(`Citation ${index + 1} not found in source: "${textSpan.substring(0, 50)}..."`);
    return {
      textSpan,
      startOffset: -1,
      endOffset: -1,
      context: `[UNVERIFIED] ${context || ""}`.trim(),
    };
  });
}
