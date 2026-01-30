# Agent Guidelines

This repo now centers on a schema-first parser/serializer. The guidance below distills what we’ve learned while implementing schemas so far and should prime agents to make consistent, correct changes quickly.

Read these first:

- `docs/hecras-parsing-format-specification.md` — architecture, formatting constraints, decisions/risks log
- `.claude/prompts/dsl-refactor/schema-first.md` — DSL reference, typing, serialization rules
- `CLAUDE.md` — architecture, gotchas, DSL quick reference, migration workflow

## What To Change (And Where)

- Implement new parsing/serialization under `src/schemas/**` using the DSL pieces from `src/schema/**`.
- Prefer DSL items: `schema`, `fields`, `multiField`, `tupleField`, `tupleArrayField`, `contextual`, `section`, `repeat`, `include`.
- Use drivers from `src/schema/driver.ts`: `parseWithSchema`, `parseSectionWithSchema`, `serializeWithSchema`.
- Keep the schema as the type source of truth: use `Infer<typeof mySchema>` for model typing; optionally `satisfies` against existing models during migration.

Optional/blank semantics to preserve round-trip fidelity:

- Use `opt(...)` for optional fields; for single-field lines, `undefined` omits the entire line.
- Use `numberPart({ nullOnBlank: true })` when blanks must round-trip to `null` and serialize as blanks.
- For boolean encodings, pick an explicit mode on `booleanPart({ mode: ... })`. We frequently need `"-1,0"`.

## Constraints And Expectations

- Keep parsing and serialization work inside `src/schemas/**` plus helpers in `src/schema/**`; avoid ad-hoc parsing elsewhere.
- Keep top-level parsing tolerant (non-strict) while coverage grows; drive composition with recognizers (`startsWith(...)`) and adapters as tracked in the migration doc.
- Update docs or comments in the same PR when adding or changing schemas. Add/extend tests next to the migrated schemas.

## Patterns From Implemented Schemas

Below are concrete patterns we’ve adopted across real sections. Use these as reference for new work.

1) Boundary Condition Lines (`src/schemas/boundaryConditionSchema.ts`)

- Use `tupleField` for single coordinate pairs and `tupleArrayField` for polyline/arc lists.
- Coordinate formatting: fixed-width 16 chars per number; set `formatter: "coordinate"`, `width: 16`, `maxWidth: 64`, `tuple: 2`, and `pad: true` to emit exact widths and whitespace padding.
- Some headers require a space-padded count (e.g., `"BC Line Arc= 2 "`). Honor this in serializer; `tupleArrayField` + `pad: true` matches current files/tests.
- Fixed-length strings: specify `length` on `stringField` to pad/truncate exactly (e.g., name length 32).

2) BreakLine (`src/schemas/breakLineSchema.ts`)

- Simple field lines via `stringField`/`numberField`; preserve blank→null with `numberField(..., { nullOnBlank: true })` for `CellSize Max`.
- Polyline points: `tupleArrayField("BreakLine Polyline=", "polylinePoints", { width: 16, maxWidth: 64, tuple: 2, formatter: "coordinate", pad: true })` to write 4 numbers per line (two XY pairs).
- Tests verify blank `CellSize Max` serializes back to a blank segment, not `0` or omission.

3) IC Point (`src/schemas/icPointSchema.ts`)

- Use `multiField("IC Point Position=", fields({ x: numberPart(), y: numberPart() }))` for compact CSV pairs.
- Names often have fixed width; use `stringField("name", "IC Point Name=", { length: 32 })` to pad correctly.

4) Junction (`src/schemas/junctionSchema.ts`)

- Mixed CSV and repeats: `multiField` for description + four booleans; encode booleans with `booleanPart({ mode: "-1,0" })` to match HEC-RAS format.
- Repeats: `repeat("upstreamConnections", startsWith("Up River,Reach="), schema([...]))` to consume contiguous upstream lines. Use `startsWith` recognizers for each repeating sub-block.
- CSV trimming: use `stringPart({ trim: true })` for river/reach names to tolerate padded input.

