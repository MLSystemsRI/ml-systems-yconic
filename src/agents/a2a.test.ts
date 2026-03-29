import { describe, it, expect, beforeEach } from "vitest";
import { A2ARouter } from "./a2a.js";
import type { AgentCard } from "./a2a.js";
import type { MVEAssessment } from "../intent/schema.js";

const fullMVE: MVEAssessment = {
  materialValue: true,
  ontologyData: true,
  robotTraining: true,
  marketIntelligence: true,
};

function makeCEOCard(): AgentCard {
  return {
    agentId: "ceo",
    agentName: "CEO",
    parentId: null,
    capabilities: [
      {
        domain: "intent",
        actions: ["validate", "override"],
        maxHomeownerValue: 40,
        maxEngineValue: 30,
      },
      {
        domain: "finance",
        actions: ["approve", "review"],
        maxHomeownerValue: 40,
        maxEngineValue: 30,
      },
    ],
    delegatesTo: ["pi", "fa", "lm"],
    delegatedFrom: null,
    status: "available",
  };
}

function makePICard(): AgentCard {
  return {
    agentId: "pi",
    agentName: "Project Intelligence",
    parentId: "ceo",
    capabilities: [
      { domain: "ttp", actions: ["score", "verify"], maxHomeownerValue: 30, maxEngineValue: 20 },
      {
        domain: "deconstruction",
        actions: ["analyze", "plan"],
        maxHomeownerValue: 35,
        maxEngineValue: 15,
      },
    ],
    delegatesTo: ["decon", "design"],
    delegatedFrom: "ceo",
    status: "available",
  };
}

function makeFACard(): AgentCard {
  return {
    agentId: "fa",
    agentName: "Financial Architect",
    parentId: "ceo",
    capabilities: [
      {
        domain: "rcm",
        actions: ["calculate", "compare"],
        maxHomeownerValue: 40,
        maxEngineValue: 20,
      },
      {
        domain: "finance",
        actions: ["model", "project"],
        maxHomeownerValue: 40,
        maxEngineValue: 20,
      },
    ],
    delegatesTo: [],
    delegatedFrom: "ceo",
    status: "available",
  };
}

function makeDeconCard(): AgentCard {
  return {
    agentId: "decon",
    agentName: "Deconstruction Agent",
    parentId: "pi",
    capabilities: [
      {
        domain: "deconstruction",
        actions: ["assess", "recover"],
        maxHomeownerValue: 30,
        maxEngineValue: 15,
      },
    ],
    delegatesTo: [],
    delegatedFrom: "pi",
    status: "available",
  };
}

/* ─── Registration & Discovery ─── */

describe("A2ARouter registration", () => {
  let router: A2ARouter;

  beforeEach(() => {
    router = new A2ARouter();
  });

  it("registers agent cards", () => {
    router.registerCard(makeCEOCard());
    expect(router.listCards()).toHaveLength(1);
  });

  it("throws on duplicate registration", () => {
    router.registerCard(makeCEOCard());
    expect(() => router.registerCard(makeCEOCard())).toThrow("already registered");
  });

  it("discovers agents by ID", () => {
    router.registerCard(makeCEOCard());
    const card = router.discover("ceo");
    expect(card?.agentName).toBe("CEO");
    expect(card?.capabilities).toHaveLength(2);
  });

  it("returns undefined for unknown agents", () => {
    expect(router.discover("unknown")).toBeUndefined();
  });
});

describe("capability discovery", () => {
  let router: A2ARouter;

  beforeEach(() => {
    router = new A2ARouter();
    router.registerCard(makeCEOCard());
    router.registerCard(makePICard());
    router.registerCard(makeFACard());
    router.registerCard(makeDeconCard());
  });

  it("finds agents by capability domain", () => {
    const ttpAgents = router.findByCapability("ttp");
    expect(ttpAgents).toHaveLength(1);
    expect(ttpAgents[0].agentId).toBe("pi");
  });

  it("finds multiple agents for shared domains", () => {
    const financeAgents = router.findByCapability("finance");
    expect(financeAgents).toHaveLength(2);
  });

  it("returns empty array for uncovered domains", () => {
    const marketplaceAgents = router.findByCapability("marketplace");
    expect(marketplaceAgents).toHaveLength(0);
  });

  it("excludes busy agents from capability search", () => {
    /* Delegate to PI to make it busy */
    router.delegate(
      "ceo",
      "pi",
      "score_project",
      "ttp",
      { homeowner: 30, collective: 20, engine: 10 },
      fullMVE,
    );
    const ttpAgents = router.findByCapability("ttp");
    expect(ttpAgents).toHaveLength(0);
  });
});

/* ─── Delegation ─── */

