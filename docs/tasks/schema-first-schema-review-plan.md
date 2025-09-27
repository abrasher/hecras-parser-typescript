# Schema-First Schema Improvements Plan

## Context
- Review focus: `src/schemas/bridgeSchema.ts`, `src/schemas/culvertSchema.ts`, `src/schemas/landCoverSchema.ts`, plus shared DSL gaps surfaced during the schema audit.
- Goal: realign existing schemas with the DSL-first approach before expanding coverage, reduce legacy coupling, and prepare reusable helpers for upcoming migrations.

## Guiding Principles
- Prefer declarative DSL items (`multiField`, `tupleArrayField`, `repeat`, `section`, `contextual`) over bespoke parsing helpers.
- Migrate serialization logic into the schema wherever possible; avoid calling legacy serializers except during transitional phases explicitly called out below.
- Keep top-level parsing tolerant (non-strict) while refactors remain scoped to sub-schemas.
- Preserve current fixtures/tests behaviour; add focused regression coverage when rewriting complex sections.

## Phase 0 — Alignment & Safety Nets
1. Snapshot current behaviour
   - [ ] Review parity tests under `test/parsers/geometry` for break line, connection, culvert, land cover; note missing coverage.
   - [ ] Add minimal round-trip tests that exercise bridge + culvert sections using existing fixtures (`Mitigation*.g0*` already in repo). Tests should compare legacy vs schema output to guard the refactor.
2. DSL capability check
   - [ ] Inventory helpers required from `src/schema/parts.ts` / `driver.ts` to support planned refactors (e.g., optional tuple defaults, counted blocks).
   - [ ] Record any DSL limitations in `docs/tasks/schema-first-migration.md` → “Decisions & Risks”.

## Phase 1 — Bridge Schema Decomposition
1. Header + coefficients (target: `Conn BR: Bridge=`, `Conn BR: BR Coef=`, `Conn BR: BR Skew=`)
   - [ ] Replace header contextual parser with `multiField` items using `fields({ ... })` and `numberPart({ nullOnBlank: true })` where blanks are legal.
   - [ ] Use `booleanPart({ mode: '-1,0' })` if enums truly model booleans; otherwise keep numeric parts.
   - [ ] Implement `stringField`/`numberField` wrappers for coefficients; ensure serializer omits lines when values `undefined` and preserves `null` as blanks.
2. Cross-sections + Manning coefficients
   - [ ] Introduce reusable sub-schema `bridgeSectionSchema` handling `Conn BR: BR/XS SE=`, bank stations, and Manning arrays via `tupleArrayField`.
   - [ ] Plug sub-schemas via `section()` calls for each slot (inside/external upstream/downstream).
   - [ ] Ensure serializer uses `serializeWithSchema` outputs; only fallback to legacy serializer if parity gap is discovered (document gap if occurs).
3. Deck parameters & stationing
   - [ ] Model header line with `multiField` and use two `tupleArrayField`s (upstream/downstream stationing) sized by counts.
   - [ ] Represent upstream/downstream rows as arrays of tuples `[station, highChord, lowChord]`; if output structure must remain objects, adapt via `contextual` serializer hook.
4. Piers & sub-arrays
   - [ ] Use `repeat('piers', startsWith('Conn BR: Pier Skew'), pierSchema)`.
   - [ ] Inside `pierSchema`, consume skew header with `multiField` and read width/elevation arrays via tuple fields.
   - [ ] Replace manual coordinate formatting with shared DSL helpers (see Phase 2).
5. Clean-up
   - [ ] Remove redundant utility functions once schema items cover behaviour.
   - [ ] Update bridge model typing to `Infer<typeof bridgeSchema>` or assert compatibility with existing interfaces.

## Phase 2 — Culvert Schema Refactor
1. Line items
   - [ ] Replace custom `spacedIntegerPart` with a DSL-compatible part (possibly new helper in `parts.ts` to support padded integers & trailing comma control) to keep serialization consistent.
   - [ ] Convert header line to `multiField` using standard parts (leveraging any new helper as needed).
2. Barrel stations & fixed-width data
   - [ ] Introduce `tupleArrayField` for upstream/downstream station pairs with `tuple: 2` and `nullOnBlank` behaviour.
   - [ ] Ensure empty barrel counts cause the item to be skipped (return `null`) instead of emitting an empty success result.
3. Barrel geometry repeat
   - [ ] Implement `repeat('barrels', startsWith('Conn Culvert Barrel='), barrelSchema)`.
   - [ ] Within `barrelSchema`, express coordinate blocks via `tupleArrayField('Conn Culvert Barrel XY=', 'coordinates', …)`; if multiple lines share a label, augment DSL or use `contextual` with helper that reuses tuple parsing.
4. Optional inline numbers
   - [ ] Replace bespoke `parseOptionalInlineNumber` with `stringField`/`numberField` + `opt` pattern or add `inlineNumberField` helper for blank-as-undefined semantics.
5. Serializer alignment
   - [ ] Reuse shared formatting utilities (`formatStationPairs`, `coordinatePairToString`) only through parts; after DSL migration the schema serializer should stand alone.

## Phase 3 — Land Cover Tables Automation
1. Counted CSV helper
   - [ ] Add DSL helper (e.g., `countedCsvField`) that parses `Label=<count>` + N comma-separated lines into `[string, number][]`.
   - [ ] Implement shared part under `src/schema/parts.ts` so other sections can reuse it.
2. Schema rewrite
   - [ ] Replace `contextual` table parsing blocks with the new helper.
   - [ ] Update region schema to use repeated helper; ensure polygon tuple arrays remain via existing DSL item.
3. Tests
   - [ ] Add round-trip test covering multiple regions and zero-row tables to confirm optional handling.

## Phase 4 — Shared DSL Enhancements & Cleanup
1. Fixed-width tuple utilities
   - [ ] Expose a reusable function or part for 2D coordinate tuples to remove duplicated `readFixedWidthSegments` logic (bridge + culvert share this need).
2. Optional/blank semantics validation
   - [ ] Audit all newly migrated fields for correct handling of `undefined` vs `null` vs blank serialization; update docs with concrete examples.
3. Documentation & tracking
   - [ ] Update `docs/tasks/schema-first-migration.md` Decisions & Risks section with any blockers or new helper descriptions.
   - [ ] Add short usage examples to `.claude/prompts/dsl-refactor/schema-first.md` illustrating counted CSV + fixed-width tuple helpers.

## Acceptance Criteria
- Bridge, culvert, and land-cover schemas no longer rely on bespoke parsing helpers except where the DSL lacks necessary primitives; any remaining exceptions are documented.
- Schema serializers produce parity output verified by updated tests.
- Shared DSL additions are unit-tested and referenced in documentation.
- Legacy serializer imports can be removed (or isolated behind temporary compatibility shims) without breaking existing consumers.

## Open Questions / Follow-Ups
- Should we extend the DSL to allow tuple arrays yielding structured objects instead of numeric tuples (e.g., cross-section points with named keys)?
- Do we need dedicated helpers for integer fields that serialize with padded blanks or trailing commas, or can those behaviours be modelled via generic combinators already in `parts.ts`?
- Once these sections are migrated, re-evaluate whether `parseGeometry.ts` can start dispatching to schemas by default for connections/bridges without feature flags.
