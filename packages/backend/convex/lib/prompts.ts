/**
 * Prompt templates for ballot measure insight generation
 *
 * Each prompt instructs the LLM to analyze a specific aspect of the measure
 * and return structured JSON with citations referencing exact text spans.
 */

// Types for structured output
export interface Citation {
  textSpan: string;
  startOffset: number;
  endOffset: number;
  context?: string;
}

export interface InsightResponse {
  content: string;
  confidence: "high" | "medium" | "low";
  uncertaintyFlags?: string[];
  citations: Citation[];
}

export type InsightType =
  | "summary"
  | "fiscal"
  | "legal_changes"
  | "affected_groups"
  | "conflicts";

/**
 * Shared citation format instructions appended to all prompts
 */
const CITATION_FORMAT = `

## REQUIRED OUTPUT FORMAT
You MUST return valid JSON matching this exact schema:
{
  "content": "<your analysis as a single string, using [1], [2] etc. for inline citation references>",
  "confidence": "high" | "medium" | "low",
  "uncertaintyFlags": ["<optional list of things you are uncertain about>"],
  "citations": [
    {
      "textSpan": "<exact verbatim quote from the source text>",
      "startOffset": <0-based character index where textSpan starts in source>,
      "endOffset": <character index one past the last char of textSpan>,
      "context": "<optional: surrounding sentence for disambiguation>"
    }
  ]
}

## CITATION RULES - CRITICAL
1. Every factual claim MUST have a citation reference [1], [2], etc.
2. textSpan must be an EXACT copy-paste substring of the source text - no paraphrasing or modifications
3. startOffset is the 0-based character index where textSpan FIRST appears in the source text
4. endOffset = startOffset + length(textSpan)
5. If the same text appears multiple times, use the occurrence most relevant to your claim
6. Number citations sequentially [1], [2], [3], etc. in your content
7. Keep textSpan reasonably short (1-3 sentences max) but include enough context to be meaningful
8. If you cannot find exact text to cite, note it in uncertaintyFlags

Return ONLY the JSON object, no markdown code blocks or other text.
`;

/**
 * Build summary prompt
 */
export function buildSummaryPrompt(measureText: string): string {
  return `You are an expert nonpartisan policy analyst. Analyze the following ballot measure text and produce a clear, plain-language summary that helps voters understand what this measure does.

## YOUR TASK
Write a concise summary (2-4 paragraphs) that explains:
1. What this measure would do if passed
2. The key provisions and mechanisms
3. Who proposed it and why (if mentioned)

Be objective and factual. Do not advocate for or against the measure.

## SOURCE TEXT
${measureText}
${CITATION_FORMAT}`;
}

/**
 * Build fiscal impact prompt
 */
export function buildFiscalPrompt(measureText: string): string {
  return `You are an expert fiscal analyst specializing in government budgets. Analyze the following ballot measure text for its financial and budgetary implications.

## YOUR TASK
Identify and explain:
1. Any direct costs to government (state, county, city)
2. Revenue changes (new taxes, fees, or revenue sources)
3. Bond issuances and debt obligations
4. Estimated annual or total costs
5. Who pays and who benefits financially

If fiscal information is limited or unclear, note this in uncertaintyFlags.

## SOURCE TEXT
${measureText}
${CITATION_FORMAT}`;
}

/**
 * Build legal changes prompt
 */
export function buildLegalChangesPrompt(measureText: string): string {
  return `You are a legal expert specializing in statutory and constitutional analysis. Analyze the following ballot measure text to identify all legal changes it would enact.

## YOUR TASK
Identify and explain:
1. Specific statutes, codes, or constitutional sections being amended
2. New legal provisions being created
3. Existing laws being repealed or modified
4. Regulatory authority being granted or removed
5. Enforcement mechanisms and penalties

Be precise about section numbers and legal references when cited in the text.

## SOURCE TEXT
${measureText}
${CITATION_FORMAT}`;
}

/**
 * Build affected groups prompt
 */
export function buildAffectedGroupsPrompt(measureText: string): string {
  return `You are a policy impact analyst. Analyze the following ballot measure text to identify all groups that would be materially affected if this measure passes.

## YOUR TASK
Identify and explain impacts on:
1. Population groups (demographics, income levels, professions)
2. Industries and businesses
3. Government agencies
4. Nonprofit organizations
5. Geographic communities

For each group, explain HOW they would be affected (positively, negatively, or mixed).

## SOURCE TEXT
${measureText}
${CITATION_FORMAT}`;
}

/**
 * Build conflicts prompt
 */
export function buildConflictsPrompt(measureText: string): string {
  return `You are a legal and policy analyst specializing in identifying problems in legislation. Analyze the following ballot measure text for internal issues.

## YOUR TASK
Identify any:
1. Internal contradictions within the measure
2. Ambiguous or vague language that could cause implementation problems
3. Potential conflicts with existing state or federal law
4. Unintended consequences that seem likely
5. Missing definitions or unclear terms

If you find no significant issues, state that clearly. Do not manufacture problems that don't exist.

## SOURCE TEXT
${measureText}
${CITATION_FORMAT}`;
}

/**
 * Map of insight types to their prompt builders
 */
export const PROMPTS: Record<InsightType, (text: string) => string> = {
  summary: buildSummaryPrompt,
  fiscal: buildFiscalPrompt,
  legal_changes: buildLegalChangesPrompt,
  affected_groups: buildAffectedGroupsPrompt,
  conflicts: buildConflictsPrompt,
};

/**
 * Get all insight types in the order they should be generated
 */
export const INSIGHT_TYPES: InsightType[] = [
  "summary",
  "fiscal",
  "legal_changes",
  "affected_groups",
  "conflicts",
];
