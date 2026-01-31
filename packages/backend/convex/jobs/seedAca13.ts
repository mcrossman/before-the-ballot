"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ACA 13 Demo Data Seeder
// This action extracts text from the sample PDF and seeds the database

export const seedAca13 = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; measureId: string; insightsCreated: number; textFileId: string }> => {
    console.log("Starting ACA 13 seed...");

    // Dynamically import pdf-parse to avoid bundling issues
    const pdfParse = (await import("pdf-parse")).default;

    // Read the PDF file
    const pdfPath = path.resolve(process.cwd(), "../../sample_data/aca-13.pdf");
    console.log(`Reading PDF from: ${pdfPath}`);

    const pdfBuffer = fs.readFileSync(pdfPath);

    // Extract text with page-by-page breakdown
    const pages: string[] = [];
    const data = await pdfParse(pdfBuffer, {
      pagerender: async (pageData: any) => {
        const textContent = await pageData.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        const cleaned = cleanPageText(text);
        pages.push(cleaned);
        return text;
      },
    });

    // Build full text from pages
    const fullText = pages.join("\n\n--- Page Break ---\n\n");

    // Store the extracted text as a Convex file
    const textBlob = new Blob([fullText], { type: "text/plain" });
    const textFileId = await ctx.storage.store(textBlob);
    console.log(`Stored text file with ID: ${textFileId}`);

    // Calculate hash
    const textHash = crypto
      .createHash("sha256")
      .update(fullText)
      .digest("hex");

    // Calculate stats
    const wordCount = fullText.split(/\s+/).filter((w) => w.length > 0).length;
    const charCount = fullText.length;
    const pageCount = pages.length;

    console.log(`Extracted ${pageCount} pages, ${wordCount} words, ${charCount} chars`);

    // Create ingestion job record
    const jobId = await ctx.runMutation(internal.ingestionJobs.create, {
      source: "ca-sos",
      status: "running",
      startedAt: Date.now(),
    });

    try {
      // Create the measure with text file reference
      const measureId = await ctx.runMutation(internal.measures.createFull, {
        measureNumber: "ACA 13",
        title: "Protect and Retain the Majority Vote Act",
        fullText,
        pages,
        textFileId,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
          keywords: data.info?.Keywords,
          creator: data.info?.Creator,
          producer: data.info?.Producer,
          creationDate: data.info?.CreationDate,
          modificationDate: data.info?.ModDate,
          pdfVersion: data.version,
        },
        stats: {
          pageCount,
          wordCount,
          charCount,
        },
        textHash,
        officialTextUrl: "/sample_data/aca-13.pdf",
        sourceUrl:
          "https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures",
        sourceType: "ca-sos",
        jurisdiction: {
          type: "state",
          name: "California",
          fipsCode: "06",
        },
        status: "upcoming",
        firstSeenAt: Date.now(),
        lastUpdatedAt: Date.now(),
        scrapedAt: Date.now(),
        scrapeJobId: jobId,
      });

      console.log(`Created measure with ID: ${measureId}`);

      // Create insights with citations
      const insights = getDemoInsights();
      const timestamp = Date.now();

      for (const insight of insights) {
        await ctx.runMutation(internal.insights.create, {
          measureId,
          type: insight.type,
          content: insight.content,
          confidence: insight.confidence,
          uncertaintyFlags: insight.uncertaintyFlags,
          citations: insight.citations,
          generatedAt: timestamp,
          model: "gpt-4",
          promptVersion: "1.0",
        });
      }

      console.log(`Created ${insights.length} insights`);

      // Complete the ingestion job
      await ctx.runMutation(internal.ingestionJobs.complete, {
        jobId,
        status: "completed",
        completedAt: Date.now(),
        measuresProcessed: 1,
        measuresNew: 1,
        measuresUpdated: 0,
        measuresFailed: [],
      });

      console.log("ACA 13 seed completed successfully!");

      return {
        success: true,
        measureId,
        insightsCreated: insights.length,
        textFileId: textFileId.toString(),
      };
    } catch (error) {
      console.error("Error seeding ACA 13:", error);

      await ctx.runMutation(internal.ingestionJobs.complete, {
        jobId,
        status: "failed",
        completedAt: Date.now(),
        error: String(error),
      });

      throw error;
    }
  },
});

// Clean page text
function cleanPageText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\f/g, "")
    .trim();
}

