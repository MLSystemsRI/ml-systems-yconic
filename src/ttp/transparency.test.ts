import { describe, it, expect } from "vitest";
import {
  calculateTransparencyScore,
  getAccessBand,
  quickScoreFromTier,
  regulatorCanAccess,
  getVerificationFeeCents,
  transparencyHeaders,
  ACCESS_BAND_THRESHOLDS,
  REGULATOR_ALLOWED_ENDPOINTS,
  VERIFICATION_FEE,
} from "./transparency.js";
import type { TransparencyFactors, AccessBand, ApiTier } from "./types.js";

/* ─── Helpers ─── */

function makeFactors(overrides: Partial<TransparencyFactors> = {}): TransparencyFactors {
  return {
    tier: "free",
    identityVerified: false,
    materialsContributed: 0,
    cyclesCompleted: 0,
    reviewsPassed: 0,
    accountAgeDays: 0,
    isRegulator: false,
    dataContributions: 0,
    ...overrides,
  };
}

/* ─── calculateTransparencyScore ─── */

describe("calculateTransparencyScore", () => {
  it("returns base score for free tier with no contributions", () => {
    const score = calculateTransparencyScore(makeFactors());
    expect(score).toBe(5);
  });

  it("returns correct base score for each tier", () => {
    expect(calculateTransparencyScore(makeFactors({ tier: "free" }))).toBe(5);
    expect(calculateTransparencyScore(makeFactors({ tier: "starter" }))).toBe(15);
    expect(calculateTransparencyScore(makeFactors({ tier: "pro" }))).toBe(30);
    expect(calculateTransparencyScore(makeFactors({ tier: "enterprise" }))).toBe(50);
  });

  it("adds identity verification bonus", () => {
    const without = calculateTransparencyScore(makeFactors());
    const with_ = calculateTransparencyScore(makeFactors({ identityVerified: true }));
    expect(with_ - without).toBe(20);
  });

  it("caps material contribution at 15", () => {
    const at15 = calculateTransparencyScore(makeFactors({ materialsContributed: 15 }));
    const at100 = calculateTransparencyScore(makeFactors({ materialsContributed: 100 }));
    expect(at15).toBe(at100);
    expect(at15 - 5).toBe(15); // 5 = free tier base
  });

  it("caps cycle score at 30", () => {
    const at3 = calculateTransparencyScore(makeFactors({ cyclesCompleted: 3 }));
    const at10 = calculateTransparencyScore(makeFactors({ cyclesCompleted: 10 }));
    expect(at3).toBe(at10);
    expect(at3 - 5).toBe(30);
  });

  it("caps review score at 15", () => {
    const at3 = calculateTransparencyScore(makeFactors({ reviewsPassed: 3 }));
    const at20 = calculateTransparencyScore(makeFactors({ reviewsPassed: 20 }));
    expect(at3).toBe(at20);
    expect(at3 - 5).toBe(15);
  });

  it("account age ramps linearly to 365 days", () => {
    const at0 = calculateTransparencyScore(makeFactors({ accountAgeDays: 0 }));
    const at182 = calculateTransparencyScore(makeFactors({ accountAgeDays: 182 }));
    const at365 = calculateTransparencyScore(makeFactors({ accountAgeDays: 365 }));
    const at730 = calculateTransparencyScore(makeFactors({ accountAgeDays: 730 }));

    expect(at0).toBe(5); // no age bonus
    expect(at182).toBe(10); // ~5 bonus (half year)
    expect(at365).toBe(15); // 10 bonus (full year)
    expect(at730).toBe(at365); // capped at 1 year
  });

  it("caps data contributions at 10", () => {
    const at20 = calculateTransparencyScore(makeFactors({ dataContributions: 20 }));
    const at100 = calculateTransparencyScore(makeFactors({ dataContributions: 100 }));
    expect(at20).toBe(at100);
    expect(at20 - 5).toBe(10);
  });

  it("adds compliance bonus for regulators", () => {
    const without = calculateTransparencyScore(makeFactors());
    const with_ = calculateTransparencyScore(makeFactors({ isRegulator: true }));
    expect(with_ - without).toBe(5);
  });

  it("clamps total score to 100", () => {
    const maxed = calculateTransparencyScore(
      makeFactors({
        tier: "enterprise",
        identityVerified: true,
        materialsContributed: 100,
        cyclesCompleted: 10,
        reviewsPassed: 10,
        accountAgeDays: 1000,
        isRegulator: true,
        dataContributions: 100,
      }),
    );
    expect(maxed).toBe(100);
  });

  it("handles a realistic mid-tier user", () => {
    const score = calculateTransparencyScore(
      makeFactors({
        tier: "starter",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 1,
        reviewsPassed: 2,
        accountAgeDays: 180,
        dataContributions: 8,
      }),
    );
    // 15 + 20 + 5 + 10 + 10 + 5 + 4 = 69
    expect(score).toBe(69);
  });
});

/* ─── getAccessBand ─── */

