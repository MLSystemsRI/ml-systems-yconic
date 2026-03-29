/**
 * Field Data Integration Engine
 *
 * Bridge between physical deconstruction operations and the digital
 * ecosystem. Field crews capture material data on-site using structured
 * inspection forms. This engine validates, normalizes, and ingests
 * field observations into the provenance chain.
 *
 * Data flows:
 *   Field crew → InspectionReport → validate → normalize → MaterialRecord
 *
 * This is NOT a database layer — it's the data transformation pipeline
 * between the physical world and the provenance engine.
 */

import type {
  MaterialCategory,
  GradingFactors,
  ContaminationTest,
  MaterialRecord,
} from "../provenance/engine.js";
import {
  generateMaterialId,
  gradeMaterial,
  assessContamination,
  estimateValue,
} from "../provenance/engine.js";
import { materialCategoryToZone } from "../shared/zones.js";

/* ─── Field Inspection Types ─── */

export interface InspectionReport {
  inspectorId: string;
  projectId: string;
  address: string;
  inspectionDate: string;
  items: InspectionItem[];
  siteConditions: SiteConditions;
  photos: PhotoReference[];
}

export interface InspectionItem {
  /** What the field crew sees — free text mapped to category */
  fieldDescription: string;
  /** Optional: crew's best guess at category */
  suggestedCategory?: MaterialCategory;
  /** Location within the structure */
  location: string;
  /** Estimated quantity in board feet */
  estimatedBoardFeet: number;
  /** Weight estimate in pounds */
  estimatedWeightLbs: number;
  /** Dimensions (field-measured) */
  dimensions: { length: number; width: number; depth: number; unit: "in" | "ft" };
  /** Visual assessment scores (0-100) */
  visualStructuralScore: number;
  visualSurfaceScore: number;
  /** Moisture meter reading (%) */
  moistureReading: number;
  /** Whether crew performed a load test */
  loadTested: boolean;
  /** Estimated age */
  estimatedAgeYears: number;
  /** Contamination observations */
  observations: FieldObservations;
}

export interface FieldObservations {
  paintChipping: boolean;
  paintAge: "pre_1978" | "post_1978" | "unknown";
  visibleMold: boolean;
  chemicalOdor: boolean;
  insectDamage: boolean;
  waterStaining: boolean;
  previousRepairs: boolean;
  asbestosLabeled: boolean;
}

export interface SiteConditions {
  weather: "clear" | "rain" | "snow" | "overcast";
  temperature: number;
  humidity: number;
  accessDifficulty: "easy" | "moderate" | "difficult" | "restricted";
  hazardsPresent: string[];
}

export interface PhotoReference {
  filename: string;
  itemIndex: number;
  type: "overview" | "detail" | "damage" | "label";
}

/* ─── Validation ─── */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  itemIndex: number | null;
  message: string;
}

export interface ValidationWarning {
  field: string;
  itemIndex: number | null;
  message: string;
}

/**
 * Validate a field inspection report before ingestion.
 *
 * Checks data quality, completeness, and consistency.
 * Returns errors (block ingestion) and warnings (flag for review).
 */
