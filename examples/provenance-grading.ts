// Provenance Example — ML Material ID + Grading + Valuation
import { generateMaterialId, gradeMaterial, assessContamination, estimateValue } from "../src/provenance/index.js";
import { materialCategoryToZone, zoneLabel } from "../src/shared/zones.js";

// Recover a 2x6 Douglas Fir joist from a deconstruction site
const category = "structural_lumber";
const zone = materialCategoryToZone(category);
const mlId = generateMaterialId(2026, "PRV001", zone, 1);

console.log(`ML Material ID: ${mlId}`);
console.log(`Zone: ${zone} (${zoneLabel(zone)})\n`);

// Grade the material from 5 weighted factors
const grading = gradeMaterial({
  structuralIntegrity: 85,  // 40% of grade
  surfaceCondition: 72,     // 30% of grade
  moistureContent: 14,      // 15% of grade
  loadTested: true,         // 10% of grade
  ageYears: 15,             // 5% of grade
});

console.log(`Grade: ${grading.grade} (score: ${grading.score})`);
console.log(`Reason: ${grading.reason}\n`);

// Assess contamination
const contam = assessContamination({
  leadPaint: false,
  asbestos: false,
  mold: false,
  chemicalTreatment: false,
  pestDamage: false,
});

console.log(`Contamination: ${contam.status}`);
console.log(`DEM report required: ${contam.demReportRequired}\n`);

// Estimate market value
const value = estimateValue(category, grading.grade, 200, contam.status);
console.log(`Value: $${(value.valueCents / 100).toFixed(2)} (${value.pricePerBoardFoot.toFixed(2)}/bf)`);
console.log(`Discount: ${((1 - value.discount) * 100).toFixed(0)}%`);
