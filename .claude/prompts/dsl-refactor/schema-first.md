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
- `Infer<typeof schema>` → produces the TypeScript model type from the schema (schema-first typing).
- Optional: `schema([...]) satisfies Schema<ExistingType>` to assert compatibility with an existing domain model.

Core Types (essentials only)

- Part: reusable value parser/formatter (unchanged from existing design).
  - `interface Part<V> { parse(s: string): V; serialize(v: V): string }`
- Tuple inference: `type TupleOf<N extends number, T, R extends T[] = []> = R['length'] extends N ? R : TupleOf<N, T, [...R, T]>;`
- Schema items are value-level objects with discriminated `kind` and enough metadata for both parsing/serialization and type inference.

Typing Strategy

- Multi‑field lines infer an object `{ [K in keyof Spec]: InferPart<Spec[K]> }`.
- Counted fixed‑width tuples infer `{ [K in Key]: Array<TupleOf<N, number>> }` directly from the `tuple` numeric literal.
- The full schema type is the intersection of its item types.
  - `Infer<S> = Simplify<UnionToIntersection<InferItem<S[number]>>>`

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
]);

type CrossSection = Infer<typeof crossSectionSchema>;
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
- Parsing and serialization functions (driver) can be layered on top of these item defs or the existing `Rule<T>` layer can adapt to consume them.

Migration Notes

- Replace calls like `multiField<CrossSection>(...)` with `multiField(...)` and wrap the field map with `fields({...} as const)` to preserve literal keys.
- Replace `countedFixedWidthTuples<CrossSection, [number, number]>(...)` with `countedFixedWidthTuples(..., { tuple: 2 as const })`.
- Get the model type from the schema with `Infer<typeof schemaDef>`; or keep your existing interfaces and assert with `satisfies`.
- Start with leaf schemas (e.g., CrossSection) and compose up (e.g., RiverReach) to gain confidence incrementally.

Nice‑to‑have (optional, later)

- `defineSchema<T>(build: (s: SchemaHelpers) => SchemaDef) satisfies Schema<T>` for a one‑mention check without requiring a separate `satisfies` at the end.
- `optional: true` and `default` flags for schema items to mark fields as optional or to supply defaults on serialization.
- Mapped tuples: `map/unmap` functions that transform `TupleOf<N, number>` to a typed object and back, with inference for the mapped type.

