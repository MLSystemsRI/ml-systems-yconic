import { describe, it, expect } from "vitest";
import { processTTPRequest } from "./middleware.js";
import type { TTPRequest } from "./middleware.js";

function makeReq(overrides: Partial<TTPRequest> = {}): TTPRequest {
  return {
    path: "/api/v1/materials",
    userAgent: "Mozilla/5.0 Chrome/120",
    apiTier: "starter",
    isRegulator: false,
    ...overrides,
  };
}

describe("processTTPRequest", () => {
  it("allows standard requests with correct headers", () => {
    const result = processTTPRequest(makeReq());
    expect(result.allowed).toBe(true);
    expect(result.score).toBe(15);
    expect(result.band).toBe("ml_verified");
    expect(result.headers["X-TT-Score"]).toBe("15");
    expect(result.headers["X-TT-Band"]).toBe("ml_verified");
    expect(result.headers["X-TT-Protocol"]).toBe("Transparency Trust Protocol v2");
  });

  it("detects AI crawlers and applies fees", () => {
    const result = processTTPRequest(makeReq({ userAgent: "GPTBot/1.0" }));
    expect(result.allowed).toBe(true);
    expect(result.feeCents).toBe(5); // ml_verified band = 5¢
    expect(result.headers["X-TT-Verification-Fee"]).toBe("5¢");
  });

  it("no fee for non-AI requests", () => {
    const result = processTTPRequest(makeReq());
    expect(result.feeCents).toBe(0);
    expect(result.headers["X-TT-Verification-Fee"]).toBeUndefined();
  });

  it("uses pre-computed TT score when provided", () => {
    const result = processTTPRequest(makeReq({ ttScore: 75 }));
    expect(result.score).toBe(75);
    expect(result.band).toBe("double_verified");
  });

  it("blocks regulators from non-compliance endpoints on free tier", () => {
    const result = processTTPRequest(
      makeReq({
        isRegulator: true,
        apiTier: "free",
        path: "/api/v1/marketplace/listings",
      }),
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("compliance scope");
    expect(result.headers["X-TT-Regulator-Scope"]).toBe("compliance");
  });

  it("allows regulators on compliance endpoints", () => {
    const result = processTTPRequest(
      makeReq({
        isRegulator: true,
        apiTier: "free",
        path: "/api/v1/materials/provenance",
      }),
    );
    expect(result.allowed).toBe(true);
  });

  it("allows pro-tier regulators on any endpoint", () => {
    const result = processTTPRequest(
      makeReq({
        isRegulator: true,
        apiTier: "pro",
        path: "/api/v1/internal/anything",
      }),
    );
    expect(result.allowed).toBe(true);
  });

  it("enterprise tier gets highest quick score", () => {
    const result = processTTPRequest(makeReq({ apiTier: "enterprise" }));
    expect(result.score).toBe(50);
    expect(result.band).toBe("full_api");
  });

  it("handles null user agent gracefully", () => {
    const result = processTTPRequest(makeReq({ userAgent: null }));
    expect(result.allowed).toBe(true);
    expect(result.feeCents).toBe(0);
  });
});