5) Land Cover (`src/schemas/landCoverSchema.ts`)

- Use `contextual` when headers embed a row count followed by that many lines. See `parseLandCoverTable` / `serializeLandCoverTable` for a compact pattern:
  - Parse: read `Label=<count>` header, then exact `count` CSV rows.
  - Serialize: output header with the count, then each `name,value` row.
- Region polygons: `tupleArrayField("LCMann Region Polygon=", "polygon", { width: 16, maxWidth: 64, tuple: 2, formatter: "coordinate" }).`
- Keep top-level and per-region tables separated; use `repeat("regions", startsWith("LCMann Region Name="), landCoverRegionSchema)`.

6) Storage Area (`src/schemas/storageAreaSchema.ts`)

- Header line with optional blanks: `multiField("Storage Area=", fields({ id: stringPart({ trim: true }), centroidX: numberPart({ nullOnBlank: true }), centroidY: numberPart({ nullOnBlank: true }) })).`
- Custom fixed-width blocks with trailing padding are best handled with `contextual`:
  - `Storage Area Surface Line=`: header with a count, then one XY pair per line, padded to 48 chars. Use `parseMultilineArray` to chunk 16-char segments and `splitIntoTuples(..., 2)` to build coordinates. On serialize, format with `formatHECRASCoordinateNumber` and pad each line to 48 chars.
  - `Storage Area 2D Points=`: prefer `tupleArrayField` with `width: 16`, `maxWidth: 64`, `tuple: 2`, `formatter: "coordinate"`, `pad: true` for standard XY arrays.
- Numeric options: a number of 2D tuning fields are optional; add `{ nullOnBlank: true }` to preserve blanks when present and omit lines entirely when the field is `undefined`.
- Boolean encoding: `booleanField("is2D", "Storage Area Is2D=", { mode: "-1,0" })`.
- Station/elevation pairs: for two-column tables use `tupleArrayField(..., { width: 8, maxWidth: 80, tuple: 2, formatter: "station" })` to match the 8-char, 10-values-per-line convention.

7) River Reach (`src/schemas/geometry/riverReachSchema.ts`)

- Use `tupleArrayField("Reach XY=", ...)` with `formatter: "coordinate"` and `pad: true` for planform coordinates.
- River-station entries follow `Type RM Length L Ch R =`; map the type code to the correct sub-schema and stream the block with a `contextual` parser that delegates to `parseSectionWithSchema` / `serializeWithSchema`.
- Supported types today: `1` → cross section, `3` → one-dimensional bridge, `5` → inline weir, `6` → lateral weir. Extend `schemaByType` when new station types appear.

8) Cross Section (`src/schemas/geometry/crossSectionSchema.ts`)

- Station/elevation tables: `tupleArrayField("#Sta/Elev=", ..., { formatter: "station", pad: true })`.
- Counted CSV blocks (`#Mann=`, `#Block Obstruct=`, `#XS Ineff=`, `XS Rating Curve=`) pair `countedArrayLengthPart` with `countedFixedWidthArray(..., { width: 8, maxWidth: 80, formatter: "station" })`.
- Persistent flags like `Permanent Ineff=` rely on `contextual` plus `parseMultilineArray` to honor the count and convert `"T"/"F"` segments.

9) Inline & Lateral Weirs (`src/schemas/geometry/inlineWeirSchema.ts`, `src/schemas/geometry/lateralWeirSchema.ts`)

- Share the `Type RM Length L Ch R =` header and stage/elevation count handled by `countedArrayLengthPart` + `countedFixedWidthArray("stageElevationPairs", { width: 8, maxWidth: 80, formatter: "station", pad: true })`.
- Keep weir metadata lines (`Lateral Weir End`, `IW Outlet Rating Curve=`, etc.) with `multiField` so blanks remain explicit via `{ nullOnBlank: true }` where needed.
- Inline weirs include a comma-separated parameter block (`IW Dist,WD,...`). Parse/serialize it through a `contextual` item with `parseCommaSeparated` / `formatCommaSeparated` and use `formatBoolean(..., "10")` for the embedded boolean.
- Lateral weirs expose repeated headwater/tailwater connections; model them with `repeat(..., startsWith("Lateral Weir HW/TW RS Station="), schema([...]))`.

