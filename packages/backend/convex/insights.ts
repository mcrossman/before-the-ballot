import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new insight for a measure
export const create = mutation({
  args: {
    measureId: v.id("measures"),
    type: v.union(
      v.literal("summary"),
      v.literal("fiscal"),
      v.literal("legal_changes"),
      v.literal("affected_groups"),
      v.literal("conflicts")
    ),
    content: v.string(),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    uncertaintyFlags: v.optional(v.array(v.string())),
    citations: v.array(
      v.object({
        textSpan: v.string(),
        startOffset: v.number(),
        endOffset: v.number(),
        context: v.optional(v.string()),
      })
    ),
    generatedAt: v.number(),
    model: v.string(),
    promptVersion: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", args);
  },
});

// Get all insights for a measure
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

// Get insight by type for a measure
export const getByType = query({
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

// Get measure with all insights in one query
export const getMeasureWithInsights = query({
  args: {
    measureId: v.id("measures"),
  },
  handler: async (ctx, args) => {
    const measure = await ctx.db.get(args.measureId);
    if (!measure) return null;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_measure", (q) => q.eq("measureId", args.measureId))
      .collect();

    return { measure, insights };
  },
});

// Update an insight (e.g., if regenerating)
export const update = mutation({
  args: {
    id: v.id("insights"),
    content: v.optional(v.string()),
    confidence: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    uncertaintyFlags: v.optional(v.array(v.string())),
    citations: v.optional(
      v.array(
        v.object({
          textSpan: v.string(),
          startOffset: v.number(),
          endOffset: v.number(),
          context: v.optional(v.string()),
        })
      )
    ),
    generatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete all insights for a measure (useful for regeneration)
export const deleteByMeasure = mutation({
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

// Get insights with optional filtering
export const list = query({
  args: {
    measureId: v.optional(v.id("measures")),
    type: v.optional(
      v.union(
        v.literal("summary"),
        v.literal("fiscal"),
        v.literal("legal_changes"),
        v.literal("affected_groups"),
        v.literal("conflicts")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const measureId = args.measureId;
    const type = args.type;

    if (measureId && type) {
      return await ctx.db
        .query("insights")
        .withIndex("by_measure_type", (q) =>
          q.eq("measureId", measureId).eq("type", type)
        )
        .order("desc")
        .take(args.limit ?? 100);
    } else if (measureId) {
      return await ctx.db
        .query("insights")
        .withIndex("by_measure", (q) => q.eq("measureId", measureId))
        .order("desc")
        .take(args.limit ?? 100);
    }

    return await ctx.db.query("insights").order("desc").take(args.limit ?? 100);
  },
});
