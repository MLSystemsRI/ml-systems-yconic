import { describe, it, expect } from "vitest";
import {
  generateMaterialId,
  parseMaterialId,
  gradeMaterial,
  assessContamination,
  estimateValue,
  generateRecoveryReport,
  generateDEMExport,
} from "./engine.js";
import type { MaterialRecord, GradingFactors, ContaminationTest } from "./engine.js";

/* ─── ML Material ID ─── */

describe("generateMaterialId", () => {
  it("generates formatted ML Material ID", () => {
    const id = generateMaterialId(2026, "PRV001", 3, 42);
    expect(id).toBe("ML-2026-PRV001-Z3-042");
  });

  it("zero-pads sequence to 3 digits", () => {
    expect(generateMaterialId(2026, "CRN002", 1, 1)).toBe("ML-2026-CRN002-Z1-001");
    expect(generateMaterialId(2026, "CRN002", 1, 100)).toBe("ML-2026-CRN002-Z1-100");
  });
});

describe("parseMaterialId", () => {
  it("parses valid ML Material ID", () => {
    const parsed = parseMaterialId("ML-2026-PRV001-Z3-042");
    expect(parsed).toEqual({ year: 2026, projectId: "PRV001", zone: 3, sequence: 42 });
  });

  it("returns null for invalid format", () => {
    expect(parseMaterialId("not-a-material-id")).toBeNull();
    expect(parseMaterialId("ML-XXXX-PRV001-Z3-042")).toBeNull();
    expect(parseMaterialId("")).toBeNull();
  });

  it("round-trips with generateMaterialId", () => {
    const id = generateMaterialId(2026, "WAR003", 5, 17);
    const parsed = parseMaterialId(id);
    expect(parsed).toEqual({ year: 2026, projectId: "WAR003", zone: 5, sequence: 17 });
  });
});

/* ─── Material Grading ─── */

describe("gradeMaterial", () => {
  it("grades premium material as A", () => {
    const result = gradeMaterial({
      structuralIntegrity: 95,
      surfaceCondition: 90,
      moistureContent: 10,
      loadTested: true,
      ageYears: 5,
    });
    expect(result.grade).toBe("A");
    expect(result.score).toBeGreaterThan(0);
  });

  it("grades good material as B", () => {
    const result = gradeMaterial({
      structuralIntegrity: 80,
      surfaceCondition: 70,
      moistureContent: 18,
      loadTested: false,
      ageYears: 15,
    });
    expect(result.grade).toBe("B");
  });

  it("grades utility material as C", () => {
    const result = gradeMaterial({
      structuralIntegrity: 55,
      surfaceCondition: 45,
      moistureContent: 25,
      loadTested: false,
      ageYears: 30,
    });
    expect(result.grade).toBe("C");
  });

  it("grades below-standard material as D", () => {
    const result = gradeMaterial({
      structuralIntegrity: 30,
      surfaceCondition: 20,
      moistureContent: 35,
      loadTested: false,
      ageYears: 50,
    });
    expect(result.grade).toBe("D");
  });

  it("grades damaged material as salvage", () => {
    const result = gradeMaterial({
      structuralIntegrity: 10,
      surfaceCondition: 5,
      moistureContent: 40,
      loadTested: false,
      ageYears: 80,
    });
    expect(result.grade).toBe("salvage");
  });

  it("load testing improves score", () => {
    const base: GradingFactors = {
      structuralIntegrity: 80,
      surfaceCondition: 70,
      moistureContent: 12,
      loadTested: false,
      ageYears: 10,
    };
    const withTest = { ...base, loadTested: true };
    expect(gradeMaterial(withTest).score).toBeGreaterThan(gradeMaterial(base).score);
  });
});

/* ─── Contamination Assessment ─── */

describe("assessContamination", () => {
  it("returns clean for no hazards", () => {
    const result = assessContamination({
      leadPaint: false,
      asbestos: false,
      mold: false,
      chemicalTreatment: false,
      pestDamage: false,
    });
    expect(result.status).toBe("clean");
    expect(result.hazards).toHaveLength(0);
    expect(result.requiresRemediation).toBe(false);
    expect(result.demReportRequired).toBe(false);
  });

  it("flags asbestos as confirmed + requires DEM report", () => {
    const result = assessContamination({
      leadPaint: false,
      asbestos: true,
      mold: false,
      chemicalTreatment: false,
      pestDamage: false,
    });
    expect(result.status).toBe("confirmed");
    expect(result.hazards).toContain("asbestos");
    expect(result.requiresRemediation).toBe(true);
    expect(result.demReportRequired).toBe(true);
  });

  it("flags lead paint as requiring DEM report", () => {
    const result = assessContamination({
      leadPaint: true,
      asbestos: false,
      mold: false,
      chemicalTreatment: false,
      pestDamage: false,
    });
    expect(result.demReportRequired).toBe(true);
    expect(result.hazards).toContain("lead_paint");
  });

  it("flags multiple hazards", () => {
    const result = assessContamination({
      leadPaint: true,
      asbestos: false,
      mold: true,
      chemicalTreatment: true,
      pestDamage: false,
    });
    expect(result.hazards).toHaveLength(3);
    expect(result.requiresRemediation).toBe(true);
  });

  it("mold alone is suspected, not confirmed", () => {
    const result = assessContamination({
      leadPaint: false,
      asbestos: false,
      mold: true,
      chemicalTreatment: false,
      pestDamage: false,
    });
    expect(result.status).toBe("suspected");
    expect(result.requiresRemediation).toBe(false);
  });
});

