import { describe, it, expect } from "vitest";
import {
  isAiCrawler,
  identifyCrawler,
  getKnownCrawlers,
  minTierForVerification,
  VERIFICATION_LABELS,
  VERIFICATION_DESCRIPTIONS,
} from "./ai-crawler.js";

/* ─── isAiCrawler ─── */

describe("isAiCrawler", () => {
  it("returns false for null user agent", () => {
    expect(isAiCrawler(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isAiCrawler("")).toBe(false);
  });

  it("returns false for standard browser user agents", () => {
    expect(
      isAiCrawler(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });

  it("detects GPTBot", () => {
    expect(isAiCrawler("Mozilla/5.0 GPTBot/1.0")).toBe(true);
  });

  it("detects ClaudeBot", () => {
    expect(isAiCrawler("ClaudeBot/1.0")).toBe(true);
  });

  it("detects PerplexityBot", () => {
    expect(isAiCrawler("Mozilla/5.0 PerplexityBot/1.0")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAiCrawler("gptbot")).toBe(true);
    expect(isAiCrawler("GPTBOT")).toBe(true);
    expect(isAiCrawler("GpTbOt")).toBe(true);
  });

  it("detects crawlers embedded in longer user agent strings", () => {
    expect(isAiCrawler("Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)")).toBe(
      true,
    );
  });

  it("returns false for Googlebot (standard, not AI)", () => {
    expect(isAiCrawler("Googlebot/2.1")).toBe(false);
  });

  it("detects Google-Extended (AI training)", () => {
    expect(isAiCrawler("Google-Extended")).toBe(true);
  });

  it("detects all known crawlers", () => {
    const crawlers = getKnownCrawlers();
    for (const crawler of crawlers) {
      expect(isAiCrawler(crawler)).toBe(true);
    }
  });
});

/* ─── identifyCrawler ─── */

describe("identifyCrawler", () => {
  it("returns null for non-crawler user agents", () => {
    expect(identifyCrawler(null)).toBeNull();
    expect(identifyCrawler("Mozilla/5.0 Chrome/120")).toBeNull();
  });

  it("returns the specific crawler name", () => {
    expect(identifyCrawler("GPTBot/1.0")).toBe("GPTBot");
    expect(identifyCrawler("ClaudeBot/1.0")).toBe("ClaudeBot");
    expect(identifyCrawler("PerplexityBot")).toBe("PerplexityBot");
  });

  it("returns first match for ambiguous strings", () => {
    const result = identifyCrawler("GPTBot ClaudeBot");
    expect(result).toBe("GPTBot");
  });
});

/* ─── getKnownCrawlers ─── */

describe("getKnownCrawlers", () => {
  it("returns a non-empty readonly array", () => {
    const crawlers = getKnownCrawlers();
    expect(crawlers.length).toBeGreaterThan(0);
  });

  it("includes major AI providers", () => {
    const crawlers = getKnownCrawlers();
    expect(crawlers).toContain("GPTBot");
    expect(crawlers).toContain("ClaudeBot");
    expect(crawlers).toContain("Amazonbot");
  });
});

/* ─── minTierForVerification ─── */

describe("minTierForVerification", () => {
  it("maps level 0 to free", () => {
    expect(minTierForVerification(0)).toBe("free");
  });

  it("maps level 1 to starter", () => {
    expect(minTierForVerification(1)).toBe("starter");
  });

  it("maps level 2 to pro", () => {
    expect(minTierForVerification(2)).toBe("pro");
  });
});

/* ─── Verification constants ─── */

describe("verification constants", () => {
  it("has labels for all 3 verification levels", () => {
    expect(Object.keys(VERIFICATION_LABELS)).toHaveLength(3);
    expect(VERIFICATION_LABELS[0]).toBe("public_record");
    expect(VERIFICATION_LABELS[1]).toBe("ml_systems_verified");
    expect(VERIFICATION_LABELS[2]).toBe("double_verified");
  });

  it("has descriptions for all 3 verification levels", () => {
    expect(Object.keys(VERIFICATION_DESCRIPTIONS)).toHaveLength(3);
    for (const level of [0, 1, 2] as const) {
      expect(VERIFICATION_DESCRIPTIONS[level].length).toBeGreaterThan(0);
    }
  });
});