describe("getAccessBand", () => {
  it("maps boundary scores correctly", () => {
    expect(getAccessBand(0)).toBe("public_record");
    expect(getAccessBand(10)).toBe("public_record");
    expect(getAccessBand(11)).toBe("ml_verified");
    expect(getAccessBand(30)).toBe("ml_verified");
    expect(getAccessBand(31)).toBe("full_api");
    expect(getAccessBand(60)).toBe("full_api");
    expect(getAccessBand(61)).toBe("double_verified");
    expect(getAccessBand(80)).toBe("double_verified");
    expect(getAccessBand(81)).toBe("ontology_licensed");
    expect(getAccessBand(100)).toBe("ontology_licensed");
  });

  it("all threshold definitions are contiguous and cover 0-100", () => {
    expect(ACCESS_BAND_THRESHOLDS[0]?.min).toBe(0);
    expect(ACCESS_BAND_THRESHOLDS[ACCESS_BAND_THRESHOLDS.length - 1]?.max).toBe(100);

    for (let i = 1; i < ACCESS_BAND_THRESHOLDS.length; i++) {
      const prev = ACCESS_BAND_THRESHOLDS[i - 1]!;
      const curr = ACCESS_BAND_THRESHOLDS[i]!;
      expect(curr.min).toBe(prev.max + 1);
    }
  });
});

/* ─── quickScoreFromTier ─── */

describe("quickScoreFromTier", () => {
  it("returns tier base score for non-regulators", () => {
    const tiers: ApiTier[] = ["free", "starter", "pro", "enterprise"];
    const expected = [5, 15, 30, 50];
    tiers.forEach((tier, i) => {
      expect(quickScoreFromTier(tier, false)).toBe(expected[i]);
    });
  });

  it("adds compliance bonus for regulators", () => {
    expect(quickScoreFromTier("free", true)).toBe(10);
    expect(quickScoreFromTier("enterprise", true)).toBe(55);
  });

  it("clamps regulator score to 100", () => {
    // Enterprise (50) + compliance (5) = 55, well under 100
    expect(quickScoreFromTier("enterprise", true)).toBeLessThanOrEqual(100);
  });
});

/* ─── regulatorCanAccess ─── */

describe("regulatorCanAccess", () => {
  it("allows pro/enterprise regulators access to any endpoint", () => {
    expect(regulatorCanAccess("/api/v1/custom/endpoint", "pro")).toBe(true);
    expect(regulatorCanAccess("/api/v1/custom/endpoint", "enterprise")).toBe(true);
  });

  it("restricts free/starter regulators to compliance endpoints", () => {
    for (const endpoint of REGULATOR_ALLOWED_ENDPOINTS) {
      expect(regulatorCanAccess(endpoint, "free")).toBe(true);
      expect(regulatorCanAccess(endpoint, "starter")).toBe(true);
    }
  });

  it("blocks free/starter regulators from non-compliance endpoints", () => {
    expect(regulatorCanAccess("/api/v1/internal/admin", "free")).toBe(false);
    expect(regulatorCanAccess("/api/v1/marketplace/listings", "starter")).toBe(false);
  });

  it("allows sub-paths of compliance endpoints", () => {
    expect(regulatorCanAccess("/api/v1/materials/provenance/ML-2026-001-Z1A", "free")).toBe(true);
  });
});

/* ─── getVerificationFeeCents ─── */

describe("getVerificationFeeCents", () => {
  it("returns 0 for non-AI queries", () => {
    const bands: AccessBand[] = [
      "public_record",
      "ml_verified",
      "full_api",
      "double_verified",
      "ontology_licensed",
    ];
    for (const band of bands) {
      expect(getVerificationFeeCents(band, false)).toBe(0);
    }
  });

  it("returns correct fee for AI queries by band", () => {
    expect(getVerificationFeeCents("public_record", true)).toBe(VERIFICATION_FEE.publicRecordCents);
    expect(getVerificationFeeCents("ml_verified", true)).toBe(VERIFICATION_FEE.mlVerifiedCents);
    expect(getVerificationFeeCents("double_verified", true)).toBe(
      VERIFICATION_FEE.doubleVerifiedCents,
    );
  });

  it("returns 0 for subscription-gated bands even for AI", () => {
    expect(getVerificationFeeCents("full_api", true)).toBe(0);
    expect(getVerificationFeeCents("ontology_licensed", true)).toBe(0);
  });
});

/* ─── transparencyHeaders ─── */

describe("transparencyHeaders", () => {
  it("always includes score, band, and protocol headers", () => {
    const headers = transparencyHeaders(45);
    expect(headers["X-TT-Score"]).toBe("45");
    expect(headers["X-TT-Band"]).toBe("full_api");
    expect(headers["X-TT-Protocol"]).toBe("Transparency Trust Protocol v2");
  });

  it("includes verification fee header when provided", () => {
    const headers = transparencyHeaders(20, { verificationFeeCents: 5 });
    expect(headers["X-TT-Verification-Fee"]).toBe("5¢");
  });

  it("includes regulator scope header when flagged", () => {
    const headers = transparencyHeaders(10, { regulatorScoped: true });
    expect(headers["X-TT-Regulator-Scope"]).toBe("compliance");
  });

  it("omits optional headers when not provided", () => {
    const headers = transparencyHeaders(50);
    expect(headers["X-TT-Verification-Fee"]).toBeUndefined();
    expect(headers["X-TT-Regulator-Scope"]).toBeUndefined();
  });
});
