/**
 * Field Data Integration Tests
 *
 * Tests validation, classification, contamination mapping,
 * ingestion, and batch processing of field inspection data.
 */

import { describe, it, expect } from "vitest";
import {
  validateInspection,
  classifyMaterial,
  observationsToContaminationTest,
  ingestInspection,
  batchIngest,
} from "./engine.js";
import type { InspectionReport, InspectionItem, FieldObservations } from "./engine.js";

/* ─── Test Fixtures ─── */

function makeObservations(overrides: Partial<FieldObservations> = {}): FieldObservations {
  return {
    paintChipping: false,
    paintAge: "post_1978",
    visibleMold: false,
    chemicalOdor: false,
    insectDamage: false,
    waterStaining: false,
    previousRepairs: false,
    asbestosLabeled: false,
    ...overrides,
  };
}

function makeItem(overrides: Partial<InspectionItem> = {}): InspectionItem {
  return {
    fieldDescription: "2x6 Douglas Fir joist, good condition",
    location: "First floor, south wall",
    estimatedBoardFeet: 120,
    estimatedWeightLbs: 160,
    dimensions: { length: 12, width: 6, depth: 2, unit: "in" as const },
    visualStructuralScore: 82,
    visualSurfaceScore: 68,
    moistureReading: 14,
    loadTested: false,
    estimatedAgeYears: 35,
    observations: makeObservations(),
    ...overrides,
  };
}

function makeReport(overrides: Partial<InspectionReport> = {}): InspectionReport {
  return {
    inspectorId: "inspector_001",
    projectId: "PRV001",
    address: "123 Hope St, Providence RI 02906",
    inspectionDate: "2026-03-29",
    items: [makeItem()],
    siteConditions: {
      weather: "clear",
      temperature: 55,
      humidity: 45,
      accessDifficulty: "easy",
      hazardsPresent: [],
    },
    photos: [{ filename: "item_0_overview.jpg", itemIndex: 0, type: "overview" }],
    ...overrides,
  };
}

/* ─── Validation ─── */

