# Schema Type Inference Simplification (Phantom Out Types)

Status: Draft

Owners: Parser/Schema maintainers

Related: src/schema/core.ts, src/schema/combinators.ts, src/schema/driver.ts

## Summary

We simplify type inference for our schema DSL by eliminating the large, kind-matching conditional type (`InferItemWithDepth`) and depth machinery. Instead, each schema item carries a private phantom “out” type that encodes its contribution to the resulting model. The top-level `Infer<Def>` becomes a simple union→intersection of each item’s phantom type.

The overall pattern matches other schema libraries in spirit—types travel alongside schema values rather than being reconstituted by a giant conditional. Libraries like Zod or io-ts achieve this with mapped types over object shapes and schema classes whose generics encode their output. Our union→intersection aggregation fills the same role for our array-based DSL, and each item’s phantom type should likewise be expressed as a mapped type over its exposed keys to keep inference precise.

## Motivation

- Readability: `InferItemWithDepth` is large, hard to scan, and easy to regress when adding new item kinds.
- Maintainability: Every new item kind forces edits to a central conditional type.
- Performance: Complex conditional unions can be slow to instantiate and hard for the TS checker.
- Alignment: Most type-first libraries push the decoded/output type onto node values (phantom or generic) and aggregate it, resulting in simpler inference.

## Design

### New phantom type hook

- Add a unique symbol and extractor:
  - `declare const OUT: unique symbol`
  - `type OutOf<T> = T extends { [OUT]: infer O } ? O : never`

- Each item interface (e.g., `MultiFieldItem`, `TupleFieldItem`, `TupleArrayFieldItem`, `CountedArrayFieldItem`, `TextBlockFieldItem`, `ContextualItem`, `SectionItem`, `RepeatItem`, `IncludeItem`) includes a private property `[OUT]: …` that encodes the item’s output shape using mapped types over the relevant keys.

### Small helpers (types only)

- `type Prop<K extends string, V, O extends boolean | undefined> = O extends true ? { [P in K]?: V } : { [P in K]: V }`
- `type TupleVals<Tuple extends number, Nullable extends boolean> = TupleOf<Tuple, Nullable extends true ? number | null : number>[]`

### Item out shapes (type-only)

- MultiField: `InferFields<F>` with optional applied when the item itself is optional.
- TupleField: `Prop<Key, InferTupleParts<Parts>, Optional>`
- TupleArray: `Prop<Key, TupleVals<Tuple, Nullable>, Optional>`
- CountedArray: `Prop<Key, TupleVals<Tuple, Nullable>, Optional>`
- TextBlock: `Prop<Key, string, Optional>`
- Contextual: `{ [Key]?: Value }`
- Section: `{ [Key]?: Infer<SubSchema> }`
- Repeat: `{ [Key]: Infer<SubSchema>[] }`
- Include: `Infer<SubSchema>`

### Top-level inference

- Replace depth-limited inference with:
  - `export type Infer<Def extends SchemaDef> = Simplify<UnionToIntersection<OutOf<Def[number]>>>`

We remove `InferItemWithDepth` and the depth decrement types from the main path. (See “Depth & recursion” for a safe fallback.)

## Example

Given:

```ts
const s = schema([
  stringField("name", "Name=", { length: 32 }),
  tupleArrayField("Reach XY=", "planform", { width: 16, maxWidth: 64, tuple: 2, formatter: "coordinate", pad: true }),
  section("meta", startsWith("Meta="), schema([
    numberField("id", "ID=", { optional: true }),
  ])),
])

type T = Infer<typeof s>
```

Before (conceptual): computed via a single large conditional that matches on `kind` and threads a depth parameter.

After (phantom out):

```ts
type T = {
  name: string;
  planform: [number, number][];
  meta?: { id?: number };
}
```

## Depth & recursion

Most of our schemas are acyclic and shallow. Depth limiting is not necessary in practice. If we later run into TS recursion limits or introduce recursive schemas, we can add an optional guarded alias:

- `export type InferSafe<Def extends SchemaDef, Depth extends number = 7> = …`
  - Only gate recursion for `Section`, `Repeat`, and `Include`, using a small `PrevDepth` map.
  - `Infer` remains the simple phantom-based version for typical use.

## Migration Plan

1) Core (types only)
   - Add `OUT` symbol and `OutOf` helper.
   - Add `Prop` and `TupleVals` helpers.
   - Extend item interfaces with `[OUT]?: …` to encode each item’s contribution.
   - Replace `Infer<Def>` with `Simplify<UnionToIntersection<OutOf<Def[number]>>>`.
   - Remove `InferItemWithDepth` and `DecrementDepth` from main flow. Optionally keep `InferSafe` as a separate export if needed later.

2) Combinators (types only)
   - Ensure combinators’ return types reflect the correct generic parameters so `[OUT]` resolves accurately (e.g., pass `optional`, `tuple`, `nullable` correctly).
   - No runtime changes required.

3) Driver
   - No changes required; this is purely type-level.

4) Documentation & examples
   - Update DSL reference to describe `Infer` semantics (no depth) and the effect of optional/nullable.
   - Note the optional `InferSafe` fallback if recursion depth becomes a concern.

5) Tests
   - Re-run existing tests; runtime behavior unchanged.
   - Add a few typed tests (type-only expectations) if helpful.

## Backward Compatibility

- Runtime: No changes.
- Types: `Infer<Def>` still yields the same shapes. Some extreme/edge recursive shapes may have different compiler performance characteristics (generally improved).
- The private phantom `[OUT]` is type-only; it does not appear at runtime or in serialized output.

## Alternatives Considered

1) Keep one large conditional but split into helper conditionals per kind
   - Improves readability, but still centralizes kind matching and must be updated for every new item.

2) TypeBox-style central mapping (Static<TSchema>)
   - One centralized conditional mapping across schema node types. Familiar but still a kind-matcher that grows with features.

3) Class-based nodes with generics (Zod/io-ts style)
   - Larger API shift; we prefer to keep our functional builder style and just adopt the phantom out trick.

## Risks

- Recursive/cyclic schemas can still hit TS recursion limits. Mitigation: keep an optional `InferSafe` alias with depth-limiting for `Section/Repeat/Include` only.
- If item interfaces are extended, forgetting to add `[OUT]` would omit that contribution from inference. Mitigation: add a lint rule or a small type test for new item kinds.

## Implementation Notes (sketch)

```ts
// core.ts (types only)
export declare const OUT: unique symbol
export type OutOf<T> = T extends { [OUT]?: infer O } ? O : never

type Prop<K extends string, V, O extends boolean | undefined> = O extends true ? { [P in K]?: V } : { [P in K]: V }
type TupleVals<T extends number, N extends boolean> = TupleOf<T, N extends true ? number | null : number>[]

export interface TupleArrayFieldItem<K extends string, T extends number, N extends boolean = false> {
  kind: "tupleArrayField"
  label: string
  key: K
  width: number
  maxWidth: number
  tupleSize: T
  optional?: true
  pad?: boolean
  formatter?: "station" | "coordinate" | ((value: number) => string)
  nullable: N
  [OUT]?: Prop<K, TupleVals<T, N>, this["optional"]>
}

// …repeat for other items…

export type Infer<Def extends SchemaDef> = Simplify<UnionToIntersection<OutOf<Def[number]>>>
```

## References

- Zod: types flow via generics on node instances (`ZodType<Output, Def, Input>`)
- io-ts: `Type<A, O, I>` nodes carry decoded `A`
- Effect/Schema, Valibot, ArkType: similar approach with output types riding on node values
- TypeBox: central mapping via `Static<TSchema>` (an alternative pattern)
