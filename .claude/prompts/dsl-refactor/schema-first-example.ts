// Schema‑first typing demo
// This file sketches the type surface to enable schema‑first inference.
// It is self‑contained for illustration and can be adapted into your DSL.

// -----------------------------
// Core: Parts
// -----------------------------

export interface Part<V> {
  parse(s: string): V
  serialize(v: V): string
}

export function stringPart(
  opts: { trim?: boolean; nullOnEmpty?: boolean } = {},
): Part<string | null> {
  return {
    parse(s) {
      const t = opts.trim ? s.trim() : s
      return opts.nullOnEmpty && t === "" ? null : t
    },
    serialize(v) {
      return v == null ? "" : String(v)
    },
  }
}

export function numberPart(opts: { integer?: boolean } = {}): Part<number> {
  return {
    parse(s) {
      const n = opts.integer ? parseInt(s, 10) : parseFloat(s)
      return Number.isNaN(n) ? 0 : n
    },
    serialize(v) {
      return String(v)
    },
  }
}

type InferPart<P> = P extends Part<infer V> ? V : never

// -----------------------------
// Helpers for inference
// -----------------------------

type TupleOf<N extends number, T, R extends T[] = []> = R["length"] extends N
  ? R
  : TupleOf<N, T, [...R, T]>

type Simplify<T> = { [K in keyof T]: T[K] } & {}
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

// -----------------------------
// Schema item defs (value-level)
// -----------------------------

type FieldMap = Record<string, Part<any>>
export const fields = <F extends FieldMap>(f: F) => f

type MultiFieldDef<F extends FieldMap> = Readonly<{
  kind: "multiField"
  label: string
  fields: F
}>

type CountedTuplesDef<K extends string, N extends number> = Readonly<{
  kind: "countedFixedWidthTuples"
  label: string
  key: K
  width: number
  maxWidth: number
  tuple: N
}>

type SchemaItem = MultiFieldDef<FieldMap> | CountedTuplesDef<string, number>

type SchemaDef = ReadonlyArray<SchemaItem>

// -----------------------------
// Builders
// -----------------------------

export function multiField<F extends FieldMap>(label: string, f: F): MultiFieldDef<F> {
  return { kind: "multiField", label, fields: f }
}

export function countedFixedWidthTuples<K extends string, N extends number>(
  label: string,
  key: K,
  opts: { width: number; maxWidth: number; tuple: N },
): CountedTuplesDef<K, N> {
  return {
    kind: "countedFixedWidthTuples",
    label,
    key,
    width: opts.width,
    maxWidth: opts.maxWidth,
    tuple: opts.tuple,
  }
}

export const schema = <S extends SchemaDef>(s: S) => s

// -----------------------------
// Type inference
// -----------------------------

type InferMultiField<F extends FieldMap> = { [K in keyof F]: InferPart<F[K]> }

type InferItem<I> =
  I extends MultiFieldDef<infer F>
    ? InferMultiField<F>
    : I extends CountedTuplesDef<infer K, infer N>
      ? { [P in K]: Array<TupleOf<N & number, number>> }
      : {}

export type Infer<S extends SchemaDef> = Simplify<UnionToIntersection<InferItem<S[number]>>>

// -----------------------------
// Example: CrossSection (schema-first)
// -----------------------------

export const crossSectionSchema = schema([
  multiField(
    "Type RM Length L Ch R=",
    fields({
      type: numberPart({ integer: true }),
      riverMile: stringPart({ trim: true }),
      lengthLeft: numberPart(),
      lengthChannel: numberPart(),
      lengthRight: numberPart(),
    }),
  ),

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
])

export type CrossSection = Infer<typeof crossSectionSchema>

// Optional: validate against an existing model type
// import type { CrossSection as ModelCrossSection } from "src/models/geometry/riverReach"
// const xs = crossSectionSchema satisfies Schema<ModelCrossSection> // if you define Schema<...> adapter
