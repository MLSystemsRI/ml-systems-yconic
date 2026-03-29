/**
 * Agent-to-Agent (A2A) Protocol — Hierarchical Task Delegation
 *
 * Implements typed capability discovery, task decomposition, and
 * hierarchical routing for the ML Systems multi-agent ecosystem.
 *
 * Agent hierarchy (from intent schema):
 *   CEO (Sal) → LM + FA + AE → PI → Domain Agents → Extensions
 *
 * Every delegation preserves intent inheritance — child agents cannot
 * exceed parent capability scope. Tasks flow DOWN the hierarchy,
 * results flow UP. The protocol enforces this structurally.
 *
 * A2A complements MCP: MCP exposes tools to external agents,
 * A2A coordinates internal agents within the ML Systems ecosystem.
 */

import type { MVEAssessment } from "../intent/schema.js";

/* ─── Agent Capabilities ─── */

/**
 * Capability domains map to ML Systems engines.
 * An agent can only act within its declared capabilities.
 */
export type CapabilityDomain =
  | "ttp"
  | "rcm"
  | "intent"
  | "deconstruction"
  | "design"
  | "construction"
  | "finance"
  | "language"
  | "accounting"
  | "marketplace";

export interface AgentCapability {
  domain: CapabilityDomain;
  actions: string[];
  /** Maximum homeowner value this agent can claim (prevents inflation) */
  maxHomeownerValue: number;
  /** Maximum engine value this agent can claim */
  maxEngineValue: number;
}

/**
 * Agent Card — discoverable identity for A2A protocol.
 * Any agent can query another agent's card to understand
 * what it can do before delegating tasks.
 */
export interface AgentCard {
  agentId: string;
  agentName: string;
  parentId: string | null;
  capabilities: AgentCapability[];
  /** Agents this agent can delegate to */
  delegatesTo: string[];
  /** Agent that delegated to this one */
  delegatedFrom: string | null;
  status: "available" | "busy" | "offline";
}

/* ─── Task Decomposition ─── */

export type TaskStatus = "pending" | "delegated" | "in_progress" | "completed" | "failed";

export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface Task {
  id: string;
  parentTaskId: string | null;
  assignedTo: string;
  createdBy: string;
  action: string;
  domain: CapabilityDomain;
  payload: Record<string, unknown>;
  priority: TaskPriority;
  status: TaskStatus;
  /** Intent values for Lucent Lens validation */
  homeownerValue: number;
  collectiveValue: number;
  engineValue: number;
  mve: MVEAssessment;
  result: Record<string, unknown> | null;
  subtasks: string[];
  createdAt: Date;
  completedAt: Date | null;
}

/* ─── Delegation Rules ─── */

/**
 * Delegation constraint — enforces hierarchy.
 * A parent agent can only delegate to agents it has registered
 * as delegates, and the child's capability must cover the task domain.
 */
export interface DelegationResult {
  allowed: boolean;
  reason: string;
  delegatedTaskId: string | null;
}

/* ─── A2A Protocol Router ─── */

export class A2ARouter {
  private cards: Map<string, AgentCard> = new Map();
  private tasks: Map<string, Task> = new Map();
  private taskCounter = 0;

  /**
   * Register an agent's capability card.
   * Cards are discoverable by any agent in the ecosystem.
   */
  registerCard(card: AgentCard): void {
    if (this.cards.has(card.agentId)) {
      throw new Error(`Agent ${card.agentId} already registered`);
    }
    this.cards.set(card.agentId, card);
  }

  /**
   * Discover an agent's capabilities.
   * This is the core A2A primitive — agents query each other
   * to understand capabilities before delegating.
   */
  discover(agentId: string): AgentCard | undefined {
    return this.cards.get(agentId);
  }

  /**
   * Find agents with a specific capability domain.
   * Used for automatic task routing — find who can handle it.
   */
  findByCapability(domain: CapabilityDomain): AgentCard[] {
    const results: AgentCard[] = [];
    for (const card of this.cards.values()) {
      if (card.capabilities.some((c) => c.domain === domain) && card.status === "available") {
        results.push(card);
      }
    }
    return results;
  }

