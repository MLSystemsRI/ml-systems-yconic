# Contributing

ML Systems is a private repository. Contributions are by invitation only.

## Development

```bash
npm install
npm run ci          # typecheck + lint + test (run before every PR)
```

## Standards

- **TypeScript strict mode** is required. No `any` types, no `@ts-ignore`.
- **Pure functions preferred.** Side effects belong in clearly separated layers, not in scoring or financial math.
- **80% test coverage threshold.** New functions must include tests.
- **ESLint + Prettier** are enforced. Run `npm run lint:fix && npm run format` before committing.

## Pull Request Checklist

1. `npm run ci` passes (typecheck, lint, all tests green)
2. New exports are documented in the relevant `index.ts` barrel file
3. Types are defined in `types.ts`, not inline
4. Test file mirrors source file: `engine.ts` -> `engine.test.ts`
5. No secrets, credentials, or environment-specific values in source

## Architecture

Ten engines, one barrel export. See `docs/ARCHITECTURE.md` for the full map.

| Engine | Path | Purpose |
|--------|------|---------|
| TTP | `src/ttp/` | Transparency Trust Protocol — scoring, access bands, AI crawler detection |
| RCM | `src/rcm/` | Reverse Construction Mortgage — 6 tiers, equity simulator |
| Intent | `src/intent/` | Lucent Lens + MVE + Custodian constraints |
| Agents | `src/agents/` | Orchestrator, A2A protocol, 10 MCP tools |
| Provenance | `src/provenance/` | ML Material IDs, grading, contamination, valuation |
| Marketplace | `src/marketplace/` | Listings, orders, revenue → equity |
| Closed Loop | `src/closed-loop/` | Finance → Deconstruct → Design → Build pipeline |
| Field Data | `src/field-data/` | Inspection validation, auto-classification, ingestion |
| Disruption | `src/disruption/` | 5-multiplier composite paradigm scoring |
| Shared | `src/shared/` | Zone mapping, cross-module utilities |
