/**
 * TTP Middleware — HTTP request/response pipeline for Transparency Trust Protocol
 *
 * Attaches X-TT-Score, X-TT-Band, X-TT-Protocol headers to every API response.
 * Detects AI crawlers and applies per-query verification fees.
 * Enforces regulator scoped access on free/starter tiers.
 *
 * Framework-agnostic: works with any HTTP handler that provides
 * request headers and a way to set response headers.
 */

import type { ApiTier, AccessBand } from "./types.js";
import {
  getAccessBand,
  quickScoreFromTier,
  regulatorCanAccess,
  getVerificationFeeCents,
  transparencyHeaders,
} from "./transparency.js";
import { isAiCrawler } from "./ai-crawler.js";

/** Minimal request interface — framework-agnostic */
export interface TTPRequest {
  path: string;
  userAgent: string | null;
  apiTier: ApiTier;
  isRegulator: boolean;
  ttScore?: number;
}

/** TTP middleware result — headers to attach + access decision */
export interface TTPResult {
  allowed: boolean;
  score: number;
  band: AccessBand;
  headers: Record<string, string>;
  feeCents: number;
  reason?: string;
}

/**
 * Process a request through the TTP pipeline.
 *
 * Pipeline:
 * 1. Determine transparency score (pre-computed or quick from tier)
 * 2. Resolve access band
 * 3. Check AI crawler status → apply per-query fees
 * 4. Check regulator scope → enforce endpoint restrictions
 * 5. Generate response headers
 */
export function processTTPRequest(req: TTPRequest): TTPResult {
  // 1. Score
  const score = req.ttScore ?? quickScoreFromTier(req.apiTier, req.isRegulator);

  // 2. Band
  const band = getAccessBand(score);

  // 3. AI crawler detection + fees
  const isCrawler = isAiCrawler(req.userAgent);
  const feeCents = getVerificationFeeCents(band, isCrawler);

  // 4. Regulator scope check
  if (req.isRegulator && !regulatorCanAccess(req.path, req.apiTier)) {
    const headers = transparencyHeaders(score, { regulatorScoped: true });
    return {
      allowed: false,
      score,
      band,
      headers,
      feeCents: 0,
      reason: "Endpoint outside regulator compliance scope. Upgrade tier for full access.",
    };
  }

  // 5. Headers
  const headers = transparencyHeaders(score, {
    verificationFeeCents: feeCents > 0 ? feeCents : undefined,
    regulatorScoped: req.isRegulator,
  });

  return { allowed: true, score, band, headers, feeCents };
}