10) One-Dimensional Bridge (`src/schemas/geometry/oneDimBridgeSchema.ts`)

- Bridge decks and piers interleave counts with fixed-width numeric grids. Use `contextual` helpers that call `parseMultilineArray` to read values and `formatFixedWidth` + `formatHECRASStationNumber` to write them back.
- Preserve blank skew strings by wrapping `stringPart` in a custom serializer that emits two spaces when the source value is absent.
- Boolean switches within numbered sequences (e.g., `wsproParam17`) stay in sync by using `booleanPart({ mode: "-1,0", pad: true })` and reusing the same ordering in serialization.

11) Stream Node (`src/schemas/geometry/streamNodeSchema.ts`)

- Compact CSV line: `multiField("Stream Node=", fields({ river: stringPart({ width: 16, trim: true }), reach: stringPart({ width: 16, trim: true }), index1: numberPart({ pad: true }), index2: numberPart({ pad: true }), description: stringPart({ width: 64, trim: true }) }))`.
- Finish the block with `blankLine()` to mirror the trailing spacer in geometry files.

## Formatting Rules That Bite

- Coordinates are 16-char fixed width, and some blocks require per-line padding to a fixed total width (`maxWidth`); set `pad: true` for `tupleArrayField` when needed.
- Some headers require a space-padded count and/or trailing space (e.g., `"...= 6 "`). Match existing sections exactly.
- Boolean encodings vary: `TF`, `-1,0`, `10`, `true/false`, `Enable/Disable`. Always set the mode explicitly.
- Infinity sentinel: `numberPart` serializes `Infinity` to `1.79769313486232E+308`. Use this to preserve certain HEC-RAS “unbounded” values (see boundary condition tests).
- Blank vs null vs undefined:
  - `undefined` on single-field lines → omit the entire line.
  - `null` with `nullOnBlank: true` → write a header with a blank value segment after `=`.
  - For `multiField` with 2+ fields: any `undefined` segment becomes blank, and the line still emits if at least one field is defined.

Utilities to know:

- `src/schema/serializationUtils.ts` exposes `formatHECRASCoordinateNumber`, `formatHECRASStationNumber`, and chunked line helpers for fixed-width blocks.
- `src/schema/parsingUtils.ts` has shared helpers (`parseKeyValue`, `parseMultilineArray`, `splitIntoTuples`). Reuse these from `contextual` items instead of hand-rolling parsing.

## When To Use Which DSL Item

- `multiField`: CSV lines with 1+ fields. Use `stringField`/`numberField`/`booleanField` for common single-field cases with length control.
- `tupleField`: a single tuple on one labeled line (e.g., a single XY pair).
- `tupleArrayField`: header with a count + fixed-width body table. Use `formatter: "coordinate" | "station"` for built-in formats.
- `contextual`: variable-length blocks or formats that depend on previously parsed context or require custom spacing/padding (e.g., `Surface Line` blocks).
- `repeat`: 0..n contiguous repeated sub-schemas keyed off a recognizer (e.g., `Up River,Reach=` lines).
- `include`: flatten another schema’s items into the current object when no nested key is desired.

## Testing Playbook

- Co-locate tests under `test/schemas/*Schema.test.ts`. Use `parseWithSchema`/`parseSectionWithSchema` and `serializeWithSchema`.
- Always add a round-trip: parse → serialize → parse, and compare the parsed shapes.
- Verify exact line parity when possible, including spacing/padding and header counts.
- Prefer focused tests per nuance:
  - Blank→null handling (`nullOnBlank: true`), especially for numbers.
  - Boolean mode output for each section.
  - Fixed-width table chunking and line breaks.

