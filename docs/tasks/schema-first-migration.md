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

- [x] Phase 1 — DSL scaffolding and docs
- [ ] Phase 2 — Migrate header + simple sections
- [ ] Phase 3 — Migrate connections (incl. bridge/culvert subparts)
- [ ] Phase 4 — Migrate river reaches (incl. cross‑sections + contextual items)
- [ ] Phase 5 — Unify serializers to schema‑driven output
- [ ] Phase 6 — Tighten strictness and remove legacy paths

Phases and Tasks

Phase 1 — DSL scaffolding and docs

- [x] Create `src/schema/` layout (`core.ts`, `parts.ts`, `driver.ts`, `combinators.ts`).
- [x] Implement item kinds: `multiField`, `countedFixedWidthTuples`, `contextual`.
- [x] Implement composition: `section`, `repeat`, `include` (see schema-first.md “Compositional Items”).
- [x] Implement parts: `stringPart({ trim?, width?, pad? })`, `numberPart({ integer?, nullOnBlank? })`, `booleanPart({ mode: 'TF'|'10'|'trueFalse'|'enableDisable' })`, `durationPart()`.
- [x] Driver: `parseWithSchema(schema, lines, start, { strict? })`, `serializeWithSchema(schema, obj)`.
- [x] Blank control: `blankLine()`, `blankLines(n)` (only where formatting requires).
- [x] Type inference helpers: tuple inference, `Infer<typeof schema>`, `Simplify`/`UnionToIntersection`.
- [x] Recognizer helpers: `startsWith('…')` to standardize sentinels.
- [x] Optional serialization rules: implement undefined vs null behavior per schema-first.md (“Optional serialization guide”).
- [x] Section adapter: `parseSectionWithSchema(schema, lines, start)` → `{ data, nextIndex }` for top‑level parity.
- [x] Documentation: update `.claude/prompts/dsl-refactor/schema-first.md` with composition + optional serialization (done; verify).
- [x] Unit tests for parts and driver (basic coverage: numbers, booleans, tuples, `section/repeat`).

Phase 2 — Header + simple sections

- [ ] Header → `headerSchema` + adapter; parser parity tests.
- [ ] Break Line → `breakLineSchema` + adapter; parser parity tests.
- [ ] Junction → `junctionSchema` + adapter; parser parity tests.
- [ ] IC Points → `icPointSchema` + adapter; parser parity tests.
- [ ] Land Cover → `landCoverSchema` (if simple enough) + adapter; parser parity tests.
- [ ] Keep top‑level dispatch unchanged; do not wire schemas yet.

Phase 3 — Connections (with sub-schemas)

- [ ] Connection core → `connectionSchema` fields (name/centroid, routing, SA links, tables).
- [ ] Counted tuples: `Connection Line=`, `Connection Centerline Profile=`, `Conn Weir SE=`.
- [ ] Optional numerics: `hTabHWMax|TWMax` with `nullOnBlank`; serializer parity.
- [ ] Booleans: `Conn Use RC Family`, `Conn OverFlow Method 2D` (True/False mode).
- [ ] Sub-schemas: `section('bridge', startsWith('Conn BR: Bridge='), bridgeSchema)`.
- [ ] Sub-schemas: `repeat('culvert', startsWith('Connection Culv='), culvertSchema)`.
- [ ] Adapters and parser parity tests against fixtures.

Phase 4 — River reaches (cross‑sections + contextual)

- [ ] River Reach core → `riverReachSchema` (names, coordinates, text position, flags).
- [ ] Cross‑Section schema: header `Type RM Length L Ch R=`, `#Sta/Elev=`, `#XS Ineff=`, contextual `Permanent Ineff=`.
- [ ] Compose: `repeat('crossSections', startsWith('Type RM Length'), crossSectionSchema)`.
- [ ] Adapters and parser parity tests.

Phase 5 — Schema‑driven serialization

- [ ] Add schema serializers for migrated sections (align field order/format to tests).
- [ ] Reuse existing formatters (`formatFixedWidth`, `formatHECRASCoordinateNumber`) via parts/options where needed.
- [ ] Compare against current `src/serializers/**`; ensure line‑for‑line parity.
- [ ] Remove duplicated per‑section serializers once parity is verified.

Phase 6 — Integration + cleanup

- [ ] Wire `src/parseGeometry.ts` to call schema adapters for all migrated sections.
- [ ] Preserve unknown‑line skip tolerance until full coverage; then consider `strict: true` at top level.
- [ ] Remove legacy parsers behind a feature flag, then delete once stabilized.
- [ ] Finalize docs: schema-first.md, usage notes, and migration summary.

Tests (ongoing across phases)

- [ ] Add parser parity tests for each migrated section using existing fixtures (`test/data/**`).
- [ ] Add serializer round‑trip tests per section once schema serializers exist.
- [ ] Keep temporary dual‑path tests (legacy vs schema) where practical during migration.

Decisions & Risks (track as they resolve)

- [ ] Optionality: `null` vs `undefined` behavior (blank vs omit) adopted across drivers and serializers.
- [ ] Boolean encodings: cover TF, -1/0, True/False, Enable/Disable.
- [ ] Composition semantics: when to use `include` vs `section` vs `repeat`; ensure stable ordering with mixed blocks.
- [ ] Recognizer precedence: avoid collisions; document order‑sensitive cases.
- [ ] Formatting: align DSL parts with serializer formatting (padding, width) to avoid drift.
- [ ] Section termination: non‑strict per‑section; consider strict at top level after coverage.
- [ ] Unknown lines: maintain skip‑forward tolerance until strictness enabled.

Stretch (optional, later)

- [ ] Extend DSL to Unsteady Flow (`src/parseUnsteadyFlow.ts`, `src/serializers/unsteadyFlow.ts`).
- [ ] Shared schema utilities for both geometry and unsteady flows.
