/**
 * Field Data Integration — Physical World → Digital Provenance
 *
 * Validates, normalizes, and ingests field inspection data
 * into the ML Material ID provenance chain.
 */

export {
  validateInspection,
  classifyMaterial,
  observationsToContaminationTest,
  ingestInspection,
  batchIngest,
} from "./engine.js";

export type {
  InspectionReport,
  InspectionItem,
  FieldObservations,
  SiteConditions,
  PhotoReference,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  BatchIngestionResult,
} from "./engine.js";
