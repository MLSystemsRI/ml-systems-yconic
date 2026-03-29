// Agent Orchestration Example — A2A Protocol + MCP Tool Execution
import { A2ARouter, executeToolCall, executeBatch } from "../src/agents/index.js";
import type { AgentCard } from "../src/agents/index.js";

// Set up the A2A router with 3 agents
const router = new A2ARouter();

const ceo: AgentCard = {
  agentId: "ceo", agentName: "CEO (Sal)", parentId: null,
  capabilities: [
    { domain: "intent", actions: ["validate"], maxHomeownerValue: 40, maxEngineValue: 30 },
    { domain: "finance", actions: ["approve"], maxHomeownerValue: 40, maxEngineValue: 30 },
  ],
  delegatesTo: ["fa", "pi"],
  delegatedFrom: null, status: "available",
};

const fa: AgentCard = {
  agentId: "fa", agentName: "Financial Architect", parentId: "ceo",
  capabilities: [
    { domain: "rcm", actions: ["calculate"], maxHomeownerValue: 40, maxEngineValue: 20 },
  ],
  delegatesTo: [],
  delegatedFrom: "ceo", status: "available",
};

router.registerCard(ceo);
router.registerCard(fa);

const mve = { materialValue: true, ontologyData: true, robotTraining: true, marketIntelligence: true };

// CEO delegates RCM calculation to Financial Architect
const delegation = router.delegate(
  "ceo", "fa", "calculate_mortgage", "rcm",
  { homeowner: 35, collective: 15, engine: 10 }, mve,
);
console.log(`Delegation: ${delegation.allowed ? "APPROVED" : "DENIED"}`);
console.log(`Task ID: ${delegation.delegatedTaskId}\n`);

// FA executes MCP tools against real engines
const results = executeBatch([
  { tool: "rcm_resolve_tier", arguments: { creditScore: 720 } },
  { tool: "rcm_calculate_payment", arguments: { principal: 200_000, annualRate: 0.065, termMonths: 360 } },
  { tool: "intent_validate_action", arguments: {
    homeownerValue: 35, collectiveValue: 15, engineValue: 10,
    materialValue: true, ontologyData: true, robotTraining: true, marketIntelligence: true,
  }},
]);

console.log("MCP Tool Results:");
for (const r of results) {
  console.log(`  ${r.tool}: ${r.success ? "OK" : "FAIL"} (${r.executionMs.toFixed(1)}ms)`);
  if (r.result) console.log(`    →`, JSON.stringify(r.result).slice(0, 80));
}

// Complete the task — results flow back up the hierarchy
router.completeTask(delegation.delegatedTaskId!, {
  tier: results[0]!.result?.["tier"],
  payment: results[1]!.result?.["monthlyPayment"],
});

console.log(`\nProtocol stats:`, router.stats());
