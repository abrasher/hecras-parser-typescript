# HEC-RAS File Format Parsing Documentation

## Schema-First Architecture

The codebase is entirely schema-first. Parsing and serialization are defined via the DSL in `src/schema/**`, and concrete section schemas live under `src/schemas/**` (geometry, plan, project, steady flow). The drivers in `src/schema/driver.ts` power `parseWithSchema`, `parseSectionWithSchema`, and `serializeWithSchema`, so every data transformation flows through a schema definition. Tests in `test/schemas/**` exercise round-trip parity for each section.

### Key Modules

- `src/schema/core.ts` — schema item definitions and the `Infer` typing helpers
- `src/schema/combinators.ts` — DSL building blocks (`multiField`, `tupleArrayField`, `contextual`, `repeat`, `include`, etc.)
- `src/schema/parts.ts` — atomic parts such as `stringPart`, `numberPart`, `booleanPart`, and `opt`
- `src/schema/serializationUtils.ts` — coordinate/station formatting helpers and fixed-width padding utilities
- `src/schema/parsingUtils.ts` — contextual helpers (`parseKeyValue`, `parseMultilineArray`, `splitIntoTuples`)
- `src/schemas/**` — section/file schemas composed from the DSL

## DSL Building Blocks

- **`schema([...])`** defines the ordered items that make up a section.
- **`fields({...})` + `multiField`** handle CSV-style lines by combining individual parts.
- **`tupleField` / `tupleArrayField`** encode fixed-width tuples (single line vs. counted arrays).
- **`contextual`** handles variable-length or custom-formatted blocks using helpers from `parsingUtils`.
- **`repeat`** consumes contiguous sub-sections matched with `startsWith(...)` recognizers.
- **`include`** inlines another schema when nesting is not desirable.
- **`blankLineIfNotEmpty("key")`** emits a spacer line only when the referenced key resolves to a non-empty array (pass a custom predicate for other cases).
- **Parts** (`stringPart`, `numberPart`, `booleanPart`, `durationPart`, `opt`, `numberPart({ nullOnBlank: true })`, etc.) encode per-field semantics for trimming, optionality, and formatting quirks.

## Fixed-Width Patterns

### Coordinate Data Format

```
Position:  1-16      17-32     33-48     49-64
Format:   [NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN][NNNNNNNN.NNNNNN]
```

- Use `tupleArrayField(..., { width: 16, maxWidth: 64, tuple: 2, formatter: "coordinate", pad: true })`.
- Serialization uses `formatHECRASCoordinateNumber` to maintain width and alignment.
- Tests ensure headers with counts (e.g., `"...= 2 "`) round-trip with identical whitespace.

### Station Pair Data Format

```
Position:  1-8      9-16     17-24    25-32    33-40    41-48    49-56    57-64    65-72    73-80
Format:   [NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN][NNNN.NN]
```

- Represent with `tupleArrayField(..., { width: 8, maxWidth: 80, tuple: 2, formatter: "station" })`.
- `nullOnBlank` keeps empty slots as blanks so downstream consumers receive `null` instead of zero.
- Use `pad: true` when the format requires trailing spaces to reach 80 characters.

### Bridge Deck Parameters

- Station/high/low chords are separate `tupleArrayField` blocks that reuse the station format configuration.
- Keep arrays aligned by sharing the same `count` value computed in the schema object.
- When low chords contain blanks, combine `tupleArrayField` with `numberPart({ nullOnBlank: true })` inside `fields(...)`.

## Key-Value & CSV Patterns

- Use `parseKeyValue` from `parsingUtils` inside `contextual` items when custom separators or padding matter.
- Standard key/value lines prefer `stringField`/`numberField`/`booleanField` helpers which automatically trim and emit blanks.
- CSV segments belong in `multiField` with `fields({...})` so each column can specify trimming and blank/null semantics.

## Contextual Blocks

- `contextual` is the escape hatch for headers that announce a count followed by lines with bespoke padding (e.g., `Storage Area Surface Line=` blocks).
- Pair `contextual` with helpers: `parseMultilineArray` to chunk fixed widths and `splitIntoTuples` for coordinate pairs.
- Always serialize using the same helpers to guarantee padding symmetry.

## Critical Formatting Rules

