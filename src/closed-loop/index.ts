/**
 * Closed-Loop Orchestration — Finance → Deconstruct → Design → Build
 *
 * The central pipeline that ties every ML Systems engine together.
 * Proves the closed loop works end-to-end with real calculations.
 */

export {
  executeClosedLoop,
  buildMariaScenario,
} from "./engine.js";

export type {
  HomeownerProfile,
  DeconstructionPlan,
  MaterialInput,
  DesignSpec,
  BuildPlan,
  FinanceStageResult,
  DeconstructStageResult,
  MarketplaceStageResult,
  DesignStageResult,
  BuildStageResult,
  EquityStageResult,
  ClosedLoopPipelineResult,
} from "./engine.js";
