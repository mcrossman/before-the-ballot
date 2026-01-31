/**
 * Insights table mutations and queries
 *
 * Manages AI-generated insights for ballot measures
 */

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

/**
 * Store a single insight (internal - called by generateInsights job)
 */
export const storeInsight = internalMutation({
  args: {
    measureId: v.id("measures"),
    generatedAt: v.number(),
    model: v.string(),
    promptVersion: v.string(),
    type: v.union(
      v.literal("summary"),
      v.literal("fiscal"),
      v.literal("legal_changes"),
      v.literal("affected_groups"),
      v.literal("conflicts")
    ),
    content: v.string(),
    confidence: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    uncertaintyFlags: v.optional(v.array(v.string())),
    citations: v.array(
      v.object({
        textSpan: v.string(),
        startOffset: v.number(),
        endOffset: v.number(),
        context: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", args);
  },
});

/**
 * Delete all insights for a measure (for regeneration)
 */
export const deleteByMeasure = internalMutation({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_measure", (q) => q.eq("measureId", args.measureId))
      .collect();

    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }

    return { deleted: insights.length };
  },
});

/**
 * Get all insights for a measure (public query)
 */
export const getByMeasure = query({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_measure", (q) => q.eq("measureId", args.measureId))
      .collect();
  },
});

/**
 * Get all insights for a measure (internal query)
 */
export const getByMeasureInternal = internalQuery({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_measure", (q) => q.eq("measureId", args.measureId))
      .collect();
  },
});

/**
 * Get a specific insight by measure and type
 */
export const getByMeasureAndType = query({
  args: {
    measureId: v.id("measures"),
    type: v.union(
      v.literal("summary"),
      v.literal("fiscal"),
      v.literal("legal_changes"),
      v.literal("affected_groups"),
      v.literal("conflicts")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_measure_type", (q) =>
        q.eq("measureId", args.measureId).eq("type", args.type)
      )
      .first();
  },
});

/**
 * Check if insights exist for a measure
 */
export const hasInsights = query({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    const first = await ctx.db
      .query("insights")
      .withIndex("by_measure", (q) => q.eq("measureId", args.measureId))
      .first();
    return first !== null;
  },
});

/**
 * Update prediction accuracy for an insight (after election results)
 */
export const updatePredictionAccuracy = mutation({
  args: {
    insightId: v.id("insights"),
    actualOutcome: v.string(),
    predictionAccuracy: v.union(
      v.literal("correct"),
      v.literal("partial"),
      v.literal("incorrect")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.insightId, {
      actualOutcome: args.actualOutcome,
      predictionAccuracy: args.predictionAccuracy,
    });
  },
});