export function validateInspection(report: InspectionReport): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Report-level validation
  if (!report.inspectorId) {
    errors.push({ field: "inspectorId", itemIndex: null, message: "Inspector ID required" });
  }
  if (!report.projectId) {
    errors.push({ field: "projectId", itemIndex: null, message: "Project ID required" });
  }
  if (!report.inspectionDate) {
    errors.push({ field: "inspectionDate", itemIndex: null, message: "Inspection date required" });
  }
  if (report.items.length === 0) {
    errors.push({ field: "items", itemIndex: null, message: "At least one inspection item required" });
  }

  // Item-level validation
  for (let i = 0; i < report.items.length; i++) {
    const item = report.items[i]!;

    if (!item.fieldDescription) {
      errors.push({ field: "fieldDescription", itemIndex: i, message: "Description required for every item" });
    }

    if (item.estimatedBoardFeet <= 0) {
      errors.push({ field: "estimatedBoardFeet", itemIndex: i, message: "Board feet must be positive" });
    }

    if (item.visualStructuralScore < 0 || item.visualStructuralScore > 100) {
      errors.push({ field: "visualStructuralScore", itemIndex: i, message: "Score must be 0-100" });
    }

    if (item.visualSurfaceScore < 0 || item.visualSurfaceScore > 100) {
      errors.push({ field: "visualSurfaceScore", itemIndex: i, message: "Score must be 0-100" });
    }

    if (item.moistureReading < 0 || item.moistureReading > 100) {
      errors.push({ field: "moistureReading", itemIndex: i, message: "Moisture must be 0-100%" });
    }

    // Warnings for data quality
    if (item.moistureReading > 30) {
      warnings.push({ field: "moistureReading", itemIndex: i, message: "High moisture — verify reading" });
    }

    if (item.observations.paintAge === "pre_1978" && !item.observations.paintChipping) {
      warnings.push({ field: "observations", itemIndex: i, message: "Pre-1978 paint — recommend lead test even without chipping" });
    }

    if (item.estimatedAgeYears > 100) {
      warnings.push({ field: "estimatedAgeYears", itemIndex: i, message: "Age >100 years — verify estimate" });
    }

    if (!item.suggestedCategory) {
      warnings.push({ field: "suggestedCategory", itemIndex: i, message: "No category suggested — will auto-classify" });
    }
  }

  // Photo coverage check
  const itemsWithPhotos = new Set(report.photos.map((p) => p.itemIndex));
  for (let i = 0; i < report.items.length; i++) {
    if (!itemsWithPhotos.has(i)) {
      warnings.push({ field: "photos", itemIndex: i, message: "No photos for this item — recommend documentation" });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/* ─── Category Classification ─── */

/** Keywords → MaterialCategory mapping for auto-classification */
const CATEGORY_KEYWORDS: Record<MaterialCategory, string[]> = {
  structural_lumber: ["joist", "beam", "stud", "rafter", "header", "structural", "framing", "2x4", "2x6", "2x8", "2x10", "2x12"],
  finish_lumber: ["trim", "baseboard", "casing", "molding", "crown", "chair rail", "wainscot", "finish"],
  doors: ["door", "entry", "panel", "slab"],
  windows: ["window", "sash", "pane", "glass", "double-hung", "casement"],
  trim: ["trim", "fascia", "soffit", "cornice"],
  flooring: ["floor", "hardwood", "tile", "laminate", "vinyl", "parquet"],
  fixtures: ["tub", "sink", "toilet", "faucet", "fixture", "bathtub", "shower", "vanity"],
  hardware: ["hardware", "hinge", "knob", "handle", "lock", "bolt", "screw", "bracket", "brass"],
  roofing: ["roof", "shingle", "gutter", "flashing", "ridge"],
  siding: ["siding", "clapboard", "shake", "panel", "vinyl siding"],
  concrete: ["concrete", "cement", "block", "foundation", "footing", "slab", "masonry", "brick"],
  sheathing: ["sheathing", "plywood", "osb", "cdx"],
  drywall: ["drywall", "gypsum", "wallboard", "sheetrock"],
  electrical: ["wire", "outlet", "switch", "panel", "conduit", "electrical", "breaker"],
  plumbing: ["pipe", "copper", "pvc", "drain", "valve", "plumbing", "supply line"],
};

/**
 * Auto-classify a field description into a material category.
 *
 * Uses keyword matching against the description. If no match,
 * falls back to the crew's suggested category.
 */
export function classifyMaterial(
  description: string,
  suggestedCategory?: MaterialCategory,
): { category: MaterialCategory; confidence: "high" | "medium" | "low"; method: "keyword" | "suggested" | "default" } {
  const lower = description.toLowerCase();

  let bestMatch: MaterialCategory | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [MaterialCategory, string[]][]) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return { category: bestMatch, confidence: "high", method: "keyword" };
  }

  if (bestMatch && bestScore === 1) {
    return { category: bestMatch, confidence: "medium", method: "keyword" };
  }

  if (suggestedCategory) {
    return { category: suggestedCategory, confidence: "medium", method: "suggested" };
  }

  return { category: "structural_lumber", confidence: "low", method: "default" };
}

/* ─── Field Observations → Contamination Test ─── */

/**
 * Convert field observations into a structured contamination test.
 *
 * Field crews don't run lab tests — they observe visual indicators.
 * Pre-1978 paint with chipping = assumed lead. Visible mold = mold.
 * Chemical odor = chemical treatment.
 */
export function observationsToContaminationTest(obs: FieldObservations): ContaminationTest {
  return {
    leadPaint: obs.paintAge === "pre_1978" && obs.paintChipping,
    asbestos: obs.asbestosLabeled,
    mold: obs.visibleMold,
    chemicalTreatment: obs.chemicalOdor,
    pestDamage: obs.insectDamage,
  };
}

