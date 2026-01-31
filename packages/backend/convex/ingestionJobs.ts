import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new ingestion job
export const create = mutation({
  args: {
    source: v.union(v.literal("ca-sos"), v.literal("santa-clara")),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ingestionJobs", {
      source: args.source,
      status: args.status,
      startedAt: args.startedAt,
      measuresProcessed: 0,
      measuresNew: 0,
      measuresUpdated: 0,
      measuresFailed: [],
    });
  },
});

// Complete an ingestion job
export const complete = mutation({
  args: {
    jobId: v.id("ingestionJobs"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    completedAt: v.number(),
    measuresProcessed: v.number(),
    measuresNew: v.number(),
    measuresUpdated: v.number(),
    measuresFailed: v.array(v.string()),
    error: v.optional(v.string()),
    errorType: v.optional(
      v.union(
        v.literal("network"),
        v.literal("parsing"),
        v.literal("structure"),
        v.literal("unknown")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.jobId, {
      status: args.status,
      completedAt: args.completedAt,
      measuresProcessed: args.measuresProcessed,
      measuresNew: args.measuresNew,
      measuresUpdated: args.measuresUpdated,
      measuresFailed: args.measuresFailed,
      error: args.error,
      errorType: args.errorType,
    });
  },
});

// Get recent jobs
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ingestionJobs")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// Get jobs by source
export const getBySource = query({
  args: {
    source: v.union(v.literal("ca-sos"), v.literal("santa-clara")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ingestionJobs")
      .withIndex("by_source_started", (q) => q.eq("source", args.source))
      .order("desc")
      .take(args.limit ?? 10);
  },
});
