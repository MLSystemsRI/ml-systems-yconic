import { describe, it, expect, beforeEach } from "vitest";
import { AgentOrchestrator, validateAction } from "./orchestrator.js";
import type { ActionProposal } from "./orchestrator.js";

function makeProposal(overrides: Partial<ActionProposal> = {}): ActionProposal {
  return {
    agentId: "pi",
    action: "find_value_task",
    homeownerValue: 30,
    collectiveValue: 20,
    engineValue: 10,
    mve: {
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: true,
    },
    ...overrides,
  };
}

/* ─── validateAction ─── */

describe("validateAction", () => {
  it("approves valid homeowner-first action with 4/4 MVE", () => {
    const result = validateAction(makeProposal());
    expect(result.approved).toBe(true);
    expect(result.blockedBy).toHaveLength(0);
  });

  it("blocks engine-first actions", () => {
    const result = validateAction(makeProposal({ homeownerValue: 5, engineValue: 25 }));
    expect(result.approved).toBe(false);
    expect(result.blockedBy).toContain("lucent_lens");
  });

  it("blocks actions failing MVE (< 3 returns)", () => {
    const result = validateAction(
      makeProposal({
        mve: {
          materialValue: true,
          ontologyData: false,
          robotTraining: false,
          marketIntelligence: false,
        },
      }),
    );
    expect(result.approved).toBe(false);
    expect(result.blockedBy).toContain("mve_gate");
  });

  it("can fail both lens and MVE simultaneously", () => {
    const result = validateAction(
      makeProposal({
        homeownerValue: 0,
        engineValue: 20,
        mve: {
          materialValue: false,
          ontologyData: false,
          robotTraining: false,
          marketIntelligence: false,
        },
      }),
    );
    expect(result.approved).toBe(false);
    expect(result.blockedBy).toContain("lucent_lens");
    expect(result.blockedBy).toContain("mve_gate");
  });

  it("returns complete lens score breakdown", () => {
    const result = validateAction(makeProposal());
    expect(result.lensScore.homeowner).toBe(30);
    expect(result.lensScore.collective).toBe(20);
    expect(result.lensScore.engine).toBe(10);
    expect(result.lensScore.total).toBe(60);
  });
});

/* ─── AgentOrchestrator ─── */

describe("AgentOrchestrator", () => {
  let orch: AgentOrchestrator;

  beforeEach(() => {
    orch = new AgentOrchestrator();
  });

  describe("register", () => {
    it("registers an agent with intent inheritance", () => {
      const state = orch.register("pi", "Project Intelligence");
      expect(state.intent.agentId).toBe("pi");
      expect(state.intent.agentName).toBe("Project Intelligence");
      expect(state.status).toBe("idle");
      expect(state.actionsExecuted).toBe(0);
    });

    it("sets parent agent ID", () => {
      orch.register("ceo", "CEO");
      const state = orch.register("pi", "Project Intelligence", "ceo");
      expect(state.intent.parentAgentId).toBe("ceo");
    });

    it("throws on duplicate registration", () => {
      orch.register("pi", "Project Intelligence");
      expect(() => orch.register("pi", "PI Again")).toThrow("already registered");
    });

    it("inherits all custodian constraints", () => {
      const state = orch.register("test", "Test Agent");
      expect(state.intent.enforcedConstraints).toHaveLength(4);
      expect(state.intent.canOverrideMVE).toBe(false);
    });
  });

  describe("submitAction", () => {
    beforeEach(() => {
      orch.register("pi", "Project Intelligence");
    });

    it("executes approved actions and updates state", () => {
      const result = orch.submitAction(makeProposal());
      expect(result.approved).toBe(true);

      const agent = orch.getAgent("pi");
      expect(agent?.status).toBe("active");
      expect(agent?.actionsExecuted).toBe(1);
      expect(agent?.lastAction).toBe("find_value_task");
    });

    it("blocks disapproved actions and increments counter", () => {
      orch.submitAction(makeProposal({ homeownerValue: 0, engineValue: 25 }));
      const agent = orch.getAgent("pi");
      expect(agent?.actionsBlocked).toBe(1);
      expect(agent?.actionsExecuted).toBe(0);
    });

    it("marks agent as blocked after 10+ failed actions", () => {
      for (let i = 0; i < 11; i++) {
        orch.submitAction(makeProposal({ homeownerValue: 0, engineValue: 25 }));
      }
      const agent = orch.getAgent("pi");
      expect(agent?.status).toBe("blocked");
    });

    it("throws for unregistered agent", () => {
      expect(() => orch.submitAction(makeProposal({ agentId: "unknown" }))).toThrow(
        "not registered",
      );
    });

    it("throws for terminated agent", () => {
      orch.terminate("pi");
      expect(() => orch.submitAction(makeProposal())).toThrow("terminated");
    });
  });

  describe("messaging", () => {
    beforeEach(() => {
      orch.register("pi", "Project Intelligence");
      orch.register("cda", "Creative Design Agent");
    });

    it("sends messages between agents", () => {
      const msg = orch.sendMessage("pi", "cda", "design_request", { projectId: "P001" });
      expect(msg.from).toBe("pi");
      expect(msg.to).toBe("cda");
      expect(msg.action).toBe("design_request");
      expect(msg.priority).toBe("normal");
    });

    it("logs messages for audit", () => {
      orch.sendMessage("pi", "cda", "task_1");
      orch.sendMessage("cda", "pi", "task_1_result");
      expect(orch.getAuditLog()).toHaveLength(2);
    });

    it("filters messages by agent", () => {
      orch.sendMessage("pi", "cda", "task_1");
      orch.sendMessage("cda", "pi", "response");
      const piMessages = orch.getMessages("pi");
      expect(piMessages).toHaveLength(2);
    });

    it("throws for unregistered sender", () => {
      expect(() => orch.sendMessage("unknown", "pi", "test")).toThrow("not registered");
    });

    it("throws for unregistered recipient", () => {
      expect(() => orch.sendMessage("pi", "unknown", "test")).toThrow("not registered");
    });
  });

  describe("lifecycle", () => {
    it("terminates an agent", () => {
      orch.register("pi", "Project Intelligence");
      orch.terminate("pi");
      expect(orch.getAgent("pi")?.status).toBe("terminated");
    });

    it("lists all agents", () => {
      orch.register("pi", "Project Intelligence");
      orch.register("cda", "Creative Design Agent");
      orch.register("tta", "Trust Agent");
      expect(orch.listAgents().size).toBe(3);
    });

    it("returns undefined for unknown agent", () => {
      expect(orch.getAgent("nonexistent")).toBeUndefined();
    });
  });

  describe("stats", () => {
    it("tracks orchestrator-wide statistics", () => {
      orch.register("pi", "Project Intelligence");
      orch.register("cda", "Creative Design Agent");
      orch.submitAction(makeProposal());
      orch.submitAction(makeProposal({ homeownerValue: 0, engineValue: 25 }));
      orch.sendMessage("pi", "cda", "test");

      const stats = orch.stats();
      expect(stats.totalAgents).toBe(2);
      expect(stats.activeAgents).toBe(1);
      expect(stats.totalMessages).toBe(1);
      expect(stats.totalActions).toBe(1);
      expect(stats.totalBlocked).toBe(1);
    });
  });
});