/* ─── Field Data → Material Records ─── */

/**
 * Ingest a validated field inspection into material records.
 *
 * This is the transformation from field-captured data into
 * provenance-chain-ready MaterialRecords with ML Material IDs,
 * grades, contamination status, and estimated values.
 */
export function ingestInspection(
  report: InspectionReport,
  year: number = 2026,
): { records: MaterialRecord[]; totalValueCents: number; classifications: ReturnType<typeof classifyMaterial>[] } {
  const records: MaterialRecord[] = [];
  const classifications: ReturnType<typeof classifyMaterial>[] = [];
  let totalValueCents = 0;

  for (let i = 0; i < report.items.length; i++) {
    const item = report.items[i]!;

    // Classify material
    const classification = classifyMaterial(item.fieldDescription, item.suggestedCategory);
    classifications.push(classification);

    // Generate ML Material ID
    const zone = materialCategoryToZone(classification.category);
    const mlId = generateMaterialId(year, report.projectId, zone, i + 1);

    // Convert field observations to grading factors
    const gradingFactors: GradingFactors = {
      structuralIntegrity: item.visualStructuralScore,
      surfaceCondition: item.visualSurfaceScore,
      moistureContent: item.moistureReading,
      loadTested: item.loadTested,
      ageYears: item.estimatedAgeYears,
    };

    const grading = gradeMaterial(gradingFactors);

    // Convert observations to contamination test
    const contamTest = observationsToContaminationTest(item.observations);
    const contamResult = assessContamination(contamTest);

    // Estimate value
    const valuation = estimateValue(
      classification.category,
      grading.grade,
      item.estimatedBoardFeet,
      contamResult.status,
    );
    totalValueCents += valuation.valueCents;

    const record: MaterialRecord = {
      mlId,
      projectId: report.projectId,
      zone,
      sequence: i + 1,
      category: classification.category,
      description: item.fieldDescription,
      grade: grading.grade,
      contamination: contamResult.status,
      dimensions: item.dimensions,
      weightLbs: item.estimatedWeightLbs,
      recoveredAt: new Date(report.inspectionDate),
      recoveredBy: report.inspectorId,
      estimatedValue: valuation.valueCents,
      auditTrail: [
        {
          action: "recovered",
          timestamp: new Date(report.inspectionDate),
          actor: report.inspectorId,
          notes: `Field inspection at ${item.location}`,
        },
        {
          action: "graded",
          timestamp: new Date(report.inspectionDate),
          actor: "pi_agent",
          notes: `Auto-graded: ${grading.grade} (${grading.reason}). Category: ${classification.category} (${classification.confidence} confidence via ${classification.method})`,
        },
      ],
    };

    records.push(record);
  }

  return { records, totalValueCents, classifications };
}

/* ─── Batch Processing ─── */

export interface BatchIngestionResult {
  totalReports: number;
  totalItems: number;
  totalRecords: number;
  totalValueCents: number;
  byCategory: Record<string, number>;
  byGrade: Record<string, number>;
  classificationConfidence: { high: number; medium: number; low: number };
  validationIssues: number;
}

/**
 * Process multiple field inspection reports in batch.
 *
 * Used for end-of-day uploads when field crews submit
 * all inspections at once.
 */
export function batchIngest(
  reports: InspectionReport[],
  year: number = 2026,
): BatchIngestionResult {
  const byCategory: Record<string, number> = {};
  const byGrade: Record<string, number> = {};
  const confidence = { high: 0, medium: 0, low: 0 };
  let totalItems = 0;
  let totalRecords = 0;
  let totalValueCents = 0;
  let validationIssues = 0;

  for (const report of reports) {
    const validation = validateInspection(report);
    if (!validation.valid) {
      validationIssues++;
      continue;
    }

    totalItems += report.items.length;
    const result = ingestInspection(report, year);
    totalRecords += result.records.length;
    totalValueCents += result.totalValueCents;

    for (const record of result.records) {
      byCategory[record.category] = (byCategory[record.category] ?? 0) + 1;
      byGrade[record.grade] = (byGrade[record.grade] ?? 0) + 1;
    }

    for (const cls of result.classifications) {
      confidence[cls.confidence]++;
    }
  }

  return {
    totalReports: reports.length,
    totalItems,
    totalRecords,
    totalValueCents,
    byCategory,
    byGrade,
    classificationConfidence: confidence,
    validationIssues,
  };
}

