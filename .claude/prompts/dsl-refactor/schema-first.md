## Schema‑First Types — Draft Spec

Goals

- Eliminate repeated generics like `<CrossSection>` at call sites.
- Infer tuple arity from a numeric literal (`tuple: 2 as const`) instead of generic tuple types.
- Keep strong, precise types with a simple, readable API.
- Allow schema to be the single source of truth; optionally validate against an existing model with `satisfies`.

API Surface (type-first)

- `schema(items)` → returns a typed schema definition object.
- `fields(spec)` → identity helper to preserve literal keys and infer field types from `Part`s.
- `multiField(label, fields(...))` → CSV multi-field line.
- `stringField(key, label, opts?)` / `numberField(...)` / `booleanField(...)` → single-field helpers that wrap `multiField` + `stringPart`/`numberPart`/`booleanPart`; accept the underlying part options (e.g., `{ trim: true }`, `{ integer: true }`, `{ mode: 'tf' }`) plus field-level metadata like `{ length }`.
- `countedFixedWidthTuples(label, key, { width, maxWidth, tuple })` → header with count + fixed-width number chunks, inferred tuple via `tuple` literal.
- `contextual(key, parser, serializer?)` → context-dependent parsing where field depends on previously parsed data.
- `section(key, recognizer, subSchema)` → optional sub-schema block keyed under `key`; omitted when `recognizer` does not match.
- `repeat(key, recognizer, subSchema)` → 0..n sub-schema blocks keyed under `key` as an array; consumes contiguous matches.
- `include(subSchema)` → flattens another schema’s items into the parent (no nested key).
- `Infer<typeof schema>` → produces the TypeScript model type from the schema (schema-first typing).
- Optional: `schema([...]) satisfies Schema<ExistingType>` to assert compatibility with an existing domain model.
- `opt(part)` → marks a field as optional; inferred property becomes `field?: V`. Serialization: if the field participates in a multi-field line with 2+ fields, `undefined` emits a blank segment; if the field is the only field (non‑multipart), `undefined` omits the entire line.
- `numberPart({ integer?: boolean, nullOnBlank?: boolean })` → when `nullOnBlank` is true, blanks parse to `null` and serialize as blanks; inferred type becomes `number | null`.

Core Types (essentials only)

- Part: reusable value parser/formatter (unchanged from existing design).
  - `interface Part<V> { parse(s: string): V; serialize(v: V): string }`
- Tuple inference: `type TupleOf<N extends number, T, R extends T[] = []> = R['length'] extends N ? R : TupleOf<N, T, [...R, T]>;`
- Schema items are value-level objects with discriminated `kind` and enough metadata for both parsing/serialization and type inference.
- Contextual parsing: `type ContextualParser<TContext, TValue> = (ctx: Partial<TContext>, lines: string[], start: number) => ParseResult<TValue> | null`
- Parse result: `interface ParseResult<T> { value: T; nextIndex: number }`
- Optional wrapper: `opt(part)` returns a `Part<InferPart<P> | undefined>`; when lifted through `fields(...)`, `Infer` produces an optional property (`description?: InferPart<P>`), not a required `InferPart<P> | undefined` union. Useful for fields like `description?` or `lastEditedTime?`.
- Numeric blank-to-null: `numberPart({ nullOnBlank: true })` returns a `Part<number | null>`; mirrors `parseMaybeFloat` behavior.

Typing Strategy

- Multi‑field lines infer an object `{ [K in keyof Spec]: InferPart<Spec[K]> }`.
- Counted fixed‑width tuples infer `{ [K in Key]: Array<TupleOf<N, number>> }` directly from the `tuple` numeric literal.
- Contextual fields infer `{ [K in Key]: ReturnType }` from the parser's return type.
- The full schema type is the intersection of its item types.
  - `Infer<S> = Simplify<UnionToIntersection<InferItem<S[number]>>>`
- Optional fields become optional properties (`field?: V`) when wrapped in `opt(...)`.
- Number parts with `nullOnBlank: true` add `| null` to the field’s type.

Example (no generics at call sites)

