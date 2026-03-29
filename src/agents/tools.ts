/**
 * MCP-Compatible Tool Definitions — AI Agent Interface
 *
 * These tool definitions follow the Model Context Protocol (MCP) schema
 * so any MCP-compatible AI agent can interact with ML Systems engines.
 *
 * Tools expose TTP scoring, RCM calculations, and intent validation
 * as callable functions with typed inputs and outputs.
 *
 * Usage: An AI agent (Claude, GPT, etc.) calls these tools to:
 * - Score entities for ecosystem access
 * - Calculate mortgage payments and schedules
 * - Validate actions against the Lucent Lens
 * - Detect AI crawlers and apply verification fees
 */

/* ─── MCP Tool Schema Types ─── */

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object";
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  returns: string;
}

/* ─── TTP Tools ─── */

export const ttpScoreEntity: ToolDefinition = {
  name: "ttp_score_entity",
  description:
    "Calculate a Transparency Trust Protocol score (0-100) for an entity. " +
    "Returns the score, access band, and factor breakdown. " +
    "The score gates which data the entity can access through the ML Systems API.",
  parameters: [
    {
      name: "tier",
      type: "string",
      description: "API tier",
      required: true,
      enum: ["free", "starter", "pro", "enterprise"],
    },
    {
      name: "identityVerified",
      type: "boolean",
      description: "Identity verified through KYC",
      required: true,
    },
    {
      name: "materialsContributed",
      type: "number",
      description: "Verified materials contributed to provenance system",
      required: true,
    },
    {
      name: "cyclesCompleted",
      type: "number",
      description: "Completed project cycles",
      required: true,
    },
    { name: "reviewsPassed", type: "number", description: "Annual reviews passed", required: true },
    {
      name: "accountAgeDays",
      type: "number",
      description: "Days since account creation",
      required: true,
    },
    {
      name: "isRegulator",
      type: "boolean",
      description: "State/municipal agency status",
      required: true,
    },
    {
      name: "dataContributions",
      type: "number",
      description: "Data points contributed",
      required: true,
    },
  ],
  returns: "{ score: number, band: string, factors: object }",
};

export const ttpDetectCrawler: ToolDefinition = {
  name: "ttp_detect_crawler",
  description:
    "Detect if a user-agent string belongs to a known AI crawler. " +
    "Returns crawler identification and applicable verification fee.",
  parameters: [
    {
      name: "userAgent",
      type: "string",
      description: "HTTP User-Agent header value",
      required: true,
    },
    {
      name: "accessBand",
      type: "string",
      description: "Current access band for fee calculation",
      required: false,
      enum: ["public_record", "ml_verified", "full_api", "double_verified", "ontology_licensed"],
    },
  ],
  returns: "{ isCrawler: boolean, crawlerName: string | null, feeCents: number }",
};

export const ttpCheckAccess: ToolDefinition = {
  name: "ttp_check_access",
  description:
    "Process a request through the TTP middleware pipeline. " +
    "Returns access decision, headers, and any applicable fees.",
  parameters: [
    { name: "path", type: "string", description: "API endpoint path", required: true },
    { name: "userAgent", type: "string", description: "User-Agent header", required: true },
    {
      name: "apiTier",
      type: "string",
      description: "API tier",
      required: true,
      enum: ["free", "starter", "pro", "enterprise"],
    },
    { name: "isRegulator", type: "boolean", description: "Regulator status", required: true },
    {
      name: "ttScore",
      type: "number",
      description: "Pre-computed TT score (optional)",
      required: false,
    },
  ],
  returns: "{ allowed: boolean, score: number, band: string, headers: object, feeCents: number }",
};

/* ─── RCM Tools ─── */

export const rcmResolveTier: ToolDefinition = {
  name: "rcm_resolve_tier",
  description:
    "Resolve a FICO credit score to an RCM mortgage tier (1-6). " +
    "Returns the tier details including product class, payment structure, and description.",
  parameters: [
    {
      name: "creditScore",
      type: "number",
      description: "FICO credit score (300-850)",
      required: true,
    },
  ],
  returns:
    "{ tier: number, productClass: string, name: string, ficoRange: string, description: string }",
};

export const rcmCalculatePayment: ToolDefinition = {
  name: "rcm_calculate_payment",
  description:
    "Calculate the monthly payment for a Reverse Construction Mortgage. " +
    "100% of every payment goes to principal — interest is deferred.",
  parameters: [
    { name: "principal", type: "number", description: "Loan amount in dollars", required: true },
    {
      name: "annualRate",
      type: "number",
      description: "Annual interest rate (decimal, e.g., 0.065)",
      required: true,
    },
    { name: "termMonths", type: "number", description: "Loan term in months", required: true },
  ],
  returns: "{ monthlyPayment: number, totalInterest: number }",
};

export const rcmPreferredPayoff: ToolDefinition = {
  name: "rcm_preferred_payoff",
  description:
    "Calculate payoff timeline for a Preferred RCM tier (daily arithmetic payments). " +
    "Day N payment = streamCount × $N. Returns payoff day and final payment.",
  parameters: [
    { name: "loanAmount", type: "number", description: "Loan amount in dollars", required: true },
    {
      name: "streamCount",
      type: "number",
      description: "Number of concurrent payment streams (1, 2, or 3)",
      required: true,
    },
  ],
  returns: "{ payoffDay: number, payoffMonths: number, finalDailyPayment: number }",
};

