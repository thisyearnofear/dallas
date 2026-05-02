# 9/10 Readiness Scorecard

This scorecard defines what "9/10" means for Dallas Buyers Club: Agent Alliance. It should be used before releases, major merges, and product direction changes.

## Product Design

Target: 9/10

- Clear primary customer: AI agent developers and teams with recurring agent failure modes.
- Clear core loop: discover alliance, join with wallet, submit encrypted optimization log, prove performance delta, unlock alliance resources.
- Clear value capture: alliance fees, validator work, DBC governance and burn mechanics.
- Clear differentiation: privacy-preserving proof of optimization, alliance-owned tokens, reusable validation infrastructure.
- No health-era language in user-facing flows unless explicitly framed as historical brand flavor.

## System Architecture

Target: 9/10

- Canonical domain names: alliance, agent, optimization log, validator, proof, treasury.
- Shared contracts live in `src/types`, `src/config`, and domain services, not scattered component aliases.
- Heavy privacy runtimes are lazy and feature-gated.
- API handlers use typed storage boundaries and do not depend on removed in-memory maps.
- Prototype shims are documented and isolated from production paths.

## UI/UX

Target: 9/10

- First screen communicates agent alliances, not a generic token marketplace or legacy health metaphor.
- Main workflows are obvious: Discover, Submit Log, Validate, Launch Alliance, Govern.
- Screens are dense enough for builders, but labels are consistent and scannable.
- Demo/prototype states are visibly marked and do not masquerade as live production data.
- Visual style supports trust: fewer novelty metaphors, more operational clarity.

## Production Readiness

Target: 9/10

- `npx tsc --noEmit`, `npm run build`, and secret scanning pass.
- Runtime feature flags are explicit for Aleo, real ZK proving, mock blockchain, and demo data.
- Large dependencies are code-split and not loaded on default routes.
- Environment warnings are resolved before deployment.
- External integrations have readiness checks, fallback behavior, and user-visible status.

## Current Gap List

- Remove remaining backward-compatible legacy API aliases once tests and downstream callers migrate.
- Split privacy service exports so default app routes do not import proof runtimes.
- Add integration tests for API KV persistence and validation state transitions.
- Add live readiness indicators for Bags, Helius, Aleo, Light Protocol, and Arcium.
- Tighten design system spacing, typography, and empty states across token and validation surfaces.
