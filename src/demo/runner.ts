/**
 * Agentic Orchestration Pipeline — Live Demo Runner
 *
 * Demonstrates the full ML Systems agent hierarchy, intent enforcement,
 * A2A delegation, RCM tier resolution, TTP scoring, and provenance
 * in a single runnable scenario.
 *
 * Scenario: Maria buys a home through the ML Systems closed loop.
 *   - DRA agent proposes deconstruction with Lucent Lens values
 *   - MVE gate evaluates (4/4 returns)
 *   - Action approved, ML Material ID assigned
 *   - TTP score calculated for the contractor buying materials
 *   - RCM tier resolved for Maria (FICO 640 → Tier 2)
 *   - Monthly payment calculated ($200K, RCM terms)
 *   - Preferred payoff calculated for comparison
 *   - A blocked action demonstrates Lucent Lens rejection
 *   - A2A delegation flows through the hierarchy
 *
 * Run: npx tsx src/demo/runner.ts
 */

import { AgentOrchestrator, A2ARouter, executeToolCall } from "../agents/index.js";
import type { ActionProposal, AgentCard } from "../agents/index.js";
import type { MVEAssessment } from "../intent/schema.js";
import { generateMaterialId, gradeMaterial, estimateValue } from "../provenance/engine.js";
import { calculateDisruptionScore } from "../disruption/engine.js";

/* ─── Output Helpers ─── */

const PASS = "[PASS]";
const FAIL = "[FAIL]";
const INFO = "[INFO]";
const STEP = "[STEP]";
const DIVIDER = "=".repeat(72);
const THIN = "-".repeat(72);

function header(title: string): void {
  console.log(`\n${DIVIDER}`);
  console.log(`  ${title}`);
  console.log(DIVIDER);
}

function step(n: number, label: string): void {
  console.log(`\n${STEP} Step ${n}: ${label}`);
  console.log(THIN);
}

function result(passed: boolean, message: string): void {
  console.log(`  ${passed ? PASS : FAIL} ${message}`);
}

function info(message: string): void {
  console.log(`  ${INFO} ${message}`);
}

/* ─── Demo Execution ─── */

export interface DemoResult {
  agentsRegistered: number;
  approvedActions: number;
  blockedActions: number;
  delegationsCompleted: number;
  delegationsBlocked: number;
  mariaMonthlyPayment: number;
  mariaPreferredPayoffDay: number;
  materialId: string;
  ttpScore: number;
  allPassed: boolean;
}