```ts
const crossSectionSchema = schema([
  multiField("Type RM Length L Ch R=", fields({
    type: numberPart({ integer: true }),
    riverMile: stringPart({ trim: true }),
    lengthLeft: numberPart(),
    lengthChannel: numberPart(),
    lengthRight: numberPart(),
  } as const)),

  countedFixedWidthTuples("#Sta/Elev=", "stationElevation", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const, // → Array<[number, number]>
  }),

  countedFixedWidthTuples("#XS Ineff=", "ineffectiveFlowAreas", {
    width: 8,
    maxWidth: 72,
    tuple: 3 as const, // → Array<[number, number, number]>
  }),

  // Context-dependent field - depends on ineffectiveFlowAreas count
  contextual("permanentIneffective", (ctx, lines, start) => {
    const line = lines[start];
    if (!line?.startsWith('Permanent Ineff=')) return null;

    const count = ctx.ineffectiveFlowAreas?.length ?? 0;
    if (count === 0) return { value: [], nextIndex: start + 1 };

    // Parse fixed-width boolean values (T/F) based on count
    const values: boolean[] = [];
    const width = 8, maxWidth = 80;
    const perLine = Math.floor(maxWidth / width);

    let idx = start + 1;
    for (; values.length < count; idx++) {
      const chunks = (lines[idx] ?? '').match(/.{1,8}/g) ?? [];
      for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (trimmed) values.push(trimmed === 'T');
        if (values.length === count) break;
      }
    }

    return { value: values, nextIndex: idx };
  }),
]);

type CrossSection = Infer<typeof crossSectionSchema>;
// → {
//     type: number, riverMile: string, lengthLeft: number, lengthChannel: number, lengthRight: number,
//     stationElevation: Array<[number, number]>,
//     ineffectiveFlowAreas: Array<[number, number, number]>,
//     permanentIneffective: boolean[]
//   }
```

Shorthand helpers for single-field lines

```ts
const metadataSchema = schema([
  stringField('name', 'Name=', { trim: true, length: 32 }),
  numberField('count', 'Count=', { integer: true, length: 8 }),
  booleanField('enabled', 'Enabled=', { mode: 'tf' }),
])

// Equivalent to multiField(...) + fields({ ... }) but terser for 1:1 key/value pairs.
//   name: string; count: number; enabled: boolean
type Metadata = Infer<typeof metadataSchema>
```

Optional and blank-to-null examples (Connection‑style fields)

```ts
const connectionSchema = schema([
  multiField("Connection=", fields({
    name: stringPart({ trim: true }),
    centroidX: numberPart({ nullOnBlank: true }),         // number | null (required key, nullable value)
    centroidY: numberPart({ nullOnBlank: true }),         // number | null
  } as const)),

  multiField("Connection Desc=", fields({
    description: opt(stringPart({ trim: true })),         // string | undefined → description?
  } as const)),

  multiField("Conn HTab HWMax=", fields({
    hTabHWMax: opt(numberPart({ nullOnBlank: true })),    // number | null | undefined → hTabHWMax?
  } as const)),
])

type ConnectionShape = Infer<typeof connectionSchema>
// → { name: string; centroidX: number | null; centroidY: number | null; description?: string; hTabHWMax?: number | null }
```

Serialization notes for the above:
- `description === undefined` → do not write a `Connection Desc=` line at all.
- `hTabHWMax === undefined` → do not write a `Conn HTab HWMax=` line at all.
- `hTabHWMax === null` with `nullOnBlank: true` → write `Conn HTab HWMax=` with a blank value segment after the equals sign.

Optional compatibility assertion with an existing model

```ts
import type { CrossSection as ModelCrossSection } from "src/models/geometry/riverReach";

const xsSchema = schema([ /* ... */ ]) satisfies Schema<ModelCrossSection>;
```

Optional serialization guide

- Multi‑field (2+ fields):
  - If at least one field is defined → write the line; each `undefined` field emits a blank segment to preserve column positions.
  - If all fields are `undefined` → omit the entire line.
- Single‑field (non‑multipart):
  - `undefined` → omit the entire line (write nothing).
  - For `numberPart({ nullOnBlank: true })`, `null` → write the line with a blank value after `=`.
- Counted fixed‑width tuples (`countedFixedWidthTuples`):
  - `value === undefined` → omit the header and all body lines (nothing written).
  - `value` is an empty array → write header with count `0`, no body lines.
- Contextual items (`contextual`):
  - Default behavior without a custom serializer: `undefined` → omit; value present → write according to the contextual serializer’s logic.
  - If the contextual item’s size depends on prior context (e.g., a count of 0), you may omit when empty to avoid stray headers/blank lines.

Examples

1) Optional counted tuples (connection weir SE)

```ts
const connSchema = schema([
  countedFixedWidthTuples('Conn Weir SE=', 'weirSE', {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
  }),
])

// Serialization behavior:
// - weirSE === undefined → no 'Conn Weir SE=' line
// - weirSE === []        → 'Conn Weir SE= 0' (header only)
// - weirSE has pairs     → header + fixed-width rows
```

2) Optional contextual (cross‑section permanent ineffective)

