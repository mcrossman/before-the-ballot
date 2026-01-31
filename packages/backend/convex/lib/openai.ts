/**
 * OpenAI client configuration
 *
 * Uses "use node" directive because OpenAI SDK requires Node.js runtime
 */

"use node";

import OpenAI from "openai";

let client: OpenAI | null = null;

/**
 * Get configured OpenAI client
 * Lazily initializes to avoid issues during module load
 */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

// Model configuration - using GPT 5.2 as specified
export const MODEL = "gpt-5.2" as const;
export const PROMPT_VERSION = "v1" as const;