/* ─── Material Valuation ─── */

describe("estimateValue", () => {
  it("calculates value for clean A-grade structural lumber", () => {
    const result = estimateValue("structural_lumber", "A", 100, "clean");
    expect(result.valueCents).toBe(45000); // $4.50 × 100 × 1.0
    expect(result.pricePerBoardFoot).toBe(4.5);
    expect(result.discount).toBe(1.0);
  });

  it("applies category multiplier for windows", () => {
    const result = estimateValue("windows", "A", 10, "clean");
    expect(result.pricePerBoardFoot).toBe(13.5); // $4.50 × 3.0
  });

  it("discounts suspected contamination by 30%", () => {
    const result = estimateValue("structural_lumber", "A", 100, "suspected");
    expect(result.discount).toBe(0.7);
    expect(result.valueCents).toBe(31500); // $4.50 × 0.7 × 100
  });

  it("discounts confirmed contamination by 70%", () => {
    const result = estimateValue("structural_lumber", "A", 100, "confirmed");
    expect(result.discount).toBe(0.3);
  });

  it("remediated materials get 85% of full price", () => {
    const result = estimateValue("structural_lumber", "A", 100, "remediated");
    expect(result.discount).toBe(0.85);
  });

  it("salvage grade has lowest base price", () => {
    const result = estimateValue("structural_lumber", "salvage", 100, "clean");
    expect(result.pricePerBoardFoot).toBe(0.25);
  });
});

/* ─── Recovery Report ─── */

describe("generateRecoveryReport", () => {
  function makeMaterial(overrides: Partial<MaterialRecord> = {}): MaterialRecord {
    return {
      mlId: "ML-2026-PRV001-Z1-001",
      projectId: "PRV001",
      zone: 1,
      sequence: 1,
      category: "structural_lumber",
      description: "2x4 stud, 8ft",
      grade: "B",
      contamination: "clean",
      dimensions: { length: 96, width: 3.5, depth: 1.5, unit: "in" },
      weightLbs: 12,
      recoveredAt: new Date(),
      recoveredBy: "crew-001",
      estimatedValue: 1200,
      auditTrail: [],
      ...overrides,
    };
  }

  it("generates report for a set of materials", () => {
    const materials = [
      makeMaterial({ grade: "A", estimatedValue: 2000 }),
      makeMaterial({ grade: "B", estimatedValue: 1500 }),
      makeMaterial({ grade: "B", estimatedValue: 1200 }),
      makeMaterial({ grade: "C", estimatedValue: 800, contamination: "suspected" }),
    ];

    const report = generateRecoveryReport("PRV001", materials, 5);

    expect(report.totalMaterials).toBe(4);
    expect(report.byGrade.A).toBe(1);
    expect(report.byGrade.B).toBe(2);
    expect(report.byGrade.C).toBe(1);
    expect(report.totalValueCents).toBe(5500);
    expect(report.recoveryRate).toBe(0.8);
    expect(report.cleanRate).toBe(0.75);
  });

  it("handles empty materials list", () => {
    const report = generateRecoveryReport("PRV001", [], 10);
    expect(report.totalMaterials).toBe(0);
    expect(report.recoveryRate).toBe(0);
  });
});

/* ─── DEM Export ─── */

describe("generateDEMExport", () => {
  function makeMaterial(
    mlId: string,
    contamination: "clean" | "suspected" | "confirmed" | "remediated",
  ): MaterialRecord {
    return {
      mlId,
      projectId: "PRV001",
      zone: 1,
      sequence: 1,
      category: "structural_lumber",
      description: "test",
      grade: "B",
      contamination,
      dimensions: { length: 96, width: 3.5, depth: 1.5, unit: "in" },
      weightLbs: 12,
      recoveredAt: new Date(),
      recoveredBy: "crew-001",
      estimatedValue: 1200,
      auditTrail: [],
    };
  }

  it("exports only contaminated materials", () => {
    const materials = [
      makeMaterial("ML-2026-PRV001-Z1-001", "clean"),
      makeMaterial("ML-2026-PRV001-Z1-002", "suspected"),
      makeMaterial("ML-2026-PRV001-Z1-003", "confirmed"),
    ];

    const tests = new Map<string, ContaminationTest>();
    tests.set("ML-2026-PRV001-Z1-002", {
      leadPaint: false,
      asbestos: false,
      mold: true,
      chemicalTreatment: false,
      pestDamage: false,
    });
    tests.set("ML-2026-PRV001-Z1-003", {
      leadPaint: true,
      asbestos: true,
      mold: false,
      chemicalTreatment: false,
      pestDamage: false,
    });

    const exports = generateDEMExport(materials, tests);
    expect(exports).toHaveLength(2);
    expect(exports[0]!.mlId).toBe("ML-2026-PRV001-Z1-002");
    expect(exports[1]!.hazards).toContain("asbestos");
    expect(exports[1]!.remediationRequired).toBe(true);
  });

  it("returns empty array for all clean materials", () => {
    const materials = [makeMaterial("ML-2026-PRV001-Z1-001", "clean")];
    const exports = generateDEMExport(materials, new Map());
    expect(exports).toHaveLength(0);
  });
});