```ts
const xsSchema = schema([
  // ...ineffectiveFlowAreas parsed earlier…
  contextual('permanentIneffective', (ctx, lines, i) => { /* parse */ }, (ctx, v) => {
    const count = ctx.ineffectiveFlowAreas?.length ?? 0
    if (v === undefined) return [] // omit entirely
    if (count === 0 && v.length === 0) return [] // omit when nothing to express
    // otherwise, emit header + rows (or single fixed-width line) per format
    return ['Permanent Ineff=', formatBooleans(v)]
  })
])
```

Compositional Items (sub-schemas)

- Use `section`, `repeat`, and `include` to compose larger schemas out of smaller ones (e.g., Geometry → Connection → Bridge/Culvert).
- Prefer `section`/`repeat` for blocks; use `opt(...)` only for field-level optionality within a `multiField`.

API

- `section(key, recognizer, subSchema)`
  - Parses at most one occurrence; if `recognizer(line)` is false at the current cursor, writes nothing and advances 0 lines.
  - If true, parses the `subSchema` starting at the current line with non-strict behavior and assigns the result to `key`.
- `repeat(key, recognizer, subSchema)`
  - While `recognizer(line)` is true at the cursor, parse `subSchema` and push into an array at `key`.
  - Stops on first non-matching line and returns control to the parent schema.
- `include(subSchema)`
  - Flattens the child items into the parent; useful when the child writes directly to the same object without its own nested key.

Examples

- Geometry with repeated sections:
```ts
const geometrySchema = schema([
  // header fields…
  repeat('storageAreas', (line) => line.startsWith('Storage Area='), storageAreaSchema),
  repeat('connections',   (line) => line.startsWith('Connection='),   connectionSchema),
  repeat('riverReaches',  (line) => line.startsWith('River Reach='),  riverReachSchema),
  // trailing global settings as fields/sections…
])
```

- Connection with optional Bridge and repeated Culvert groups:
```ts
const connectionSchema = schema([
  multiField('Connection=', fields({
    name: stringPart({ trim: true }),
    centroidX: numberPart({ nullOnBlank: true }),
    centroidY: numberPart({ nullOnBlank: true }),
  })),
  // …additional connection lines…
  section('bridge', (line) => line.startsWith('Conn BR: Bridge='), bridgeSchema),
  repeat('culvert', (line) => line.startsWith('Connection Culv='),  culvertSchema),
])
```

Serialization rules for sections/repeats

- `section`: undefined → omit entire block; defined → serialize sub-schema in place.
- `repeat`: empty array → write nothing; non-empty → serialize each item in order.
- Use `include` when you want the child’s items interleaved into the parent without a nested property.

Proposed Runtime Shape (high level)

- `schema([...])` returns a `SchemaDef` array of discriminated items:
  - `MultiFieldDef`: { kind: 'multiField'; label; fields }
  - `CountedTuplesDef`: { kind: 'countedFixedWidthTuples'; label; key; width; maxWidth; tuple }
  - `ContextualDef`: { kind: 'contextual'; key; parser; serializer? }
  - `SectionDef`: { kind: 'section'; key; recognizer; schema }
  - `RepeatDef`: { kind: 'repeat'; key; recognizer; schema }
  - `IncludeDef`: { kind: 'include'; schema }
- Parsing and serialization functions (driver) can be layered on top of these item defs or the existing `Rule<T>` layer can adapt to consume them.
- Optional fields are expressed via `opt(part)` at the field level (no new schema item kind required).
- Serialization rules for `opt`:
  - In a multi-field with 2+ fields: `undefined` → emit a blank segment to preserve column positions.
  - In a single-field (non‑multipart) item: `undefined` → omit the entire item (write nothing).
  - For `numberPart({ nullOnBlank: true })`, `null` still serializes as a blank value; this is distinct from `undefined` which controls presence/omission.
- For `numberPart({ nullOnBlank: true })`, parsing a blank yields `null` and serialization of `null` emits a blank field, matching `parseMaybeFloat` semantics today.

Migration Notes — From Current Parsers

What you have today (quick recap)

- Single‑pass, sentinel‑based driver in `src/parseGeometry.ts` that routes by `line.startsWith(...)` and advances a shared cursor.
- One parser per section under `src/parsers/geometry/*Parser.ts` that:
  - Scans while lines match section‑specific prefixes, returns `{ data, nextIndex }` or `{ data, linesConsumed }`.
  - Uses helpers from `src/parsers/utils.ts` for key/value lines, fixed‑width blocks, tolerant numbers, tuples, CSV, and durations.
- Unknown or unhandled lines are skipped at the top level (forward‑tolerant behavior).

How to migrate incrementally

