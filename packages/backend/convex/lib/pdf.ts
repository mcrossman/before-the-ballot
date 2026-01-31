/**
 * PDF text extraction utilities
 * Note: pdf-parse must be installed in packages/backend
 */

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import to handle optional dependency
  try {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return cleanMeasureText(data.text);
  } catch (err) {
    console.error("PDF extraction failed:", err);
    throw new Error(`Failed to extract PDF text: ${err}`);
  }
}

export async function extractPdfTextFallback(buffer: Buffer): Promise<string> {
  // Fallback using pdf2json if pdf-parse fails
  try {
    const PDFParser = (await import("pdf2json")).default;

    return new Promise((resolve, reject) => {
      const parser = new PDFParser();

      parser.on("pdfParser_dataReady", (pdfData) => {
        resolve(cleanMeasureText(pdfData.RawTextContent));
      });

      parser.on("pdfParser_dataError", (err) => {
        reject(new Error(`PDF2JSON error: ${err}`));
      });

      parser.parseBuffer(buffer);
    });
  } catch (err) {
    throw new Error(`Fallback PDF extraction failed: ${err}`);
  }
}

/**
 * Clean extracted measure text
 */
export function cleanMeasureText(rawText: string): string {
  return (
    rawText
      // Normalize multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      // Replace form feeds
      .replace(/\f/g, "\n")
      // Trim whitespace
      .trim()
  );
}
