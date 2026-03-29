/**
 * ML Systems Database Schema — Type Definitions
 *
 * The full Drizzle ORM schema (30+ tables) lives in the monorepo at
 * packages/db/src/schema.ts. This module exports the table name constants
 * and relationship types used by the TTP engine and other consumers.
 *
 * Tables are organized by neural net node:
 *
 * CORE:     users, apiKeys, tokenTransactions
 * ML1:      deconSessions, materials, materialProvenance
 * ML2:      designSessions, planStacks
 * ML3:      projects, properties, zones, tasks, dailyLogs
 * FA:       loans, loanPayments, rcmSchedules, loanPits, loanBids
 * AE:       employees, annualReviews, payrollRuns
 * TTP:      ttScores, ttScoreHistory
 * BOH:      storeListings, storeOrders, storeOrderItems
 * CR:       crProperties, crDancers, crSubsidies
 */

/** Neural net layer assignment for RBAC */
export type NeuralNetLayer =
  | "ML1"
  | "ML2"
  | "ML3" // Physical Net
  | "LM"
  | "FA"
  | "AE" // Financial Net
  | "EV"
  | "CR"
  | "GW"; // Dance Net

/** User roles — determines which neural net nodes a user can access */
export type UserRole =
  | "client"
  | "crew"
  | "manager"
  | "admin"
  | "partner_lender"
  | "sponsor"
  | "state_agency"
  | "architect"
  | "seller";

/** Project lifecycle status — maps to the closed loop phases */
export type ProjectStatus =
  | "lead"
  | "loan_origination"
  | "deconstruction"
  | "construction"
  | "complete"
  | "resold";

/** Material category — zone-based classification from deconstruction */
export type MaterialCategory =
  | "structural"
  | "electrical"
  | "plumbing"
  | "finish"
  | "roofing"
  | "other";

/** Material grade — quality assessment after recovery */
export type MaterialGrade = "A" | "B" | "C" | "D" | "salvage";

/** Contamination status — DEM compliance requirement */
export type ContaminationStatus = "clean" | "suspected" | "confirmed" | "remediated";

/** Loan types — RCM is the novel product, others for comparison */
export type LoanType = "RCM" | "conventional" | "bridge";

/** Pit status — reverse auction lifecycle for construction loans */
export type PitStatus = "open" | "awarded" | "expired" | "cancelled";

/** TTP access bands — derived from transparency score */
export type TTAccessBand =
  | "public_record"
  | "ml_verified"
  | "full_api"
  | "double_verified"
  | "ontology_licensed";

/** All table names in the ML Systems schema */
export const TABLE_NAMES = [
  // Core
  "users",
  "apiKeys",
  "tokenTransactions",
  // ML1 — Deconstruction
  "deconSessions",
  "materials",
  "materialProvenance",
  // ML2 — Design
  "designSessions",
  "planStacks",
  // ML3 — Build
  "projects",
  "properties",
  "zones",
  "tasks",
  "dailyLogs",
  // FA — Finance
  "loans",
  "loanPayments",
  "rcmSchedules",
  "loanPits",
  "loanBids",
  "partnerLenders",
  "pitSubsidies",
  // AE — Accounting
  "employees",
  "annualReviews",
  "payrollRuns",
  // TTP
  "ttScores",
  "ttScoreHistory",
  // BOH — Marketplace
  "storeListings",
  "storeOrders",
  "storeOrderItems",
  // CR — Healthcare
  "crProperties",
  "crDancers",
  "crSubsidies",
] as const;

export type TableName = (typeof TABLE_NAMES)[number];

/** Validate that a string is a known table name */
export function isValidTable(name: string): name is TableName {
  return (TABLE_NAMES as readonly string[]).includes(name);
}
