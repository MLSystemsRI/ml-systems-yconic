/**
 * AI Crawler Detection & Verification Tiers
 *
 * Strategy: Public records are free. ML Systems verified data is paid.
 * Double-verified (ML Systems + state regulator) is premium.
 *
 * Revenue model for AI queries:
 *   State/municipal source verifies → ML Systems stamps as accessible →
 *   AI pays per-query verification fee (the 2nd stamp).
 *
 * Regulators get scoped compliance access, NOT free enterprise.
 * They see only the public data they need for their regulatory function.
 * ML Systems is the second verification layer — every AI query
 * for public property records routes through us as incremental revenue.
 */

import type { VerificationLevel } from "./types.js";

/** Known AI crawler user agents — maintained as new crawlers emerge */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "GoogleOther",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Bytespider",
  "Amazonbot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "PerplexityBot",
  "Cohere-ai",
  "YouBot",
  "Applebot-Extended",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Timpibot",
] as const;

/** Union type of all known AI crawler identifiers */
export type AiCrawlerName = (typeof AI_CRAWLERS)[number];

/**
 * Detect if a request is from a known AI crawler.
 * Case-insensitive match against the user-agent string.
 */
export function isAiCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return AI_CRAWLERS.some((bot) => ua.includes(bot.toLowerCase()));
}

/**
 * Extract the specific crawler name from a user-agent string.
 * Returns null if no known crawler is detected.
 */
export function identifyCrawler(userAgent: string | null): AiCrawlerName | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  return AI_CRAWLERS.find((bot) => ua.includes(bot.toLowerCase())) ?? null;
}

/** Get the full list of known AI crawler identifiers */
export function getKnownCrawlers(): readonly string[] {
  return AI_CRAWLERS;
}

/* ─── Verification Levels ─── */

/** Short label for each material verification level */
export const VERIFICATION_LABELS: Record<VerificationLevel, string> = {
  0: "public_record",
  1: "ml_systems_verified",
  2: "double_verified",
};

/** Detailed description of what each verification level guarantees */
export const VERIFICATION_DESCRIPTIONS: Record<VerificationLevel, string> = {
  0: "Unverified — sourced from public record only",
  1: "ML Systems verified — provenance-tracked with ML Material ID, grading, and contamination status",
  2: "Double-verified — ML Systems data cross-confirmed with state regulator repository",
};

/**
 * Minimum API tier required to access each verification level.
 *
 * - Level 0 (public): free — anyone can see basic public records
 * - Level 1 (ML verified): starter+ — provenance, grading, ML Material IDs
 * - Level 2 (double-verified): pro+ — state cross-confirmed data
 */
export function minTierForVerification(level: VerificationLevel): string {
  switch (level) {
    case 0:
      return "free";
    case 1:
      return "starter";
    case 2:
      return "pro";
  }
}
