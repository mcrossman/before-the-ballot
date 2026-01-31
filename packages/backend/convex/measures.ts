import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new measure
export const create = mutation({
  args: {
    measureNumber: v.string(),
    title: v.string(),
    officialText: v.string(),
    textHash: v.string(),
    sourceUrl: v.string(),
    sourceType: v.union(v.literal("ca-sos"), v.literal("santa-clara-county")),
    jurisdiction: v.object({
      type: v.union(v.literal("state"), v.literal("county"), v.literal("city")),
      name: v.string(),
      fipsCode: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("passed"),
      v.literal("failed"),
      v.literal("withdrawn")
    ),
    firstSeenAt: v.number(),
    lastUpdatedAt: v.number(),
    scrapedAt: v.number(),
    scrapeJobId: v.id("ingestionJobs"),
    electionDate: v.optional(v.number()),
    fiscalImpactText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("measures", args);
  },
});

// Update an existing measure
export const update = mutation({
  args: {
    id: v.id("measures"),
    officialText: v.string(),
    textHash: v.string(),
    lastUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      officialText: args.officialText,
      textHash: args.textHash,
      lastUpdatedAt: args.lastUpdatedAt,
    });
  },
});

// Find measure by source URL
export const findBySourceUrl = query({
  args: {
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("measures")
      .withIndex("by_source_url", (q) => q.eq("sourceUrl", args.sourceUrl))
      .first();
  },
});

// Get all measures
export const getAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("measures").order("desc").take(args.limit ?? 100);
  },
});

// Get measures by source type
export const getBySourceType = query({
  args: {
    sourceType: v.union(v.literal("ca-sos"), v.literal("santa-clara-county")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("measures")
      .withIndex("by_source_type", (q) => q.eq("sourceType", args.sourceType))
      .order("desc")
      .take(args.limit ?? 100);
  },
});

// Get measure by ID
export const getById = query({
  args: {
    id: v.id("measures"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update measure status (e.g., after election)
export const updateStatus = mutation({
  args: {
    id: v.id("measures"),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("passed"),
      v.literal("failed"),
      v.literal("withdrawn")
    ),
    outcome: v.optional(
      v.object({
        passed: v.boolean(),
        yesVotes: v.number(),
        noVotes: v.number(),
        percentYes: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      outcome: args.outcome,
      lastUpdatedAt: Date.now(),
    });
  },
});