  /**
   * Delegate a task from one agent to another.
   *
   * Enforces:
   * 1. Parent must have child in its delegatesTo list
   * 2. Child must have the required capability domain
   * 3. Task values must not exceed child's capability limits
   * 4. Intent hierarchy preserved (homeowner >= engine)
   */
  delegate(
    fromId: string,
    toId: string,
    action: string,
    domain: CapabilityDomain,
    values: { homeowner: number; collective: number; engine: number },
    mve: MVEAssessment,
    payload: Record<string, unknown> = {},
    priority: TaskPriority = "normal",
    parentTaskId: string | null = null,
  ): DelegationResult {
    const from = this.cards.get(fromId);
    const to = this.cards.get(toId);

    if (!from)
      return { allowed: false, reason: `Sender ${fromId} not registered`, delegatedTaskId: null };
    if (!to)
      return { allowed: false, reason: `Recipient ${toId} not registered`, delegatedTaskId: null };

    /* Rule 1: Hierarchy check */
    if (!from.delegatesTo.includes(toId)) {
      return {
        allowed: false,
        reason: `${fromId} cannot delegate to ${toId} — not in delegation chain`,
        delegatedTaskId: null,
      };
    }

    /* Rule 2: Capability check */
    const capability = to.capabilities.find((c) => c.domain === domain);
    if (!capability) {
      return {
        allowed: false,
        reason: `${toId} lacks capability for domain: ${domain}`,
        delegatedTaskId: null,
      };
    }

    /* Rule 3: Value limit check */
    if (values.homeowner > capability.maxHomeownerValue) {
      return {
        allowed: false,
        reason: `Homeowner value ${values.homeowner} exceeds ${toId} limit of ${capability.maxHomeownerValue}`,
        delegatedTaskId: null,
      };
    }
    if (values.engine > capability.maxEngineValue) {
      return {
        allowed: false,
        reason: `Engine value ${values.engine} exceeds ${toId} limit of ${capability.maxEngineValue}`,
        delegatedTaskId: null,
      };
    }

    /* Rule 4: Intent hierarchy (Lucent Lens basic check) */
    if (values.engine > values.homeowner) {
      return {
        allowed: false,
        reason: "Engine value cannot exceed homeowner value — Lucent Lens violation",
        delegatedTaskId: null,
      };
    }

    /* Check recipient availability */
    if (to.status !== "available") {
      return {
        allowed: false,
        reason: `${toId} is ${to.status} — cannot accept tasks`,
        delegatedTaskId: null,
      };
    }

    /* Create task */
    const taskId = `task_${++this.taskCounter}`;
    const task: Task = {
      id: taskId,
      parentTaskId,
      assignedTo: toId,
      createdBy: fromId,
      action,
      domain,
      payload,
      priority,
      status: "delegated",
      homeownerValue: values.homeowner,
      collectiveValue: values.collective,
      engineValue: values.engine,
      mve,
      result: null,
      subtasks: [],
      createdAt: new Date(),
      completedAt: null,
    };

    this.tasks.set(taskId, task);

    /* Link subtask to parent */
    if (parentTaskId) {
      const parent = this.tasks.get(parentTaskId);
      if (parent) parent.subtasks.push(taskId);
    }

    /* Mark recipient as busy */
    to.status = "busy";

    return { allowed: true, reason: "Task delegated successfully", delegatedTaskId: taskId };
  }

  /**
   * Complete a task and return results up the hierarchy.
   * Results flow upward — the delegating agent receives them.
   */
  completeTask(taskId: string, result: Record<string, unknown>): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = "completed";
    task.result = result;
    task.completedAt = new Date();

    /* Free the agent */
    const agent = this.cards.get(task.assignedTo);
    if (agent) agent.status = "available";

    return task;
  }

  /**
   * Fail a task with an error reason.
   */
  failTask(taskId: string, reason: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    task.status = "failed";
    task.result = { error: reason };
    task.completedAt = new Date();

    const agent = this.cards.get(task.assignedTo);
    if (agent) agent.status = "available";

    return task;
  }

  /**
   * Decompose a task into subtasks and delegate each.
   * This is how complex operations are broken into agent-sized work.
   */
  decompose(
    parentTaskId: string,
    subtasks: Array<{
      toId: string;
      action: string;
      domain: CapabilityDomain;
      values: { homeowner: number; collective: number; engine: number };
      mve: MVEAssessment;
      payload?: Record<string, unknown>;
    }>,
  ): DelegationResult[] {
    const parent = this.tasks.get(parentTaskId);
    if (!parent) {
      return [
        { allowed: false, reason: `Parent task ${parentTaskId} not found`, delegatedTaskId: null },
      ];
    }

    return subtasks.map((sub) =>
      this.delegate(
        parent.assignedTo,
        sub.toId,
        sub.action,
        sub.domain,
        sub.values,
        sub.mve,
        sub.payload ?? {},
        parent.priority,
        parentTaskId,
      ),
    );
  }

  /** Get a task by ID */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /** Get all tasks for an agent */
  getAgentTasks(agentId: string): Task[] {
    return [...this.tasks.values()].filter(
      (t) => t.assignedTo === agentId || t.createdBy === agentId,
    );
  }

  /** Get all registered agent cards */
  listCards(): AgentCard[] {
    return [...this.cards.values()];
  }

  /** Protocol statistics */
  stats(): {
    totalAgents: number;
    availableAgents: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
  } {
    let availableAgents = 0;
    let completedTasks = 0;
    let failedTasks = 0;
    let pendingTasks = 0;

    for (const card of this.cards.values()) {
      if (card.status === "available") availableAgents++;
    }
    for (const task of this.tasks.values()) {
      if (task.status === "completed") completedTasks++;
      else if (task.status === "failed") failedTasks++;
      else pendingTasks++;
    }

    return {
      totalAgents: this.cards.size,
      availableAgents,
      totalTasks: this.tasks.size,
      completedTasks,
      failedTasks,
      pendingTasks,
    };
  }
}
