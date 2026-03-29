/**
 * Agent System — Multi-agent orchestration with MCP tool interface
 *
 * The orchestrator manages agent lifecycle and enforces intent inheritance.
 * Tools expose ML Systems engines to any MCP-compatible AI agent.
 */

export { AgentOrchestrator, validateAction } from "./orchestrator.js";
export type {
  AgentStatus,
  AgentState,
  AgentMessage,
  MessagePriority,
  ActionProposal,
  ActionResult,
} from "./orchestrator.js";

export {
  ALL_TOOLS,
  getTool,
  listToolNames,
  ttpScoreEntity,
  ttpDetectCrawler,
  ttpCheckAccess,
  rcmResolveTier,
  rcmCalculatePayment,
  rcmPreferredPayoff,
  intentValidateAction,
} from "./tools.js";
export type { ToolDefinition, ToolParameter } from "./tools.js";

export { A2ARouter } from "./a2a.js";
export { executeToolCall, executeBatch } from "./runtime.js";
export type { ToolCallInput, ToolCallResult } from "./runtime.js";
export type {
  CapabilityDomain,
  AgentCapability,
  AgentCard,
  Task,
  TaskStatus,
  TaskPriority,
  DelegationResult,
} from "./a2a.js";