export function runDemo(): DemoResult {
  const tracker = {
    agentsRegistered: 0,
    approvedActions: 0,
    blockedActions: 0,
    delegationsCompleted: 0,
    delegationsBlocked: 0,
    mariaMonthlyPayment: 0,
    mariaPreferredPayoffDay: 0,
    materialId: "",
    ttpScore: 0,
    allPassed: true,
  };

  function check(passed: boolean, message: string): boolean {
    result(passed, message);
    if (!passed) tracker.allPassed = false;
    return passed;
  }

  header("ML Systems — Agentic Orchestration Pipeline Demo");
  info("Scenario: Maria's Home Purchase (FICO 640, $200K loan)");
  info("Date: " + new Date().toISOString().split("T")[0]);

  /* ──────────────────────────────────────────────────────────
   * STEP 1: Register Agent Hierarchy
   * CEO → LM, FA, AE → PI → CDA, DRA
   * ────────────────────────────────────────────────────────── */

  step(1, "Register Agent Hierarchy");

  const orchestrator = new AgentOrchestrator();
  const router = new A2ARouter();

  // Register in orchestrator (intent inheritance)
  orchestrator.register("ceo", "The Custodian (CEO)", null);
  orchestrator.register("lm", "Language Modeler", "ceo");
  orchestrator.register("fa", "Financial Architect", "ceo");
  orchestrator.register("ae", "Accounting Engineer", "ceo");
  orchestrator.register("pi", "Project Intelligence", "fa");
  orchestrator.register("cda", "Construction Design Architect", "pi");
  orchestrator.register("dra", "Deconstruction Research Agent", "pi");

  tracker.agentsRegistered = orchestrator.listAgents().size;

  // Register A2A capability cards
  const agentCards: AgentCard[] = [
    {
      agentId: "ceo",
      agentName: "The Custodian (CEO)",
      parentId: null,
      capabilities: [
        { domain: "intent", actions: ["override_mve", "terminate_agent"], maxHomeownerValue: 40, maxEngineValue: 30 },
      ],
      delegatesTo: ["lm", "fa", "ae"],
      delegatedFrom: null,
      status: "available",
    },
    {
      agentId: "lm",
      agentName: "Language Modeler",
      parentId: "ceo",
      capabilities: [
        { domain: "language", actions: ["generate", "analyze", "summarize"], maxHomeownerValue: 35, maxEngineValue: 25 },
      ],
      delegatesTo: [],
      delegatedFrom: "ceo",
      status: "available",
    },
    {
      agentId: "fa",
      agentName: "Financial Architect",
      parentId: "ceo",
      capabilities: [
        { domain: "finance", actions: ["resolve_tier", "calculate_payment", "equity_analysis"], maxHomeownerValue: 40, maxEngineValue: 25 },
        { domain: "rcm", actions: ["resolve_tier", "calculate_payment", "preferred_payoff"], maxHomeownerValue: 40, maxEngineValue: 25 },
      ],
      delegatesTo: ["pi"],
      delegatedFrom: "ceo",
      status: "available",
    },
    {
      agentId: "ae",
      agentName: "Accounting Engineer",
      parentId: "ceo",
      capabilities: [
        { domain: "accounting", actions: ["reconcile", "report", "audit"], maxHomeownerValue: 30, maxEngineValue: 20 },
      ],
      delegatesTo: [],
      delegatedFrom: "ceo",
      status: "available",
    },
    {
      agentId: "pi",
      agentName: "Project Intelligence",
      parentId: "fa",
      capabilities: [
        { domain: "construction", actions: ["plan", "schedule", "inspect"], maxHomeownerValue: 35, maxEngineValue: 25 },
        { domain: "deconstruction", actions: ["assess", "recover", "grade"], maxHomeownerValue: 35, maxEngineValue: 25 },
      ],
      delegatesTo: ["cda", "dra"],
      delegatedFrom: "fa",
      status: "available",
    },
    {
      agentId: "cda",
      agentName: "Construction Design Architect",
      parentId: "pi",
      capabilities: [
        { domain: "design", actions: ["draft", "render", "specify"], maxHomeownerValue: 30, maxEngineValue: 20 },
        { domain: "construction", actions: ["plan", "schedule"], maxHomeownerValue: 30, maxEngineValue: 20 },
      ],
      delegatesTo: [],
      delegatedFrom: "pi",
      status: "available",
    },
    {
      agentId: "dra",
      agentName: "Deconstruction Research Agent",
      parentId: "pi",
      capabilities: [
        { domain: "deconstruction", actions: ["assess", "recover", "grade", "separate"], maxHomeownerValue: 30, maxEngineValue: 20 },
      ],
      delegatesTo: [],
      delegatedFrom: "pi",
      status: "available",
    },
  ];

  for (const card of agentCards) {
    router.registerCard(card);
  }

  check(tracker.agentsRegistered === 7, `Registered ${tracker.agentsRegistered}/7 agents in orchestrator`);
  check(router.listCards().length === 7, `Registered ${router.listCards().length}/7 agent cards in A2A router`);

  info("Hierarchy: CEO -> LM + FA + AE -> PI -> CDA + DRA");

  /* ──────────────────────────────────────────────────────────
   * STEP 2: DRA Proposes Deconstruction (Lucent Lens + MVE)
   * ────────────────────────────────────────────────────────── */

  step(2, "DRA Proposes Deconstruction Action");

  const deconMVE: MVEAssessment = {
    materialValue: true,
    ontologyData: true,
    robotTraining: true,
    marketIntelligence: true,
  };

  const deconProposal: ActionProposal = {
    agentId: "dra",
    action: "deconstruct_existing_structure",
    homeownerValue: 35,
    collectiveValue: 25,
    engineValue: 20,
    mve: deconMVE,
  };

  const deconResult = orchestrator.submitAction(deconProposal);
  tracker.approvedActions += deconResult.approved ? 1 : 0;

  check(deconResult.approved, "Deconstruction action APPROVED");
  check(deconResult.lensScore.homeowner === 35, `Lucent Lens — homeowner: ${deconResult.lensScore.homeowner}/40`);
  check(deconResult.lensScore.collective === 25, `Lucent Lens — collective: ${deconResult.lensScore.collective}/30`);
  check(deconResult.lensScore.engine === 20, `Lucent Lens — engine: ${deconResult.lensScore.engine}/30`);
  check(deconResult.lensScore.total === 80, `Lucent Lens — total: ${deconResult.lensScore.total}/100`);
  check(deconResult.mveResult.returnCount === 4, `MVE gate: ${deconResult.mveResult.returnCount}/4 returns`);
  check(deconResult.blockedBy.length === 0, "No blockers — action is clear");

  /* ──────────────────────────────────────────────────────────
   * STEP 3: Assign ML Material ID + Grade Recovered Material
   * ────────────────────────────────────────────────────────── */

  step(3, "ML Material ID Assignment + Grading");

  const mlId = generateMaterialId(2026, "PRV001", 3, 42);
  tracker.materialId = mlId;

  check(mlId === "ML-2026-PRV001-Z3-042", `Material ID: ${mlId}`);

  const grading = gradeMaterial({
    structuralIntegrity: 82,
    surfaceCondition: 68,
    moistureContent: 14,
    loadTested: false,
    ageYears: 35,
  });

  check(grading.grade === "B", `Grade: ${grading.grade} — ${grading.reason}`);

  const valuation = estimateValue("structural_lumber", "B", 120, "clean");
  const valueDollars = valuation.valueCents / 100;

  check(valuation.valueCents > 0, `Valuation: $${valueDollars.toFixed(2)} (${120} board-feet @ $${valuation.pricePerBoardFoot.toFixed(2)}/bf)`);

  /* ──────────────────────────────────────────────────────────
   * STEP 4: TTP Score for Contractor Buying Materials
   * ────────────────────────────────────────────────────────── */

  step(4, "TTP Score — Contractor Material Purchase");

  const ttpResult = executeToolCall({
    tool: "ttp_score_entity",
    arguments: {
      tier: "starter",
      identityVerified: true,
      materialsContributed: 8,
      cyclesCompleted: 1,
      reviewsPassed: 1,
      accountAgeDays: 180,
      isRegulator: false,
      dataContributions: 12,
    },
  });

  check(ttpResult.success, "TTP score calculated successfully");
  const ttpScore = ttpResult.result?.["score"] as number;
  const ttpBand = ttpResult.result?.["band"] as string;
  tracker.ttpScore = ttpScore;

  check(typeof ttpScore === "number" && ttpScore > 0, `TTP Score: ${ttpScore}/100`);
  check(typeof ttpBand === "string", `Access Band: ${ttpBand}`);
  info(`Contractor can access: ${ttpBand === "full_api" ? "Material feeds + valuations" : ttpBand === "ml_verified" ? "Provenance chain + grading" : ttpBand}`);

  /* ──────────────────────────────────────────────────────────
   * STEP 5: RCM Tier Resolution — Maria (FICO 640)
   * ────────────────────────────────────────────────────────── */

  step(5, "RCM Tier Resolution — Maria (FICO 640)");

  const tierResult = executeToolCall({
    tool: "rcm_resolve_tier",
    arguments: { creditScore: 640 },
  });

  check(tierResult.success, "Tier resolved successfully");
  const tier = tierResult.result?.["tier"] as number;
  const tierName = tierResult.result?.["name"] as string;
  const productClass = tierResult.result?.["productClass"] as string;

  check(tier === 2, `Tier: ${tier} — ${tierName}`);
  check(productClass === "standard", `Product class: ${productClass} (monthly payments)`);
  info("Overpayment mode: split (50/50 between interest and principal)");

  /* ──────────────────────────────────────────────────────────
   * STEP 6: Monthly Payment Calculation ($200K RCM)
   * ────────────────────────────────────────────────────────── */

  step(6, "Monthly Payment — $200K RCM Loan");

  const paymentResult = executeToolCall({
    tool: "rcm_calculate_payment",
    arguments: {
      principal: 200_000,
      annualRate: 0.065,
      termMonths: 360,
    },
  });

  check(paymentResult.success, "Payment calculated successfully");
  const monthlyPayment = paymentResult.result?.["monthlyPayment"] as number;
  const totalInterest = paymentResult.result?.["totalInterest"] as number;
  tracker.mariaMonthlyPayment = monthlyPayment;

  check(monthlyPayment > 1200 && monthlyPayment < 1400, `Monthly payment: $${monthlyPayment.toFixed(2)}`);
  info(`100% of $${monthlyPayment.toFixed(2)} goes to PRINCIPAL — interest deferred`);
  info(`Total deferred interest over term: $${totalInterest.toFixed(2)}`);

  /* ──────────────────────────────────────────────────────────
   * STEP 7: Preferred Payoff Comparison
   * ────────────────────────────────────────────────────────── */

  step(7, "Preferred RCM Payoff Comparison (1 stream)");

  const payoffResult = executeToolCall({
    tool: "rcm_preferred_payoff",
    arguments: {
      loanAmount: 200_000,
      streamCount: 1,
    },
  });

  check(payoffResult.success, "Preferred payoff calculated successfully");
  const payoffDay = payoffResult.result?.["payoffDay"] as number;
  const payoffMonths = payoffResult.result?.["payoffMonths"] as number;
  tracker.mariaPreferredPayoffDay = payoffDay;

  check(payoffDay > 0, `Payoff day: ${payoffDay} (Day $1, Day $2, ... Day $${payoffDay})`);
  info(`Payoff in ${payoffMonths} months vs. 360 months standard`);
  info(`If Maria improves credit to 700+, she unlocks Preferred RCM`);

  /* ──────────────────────────────────────────────────────────
   * STEP 8: BLOCKED Action — Engine > Homeowner
   * ────────────────────────────────────────────────────────── */

  step(8, "BLOCKED Action — Engine Value Exceeds Homeowner Value");

  const badProposal: ActionProposal = {
    agentId: "dra",
    action: "harvest_data_from_structure",
    homeownerValue: 10,
    collectiveValue: 5,
    engineValue: 25,
    mve: {
      materialValue: false,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: false,
    },
  };

  const badResult = orchestrator.submitAction(badProposal);
  tracker.blockedActions += badResult.approved ? 0 : 1;

  check(!badResult.approved, "Action BLOCKED — Lucent Lens rejected");
  check(badResult.blockedBy.includes("lucent_lens"), `Blocked by: ${badResult.blockedBy.join(", ")}`);
  check(badResult.blockedBy.includes("mve_gate"), "Also blocked by MVE gate (2/4 returns < 3 required)");
  info(`Reason: ${badResult.lensReason}`);
  info(`MVE: ${badResult.mveResult.reason}`);

  /* ──────────────────────────────────────────────────────────
   * STEP 9: A2A Delegation — CEO → FA → PI (Hierarchy Enforced)
   * ────────────────────────────────────────────────────────── */

  step(9, "A2A Delegation — CEO -> FA -> PI -> DRA");

  const mveForDelegation: MVEAssessment = {
    materialValue: true,
    ontologyData: true,
    robotTraining: true,
    marketIntelligence: true,
  };

  // CEO delegates to FA
  const d1 = router.delegate(
    "ceo", "fa",
    "process_maria_loan",
    "finance",
    { homeowner: 35, collective: 20, engine: 15 },
    mveForDelegation,
    { borrower: "Maria", fico: 640, loanAmount: 200_000 },
    "high",
  );

  check(d1.allowed, `CEO -> FA: ${d1.reason}`);
  tracker.delegationsCompleted += d1.allowed ? 1 : 0;

  // FA completes the task (makes it available again for delegation)
  if (d1.delegatedTaskId) {
    router.completeTask(d1.delegatedTaskId, { tierResolved: 2, paymentCalculated: true });
  }

  // FA delegates to PI
  const d2 = router.delegate(
    "fa", "pi",
    "assess_deconstruction_opportunity",
    "construction",
    { homeowner: 30, collective: 20, engine: 15 },
    mveForDelegation,
    { projectId: "PRV001", propertyAddress: "123 Hope St, Providence RI" },
    "high",
  );

  check(d2.allowed, `FA -> PI: ${d2.reason}`);
  tracker.delegationsCompleted += d2.allowed ? 1 : 0;

  // PI completes and delegates to DRA
  if (d2.delegatedTaskId) {
    router.completeTask(d2.delegatedTaskId, { assessmentComplete: true });
  }

  const d3 = router.delegate(
    "pi", "dra",
    "execute_deconstruction",
    "deconstruction",
    { homeowner: 28, collective: 18, engine: 14 },
    mveForDelegation,
    { zone: 3, materialTypes: ["structural_lumber", "doors", "windows"] },
    "high",
  );

  check(d3.allowed, `PI -> DRA: ${d3.reason}`);
  tracker.delegationsCompleted += d3.allowed ? 1 : 0;

  // Attempt invalid delegation: FA directly to DRA (should fail — not in delegation chain)
  const dBad = router.delegate(
    "fa", "dra",
    "skip_hierarchy",
    "deconstruction",
    { homeowner: 20, collective: 10, engine: 5 },
    mveForDelegation,
  );

  check(!dBad.allowed, `FA -> DRA (skip): BLOCKED — ${dBad.reason}`);
  tracker.delegationsBlocked += dBad.allowed ? 0 : 1;

  /* ──────────────────────────────────────────────────────────
   * STEP 10: Disruption Score Summary
   * ────────────────────────────────────────────────────────── */

  step(10, "Disruption Score — Closed Loop Validation");

  const disruption = calculateDisruptionScore();

  check(disruption.compositeMultiplier >= 3, `Composite multiplier: ${disruption.compositeMultiplier}x`);
  check(disruption.category === "significant" || disruption.category === "paradigm_shift" || disruption.category === "category_creation",
    `Category: ${disruption.category}`);
  check(disruption.closedLoop, "Closed loop: INTACT (4/4 revenue streams)");
  check(disruption.antiSaasAligned, "Anti-SaaS: ALIGNED (outcome-based pricing)");

  for (const m of disruption.multipliers) {
    info(`${m.metric}: ${m.multiplier}x — ${m.description}`);
  }

  /* ──────────────────────────────────────────────────────────
   * FINAL SUMMARY
   * ────────────────────────────────────────────────────────── */

  header("DEMO RESULTS");

  const stats = orchestrator.stats();
  const a2aStats = router.stats();

  console.log(`
  Agents registered:      ${tracker.agentsRegistered}
  Actions approved:       ${tracker.approvedActions}
  Actions blocked:        ${tracker.blockedActions}
  Delegations completed:  ${tracker.delegationsCompleted}
  Delegations blocked:    ${tracker.delegationsBlocked}
  Maria's monthly payment: $${tracker.mariaMonthlyPayment.toFixed(2)}
  Preferred payoff day:   ${tracker.mariaPreferredPayoffDay}
  Material ID assigned:   ${tracker.materialId}
  Contractor TTP score:   ${tracker.ttpScore}
  Orchestrator messages:  ${stats.totalMessages}
  A2A tasks created:      ${a2aStats.totalTasks}
  `);

  if (tracker.allPassed) {
    console.log(`  ${PASS} ALL CHECKS PASSED — Pipeline fully operational`);
  } else {
    console.log(`  ${FAIL} SOME CHECKS FAILED — Review output above`);
  }

  console.log(`\n${DIVIDER}\n`);

  return tracker;
}

/* ─── CLI Entry Point ─── */
if (process.argv[1] && (process.argv[1].endsWith("runner.ts") || process.argv[1].endsWith("runner.js"))) {
  runDemo();
}
