/**
 * PDF utilities - simplified version that stores URLs without parsing
 * Note: PDF text extraction would require "use node" directive
 */

export interface PdfMetadata {
  url: string;
  contentType: string | null;
  contentLength: number | null;
  lastModified: string | null;
}

export async function fetchPdfMetadata(url: string): Promise<PdfMetadata> {
  const response = await fetch(url, { method: "HEAD" });
  
  return {
    url,
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length") 
      ? parseInt(response.headers.get("content-length")!, 10) 
      : null,
    lastModified: response.headers.get("last-modified"),
  };
}

/**
 * Placeholder for future PDF text extraction
 * Would require "use node" directive and libraries like pdf-parse
 */
export async function extractPdfText(_buffer: Buffer): Promise<string> {
  throw new Error(
    "PDF text extraction requires Node.js runtime. " +
    "Add 'use node' directive to use pdf-parse library."
  );
}
