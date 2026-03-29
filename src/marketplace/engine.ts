/**
 * BOH Marketplace Engine — Secondary Building Materials
 *
 * Recovered materials flow from the provenance engine into marketplace
 * listings. This is the revenue side of the closed loop — materials
 * that would be landfilled are instead graded, priced, and sold.
 *
 * The marketplace uses 10 zone-based categories matching the
 * deconstruction zones:
 * Z1: Kitchen | Z2: Lumber | Z3: Doors/Windows/Trim
 * Z4: Sheathing/Drywall | Z5: Flooring/Fixtures | Z6: Hardware/Metals
 * Z7: Concrete | Z8: Roofing/Siding | Gear | Bundles
 *
 * Pricing is transparent: base price × grade × category × condition.
 * Every listing links back to its ML Material ID for provenance.
 */

import type {
  MaterialRecord,
  MaterialGrade,
  MaterialCategory,
  ContaminationStatus,
} from "../provenance/engine.js";
import { estimateValue } from "../provenance/engine.js";

/* ─── Marketplace Types ─── */

export type ListingStatus = "draft" | "active" | "reserved" | "sold" | "withdrawn";

export type MarketplaceZone =
  | "kitchen"
  | "lumber"
  | "doors_windows_trim"
  | "sheathing_drywall"
  | "flooring_fixtures"
  | "hardware_metals"
  | "concrete"
  | "roofing_siding"
  | "gear"
  | "bundles";

export interface Listing {
  id: string;
  mlId: string;
  title: string;
  description: string;
  zone: MarketplaceZone;
  category: MaterialCategory;
  grade: MaterialGrade;
  contamination: ContaminationStatus;
  priceCents: number;
  boardFeet: number;
  status: ListingStatus;
  projectId: string;
  createdAt: Date;
  soldAt: Date | null;
}

export interface Order {
  id: string;
  listingIds: string[];
  buyerId: string;
  totalCents: number;
  status: "pending" | "confirmed" | "picked_up" | "cancelled";
  createdAt: Date;
}

/* ─── Zone Mapping ─── */

const CATEGORY_TO_ZONE: Record<MaterialCategory, MarketplaceZone> = {
  structural_lumber: "lumber",
  finish_lumber: "lumber",
  doors: "doors_windows_trim",
  windows: "doors_windows_trim",
  trim: "doors_windows_trim",
  flooring: "flooring_fixtures",
  fixtures: "flooring_fixtures",
  hardware: "hardware_metals",
  roofing: "roofing_siding",
  siding: "roofing_siding",
  concrete: "concrete",
  sheathing: "sheathing_drywall",
  drywall: "sheathing_drywall",
  electrical: "hardware_metals",
  plumbing: "hardware_metals",
};

/**
 * Map a material category to its marketplace zone.
 */
export function categoryToZone(category: MaterialCategory): MarketplaceZone {
  return CATEGORY_TO_ZONE[category];
}

/* ─── Listing Creation ─── */

let listingCounter = 0;

/**
 * Create a marketplace listing from a recovered material.
 *
 * Pricing comes from the provenance engine's estimateValue function.
 * The listing links back to the ML Material ID so buyers can
 * trace the full chain of custody.
 */
export function createListing(material: MaterialRecord, boardFeet: number): Listing {
  const valuation = estimateValue(
    material.category,
    material.grade,
    boardFeet,
    material.contamination,
  );

  return {
    id: `LST-${++listingCounter}`,
    mlId: material.mlId,
    title: `${material.grade}-Grade ${formatCategory(material.category)}`,
    description: material.description,
    zone: categoryToZone(material.category),
    category: material.category,
    grade: material.grade,
    contamination: material.contamination,
    priceCents: valuation.valueCents,
    boardFeet,
    status: "draft",
    projectId: material.projectId,
    createdAt: new Date(),
    soldAt: null,
  };
}

/**
 * Create listings for all materials in a batch.
 * Skips materials with confirmed contamination that haven't been remediated.
 */