/* ─── Intent Tools ─── */

export const intentValidateAction: ToolDefinition = {
  name: "intent_validate_action",
  description:
    "Validate a proposed action against the ML Systems Intent Schema. " +
    "Checks Lucent Lens hierarchy (homeowner > engine) and MVE gate (3/4 returns). " +
    "Every agent must call this before executing any action.",
  parameters: [
    {
      name: "homeownerValue",
      type: "number",
      description: "Value to homeowner (0-40)",
      required: true,
    },
    {
      name: "collectiveValue",
      type: "number",
      description: "Value to collective (0-30)",
      required: true,
    },
    { name: "engineValue", type: "number", description: "Value to engine (0-30)", required: true },
    {
      name: "materialValue",
      type: "boolean",
      description: "Produces recovered material value",
      required: true,
    },
    {
      name: "ontologyData",
      type: "boolean",
      description: "Produces ontology training data",
      required: true,
    },
    {
      name: "robotTraining",
      type: "boolean",
      description: "Produces robot training signal",
      required: true,
    },
    {
      name: "marketIntelligence",
      type: "boolean",
      description: "Produces market intelligence",
      required: true,
    },
  ],
  returns: "{ approved: boolean, lensScore: object, mveResult: object, blockedBy: string[] }",
};

/* ─── Provenance Tools ─── */

export const provenanceGradeMaterial: ToolDefinition = {
  name: "provenance_grade_material",
  description:
    "Grade a recovered material based on physical assessment factors. " +
    "Returns grade (A/B/C/D/salvage), score, and reason. " +
    "The grade feeds marketplace pricing and DEM compliance.",
  parameters: [
    { name: "structuralIntegrity", type: "number", description: "Structural integrity (0-100)", required: true },
    { name: "surfaceCondition", type: "number", description: "Surface condition (0-100)", required: true },
    { name: "moistureContent", type: "number", description: "Moisture content percentage", required: true },
    { name: "loadTested", type: "boolean", description: "Whether material was load-tested", required: true },
    { name: "ageYears", type: "number", description: "Age of material in years", required: true },
  ],
  returns: "{ grade: string, score: number, reason: string }",
};

export const provenanceEstimateValue: ToolDefinition = {
  name: "provenance_estimate_value",
  description:
    "Estimate market value of a recovered material. " +
    "Value = base price × category multiplier × contamination discount. " +
    "Feeds BOH marketplace listing prices.",
  parameters: [
    { name: "category", type: "string", description: "Material category", required: true, enum: ["structural_lumber", "finish_lumber", "doors", "windows", "trim", "flooring", "fixtures", "hardware", "roofing", "siding", "concrete", "sheathing", "drywall", "electrical", "plumbing"] },
    { name: "grade", type: "string", description: "Material grade", required: true, enum: ["A", "B", "C", "D", "salvage"] },
    { name: "boardFeet", type: "number", description: "Quantity in board feet", required: true },
    { name: "contamination", type: "string", description: "Contamination status", required: true, enum: ["clean", "suspected", "confirmed", "remediated"] },
  ],
  returns: "{ valueCents: number, pricePerBoardFoot: number, discount: number }",
};

export const rcmSimulateEquity: ToolDefinition = {
  name: "rcm_simulate_equity",
  description:
    "Run a 360-month equity simulation comparing RCM vs traditional mortgage. " +
    "Returns milestones (20% equity month, crossover month, payoff month) and summary. " +
    "Proves RCM builds equity faster at every time horizon.",
  parameters: [
    { name: "loanAmount", type: "number", description: "Loan amount in dollars", required: true },
    { name: "annualRate", type: "number", description: "Annual interest rate (decimal)", required: true },
    { name: "termMonths", type: "number", description: "Loan term in months", required: true },
    { name: "propertyValue", type: "number", description: "Property value in dollars", required: true },
    { name: "appreciationRate", type: "number", description: "Annual property appreciation (decimal)", required: true },
    { name: "monthlyMaterialRevenueCents", type: "number", description: "Monthly material recovery revenue (cents)", required: true },
  ],
  returns: "{ milestones: object, summary: object, rcmPayment: number, traditionalPayment: number }",
};

/* ─── Tool Registry ─── */

/** All available MCP tools */
export const ALL_TOOLS: readonly ToolDefinition[] = [
  ttpScoreEntity,
  ttpDetectCrawler,
  ttpCheckAccess,
  rcmResolveTier,
  rcmCalculatePayment,
  rcmPreferredPayoff,
  intentValidateAction,
  provenanceGradeMaterial,
  provenanceEstimateValue,
  rcmSimulateEquity,
] as const;

/** Look up a tool by name */
export function getTool(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((t) => t.name === name);
}

/** List all tool names */
export function listToolNames(): string[] {
  return ALL_TOOLS.map((t) => t.name);
}