// Demo insights data
function getDemoInsights(): Array<{
  type: "summary" | "fiscal" | "legal_changes" | "affected_groups" | "conflicts";
  content: string;
  confidence: "high" | "medium" | "low";
  uncertaintyFlags?: string[];
  citations: Array<{
    textSpan: string;
    startOffset: number;
    endOffset: number;
    context?: string;
  }>;
}> {
  return [
    {
      type: "summary",
      content:
        'ACA 13 would amend the California Constitution to require that any future ballot initiative seeking to increase voting thresholds (such as requiring a two-thirds majority instead of simple majority) must itself be approved by that same higher threshold. For example, an initiative requiring a two-thirds vote to pass future tax measures would need two-thirds voter approval to pass. The measure also authorizes local governments to hold advisory votes on governance issues, with results that are non-binding.',
      confidence: "high",
      citations: [
        {
          textSpan:
            "an initiative measure that includes one or more provisions that amend the Constitution to increase the voter approval requirement to adopt any state or local measure is approved by the voters only if the proportion of votes cast in favor of the initiative measure is equal to or greater than the highest voter approval requirement",
          startOffset: 0,
          endOffset: 280,
          context:
            "Section 10.5(b) - The core mechanism requiring higher thresholds for threshold-increasing initiatives",
        },
        {
          textSpan:
            "a local governing body may hold an advisory vote concerning any issue of governance",
          startOffset: 0,
          endOffset: 80,
          context: "Section 7.8 - Authorization for advisory votes",
        },
      ],
    },
    {
      type: "fiscal",
      content:
        "ACA 13 has no direct fiscal impact on state or local government. It does not allocate any funds, create new taxes, or require additional spending. The measure is procedural in nature, changing only how certain ballot initiatives are approved. Local governments may incur minimal administrative costs if they choose to conduct advisory votes, but these are optional and entirely at the discretion of local governing bodies.",
      confidence: "high",
      uncertaintyFlags: [
        "Actual costs for advisory votes would depend on frequency chosen by local governments",
      ],
      citations: [
        {
          textSpan:
            "The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body",
          startOffset: 0,
          endOffset: 75,
          context:
            "Section 7.8 - Advisory votes are non-binding, implying they could be skipped without legal consequence",
        },
      ],
    },
    {
      type: "legal_changes",
      content:
        "ACA 13 makes three key changes to the California Constitution: (1) Amends Article II, Section 10 to reference the new voting threshold rules; (2) Adds Article II, Section 10.5 establishing the majority-vote baseline and the higher-threshold requirement for initiatives that would increase voting thresholds; (3) Adds Article XI, Section 7.8 authorizing local advisory votes on governance issues. The measure applies to all statewide initiatives submitted on or after January 1, 2024, and includes an explicit severability clause.",
      confidence: "high",
      citations: [
        {
          textSpan: "Section 10 of Article II thereof is amended",
          startOffset: 0,
          endOffset: 45,
          context: "First Amendment - Modifies existing Section 10",
        },
        {
          textSpan: "Section 10.5 is added to Article II",
          startOffset: 0,
          endOffset: 40,
          context: "Second Amendment - Creates new Section 10.5 with threshold rules",
        },
        {
          textSpan: "Section 7.8 is added to Article XI",
          startOffset: 0,
          endOffset: 38,
          context: "Third Amendment - Creates new Section 7.8 for advisory votes",
        },
        {
          textSpan:
            "This section applies to all statewide initiative measures submitted to the electors on or after January 1, 2024",
          startOffset: 0,
          endOffset: 85,
          context: "Section 10.5(c) - Effective date provision",
        },
        {
          textSpan: "The provisions of this measure are severable",
          startOffset: 0,
          endOffset: 50,
          context: "Fourth - Severability clause",
        },
      ],
    },
    {
      type: "affected_groups",
      content:
        "Directly affected groups include: (1) Voters and advocacy organizations seeking to pass initiatives that would raise voting thresholds for future measures—they would face a higher bar to pass their own measure; (2) Local governments and their residents, as cities and counties gain explicit constitutional authority to conduct advisory votes on governance issues; (3) Businesses and interest groups that may benefit from or oppose higher voting thresholds in future initiatives. The measure explicitly protects existing constitutional provisions from before January 1, 2024, including Proposition 13 (1978).",
      confidence: "medium",
      uncertaintyFlags: [
        "Indirect effects on future initiative campaigns cannot be fully predicted",
      ],
      citations: [
        {
          textSpan:
            "The provisions of this measure are not intended to reverse or invalidate provisions of the Constitution in effect before January 1, 2024, including the provisions of Proposition 13 of 1978",
          startOffset: 0,
          endOffset: 140,
          context: "WHEREAS clause - Grandfathering of existing provisions",
        },
        {
          textSpan:
            "local governing body may hold an advisory vote concerning any issue of governance for the purpose of allowing voters within the jurisdiction to voice their opinions",
          startOffset: 0,
          endOffset: 120,
          context: "Section 7.8 - Local governments gain new authority",
        },
      ],
    },
    {
      type: "conflicts",
      content:
        "Potential conflicts or tensions: (1) Article XVIII, Section 4 of the California Constitution currently governs the initiative process—ACA 13 adds language 'Notwithstanding Section 4 of Article XVIII' to ensure its provisions take precedence; (2) The advisory vote provision (Section 7.8) is permissive, not mandatory, so no conflict with existing local government authority, but could create political pressure on local officials if advisory votes show strong public sentiment contrary to official actions; (3) Courts may need to interpret what constitutes 'increasing the voter approval requirement' in borderline cases.",
      confidence: "medium",
      citations: [
        {
          textSpan:
            "Notwithstanding Section 4 of Article XVIII or any other provision of the Constitution",
          startOffset: 0,
          endOffset: 70,
          context:
            "Section 10.5(b) - Override of conflicting constitutional provisions",
        },
        {
          textSpan:
            "The results of the advisory vote shall in no manner be controlling on the sponsoring local governing body",
          startOffset: 0,
          endOffset: 75,
          context: "Section 7.8 - Non-binding nature prevents direct legal conflicts",
        },
      ],
    },
  ];
}
