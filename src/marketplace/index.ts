/**
 * BOH Marketplace — Secondary Building Materials
 *
 * Recovered materials from the provenance engine become marketplace
 * listings. Zone-based categorization, provenance-linked pricing,
 * order processing, and revenue integration with RCM equity.
 */

export {
  categoryToZone,
  createListing,
  createBatchListings,
  createOrder,
  confirmOrder,
  calculateMarketplaceStats,
  materialRecoveryEquityContribution,
} from "./engine.js";

export type { ListingStatus, MarketplaceZone, Listing, Order, MarketplaceStats } from "./engine.js";
