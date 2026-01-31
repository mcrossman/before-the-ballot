/**
 * PDF text extraction action using Node.js libraries
 * 
 * This file MUST use the "use node" directive because pdf-parse
 * and crypto require Node.js APIs (fs, crypto, etc.)
 * 
 * Exported as internalAction so scrapers can call it via ctx.runAction
 */

"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// Types for full extraction result
export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pdfVersion?: string;
}

export interface ExtractionStats {
  pageCount: number;
  wordCount: number;
  charCount: number;
}

export interface FullExtractionResult {
  fullText: string;
  pages: string[];
  metadata: PdfMetadata;
  stats: ExtractionStats;
  textHash: string;
}

/**
 * Fetch and extract full content from PDF
 */
async function fetchAndExtractFull(url: string): Promise<FullExtractionResult> {
  // Fetch PDF
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const pdfParse = await import("pdf-parse");
  
  // Extract with page callback to get per-page text
  const pages: string[] = [];
  let options: any = {
    pagerender: (pageData: any) => {
      return pageData.getTextContent()
        .then((textContent: any) => {
          const text = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          pages.push(cleanPageText(text));
          return text;
        });
    }
  };
  
  const data = await pdfParse.default(buffer, options);

  // Build full text from pages (ensures consistency)
  const fullText = pages.join("\n\n--- Page Break ---\n\n");
  
  // Calculate hash from full text
  const textHash = crypto.createHash("sha256").update(fullText).digest("hex");

  // Extract metadata
  const metadata: PdfMetadata = {
    title: data.info?.Title,
    author: data.info?.Author,
    subject: data.info?.Subject,
    keywords: data.info?.Keywords,
    creator: data.info?.Creator,
    producer: data.info?.Producer,
    creationDate: data.info?.CreationDate,
    modificationDate: data.info?.ModDate,
    pdfVersion: data.version,
  };

  // Calculate statistics
  const stats: ExtractionStats = {
    pageCount: data.numpages || pages.length,
    wordCount: fullText.split(/\s+/).filter(w => w.length > 0).length,
    charCount: fullText.length,
  };

  return {
    fullText,
    pages,
    metadata,
    stats,
    textHash,
  };
}

/**
 * Extract all text content from PDF with full structure preservation
 * Called by scrapers to comprehensively process PDF content
 */
export const extractPdfFull = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args): Promise<FullExtractionResult> => {
    return fetchAndExtractFull(args.url);
  },
});

/**
 * Extract text from PDF and calculate hash (Legacy - for backward compatibility)
 * Called by scrapers to process PDF content
 */
export const extractPdfText = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args): Promise<{ text: string; textHash: string }> => {
    // Use full extraction but return legacy format
    const result = await fetchAndExtractFull(args.url);
    return {
      text: result.fullText,
      textHash: result.textHash,
    };
  },
});

/**
 * Clean individual page text
 */
function cleanPageText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")        // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")    // Normalize multiple newlines
    .replace(/\f/g, "")            // Remove form feeds
    .trim();
}
