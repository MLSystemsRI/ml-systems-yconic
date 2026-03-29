/**
 * Agent Orchestrator — Multi-agent system with intent inheritance
 *
 * Every AI agent in the ML Systems ecosystem inherits the Intent Schema
 * at instantiation. The orchestrator manages agent lifecycle, message
 * routing, and ensures all decisions pass through the Lucent Lens.
 *
 * Architecture:
 *   CEO (Sal) → LM + FA + AE → PI → Domain Agents → Extensions
 *
 * Agents communicate through typed messages. The orchestrator validates
 * every action against the intent schema before execution.
 */

import type { AgentIntent, LucentLensScore, MVEAssessment } from "../intent/schema.js";
import {
  createAgentIntent,
  scoreLucentLens,
  passesLucentLens,
  passesMVE,
} from "../intent/schema.js";

/* ─── Agent Status ─── */

export type AgentStatus = "idle" | "active" | "blocked" | "terminated";

export interface AgentState {
  intent: AgentIntent;
  status: AgentStatus;
  lastAction: string | null;
  actionsExecuted: number;
  actionsBlocked: number;
  createdAt: Date;
}

/* ─── Message Types ─── */

export type MessagePriority = "low" | "normal" | "high" | "critical";

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  action: string;
  payload: Record<string, unknown>;
  priority: MessagePriority;
  timestamp: Date;
}

/* ─── Action Validation ─── */

export interface ActionProposal {
  agentId: string;
  action: string;
  homeownerValue: number;
  collectiveValue: number;
  engineValue: number;
  mve: MVEAssessment;
}

export interface ActionResult {
  approved: boolean;
  lensScore: LucentLensScore;
  lensReason: string;
  mveResult: { passes: boolean; returnCount: number; reason: string };
  blockedBy: string[];
}

/**
 * Validate an action proposal against the full intent schema.
 *
 * Every action must pass:
 * 1. Lucent Lens (homeowner > engine, minimum total)
 * 2. MVE gate (3 of 4 returns)
 *
 * This is the core enforcement mechanism — no agent can bypass it.
 */
export function validateAction(proposal: ActionProposal): ActionResult {
  const lensScore = scoreLucentLens(
    proposal.homeownerValue,
    proposal.collectiveValue,
    proposal.engineValue,
  );
  const lensResult = passesLucentLens(lensScore);
  const mveResult = passesMVE(proposal.mve);

  const blockedBy: string[] = [];
  if (!lensResult.passes) blockedBy.push("lucent_lens");
  if (!mveResult.passes) blockedBy.push("mve_gate");

  return {
    approved: lensResult.passes && mveResult.passes,
    lensScore,
    lensReason: lensResult.reason,
    mveResult,
    blockedBy,
  };
}

/* ─── Orchestrator ─── */

export class AgentOrchestrator {
  private agents: Map<string, AgentState> = new Map();
  private messageLog: AgentMessage[] = [];

  /**
   * Register a new agent with intent inheritance.
   * Every agent starts with the full intent schema — no exceptions.
   */
  register(agentId: string, agentName: string, parentId: string | null = null): AgentState {
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} already registered`);
    }

    const state: AgentState = {
      intent: createAgentIntent(agentId, agentName, parentId),
      status: "idle",
      lastAction: null,
      actionsExecuted: 0,
      actionsBlocked: 0,
      createdAt: new Date(),
    };

    this.agents.set(agentId, state);
    return state;
  }

  /**
   * Submit an action for validation and execution.
   * Returns the validation result — the caller decides what to do.
   */
  submitAction(proposal: ActionProposal): ActionResult {
    const agent = this.agents.get(proposal.agentId);
    if (!agent) {
      throw new Error(`Agent ${proposal.agentId} not registered`);
    }

    if (agent.status === "terminated") {
      throw new Error(`Agent ${proposal.agentId} is terminated`);
    }

    const result = validateAction(proposal);

    if (result.approved) {
      agent.status = "active";
      agent.lastAction = proposal.action;
      agent.actionsExecuted++;
    } else {
      agent.actionsBlocked++;
      if (agent.actionsBlocked > 10) {
        agent.status = "blocked";
      }
    }

    return result;
  }

  /**
   * Send a message between agents.
   * Messages are logged for audit — transparency is structural.
   */
  sendMessage(
    from: string,
    to: string,
    action: string,
    payload: Record<string, unknown> = {},
    priority: MessagePriority = "normal",
  ): AgentMessage {
    if (!this.agents.has(from)) throw new Error(`Sender ${from} not registered`);
    if (!this.agents.has(to)) throw new Error(`Recipient ${to} not registered`);

    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from,
      to,
      action,
      payload,
      priority,
      timestamp: new Date(),
    };

    this.messageLog.push(message);
    return message;
  }

  /** Get an agent's current state */
  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  /** Get all registered agents */
  listAgents(): Map<string, AgentState> {
    return new Map(this.agents);
  }

  /** Get message history for an agent */
  getMessages(agentId: string): AgentMessage[] {
    return this.messageLog.filter((m) => m.from === agentId || m.to === agentId);
  }

  /** Get full message audit log */
  getAuditLog(): readonly AgentMessage[] {
    return this.messageLog;
  }

  /** Terminate an agent */
  terminate(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) agent.status = "terminated";
  }

  /** Get orchestrator stats */
  stats(): {
    totalAgents: number;
    activeAgents: number;
    totalMessages: number;
    totalActions: number;
    totalBlocked: number;
  } {
    let activeAgents = 0;
    let totalActions = 0;
    let totalBlocked = 0;

    for (const agent of this.agents.values()) {
      if (agent.status === "active") activeAgents++;
      totalActions += agent.actionsExecuted;
      totalBlocked += agent.actionsBlocked;
    }

    return {
      totalAgents: this.agents.size,
      activeAgents,
      totalMessages: this.messageLog.length,
      totalActions,
      totalBlocked,
    };
  }
}
