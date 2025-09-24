# Schema‑First Migration Tracker

Purpose

- Track progress migrating from sentinel-based parsers to a unified schema‑first parser/serializer.
- Keep tasks actionable, checkable, and tied to code locations.

Definition of Done (per section)

- Parsing parity against existing fixtures (no diffs vs current parser).
- Serializer round‑trip parity (serialize(parsed) matches original for normalized fields).
- Types compatible with existing models via `Infer<typeof schema>` or `satisfies`.
- Top‑level integration preserves file scanning semantics and indices.

How to Use

- Check items as you land PRs. Link PRs inline when helpful.
- Feel free to add/adjust tasks as new cases emerge.

Milestones

- [ ] Phase 1 — DSL scaffolding and docs
- [ ] Phase 2 — Migrate header + one simple section (junction/break line)
- [ ] Phase 3 — Migrate connections (incl. bridge/culvert subparts)
- [ ] Phase 4 — Migrate river reaches (incl. cross‑sections + contextual items)
- [ ] Phase 5 — Unify serializers to schema‑driven output
- [ ] Phase 6 — Tighten strictness and remove legacy paths

Framework & DSL

- [ ] Create `src/schema/` module layout (`core.ts`, `parts.ts`, `driver.ts`, `combinators.ts`)
- [ ] Implement `schema`, `fields`, `multiField`, `countedFixedWidthTuples`, `contextual`, `opt`
- [ ] Implement parts: `numberPart({ integer?, nullOnBlank? })`, `stringPart({ trim? })`, `booleanPart({ mode: 'TF'|'10'|'trueFalse'|'enableDisable' })`, `durationPart()`
- [ ] Driver functions: `parseWithSchema(schema, lines, start, { strict? })`, `serializeWithSchema(schema, obj)`
- [ ] Blank control helpers: `blankLine()`, `blankLines(n)` (only where formatting requires)
- [ ] Type inference helpers: tuple inference, `Infer<typeof schema>`, utility `Simplify`/`UnionToIntersection` if needed
- [ ] Section adapter: `parseSectionWithSchema(schema, lines, start)` → `{ data, nextIndex }` for top‑level compatibility
- [ ] Developer docs: brief DSL usage guide in `docs/` with examples

Parsers → Schemas (Geometry)

- [ ] Header → `headerSchema` (src/parsers/geometry/headerParser.ts)
- [ ] Break Line → `breakLineSchema` (src/parsers/geometry/breakLineParser.ts)
- [ ] Junction → `junctionSchema` (src/parsers/geometry/junctionParser.ts)
- [ ] Land Cover → `landCoverSchema` (src/parsers/geometry/landCoverParser.ts)
- [ ] Storage Area → `storageAreaSchema` (src/parsers/geometry/storageAreaParser.ts)
- [ ] Boundary Condition → `boundaryConditionSchema` (src/parsers/geometry/boundaryConditionParser.ts)
- [ ] IC Points → `icPointSchema` (src/parsers/geometry/icPointParser.ts)
- [ ] Connection (core) → `connectionSchema` (src/parsers/geometry/connectionParser.ts)
- [ ] Connection subpart → Bridge (`Conn BR: Bridge=`) (src/parsers/geometry/bridgeParser.ts)
- [ ] Connection subpart → Culvert (`Connection Culv=`) (src/parsers/geometry/culvertParser.ts)
- [ ] River Reach (core) → `riverReachSchema` (src/parsers/geometry/riverReachParser.ts)
- [ ] River Reach subpart → Cross‑Section header (`Type RM Length L Ch R=`)
- [ ] River Reach subpart → `#Sta/Elev=` tuples (counted fixed‑width)
- [ ] River Reach subpart → `#XS Ineff=` tuples (counted fixed‑width)
- [ ] River Reach subpart → `Permanent Ineff=` booleans (context‑dependent)

Top‑Level Integration

- [ ] Add schema adapter calls in `src/parseGeometry.ts` for migrated sections
- [ ] Preserve current behavior for unknown lines (skip), until coverage is near‑complete
- [ ] Optional: introduce strict mode at top level when coverage is complete

Serializers Alignment

- [ ] Implement schema‑driven serialization for migrated sections
- [ ] Align field ordering to current output (tests under `test/serializers/**`)
- [ ] Remove duplicated per‑section serializers once parity verified

Tests

- [ ] Add parser parity tests for each migrated section using existing fixtures (`test/data/**`)
- [ ] Add serializer round‑trip tests (migrated section only)
- [ ] Keep a temporary dual‑path test to compare legacy vs schema output where practical

Decisions & Risks (track as they resolve)

- [ ] Null vs undefined: `numberPart({ nullOnBlank: true })` for `number | null`; `opt(...)` for `undefined`
- [ ] Boolean encodings: ensure all modes covered (T/F, -1/0, True/False, Enable/Disable)
- [ ] Section termination: use non‑strict per‑section, strict optional at top level
- [ ] Unknown lines: maintain skip‑forward tolerance until strictness enabled
- [ ] Mapping hooks: tuple arrays vs object pairs for station/elevation

Stretch (optional, later)

- [ ] Extend DSL to Unsteady Flow (`src/parseUnsteadyFlow.ts`, `src/serializers/unsteadyFlow.ts`)
- [ ] Shared schema utilities for both geometry and unsteady flows

