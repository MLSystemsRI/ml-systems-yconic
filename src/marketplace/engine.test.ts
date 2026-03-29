import { describe, it, expect } from "vitest";
import {
  categoryToZone,
  createListing,
  createBatchListings,
  createOrder,
  confirmOrder,
  calculateMarketplaceStats,
  materialRecoveryEquityContribution,
} from "./engine.js";
import type { MaterialRecord } from "../provenance/engine.js";
import type { Listing } from "./engine.js";

/* ─── Fixtures ─── */

function makeMaterial(overrides: Partial<MaterialRecord> = {}): MaterialRecord {
  return {
    mlId: "ML-2026-PRV001-Z2-001",
    projectId: "PRV001",
    zone: 2,
    sequence: 1,
    category: "structural_lumber",
    description: "2x6 stud, 8ft, Douglas Fir",
    grade: "B",
    contamination: "clean",
    dimensions: { length: 96, width: 5.5, depth: 1.5, unit: "in" },
    weightLbs: 16,
    recoveredAt: new Date(),
    recoveredBy: "crew-001",
    estimatedValue: 1625,
    auditTrail: [],
    ...overrides,
  };
}

/* ─── Zone Mapping ─── */

describe("categoryToZone", () => {
  it("maps structural lumber to lumber zone", () => {
    expect(categoryToZone("structural_lumber")).toBe("lumber");
  });

  it("maps doors to doors_windows_trim zone", () => {
    expect(categoryToZone("doors")).toBe("doors_windows_trim");
  });

  it("maps flooring to flooring_fixtures zone", () => {
    expect(categoryToZone("flooring")).toBe("flooring_fixtures");
  });

  it("maps electrical to hardware_metals zone", () => {
    expect(categoryToZone("electrical")).toBe("hardware_metals");
  });

  it("maps roofing to roofing_siding zone", () => {
    expect(categoryToZone("roofing")).toBe("roofing_siding");
  });
});

/* ─── Listing Creation ─── */

describe("createListing", () => {
  it("creates a listing from a material record", () => {
    const listing = createListing(makeMaterial(), 50);

    expect(listing.mlId).toBe("ML-2026-PRV001-Z2-001");
    expect(listing.zone).toBe("lumber");
    expect(listing.grade).toBe("B");
    expect(listing.status).toBe("draft");
    expect(listing.priceCents).toBeGreaterThan(0);
    expect(listing.boardFeet).toBe(50);
    expect(listing.title).toContain("B-Grade");
  });

  it("prices based on grade and category", () => {
    const gradeA = createListing(makeMaterial({ grade: "A" }), 50);
    const gradeC = createListing(makeMaterial({ grade: "C" }), 50);
    expect(gradeA.priceCents).toBeGreaterThan(gradeC.priceCents);
  });

  it("discounts contaminated materials", () => {
    const clean = createListing(makeMaterial({ contamination: "clean" }), 50);
    const suspected = createListing(makeMaterial({ contamination: "suspected" }), 50);
    expect(suspected.priceCents).toBeLessThan(clean.priceCents);
  });
});

describe("createBatchListings", () => {
  it("creates listings for all clean materials", () => {
    const materials = [
      makeMaterial({ mlId: "ML-2026-PRV001-Z2-001" }),
      makeMaterial({ mlId: "ML-2026-PRV001-Z2-002" }),
      makeMaterial({ mlId: "ML-2026-PRV001-Z2-003" }),
    ];

    const { listings, skipped, totalValueCents } = createBatchListings(materials, 40);
    expect(listings).toHaveLength(3);
    expect(skipped).toHaveLength(0);
    expect(totalValueCents).toBeGreaterThan(0);
  });

  it("skips materials with confirmed contamination", () => {
    const materials = [
      makeMaterial({ mlId: "ML-2026-PRV001-Z2-001", contamination: "clean" }),
      makeMaterial({ mlId: "ML-2026-PRV001-Z2-002", contamination: "confirmed" }),
    ];

    const { listings, skipped } = createBatchListings(materials, 40);
    expect(listings).toHaveLength(1);
    expect(skipped).toContain("ML-2026-PRV001-Z2-002");
  });

  it("allows remediated materials", () => {
    const materials = [makeMaterial({ contamination: "remediated" })];
    const { listings } = createBatchListings(materials, 40);
    expect(listings).toHaveLength(1);
  });
});