describe("Field Data — Validation", () => {
  it("validates a complete report", () => {
    const result = validateInspection(makeReport());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects missing inspector ID", () => {
    const result = validateInspection(makeReport({ inspectorId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "inspectorId")).toBe(true);
  });

  it("rejects missing project ID", () => {
    const result = validateInspection(makeReport({ projectId: "" }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "projectId")).toBe(true);
  });

  it("rejects empty items", () => {
    const result = validateInspection(makeReport({ items: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "items")).toBe(true);
  });

  it("rejects item with zero board feet", () => {
    const result = validateInspection(makeReport({ items: [makeItem({ estimatedBoardFeet: 0 })] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "estimatedBoardFeet")).toBe(true);
  });

  it("rejects out-of-range structural score", () => {
    const result = validateInspection(makeReport({ items: [makeItem({ visualStructuralScore: 150 })] }));
    expect(result.valid).toBe(false);
  });

  it("warns on high moisture reading", () => {
    const result = validateInspection(makeReport({ items: [makeItem({ moistureReading: 35 })] }));
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.field === "moistureReading")).toBe(true);
  });

  it("warns on pre-1978 paint without chipping", () => {
    const item = makeItem({
      observations: makeObservations({ paintAge: "pre_1978", paintChipping: false }),
    });
    const result = validateInspection(makeReport({ items: [item] }));
    expect(result.warnings.some((w) => w.message.includes("lead test"))).toBe(true);
  });

  it("warns on missing photos", () => {
    const result = validateInspection(makeReport({ photos: [] }));
    expect(result.warnings.some((w) => w.field === "photos")).toBe(true);
  });

  it("warns on age > 100 years", () => {
    const result = validateInspection(makeReport({
      items: [makeItem({ estimatedAgeYears: 120 })],
    }));
    expect(result.warnings.some((w) => w.field === "estimatedAgeYears")).toBe(true);
  });
});

/* ─── Classification ─── */

describe("Field Data — Material Classification", () => {
  it("classifies joist as structural lumber (high confidence)", () => {
    const result = classifyMaterial("2x6 Douglas Fir joist, structural framing");
    expect(result.category).toBe("structural_lumber");
    expect(result.confidence).toBe("high");
    expect(result.method).toBe("keyword");
  });

  it("classifies copper pipe as plumbing", () => {
    const result = classifyMaterial("3/4 inch copper pipe, supply line");
    expect(result.category).toBe("plumbing");
    expect(result.confidence).toBe("high");
  });

  it("classifies door as doors", () => {
    const result = classifyMaterial("Solid core interior door, 6-panel");
    expect(result.category).toBe("doors");
    expect(["high", "medium"]).toContain(result.confidence);
  });

  it("classifies hardwood floor as flooring", () => {
    const result = classifyMaterial("Oak hardwood floor strips, 3/4 inch");
    expect(result.category).toBe("flooring");
    expect(["high", "medium"]).toContain(result.confidence);
  });

  it("uses suggested category when keywords are ambiguous", () => {
    const result = classifyMaterial("Miscellaneous salvage items", "hardware");
    expect(result.category).toBe("hardware");
    expect(result.method).toBe("suggested");
  });

  it("falls back to structural_lumber when nothing matches", () => {
    const result = classifyMaterial("Unknown item");
    expect(result.category).toBe("structural_lumber");
    expect(result.confidence).toBe("low");
    expect(result.method).toBe("default");
  });

  it("classifies shingle as roofing", () => {
    const result = classifyMaterial("Architectural asphalt shingle");
    expect(result.category).toBe("roofing");
  });

  it("classifies cast iron tub as fixtures", () => {
    const result = classifyMaterial("Cast iron claw-foot bathtub, refinishable");
    expect(result.category).toBe("fixtures");
  });
});

/* ─── Contamination Mapping ─── */

describe("Field Data — Contamination Mapping", () => {
  it("maps clean observations to no contamination", () => {
    const test = observationsToContaminationTest(makeObservations());
    expect(test.leadPaint).toBe(false);
    expect(test.asbestos).toBe(false);
    expect(test.mold).toBe(false);
  });

  it("maps pre-1978 chipping paint to lead", () => {
    const test = observationsToContaminationTest(
      makeObservations({ paintAge: "pre_1978", paintChipping: true }),
    );
    expect(test.leadPaint).toBe(true);
  });

  it("does NOT flag lead for post-1978 chipping paint", () => {
    const test = observationsToContaminationTest(
      makeObservations({ paintAge: "post_1978", paintChipping: true }),
    );
    expect(test.leadPaint).toBe(false);
  });

  it("maps visible mold to mold contamination", () => {
    const test = observationsToContaminationTest(makeObservations({ visibleMold: true }));
    expect(test.mold).toBe(true);
  });

  it("maps asbestos label to asbestos contamination", () => {
    const test = observationsToContaminationTest(makeObservations({ asbestosLabeled: true }));
    expect(test.asbestos).toBe(true);
  });

  it("maps insect damage to pest damage", () => {
    const test = observationsToContaminationTest(makeObservations({ insectDamage: true }));
    expect(test.pestDamage).toBe(true);
  });
});

/* ─── Ingestion ─── */

describe("Field Data — Ingestion Pipeline", () => {
  it("ingests a report into material records", () => {
    const result = ingestInspection(makeReport());
    expect(result.records).toHaveLength(1);
    expect(result.totalValueCents).toBeGreaterThan(0);
  });

  it("assigns ML Material IDs to ingested records", () => {
    const result = ingestInspection(makeReport());
    expect(result.records[0]!.mlId).toMatch(/^ML-2026-PRV001-Z\d+-\d{3}$/);
  });

  it("grades materials based on field observations", () => {
    const result = ingestInspection(makeReport());
    expect(["A", "B", "C", "D", "salvage"]).toContain(result.records[0]!.grade);
  });

  it("creates audit trail with inspector info", () => {
    const result = ingestInspection(makeReport());
    const trail = result.records[0]!.auditTrail;
    expect(trail.length).toBeGreaterThanOrEqual(2);
    expect(trail[0]!.actor).toBe("inspector_001");
    expect(trail[0]!.action).toBe("recovered");
  });

  it("ingests multiple items from one report", () => {
    const report = makeReport({
      items: [
        makeItem({ fieldDescription: "2x6 joist, structural framing" }),
        makeItem({ fieldDescription: "Copper pipe, 3/4 inch supply line" }),
        makeItem({ fieldDescription: "Oak hardwood floor strips" }),
      ],
      photos: [
        { filename: "a.jpg", itemIndex: 0, type: "overview" },
        { filename: "b.jpg", itemIndex: 1, type: "overview" },
        { filename: "c.jpg", itemIndex: 2, type: "overview" },
      ],
    });

    const result = ingestInspection(report);
    expect(result.records).toHaveLength(3);

    // Each should have a unique ML Material ID
    const ids = result.records.map((r) => r.mlId);
    expect(new Set(ids).size).toBe(3);
  });

  it("handles contaminated materials correctly", () => {
    const item = makeItem({
      fieldDescription: "Old door with chipping paint",
      observations: makeObservations({ paintAge: "pre_1978", paintChipping: true }),
    });
    const result = ingestInspection(makeReport({ items: [item] }));
    expect(result.records[0]!.contamination).not.toBe("clean");
  });
});

/* ─── Batch Processing ─── */

describe("Field Data — Batch Processing", () => {
  it("processes multiple reports", () => {
    const reports = [
      makeReport({ projectId: "PRV001" }),
      makeReport({ projectId: "PRV002" }),
    ];
    const result = batchIngest(reports);
    expect(result.totalReports).toBe(2);
    expect(result.totalRecords).toBe(2);
    expect(result.totalValueCents).toBeGreaterThan(0);
  });

  it("skips invalid reports", () => {
    const reports = [
      makeReport(),
      makeReport({ inspectorId: "" }), // Invalid
    ];
    const result = batchIngest(reports);
    expect(result.totalReports).toBe(2);
    expect(result.totalRecords).toBe(1);
    expect(result.validationIssues).toBe(1);
  });

  it("tracks classification confidence", () => {
    const reports = [
      makeReport({
        items: [
          makeItem({ fieldDescription: "2x6 structural framing joist" }), // high
          makeItem({ fieldDescription: "Unknown salvage" }), // low
        ],
        photos: [
          { filename: "a.jpg", itemIndex: 0, type: "overview" },
          { filename: "b.jpg", itemIndex: 1, type: "overview" },
        ],
      }),
    ];
    const result = batchIngest(reports);
    expect(result.classificationConfidence.high + result.classificationConfidence.medium + result.classificationConfidence.low).toBe(2);
  });

  it("aggregates by category and grade", () => {
    const result = batchIngest([makeReport()]);
    expect(Object.values(result.byCategory).reduce((a, b) => a + b, 0)).toBe(result.totalRecords);
    expect(Object.values(result.byGrade).reduce((a, b) => a + b, 0)).toBe(result.totalRecords);
  });
});
