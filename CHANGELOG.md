# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-03-29

### Added
- **TTP engine** — Transparency Trust Protocol: score 0-100 from 8 factors, 5 access bands, AI crawler detection (20+ bots), regulator scoping, verification fees, framework-agnostic middleware
- **RCM engine** — Reverse Construction Mortgage: 6 credit tiers by FICO, 100% principal allocation, standard (monthly) + preferred (daily arithmetic) schedules, overpayment modes, 6-tier comparison, loan origination pipeline
- **RCM equity simulator** — 360-month comparison of RCM vs traditional mortgage with property appreciation and material revenue integration
- **Intent Schema** — Lucent Lens scoring (homeowner 0-40 > collective 0-30 > engine 0-30), MVE gate (3/4 returns), Custodian constraints, agent intent factory, anti-SaaS pricing rules
- **Agent Orchestrator** — Multi-agent lifecycle management with Lucent Lens validation, safety cutoff (10+ blocks = auto-blocked), message routing
- **A2A Protocol** — Agent-to-Agent hierarchical task delegation with 4 enforcement rules (hierarchy, capability, value limits, intent preservation), capability discovery, task decomposition
- **MCP Tools** — 10 MCP-compatible tool definitions with runtime executors: TTP scoring, crawler detection, access checking, RCM tier resolution, payment calculation, preferred payoff, equity simulation, intent validation, provenance grading, material valuation
- **Provenance engine** — ML Material ID system (ML-{year}-{project}-Z{zone}-{seq}), structural grading (A/B/C/D/salvage) from 5 weighted factors, contamination assessment, DEM export, 15 material categories with zone-based pricing, recovery reports
- **Marketplace engine** — Secondary materials exchange: listings from provenance records, order processing, revenue → homeowner equity integration (51% share)
- **Closed-loop pipeline** — `executeClosedLoop()`: Finance → Deconstruct → Design → Build in single executable function, uses real engines at every stage, Maria scenario defaults
- **Field data engine** — Physical → digital bridge: inspection validation, auto-classification via 15 keyword dictionaries, observation → contamination mapping, provenance chain ingestion, batch processing
- **Disruption engine** — 5-multiplier composite scoring via geometric mean, closed-loop validation, paradigm comparison
- **Shared utilities** — Material category → zone mapping (15 categories → 10 zones), zone labels, active zone extraction
- **Database schema reference** — Typed table names and enum types for Drizzle ORM
- **Demo runner** — 10-step Maria scenario executing full closed loop
- **482 tests** across 21 test files (98.7% statement coverage, 100% function coverage)
- **12 cross-module integration tests** including A2A agents orchestrating the closed-loop pipeline via MCP tools
- **CI pipeline** — GitHub Actions: typecheck + lint + test
- **Documentation** — API reference (all 10 engines), architecture guide, contributing guide, security policy
- **Zero runtime dependencies** — all engines are pure TypeScript
