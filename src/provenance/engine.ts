/**
 * ML Provenance Engine — Material Identity & Chain of Custody
 *
 * Every recovered material in the ML Systems ecosystem gets:
 * 1. A unique ML Material ID (ML-{year}-{project}-{zone}{seq})
 * 2. A grade (A/B/C/D/salvage) based on structural integrity
 * 3. A contamination status (clean/suspected/confirmed/remediated)
 * 4. An audit trail from recovery through sale
 *
 * This is the physical data layer. When a house is deconstructed,
 * materials flow through this engine before reaching the marketplace.
 * The provenance chain is what makes secondary materials trustworthy —
 * without it, recovered lumber is just "used wood."
 *
 * DEM (Department of Environmental Management) compliance requires
 * contamination tracking on every material. This is structural, not optional.
 */

/* ─── Material Identity ─── */

export type MaterialCategory =
  | "structural_lumber"
  | "finish_lumber"
  | "doors"
  | "windows"
  | "trim"
  | "flooring"
  | "fixtures"
  | "hardware"
  | "roofing"
  | "siding"
  | "concrete"
  | "sheathing"
  | "drywall"
  | "electrical"
  | "plumbing";

export type MaterialGrade = "A" | "B" | "C" | "D" | "salvage";

export type ContaminationStatus = "clean" | "suspected" | "confirmed" | "remediated";

export interface MaterialRecord {
  mlId: string;
  projectId: string;
  zone: number;
  sequence: number;
  category: MaterialCategory;
  description: string;
  grade: MaterialGrade;
  contamination: ContaminationStatus;
  dimensions: { length: number; width: number; depth: number; unit: "in" | "ft" };
  weightLbs: number;
  recoveredAt: Date;
  recoveredBy: string;
  estimatedValue: number;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  action: "recovered" | "graded" | "tested" | "listed" | "sold" | "exported";
  timestamp: Date;
  actor: string;
  notes: string;
}

/* ─── ML Material ID Generation ─── */

/**
 * Generate an ML Material ID.
 *
 * Format: ML-{year}-{projectId}-{zone}{sequence}
 * Example: ML-2026-PRV001-Z3-042
 *
 * The ID encodes provenance: you can read where and when
 * the material was recovered just from the identifier.
 */
export function generateMaterialId(
  year: number,
  projectId: string,
  zone: number,
  sequence: number,
): string {
  const seq = String(sequence).padStart(3, "0");
  return `ML-${year}-${projectId}-Z${zone}-${seq}`;
}

/**
 * Parse an ML Material ID back into its components.
 * Returns null if the format is invalid.
 */
export function parseMaterialId(
  mlId: string,
): { year: number; projectId: string; zone: number; sequence: number } | null {
  const match = mlId.match(/^ML-(\d{4})-([A-Z0-9]+)-Z(\d+)-(\d{3})$/);
  if (!match) return null;
  return {
    year: parseInt(match[1]!, 10),
    projectId: match[2]!,
    zone: parseInt(match[3]!, 10),
    sequence: parseInt(match[4]!, 10),
  };
}

/* ─── Material Grading ─── */

export interface GradingFactors {
  /** Structural integrity (0-100) */
  structuralIntegrity: number;
  /** Surface condition (0-100) */
  surfaceCondition: number;
  /** Moisture content percentage (lower is better for wood) */
  moistureContent: number;
  /** Whether the material has been load-tested */
  loadTested: boolean;
  /** Age of the material in years */
  ageYears: number;
}

/**
 * Grade a material based on physical assessment factors.
 *
 * Grading rules:
 * - A: Structural integrity ≥ 90, surface ≥ 80, moisture < 15%, load-tested
 * - B: Structural integrity ≥ 75, surface ≥ 60, moisture < 20%
 * - C: Structural integrity ≥ 50, surface ≥ 40
 * - D: Structural integrity ≥ 25
 * - Salvage: Below all thresholds — still has material value
 */
export function gradeMaterial(factors: GradingFactors): {
  grade: MaterialGrade;
  score: number;
  reason: string;
} {
  const score =
    factors.structuralIntegrity * 0.4 +
    factors.surfaceCondition * 0.3 +
    Math.max(0, 100 - factors.moistureContent * 5) * 0.15 +
    (factors.loadTested ? 10 : 0) +
    Math.max(0, 5 - factors.ageYears * 0.1);

  if (
    factors.structuralIntegrity >= 90 &&
    factors.surfaceCondition >= 80 &&
    factors.moistureContent < 15 &&
    factors.loadTested
  ) {
    return { grade: "A", score, reason: "Premium grade — structural, tested, dry" };
  }

  if (
    factors.structuralIntegrity >= 75 &&
    factors.surfaceCondition >= 60 &&
    factors.moistureContent < 20
  ) {
    return { grade: "B", score, reason: "Standard grade — good structural integrity" };
  }

  if (factors.structuralIntegrity >= 50 && factors.surfaceCondition >= 40) {
    return { grade: "C", score, reason: "Utility grade — functional, cosmetic issues" };
  }

  if (factors.structuralIntegrity >= 25) {
    return { grade: "D", score, reason: "Below standard — limited structural use" };
  }

  return { grade: "salvage", score, reason: "Salvage only — material value, not structural" };
}

/* ─── Contamination Assessment ─── */

export interface ContaminationTest {
  leadPaint: boolean;
  asbestos: boolean;
  mold: boolean;
  chemicalTreatment: boolean;
  pestDamage: boolean;
}

/**
 * Assess contamination status based on test results.
 *
 * DEM requires tracking contamination on every material.
 * Materials with confirmed contamination can still be sold
 * but must be labeled and may require remediation first.
 */