/* ─── Order Processing ─── */

describe("createOrder", () => {
  it("creates an order from active listings", () => {
    const listings: Listing[] = [
      { ...createListing(makeMaterial(), 50), status: "active" },
      { ...createListing(makeMaterial({ mlId: "ML-2026-PRV001-Z2-002" }), 30), status: "active" },
    ];

    const { order, error } = createOrder(listings, "buyer-001");
    expect(error).toBeNull();
    expect(order).not.toBeNull();
    expect(order!.listingIds).toHaveLength(2);
    expect(order!.totalCents).toBeGreaterThan(0);
    expect(order!.status).toBe("pending");
  });

  it("rejects order with unavailable listings", () => {
    const listings: Listing[] = [{ ...createListing(makeMaterial(), 50), status: "draft" }];

    const { order, error } = createOrder(listings, "buyer-001");
    expect(order).toBeNull();
    expect(error).toContain("not available");
  });

  it("marks listings as reserved", () => {
    const listing: Listing = { ...createListing(makeMaterial(), 50), status: "active" };
    createOrder([listing], "buyer-001");
    expect(listing.status).toBe("reserved");
  });
});

describe("confirmOrder", () => {
  it("marks listings as sold with timestamp", () => {
    const listing: Listing = { ...createListing(makeMaterial(), 50), status: "active" };
    const { order } = createOrder([listing], "buyer-001");

    confirmOrder(order!, [listing]);
    expect(order!.status).toBe("confirmed");
    expect(listing.status).toBe("sold");
    expect(listing.soldAt).toBeInstanceOf(Date);
  });
});

/* ─── Marketplace Analytics ─── */

describe("calculateMarketplaceStats", () => {
  it("calculates stats from listings", () => {
    const listings: Listing[] = [
      { ...createListing(makeMaterial({ grade: "A" }), 50), status: "active" },
      { ...createListing(makeMaterial({ grade: "B" }), 40), status: "sold", priceCents: 5000 },
      { ...createListing(makeMaterial({ grade: "C" }), 30), status: "sold", priceCents: 3000 },
    ];

    const stats = calculateMarketplaceStats(listings);
    expect(stats.totalListings).toBe(3);
    expect(stats.activeListings).toBe(1);
    expect(stats.soldListings).toBe(2);
    expect(stats.totalRevenueCents).toBe(8000);
    expect(stats.byGrade.A).toBe(1);
    expect(stats.byGrade.B).toBe(1);
  });

  it("handles empty listings", () => {
    const stats = calculateMarketplaceStats([]);
    expect(stats.totalListings).toBe(0);
    expect(stats.averagePriceCents).toBe(0);
  });
});

/* ─── Revenue Integration ─── */

describe("materialRecoveryEquityContribution", () => {
  it("calculates equity contribution at 51% revenue share", () => {
    const listings: Listing[] = [
      { ...createListing(makeMaterial(), 50), status: "sold", priceCents: 10000 },
      { ...createListing(makeMaterial(), 30), status: "sold", priceCents: 6000 },
    ];

    const result = materialRecoveryEquityContribution(listings);
    expect(result.totalRevenueCents).toBe(16000);
    expect(result.equityContributionCents).toBe(8160); // 16000 × 0.51
    expect(result.listingCount).toBe(2);
  });

  it("ignores non-sold listings", () => {
    const listings: Listing[] = [
      { ...createListing(makeMaterial(), 50), status: "active", priceCents: 10000 },
      { ...createListing(makeMaterial(), 30), status: "sold", priceCents: 6000 },
    ];

    const result = materialRecoveryEquityContribution(listings);
    expect(result.totalRevenueCents).toBe(6000);
    expect(result.listingCount).toBe(1);
  });

  it("supports custom revenue share percentage", () => {
    const listings: Listing[] = [
      { ...createListing(makeMaterial(), 50), status: "sold", priceCents: 10000 },
    ];

    const result = materialRecoveryEquityContribution(listings, 0.75);
    expect(result.equityContributionCents).toBe(7500);
  });
});
