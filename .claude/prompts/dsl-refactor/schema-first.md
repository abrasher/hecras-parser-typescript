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
- `countedFixedWidthTuples(label, key, { width, maxWidth, tuple })` → header with count + fixed-width number chunks, inferred tuple via `tuple` literal.
- `contextual(key, parser, serializer?)` → context-dependent parsing where field depends on previously parsed data.
- `Infer<typeof schema>` → produces the TypeScript model type from the schema (schema-first typing).
- Optional: `schema([...]) satisfies Schema<ExistingType>` to assert compatibility with an existing domain model.
- `opt(part)` → marks a field as optional; inferred type becomes `V | undefined` and serialization emits a blank segment when undefined.
- `numberPart({ integer?: boolean, nullOnBlank?: boolean })` → when `nullOnBlank` is true, blanks parse to `null` and serialize as blanks; inferred type becomes `number | null`.

Core Types (essentials only)

- Part: reusable value parser/formatter (unchanged from existing design).
  - `interface Part<V> { parse(s: string): V; serialize(v: V): string }`
- Tuple inference: `type TupleOf<N extends number, T, R extends T[] = []> = R['length'] extends N ? R : TupleOf<N, T, [...R, T]>;`
- Schema items are value-level objects with discriminated `kind` and enough metadata for both parsing/serialization and type inference.
- Contextual parsing: `type ContextualParser<TContext, TValue> = (ctx: Partial<TContext>, lines: string[], start: number) => ParseResult<TValue> | null`
- Parse result: `interface ParseResult<T> { value: T; nextIndex: number }`
- Optional wrapper: `opt(part)` returns a `Part<InferPart<P> | undefined>`; useful for fields like `description?` or `lastEditedTime?`.
- Numeric blank-to-null: `numberPart({ nullOnBlank: true })` returns a `Part<number | null>`; mirrors `parseMaybeFloat` behavior.

Typing Strategy

- Multi‑field lines infer an object `{ [K in keyof Spec]: InferPart<Spec[K]> }`.
- Counted fixed‑width tuples infer `{ [K in Key]: Array<TupleOf<N, number>> }` directly from the `tuple` numeric literal.
- Contextual fields infer `{ [K in Key]: ReturnType }` from the parser's return type.
- The full schema type is the intersection of its item types.
  - `Infer<S> = Simplify<UnionToIntersection<InferItem<S[number]>>>`
- Optional fields add `| undefined` to the field’s type when wrapped in `opt(...)`.
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

Optional compatibility assertion with an existing model

```ts
import type { CrossSection as ModelCrossSection } from "src/models/geometry/riverReach";

const xsSchema = schema([ /* ... */ ]) satisfies Schema<ModelCrossSection>;
```

Proposed Runtime Shape (high level)

- `schema([...])` returns a `SchemaDef` array of discriminated items:
  - `MultiFieldDef`: { kind: 'multiField'; label; fields }
  - `CountedTuplesDef`: { kind: 'countedFixedWidthTuples'; label; key; width; maxWidth; tuple }
  - `ContextualDef`: { kind: 'contextual'; key; parser; serializer? }
- Parsing and serialization functions (driver) can be layered on top of these item defs or the existing `Rule<T>` layer can adapt to consume them.
- Optional fields are expressed as a wrapper `opt(part)` at the field level (no new schema item kind required). Drivers should treat `undefined` as “emit blank segment” for `multiField` serialization.
- For `numberPart({ nullOnBlank: true })`, parsing a blank yields `null` and serialization of `null` emits a blank field, matching `parseMaybeFloat` semantics today.

Migration Notes

- Replace calls like `multiField<CrossSection>(...)` with `multiField(...)` and wrap the field map with `fields({...} as const)` to preserve literal keys.
- Replace `countedFixedWidthTuples<CrossSection, [number, number]>(...)` with `countedFixedWidthTuples(..., { tuple: 2 as const })`.
- Replace custom rules like `permanentIneffRule` with `contextual(key, parser)` - the parser receives the parsed context and can implement the same logic.
- Get the model type from the schema with `Infer<typeof schemaDef>`; or keep your existing interfaces and assert with `satisfies`.
- Start with leaf schemas (e.g., CrossSection) and compose up (e.g., RiverReach) to gain confidence incrementally.
- Where you currently use `parseMaybeFloat`, use `numberPart({ nullOnBlank: true })` to preserve `number | null` behavior.
- For fields that are optional in models (e.g., many in `src/models/geometry/connection.ts`), wrap their parts with `opt(...)` so inference adds `| undefined`.

Nice‑to‑have (optional, later)

- `defineSchema<T>(build: (s: SchemaHelpers) => SchemaDef) satisfies Schema<T>` for a one‑mention check without requiring a separate `satisfies` at the end.
- `default` flags for schema items/fields to supply defaults on serialization.
- Mapped tuples: `map/unmap` functions that transform `TupleOf<N, number>` to a typed object and back, with inference for the mapped type.
