/**
 * Multi-format content extraction for ballot measure documents
 *
 * Supports:
 * - PDF files (via pdf-parse)
 * - Markdown files (raw text)
 * - HTML web pages (tag stripping)
 */

"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// Types
export interface ContentMetadata {
  sourceType: "pdf" | "markdown" | "html";
  title?: string;
  author?: string;
  extractedAt: string;
}

export interface ExtractionStats {
  pageCount: number;
  wordCount: number;
  charCount: number;
}

export interface ExtractionResult {
  fullText: string;
  pages: string[];
  metadata: ContentMetadata;
  stats: ExtractionStats;
  textHash: string;
}

/**
 * Detect content type from URL and response headers
 */
async function detectContentType(
  url: string
): Promise<"pdf" | "markdown" | "html"> {
  // Check URL extension first
  const urlLower = url.toLowerCase();
  if (urlLower.endsWith(".pdf")) return "pdf";
  if (urlLower.endsWith(".md") || urlLower.endsWith(".markdown"))
    return "markdown";

  // HEAD request to check Content-Type
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/pdf")) return "pdf";
    if (
      contentType.includes("text/markdown") ||
      contentType.includes("text/x-markdown")
    )
      return "markdown";
    if (contentType.includes("text/plain")) {
      // Could be markdown served as plain text (e.g., raw GitHub)
      if (url.includes("raw.githubusercontent.com")) return "markdown";
      return "html"; // Default to HTML processing for plain text
    }
  } catch {
    // If HEAD fails, we'll detect from content
  }

  // Default to HTML
  return "html";
}

/**
 * Extract content from PDF
 */
async function extractPdf(url: string): Promise<ExtractionResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const pdfParse = await import("pdf-parse");

  const pages: string[] = [];
  const options: any = {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((textContent: any) => {
        const text = textContent.items.map((item: any) => item.str).join(" ");
        pages.push(cleanText(text));
        return text;
      });
    },
  };

  const data = await pdfParse.default(buffer, options);

  const fullText = pages.join("\n\n--- Page Break ---\n\n");
  const textHash = crypto.createHash("sha256").update(fullText).digest("hex");

  return {
    fullText,
    pages,
    metadata: {
      sourceType: "pdf",
      title: data.info?.Title,
      author: data.info?.Author,
      extractedAt: new Date().toISOString(),
    },
    stats: {
      pageCount: data.numpages || pages.length,
      wordCount: fullText.split(/\s+/).filter((w) => w.length > 0).length,
      charCount: fullText.length,
    },
    textHash,
  };
}

/**
 * Extract content from Markdown
 */
async function extractMarkdown(url: string): Promise<ExtractionResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: HTTP ${response.status}`);
  }

  const text = await response.text();
  const fullText = cleanText(text);
  const textHash = crypto.createHash("sha256").update(fullText).digest("hex");

  // Extract title from first heading if present
  const titleMatch = fullText.match(/^#\s+(.+)$/m);

  return {
    fullText,
    pages: [fullText], // Single "page" for markdown
    metadata: {
      sourceType: "markdown",
      title: titleMatch?.[1],
      extractedAt: new Date().toISOString(),
    },
    stats: {
      pageCount: 1,
      wordCount: fullText.split(/\s+/).filter((w) => w.length > 0).length,
      charCount: fullText.length,
    },
    textHash,
  };
}

/**
 * Extract content from HTML
 */
async function extractHtml(url: string): Promise<ExtractionResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML: HTTP ${response.status}`);
  }

  const html = await response.text();

  // Extract title from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  // Strip HTML and extract text
  const fullText = stripHtml(html);
  const textHash = crypto.createHash("sha256").update(fullText).digest("hex");

  return {
    fullText,
    pages: [fullText], // Single "page" for HTML
    metadata: {
      sourceType: "html",
      title: titleMatch?.[1]?.trim(),
      extractedAt: new Date().toISOString(),
    },
    stats: {
      pageCount: 1,
      wordCount: fullText.split(/\s+/).filter((w) => w.length > 0).length,
      charCount: fullText.length,
    },
    textHash,
  };
}

/**
 * Strip HTML tags and extract readable text
 */
function stripHtml(html: string): string {
  let text = html;

  // Remove script and style blocks
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Add spacing for block elements
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br)[^>]*>/gi, "\n");
  text = text.replace(/<(br|hr)[^>]*\/?>/gi, "\n");

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  return cleanText(text);
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return result;
}

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
    .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace
    .replace(/\f/g, "") // Remove form feeds
    .trim();
}

/**
 * Unified content extraction action
 * Auto-detects format (PDF, Markdown, HTML) and extracts text
 */
export const extractContent = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args): Promise<ExtractionResult> => {
    const contentType = await detectContentType(args.url);

    switch (contentType) {
      case "pdf":
        return extractPdf(args.url);
      case "markdown":
        return extractMarkdown(args.url);
      case "html":
        return extractHtml(args.url);
    }
  },
});
