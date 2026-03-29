/**
 * ML Provenance — Material Identity & Chain of Custody
 *
 * Every recovered material gets an ML Material ID, a grade,
 * a contamination assessment, and a valuation. This is the
 * physical data layer that feeds the marketplace and RCM equity.
 */

export {
  generateMaterialId,
  parseMaterialId,
  gradeMaterial,
  assessContamination,
  estimateValue,
  generateRecoveryReport,
  generateDEMExport,
} from "./engine.js";

export type {
  MaterialCategory,
  MaterialGrade,
  ContaminationStatus,
  MaterialRecord,
  AuditEntry,
  GradingFactors,
  ContaminationTest,
  RecoveryReport,
  DEMExportRecord,
} from "./engine.js";
