import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new measure with full document extraction
export const createFull = mutation({
  args: {
    measureNumber: v.string(),
    title: v.string(),
    fullText: v.string(),
    pages: v.array(v.string()),
    textFileId: v.optional(v.id("_storage")),
    metadata: v.object({
      title: v.optional(v.string()),
      author: v.optional(v.string()),
      subject: v.optional(v.string()),
      keywords: v.optional(v.string()),
      creator: v.optional(v.string()),
      producer: v.optional(v.string()),
      creationDate: v.optional(v.string()),
      modificationDate: v.optional(v.string()),
      pdfVersion: v.optional(v.string()),
    }),
    stats: v.object({
      pageCount: v.number(),
      wordCount: v.number(),
      charCount: v.number(),
    }),
    textHash: v.string(),
    officialTextUrl: v.optional(v.string()),
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
    return await ctx.db.insert("measures", {
      ...args,
      officialText: args.fullText, // Keep legacy field synced
    });
  },
});

// Legacy create - for backward compatibility
export const create = mutation({
  args: {
    measureNumber: v.string(),
    title: v.string(),
    officialText: v.string(),
    textHash: v.string(),
    officialTextUrl: v.optional(v.string()),
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
    return await ctx.db.insert("measures", {
      ...args,
      fullText: args.officialText,
      pages: [args.officialText],
      metadata: {},
      stats: {
        pageCount: 1,
        wordCount: args.officialText.split(/\s+/).filter(w => w.length > 0).length,
        charCount: args.officialText.length,
      },
    });
  },
});

// Update with full document extraction data
export const updateFull = mutation({
  args: {
    id: v.id("measures"),
    fullText: v.string(),
    pages: v.array(v.string()),
    metadata: v.object({
      title: v.optional(v.string()),
      author: v.optional(v.string()),
      subject: v.optional(v.string()),
      keywords: v.optional(v.string()),
      creator: v.optional(v.string()),
      producer: v.optional(v.string()),
      creationDate: v.optional(v.string()),
      modificationDate: v.optional(v.string()),
      pdfVersion: v.optional(v.string()),
    }),
    stats: v.object({
      pageCount: v.number(),
      wordCount: v.number(),
      charCount: v.number(),
    }),
    textHash: v.string(),
    lastUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      fullText: args.fullText,
      officialText: args.fullText, // Keep legacy field synced
      pages: args.pages,
      metadata: args.metadata,
      stats: args.stats,
      textHash: args.textHash,
      lastUpdatedAt: args.lastUpdatedAt,
    });
  },
});

// Legacy update - for backward compatibility
export const update = mutation({
  args: {
    id: v.id("measures"),
    officialText: v.string(),
    textHash: v.string(),
    lastUpdatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const wordCount = args.officialText.split(/\s+/).filter(w => w.length > 0).length;
    return await ctx.db.patch(args.id, {
      officialText: args.officialText,
      fullText: args.officialText,
      pages: [args.officialText],
      textHash: args.textHash,
      lastUpdatedAt: args.lastUpdatedAt,
      stats: {
        pageCount: 1,
        wordCount,
        charCount: args.officialText.length,
      },
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

// Get text for a specific page (useful for citations)
export const getPageText = query({
  args: {
    measureId: v.id("measures"),
    pageNumber: v.number(), // 1-indexed
  },
  handler: async (ctx, args) => {
    const measure = await ctx.db.get(args.measureId);
    if (!measure || !measure.pages) return null;
    
    const pageIndex = args.pageNumber - 1; // Convert to 0-indexed
    if (pageIndex < 0 || pageIndex >= measure.pages.length) {
      return null;
    }
    
    return {
      pageNumber: args.pageNumber,
      text: measure.pages[pageIndex],
      totalPages: measure.pages.length,
    };
  },
});

// Search within measure text (basic implementation)
export const searchText = query({
  args: {
    measureId: v.id("measures"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const measure = await ctx.db.get(args.measureId);
    if (!measure || !measure.pages) return [];
    
    const results: { pageNumber: number; text: string; context: string }[] = [];
    const queryLower = args.query.toLowerCase();
    
    measure.pages.forEach((pageText, index) => {
      if (pageText.toLowerCase().includes(queryLower)) {
        // Extract context around the match
        const pageLower = pageText.toLowerCase();
        const matchIndex = pageLower.indexOf(queryLower);
        const start = Math.max(0, matchIndex - 100);
        const end = Math.min(pageText.length, matchIndex + args.query.length + 100);
        const context = pageText.slice(start, end);
        
        results.push({
          pageNumber: index + 1,
          text: pageText,
          context: `...${context}...`,
        });
      }
    });
    
    return results;
  },
});