export function assessContamination(test: ContaminationTest): {
  status: ContaminationStatus;
  hazards: string[];
  requiresRemediation: boolean;
  demReportRequired: boolean;
} {
  const hazards: string[] = [];
  if (test.leadPaint) hazards.push("lead_paint");
  if (test.asbestos) hazards.push("asbestos");
  if (test.mold) hazards.push("mold");
  if (test.chemicalTreatment) hazards.push("chemical_treatment");
  if (test.pestDamage) hazards.push("pest_damage");

  if (hazards.length === 0) {
    return { status: "clean", hazards, requiresRemediation: false, demReportRequired: false };
  }

  /* Asbestos and lead always require DEM reporting */
  const demReportRequired = test.asbestos || test.leadPaint;

  /* Asbestos requires mandatory remediation before any use */
  const requiresRemediation = test.asbestos || (test.leadPaint && test.mold);

  return {
    status: requiresRemediation ? "confirmed" : "suspected",
    hazards,
    requiresRemediation,
    demReportRequired,
  };
}

/* ─── Material Valuation ─── */

/** Base price per board-foot by category and grade (USD) */
const BASE_PRICES: Record<MaterialGrade, number> = {
  A: 4.5,
  B: 3.25,
  C: 2.0,
  D: 1.0,
  salvage: 0.25,
};

/** Category multiplier — some materials are worth more */
const CATEGORY_MULTIPLIERS: Record<MaterialCategory, number> = {
  structural_lumber: 1.0,
  finish_lumber: 1.4,
  doors: 2.5,
  windows: 3.0,
  trim: 1.2,
  flooring: 1.8,
  fixtures: 2.0,
  hardware: 1.5,
  roofing: 0.8,
  siding: 0.9,
  concrete: 0.3,
  sheathing: 0.6,
  drywall: 0.4,
  electrical: 1.3,
  plumbing: 1.6,
};

/**
 * Estimate the market value of a recovered material.
 *
 * Value = basePricePerBoardFoot × boardFeet × categoryMultiplier × gradeDiscount
 *
 * Contaminated materials are discounted further.
 * This pricing feeds the BOH marketplace listings.
 */
export function estimateValue(
  category: MaterialCategory,
  grade: MaterialGrade,
  boardFeet: number,
  contamination: ContaminationStatus,
): { valueCents: number; pricePerBoardFoot: number; discount: number } {
  const basePrice = BASE_PRICES[grade];
  const categoryMult = CATEGORY_MULTIPLIERS[category];

  let discount = 1.0;
  if (contamination === "suspected") discount = 0.7;
  else if (contamination === "confirmed") discount = 0.3;
  else if (contamination === "remediated") discount = 0.85;

  const pricePerBoardFoot = basePrice * categoryMult * discount;
  const valueCents = Math.round(pricePerBoardFoot * boardFeet * 100);

  return { valueCents, pricePerBoardFoot, discount };
}

import { createGradeCounter, safeRatio } from "../shared/math.js";

/* ─── Recovery Metrics ─── */

export interface RecoveryReport {
  projectId: string;
  totalMaterials: number;
  byGrade: Record<MaterialGrade, number>;
  byCategory: Record<string, number>;
  totalValueCents: number;
  recoveryRate: number;
  cleanRate: number;
  averageGradeScore: number;
}

/**
 * Generate a recovery report for a project's materials.
 *
 * This is the data that feeds the disruption engine's material
 * recovery multiplier and the RCM equity calculation
 * (material recovery value = additional equity).
 */
export function generateRecoveryReport(
  projectId: string,
  materials: MaterialRecord[],
  totalBuildingMaterials: number,
): RecoveryReport {
  const byGrade = createGradeCounter();
  const byCategory: Record<string, number> = {};
  let totalValueCents = 0;
  let cleanCount = 0;

  for (const mat of materials) {
    byGrade[mat.grade]++;
    byCategory[mat.category] = (byCategory[mat.category] ?? 0) + 1;
    totalValueCents += mat.estimatedValue;
    if (mat.contamination === "clean") cleanCount++;
  }

  return {
    projectId,
    totalMaterials: materials.length,
    byGrade,
    byCategory,
    totalValueCents,
    recoveryRate: safeRatio(materials.length, totalBuildingMaterials),
    cleanRate: safeRatio(cleanCount, materials.length),
    averageGradeScore: 0,
  };
}

/* ─── DEM Export ─── */

export interface DEMExportRecord {
  mlId: string;
  projectId: string;
  category: string;
  contamination: ContaminationStatus;
  hazards: string[];
  remediationRequired: boolean;
  exportDate: string;
}

/**
 * Generate DEM-compliant export records for contaminated materials.
 *
 * Rhode Island DEM requires reporting on any material with
 * suspected or confirmed contamination. This export format
 * matches DEM's intake requirements.
 */
export function generateDEMExport(
  materials: MaterialRecord[],
  contaminationTests: Map<string, ContaminationTest>,
): DEMExportRecord[] {
  const records: DEMExportRecord[] = [];

  for (const mat of materials) {
    if (mat.contamination === "clean") continue;

    const test = contaminationTests.get(mat.mlId);
    const assessment = test
      ? assessContamination(test)
      : { hazards: [], requiresRemediation: false };

    records.push({
      mlId: mat.mlId,
      projectId: mat.projectId,
      category: mat.category,
      contamination: mat.contamination,
      hazards: assessment.hazards,
      remediationRequired: assessment.requiresRemediation,
      exportDate: new Date().toISOString().split("T")[0]!,
    });
  }

  return records;
}