describe("task delegation", () => {
  let router: A2ARouter;

  beforeEach(() => {
    router = new A2ARouter();
    router.registerCard(makeCEOCard());
    router.registerCard(makePICard());
    router.registerCard(makeFACard());
    router.registerCard(makeDeconCard());
  });

  it("delegates tasks down the hierarchy", () => {
    const result = router.delegate(
      "ceo",
      "pi",
      "analyze_site",
      "ttp",
      { homeowner: 25, collective: 15, engine: 10 },
      fullMVE,
    );
    expect(result.allowed).toBe(true);
    expect(result.delegatedTaskId).toBeTruthy();
  });

  it("blocks delegation outside hierarchy", () => {
    const result = router.delegate(
      "fa",
      "pi",
      "score_project",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not in delegation chain");
  });

  it("blocks delegation to agents lacking capability", () => {
    const result = router.delegate(
      "ceo",
      "fa",
      "deconstruct",
      "deconstruction",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("lacks capability");
  });

  it("blocks when homeowner value exceeds agent limit", () => {
    const result = router.delegate(
      "ceo",
      "pi",
      "score_project",
      "ttp",
      { homeowner: 35, collective: 10, engine: 5 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("exceeds");
  });

  it("blocks when engine exceeds homeowner (Lucent Lens)", () => {
    const result = router.delegate(
      "ceo",
      "pi",
      "score_project",
      "ttp",
      { homeowner: 5, collective: 10, engine: 20 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Lucent Lens");
  });

  it("blocks delegation to busy agents", () => {
    router.delegate(
      "ceo",
      "pi",
      "task1",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    const result = router.delegate(
      "ceo",
      "pi",
      "task2",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("busy");
  });

  it("blocks delegation from unregistered agents", () => {
    const result = router.delegate(
      "unknown",
      "pi",
      "task",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not registered");
  });
});

/* ─── Task Lifecycle ─── */

describe("task lifecycle", () => {
  let router: A2ARouter;

  beforeEach(() => {
    router = new A2ARouter();
    router.registerCard(makeCEOCard());
    router.registerCard(makePICard());
  });

  it("completes tasks and frees agents", () => {
    const { delegatedTaskId } = router.delegate(
      "ceo",
      "pi",
      "score",
      "ttp",
      { homeowner: 25, collective: 15, engine: 10 },
      fullMVE,
    );
    expect(router.discover("pi")?.status).toBe("busy");

    const task = router.completeTask(delegatedTaskId!, { score: 75 });
    expect(task?.status).toBe("completed");
    expect(task?.result).toEqual({ score: 75 });
    expect(router.discover("pi")?.status).toBe("available");
  });

  it("fails tasks with error reason", () => {
    const { delegatedTaskId } = router.delegate(
      "ceo",
      "pi",
      "score",
      "ttp",
      { homeowner: 25, collective: 15, engine: 10 },
      fullMVE,
    );

    const task = router.failTask(delegatedTaskId!, "insufficient data");
    expect(task?.status).toBe("failed");
    expect(task?.result).toEqual({ error: "insufficient data" });
    expect(router.discover("pi")?.status).toBe("available");
  });

  it("returns undefined for unknown tasks", () => {
    expect(router.completeTask("nonexistent", {})).toBeUndefined();
    expect(router.failTask("nonexistent", "error")).toBeUndefined();
  });

  it("tracks tasks by agent", () => {
    router.delegate(
      "ceo",
      "pi",
      "task1",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );
    const piTasks = router.getAgentTasks("pi");
    expect(piTasks).toHaveLength(1);
    expect(piTasks[0].assignedTo).toBe("pi");

    const ceoTasks = router.getAgentTasks("ceo");
    expect(ceoTasks).toHaveLength(1);
    expect(ceoTasks[0].createdBy).toBe("ceo");
  });
});

/* ─── Task Decomposition ─── */

describe("task decomposition", () => {
  let router: A2ARouter;

  beforeEach(() => {
    router = new A2ARouter();
    router.registerCard(makeCEOCard());
    router.registerCard(makePICard());
    router.registerCard(makeDeconCard());

    /* Create parent task */
    router.delegate(
      "ceo",
      "pi",
      "full_site_assessment",
      "deconstruction",
      { homeowner: 30, collective: 20, engine: 10 },
      fullMVE,
    );
  });

  it("decomposes tasks into subtasks", () => {
    const parentTask = router.getAgentTasks("pi")[0];
    const results = router.decompose(parentTask.id, [
      {
        toId: "decon",
        action: "assess_roof",
        domain: "deconstruction",
        values: { homeowner: 25, collective: 15, engine: 10 },
        mve: fullMVE,
      },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].allowed).toBe(true);
  });

  it("links subtasks to parent", () => {
    const parentTask = router.getAgentTasks("pi")[0];
    router.decompose(parentTask.id, [
      {
        toId: "decon",
        action: "assess_foundation",
        domain: "deconstruction",
        values: { homeowner: 20, collective: 10, engine: 5 },
        mve: fullMVE,
      },
    ]);

    const updated = router.getTask(parentTask.id);
    expect(updated?.subtasks).toHaveLength(1);
  });

  it("fails decomposition for unknown parent task", () => {
    const results = router.decompose("nonexistent", [
      {
        toId: "decon",
        action: "assess",
        domain: "deconstruction",
        values: { homeowner: 20, collective: 10, engine: 5 },
        mve: fullMVE,
      },
    ]);
    expect(results[0].allowed).toBe(false);
    expect(results[0].reason).toContain("not found");
  });
});

/* ─── Statistics ─── */

describe("A2A stats", () => {
  it("tracks protocol-wide statistics", () => {
    const router = new A2ARouter();
    router.registerCard(makeCEOCard());
    router.registerCard(makePICard());

    router.delegate(
      "ceo",
      "pi",
      "task1",
      "ttp",
      { homeowner: 20, collective: 10, engine: 5 },
      fullMVE,
    );

    const stats = router.stats();
    expect(stats.totalAgents).toBe(2);
    expect(stats.availableAgents).toBe(1);
    expect(stats.totalTasks).toBe(1);
    expect(stats.pendingTasks).toBe(1);
  });
});