1) Mirror one sub‑parser as a schema
- Pick a contained section (e.g., header, junction, break line) and re‑express its logic as a `schema([...])` using `multiField`, `countedFixedWidthTuples`, and `contextual` where needed.
- Keep the existing parser exported, add a sibling `...Schema` next to it, plus a small adapter `parseWithSchema(...Schema)` if you want to validate parity before swapping callers.

2) Adapt top‑level dispatch without upheaval
- In `src/parseGeometry.ts`, when a sentinel matches (e.g., `Connection=`), call your schema‑based adapter and continue to return `{ data, nextIndex }` so the loop semantics remain unchanged.
- Per‑section parsing should run in non‑strict mode to stop at the first non‑matching line; keep top‑level strictness off (current behavior) until coverage is complete.

3) Map existing helpers to parts
- `parseKeyValue` + per‑field parsing → `multiField('Label=', fields({ ... }))` with `stringPart/numberPart/booleanPart/durationPart`.
- `parseMultilineArray` + `splitIntoTuples` → `countedFixedWidthTuples('Header=', key, { width, maxWidth, tuple: N as const })`.
- `parseMaybeFloat` / `parseMaybeInt` → `numberPart({ nullOnBlank: true })` for `number | null`.
- Boolean variants ("-1/0", "True/False", "Enable/Disable", "T/F") → `booleanPart({ mode })`.

4) Encode context‑dependent lines explicitly
- Wherever a line depends on values parsed earlier in the same section (e.g., "Permanent Ineff=" sized by `ineffectiveFlowAreas.length` in river reaches), use `contextual(key, (ctx, lines, i) => ...)`.

5) Keep return shapes compatible
- Schema inference gives you `Infer<typeof xsSchema>`. If you already have model types in `src/models/...`, either:
  - Make the schema the source of truth and export `Infer<typeof xsSchema>`; or
  - Keep existing interfaces and assert compatibility via `schema([...]) satisfies Schema<ExistingType>`.

6) Validate with existing tests
- Reuse the current test suite: `test/parsers/**` for parsing parity and `test/serializers/**` for round‑trip checks. Start with a small section and ensure no output diffs before broadening scope.

Section termination and unknown lines

- Today, sub‑parsers stop when the next line doesn’t match their known prefixes. Model this by running section schemas with non‑strict parsing, so the driver returns on first mismatch.
- At the top level, you currently skip unrecognized lines. You can keep that behavior while migrating; once coverage is high, consider a strict mode to catch drift in file formats.

Serialization alignment

- Serializers under `src/serializers/**` already encapsulate field order and formatting. When adopting schema‑first, the same item defs can drive both parse and serialize, removing duplication.
- Optional fields: wrap parts with `opt(...)` so `undefined` omits content for that segment. For nullable numerics that must serialize as blanks, prefer `numberPart({ nullOnBlank: true })` to preserve `number | null` semantics seen in the current code.

Recommended first targets

- Header (`src/parsers/geometry/headerParser.ts`): simple key/value and optional description block.
- Break lines (`src/parsers/geometry/breakLineParser.ts`): fixed‑width lists and small CSVs.
- Junctions (`src/parsers/geometry/junctionParser.ts`): compact, low coupling to other sections.
- After confidence, move to Connections and River Reaches where `contextual(...)` and counted tuples shine.

Small mapping examples from today’s code

- Connection header line in `src/parsers/geometry/connectionParser.ts:63`:
  - Today: `parseKeyValue` → `parseCommaSeparated` → manual `parseFloat` with blanks considered invalid.
  - Schema: `multiField('Connection=', fields({ name: stringPart({ trim: true }), centroidX: numberPart({ nullOnBlank: true }), centroidY: numberPart({ nullOnBlank: true }) }))`.
- Weir station/elevation in `src/parsers/geometry/connectionParser.ts:212`:
  - Today: `parseMultilineArray` → `splitIntoTuples(2)` → map to `{ station, elevation }[]`.
  - Schema: `countedFixedWidthTuples('Conn Weir SE=', 'weirSE', { width: 8, maxWidth: 80, tuple: 2 as const })` then map to objects if desired via a `map` hook.
- River reach “Permanent Ineff=” booleans sized by a prior count:
  - Today: custom loop sized by `ineffectiveFlowAreas.length`.
  - Schema: `contextual('permanentIneffective', (ctx, lines, i) => ...)` using the same count.

Pragmatic rollout plan

- Phase 1: Add schema defs alongside existing parsers for 1–2 sections, gate usage behind a flag or local adapter, and assert type compatibility with current models.
- Phase 2: Switch top‑level dispatch to call schema‑based adapters for migrated sections; keep others untouched.
- Phase 3: Consolidate serializers to read from the same schema items; delete per‑section duplication once tests pass.

Nice‑to‑have (optional, later)

- `default` flags for schema items/fields to supply defaults on serialization.
