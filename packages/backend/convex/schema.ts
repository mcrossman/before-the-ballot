import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Ballot measures
  measures: defineTable({
    // Identification
    measureNumber: v.string(),
    electionId: v.optional(v.id("elections")),
    jurisdiction: v.object({
      type: v.union(v.literal("state"), v.literal("county"), v.literal("city")),
      name: v.string(),
      fipsCode: v.optional(v.string()),
    }),

    // Content - Full document extraction
    title: v.string(),
    officialText: v.optional(v.string()),     // Legacy: deprecated but kept for compatibility
    fullText: v.optional(v.string()),         // Complete document text with page breaks
    pages: v.optional(v.array(v.string())),   // Page-by-page text array for citation mapping
    textFileId: v.optional(v.id("_storage")), // Convex file storage ID for extracted text
    
    // PDF Metadata
    metadata: v.optional(v.object({
      title: v.optional(v.string()),
      author: v.optional(v.string()),
      subject: v.optional(v.string()),
      keywords: v.optional(v.string()),
      creator: v.optional(v.string()),
      producer: v.optional(v.string()),
      creationDate: v.optional(v.string()),
      modificationDate: v.optional(v.string()),
      pdfVersion: v.optional(v.string()),
    })),
    
    // Extraction Statistics
    stats: v.optional(v.object({
      pageCount: v.number(),
      wordCount: v.number(),
      charCount: v.number(),
    })),
    
    // Change Detection
    textHash: v.string(),                     // SHA256 of fullText for deduplication
    
    // Source References
    officialTextUrl: v.optional(v.string()),
    fiscalImpactText: v.optional(v.string()),
    sourceUrl: v.string(),
    sourceType: v.union(
      v.literal("ca-sos"),
      v.literal("santa-clara-county")
    ),

    // Metadata
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

    // Timestamps
    firstSeenAt: v.number(),
    lastUpdatedAt: v.number(),
    electionDate: v.optional(v.number()),
    scrapedAt: v.number(),
    scrapeJobId: v.id("ingestionJobs"),
  })
    .index("by_election", ["electionId"])
    .index("by_jurisdiction", ["jurisdiction.name"])
    .index("by_status", ["status"])
    .index("by_source_url", ["sourceUrl"])
    .index("by_source_type", ["sourceType"]),

  // AI-generated insights
  insights: defineTable({
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
    actualOutcome: v.optional(v.string()),
    predictionAccuracy: v.optional(
      v.union(v.literal("correct"), v.literal("partial"), v.literal("incorrect"))
    ),
  })
    .index("by_measure", ["measureId"])
    .index("by_measure_type", ["measureId", "type"]),

  // User stances
  userStances: defineTable({
    userId: v.string(),
    measureId: v.id("measures"),
    stance: v.union(
      v.literal("support"),
      v.literal("oppose"),
      v.literal("undecided")
    ),
    personalNotes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_measure", ["userId", "measureId"]),

  // Elections
  elections: defineTable({
    date: v.number(),
    type: v.union(v.literal("primary"), v.literal("general"), v.literal("special")),
    year: v.number(),
    jurisdictions: v.array(v.string()),
  }).index("by_date", ["date"]),

  // Ingestion job tracking
  ingestionJobs: defineTable({
    source: v.union(v.literal("ca-sos"), v.literal("santa-clara")),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
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
  })
    .index("by_source_started", ["source", "startedAt"])
    .index("by_status", ["status"]),
});