- **16-char coordinates**: Always right-aligned with spaces; use the `coordinate` formatter.
- **8-char stations**: Same alignment rules; leverage the `station` formatter.
- **Boolean encodings**: Pick an explicit mode (`-1,0`, `TF`, `10`, etc.) rather than relying on defaults.
- **Infinity sentinel**: `numberPart` emits `1.79769313486232E+308` for `Infinity`; tests cover sections that require it.
- **Blank vs null vs undefined**:
  - `undefined` on single-field lines omits the line entirely.
  - `null` with `nullOnBlank: true` writes the key with an empty value segment.
  - `multiField` blanks individual segments when set to `undefined`; the line emits if any segment is defined.

## Component Notes

- **Storage Areas**: Surface lines use `contextual` with `parseMultilineArray`; 2D points reuse `tupleArrayField` with coordinate formatter; boolean flags use `booleanField(..., { mode: "-1,0" })`.
- **Land Cover**: Region tables are handled with `contextual` blocks that read a count and emit CSV rows; polygons reuse the coordinate formatter.
- **Boundary Conditions**: Arc and polyline coordinates employ padded `tupleArrayField` blocks to match legacy file spacing.
- **Connections / Bridges / Culverts**: Share station and coordinate tuple arrays; tune blank handling per numeric field using `nullOnBlank`.
- **River Reaches**: The `riverReachSchema` now emits `riverStationEntries`, an ordered list of cross sections (`type = 1`) and lateral weirs (`type = 6`). Entries are parsed/serialized via a `contextual` dispatcher that preserves file ordering while letting downstream code discriminate by the existing `type` field.

## Testing Expectations

- Every schema change should add or update tests in `test/schemas/**` covering parse → serialize → parse round-trips.
- Tests must assert line-for-line parity (including whitespace) for critical sections such as coordinates, station tables, and boolean encodings.
- Include focused cases for blank/null propagation, boolean mode output, and count headers when they affect serialization.

## Decisions & Risks

Document new formatting discoveries, schema limitations, or trade-offs here. Include the relevant schema/test path and a short summary so future contributors understand the current state and open work.

- _[Add entries as the migration progresses]_
- _2025-10-06_ — River reaches represent cross sections and lateral weirs as a single `riverStationEntries` union keyed by `type`. This mirrors the HEC-RAS interleaving (e.g., XS/XSLW/XS…) and keeps serialization stable. Callers that previously expected `crossSections` must filter by `entry.type === 1`.
- _2025-11-24_ — Cross sections now support `Levee=` lines with format `Levee=<enabled>,<leftStation>,<leftElevation>,<leftSide>,<rightStation>,<rightElevation>,<rightSide>,<additionalParam>`. All numeric fields use `nullOnBlank: true` to preserve blank values (empty CSV segments). The boolean `enabled` field uses `-1,0` encoding. **Note: Field names are inferred from a single example (`Levee=-1,182.83,254,0,,,0,0`) and need verification against HEC-RAS documentation.** See `src/schemas/geometry/crossSectionSchema.ts:66-82`.
- _2026-02-18_ — `planSchema` is now a large structured schema (typed fields plus nested repeats/sections such as UNET D2 areas, PS areas, breaches, and dredge events) rather than a header-plus-passthrough parser. Current plan risks are focused on edge-case formatting/coverage parity, not wholesale raw-line passthrough. See `src/schemas/planSchema.ts` and `test/schemas/planSchema.test.ts`.
- _2026-02-17_ — Added `steadyFlowSchema` for `.fXX` steady flow files covering headers, river flow blocks, boundary blocks, observed water surface lines, DSS import lines, and storage area elevation blocks. To preserve exact round-trip spacing in current sample files, per-profile flow/elevation value rows are currently stored as single raw lines via `contextual` rather than parsed into numeric arrays. See `src/schemas/steadyFlowSchema.ts` and `test/schemas/steadyFlowSchema.test.ts`.
- _2026-02-17_ — Added `unsteadyFlowSchema` for `.uXX` files with structured parsing for core header and initial-condition lines (`Flow Title`, `Program Version`, `Use Restart`, optional `Restart Filename`, and repeating initial location/elevation lines). All remaining lines are currently captured and serialized verbatim via a contextual passthrough to preserve exact round-trip fidelity while deeper unsteady migration continues. See `src/schemas/unsteadyFlowSchema.ts` and `test/schemas/unsteadyFlowSchema.test.ts`.