export function createBatchListings(
  materials: MaterialRecord[],
  boardFeetPerMaterial: number,
): { listings: Listing[]; skipped: string[]; totalValueCents: number } {
  const listings: Listing[] = [];
  const skipped: string[] = [];
  let totalValueCents = 0;

  for (const material of materials) {
    if (material.contamination === "confirmed") {
      skipped.push(material.mlId);
      continue;
    }

    const listing = createListing(material, boardFeetPerMaterial);
    listings.push(listing);
    totalValueCents += listing.priceCents;
  }

  return { listings, skipped, totalValueCents };
}

/* ─── Order Processing ─── */

let orderCounter = 0;

/**
 * Create an order from selected listings.
 * Validates all listings are active before creating the order.
 */
export function createOrder(
  listings: Listing[],
  buyerId: string,
): { order: Order | null; error: string | null } {
  const unavailable = listings.filter((l) => l.status !== "active");
  if (unavailable.length > 0) {
    return {
      order: null,
      error: `Listings not available: ${unavailable.map((l) => l.id).join(", ")}`,
    };
  }

  const totalCents = listings.reduce((sum, l) => sum + l.priceCents, 0);

  const order: Order = {
    id: `ORD-${++orderCounter}`,
    listingIds: listings.map((l) => l.id),
    buyerId,
    totalCents,
    status: "pending",
    createdAt: new Date(),
  };

  /* Mark listings as reserved */
  for (const listing of listings) {
    listing.status = "reserved";
  }

  return { order, error: null };
}

/**
 * Confirm an order — marks listings as sold.
 */
export function confirmOrder(order: Order, listings: Listing[]): void {
  order.status = "confirmed";
  const now = new Date();
  for (const listing of listings) {
    if (order.listingIds.includes(listing.id)) {
      listing.status = "sold";
      listing.soldAt = now;
    }
  }
}

/* ─── Marketplace Analytics ─── */

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalRevenueCents: number;
  averagePriceCents: number;
  byZone: Record<string, number>;
  byGrade: Record<MaterialGrade, number>;
  inventoryValueCents: number;
}

/**
 * Calculate marketplace statistics from all listings.
 */
export function calculateMarketplaceStats(listings: Listing[]): MarketplaceStats {
  const byZone: Record<string, number> = {};
  const byGrade: Record<MaterialGrade, number> = { A: 0, B: 0, C: 0, D: 0, salvage: 0 };
  let totalRevenueCents = 0;
  let activeCount = 0;
  let soldCount = 0;
  let inventoryValueCents = 0;

  for (const listing of listings) {
    byZone[listing.zone] = (byZone[listing.zone] ?? 0) + 1;
    byGrade[listing.grade]++;

    if (listing.status === "sold") {
      soldCount++;
      totalRevenueCents += listing.priceCents;
    }
    if (listing.status === "active") {
      activeCount++;
      inventoryValueCents += listing.priceCents;
    }
  }

  return {
    totalListings: listings.length,
    activeListings: activeCount,
    soldListings: soldCount,
    totalRevenueCents,
    averagePriceCents:
      listings.length > 0 ? Math.round(totalRevenueCents / Math.max(soldCount, 1)) : 0,
    byZone,
    byGrade,
    inventoryValueCents,
  };
}

/* ─── Revenue Integration ─── */

/**
 * Calculate the material recovery revenue contribution to RCM equity.
 *
 * This is the closed-loop connection: recovered materials sold through
 * BOH generate revenue that contributes to the homeowner's equity
 * position in the RCM calculation.
 *
 * materialRecoveryValue in rcmEquity() comes from here.
 */
export function materialRecoveryEquityContribution(
  soldListings: Listing[],
  revenueSharePercent: number = 0.51,
): { totalRevenueCents: number; equityContributionCents: number; listingCount: number } {
  const sold = soldListings.filter((l) => l.status === "sold");
  const totalRevenueCents = sold.reduce((sum, l) => sum + l.priceCents, 0);
  const equityContributionCents = Math.round(totalRevenueCents * revenueSharePercent);

  return {
    totalRevenueCents,
    equityContributionCents,
    listingCount: sold.length,
  };
}

/* ─── Helpers ─── */

function formatCategory(category: MaterialCategory): string {
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