## Migration Rules Of Engagement

- Keep new parsing/serialization logic inside `src/schemas/**`; add shared helpers in `src/schema/**` when needed.
- Keep schemas tolerant (non-strict) at the edges while coverage grows; use recognizers and includes to integrate with partial sections safely.
- If ordering or formatting in serializers forces compromises, document under “Decisions & Risks” in `docs/hecras-parsing-format-specification.md` and mention in PR notes.

## Checklist: Adding A New Schema

1) Review existing models, schema tests, and representative HEC-RAS snippets to catalog fields and formats.
2) Define a `*Schema.ts` under `src/schemas/` using the smallest set of DSL items that match the format.
3) Use `stringField`/`numberField`/`booleanField` for simple lines; `tupleField`/`tupleArrayField` for tuples and fixed-width tables; `contextual` as a rare exception.
4) Encode optional/blank/null semantics explicitly with `opt(...)` and `numberPart({ nullOnBlank: true })`.
5) Write tests:
   - Parse example lines; assert on values.
   - Serialize example values; assert exact output lines.
   - Round-trip parse→serialize→parse equality.
6) Update `docs/hecras-parsing-format-specification.md` with coverage notes and any decisions/risks.

## Quick Pointers (File References)

- Boundary condition: `src/schemas/boundaryConditionSchema.ts`
- Break line: `src/schemas/breakLineSchema.ts`
- IC point: `src/schemas/icPointSchema.ts`
- Junction: `src/schemas/junctionSchema.ts`
- Land cover: `src/schemas/landCoverSchema.ts`
- Storage area: `src/schemas/storageAreaSchema.ts`
- River reach: `src/schemas/geometry/riverReachSchema.ts`
- Cross section: `src/schemas/geometry/crossSectionSchema.ts`
- Inline weir: `src/schemas/geometry/inlineWeirSchema.ts`
- Lateral weir: `src/schemas/geometry/lateralWeirSchema.ts`
- One-dimensional bridge: `src/schemas/geometry/oneDimBridgeSchema.ts`
- Stream node: `src/schemas/geometry/streamNodeSchema.ts`
- DSL core: `src/schema/core.ts`, `src/schema/combinators.ts`, `src/schema/driver.ts`, `src/schema/parts.ts`, `src/schema/serializationUtils.ts`

## Regression Testing

**IMPORTANT:** All changes to parsing/serialization must not regress geometry comparison results.

The project includes an automated regression prevention system. See `scripts/README-regression-testing.md` for full details.

**Commands:**
- `npm run baseline:capture` - Capture baseline from main branch
- `npm run check:regression` - Check for regression vs baseline
- `npm run compare:geometries` - Run full geometry comparison

**CI Integration:**
- Every PR automatically captures baseline from `origin/main`
- Runs regression check in `--strict` mode
- Blocks merge if regression detected

**What counts as regression:**
- Fewer geometry files matched
- Fewer lines matched before first difference
- Difference occurs earlier in a failing line
- New parsing errors introduced

**What's allowed:**
- ✅ Improvements (more files/lines matched)
- ✅ No change (same result as baseline)
- ✅ Unrelated refactoring that doesn't affect parsing

**Key insight:** The system always compares to `main` branch baseline, not just the previous commit. This prevents the scenario where:
1. Commit A regresses
2. Commit B improves over A but is still worse than baseline
3. Without baseline comparison, B would incorrectly appear as progress

**When making changes:**
1. Capture baseline before starting: `npm run baseline:capture`
2. Make your changes
3. Check for regression: `npm run check:regression`
4. If regression detected, fix it before creating PR
5. CI will verify on PR creation

## If Blocked

- Capture the issue under "Decisions & Risks" in `docs/hecras-parsing-format-specification.md` with a minimal reproducible snippet.
- Prefer `contextual` hooks to bridge format edge cases without bypassing the schema DSL.
- Ask for a quick design check in PR notes when introducing a new pattern or serializer rule.
