import { describe, it, expect } from "vitest";
import { ALL_TOOLS, getTool, listToolNames } from "./tools.js";

describe("tool registry", () => {
  it("contains 7 tools", () => {
    expect(ALL_TOOLS).toHaveLength(7);
  });

  it("all tools have unique names", () => {
    const names = ALL_TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all tools have descriptions", () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(20);
    }
  });

  it("all tools have at least one parameter", () => {
    for (const tool of ALL_TOOLS) {
      expect(tool.parameters.length).toBeGreaterThan(0);
    }
  });

  it("all parameters have name, type, and description", () => {
    for (const tool of ALL_TOOLS) {
      for (const param of tool.parameters) {
        expect(param.name.length).toBeGreaterThan(0);
        expect(["string", "number", "boolean", "object"]).toContain(param.type);
        expect(param.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("getTool", () => {
  it("finds tools by name", () => {
    expect(getTool("ttp_score_entity")?.name).toBe("ttp_score_entity");
    expect(getTool("rcm_resolve_tier")?.name).toBe("rcm_resolve_tier");
    expect(getTool("intent_validate_action")?.name).toBe("intent_validate_action");
  });

  it("returns undefined for unknown tools", () => {
    expect(getTool("nonexistent")).toBeUndefined();
  });
});

describe("listToolNames", () => {
  it("returns all tool names", () => {
    const names = listToolNames();
    expect(names).toHaveLength(7);
    expect(names).toContain("ttp_score_entity");
    expect(names).toContain("rcm_calculate_payment");
    expect(names).toContain("intent_validate_action");
  });
});

describe("tool categories", () => {
  it("has 3 TTP tools", () => {
    const ttpTools = ALL_TOOLS.filter((t) => t.name.startsWith("ttp_"));
    expect(ttpTools).toHaveLength(3);
  });

  it("has 3 RCM tools", () => {
    const rcmTools = ALL_TOOLS.filter((t) => t.name.startsWith("rcm_"));
    expect(rcmTools).toHaveLength(3);
  });

  it("has 1 Intent tool", () => {
    const intentTools = ALL_TOOLS.filter((t) => t.name.startsWith("intent_"));
    expect(intentTools).toHaveLength(1);
  });
});
