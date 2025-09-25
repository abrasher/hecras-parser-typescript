export type TupleOf<N extends number, T, R extends T[] = []> = R["length"] extends N
  ? R
  : TupleOf<N, T, [...R, T]>

export type Simplify<T> = { [K in keyof T]: T[K] }
export type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer R,
) => void
  ? R
  : never

type SchemaDepthLimit = 7

type DecrementDepth<D extends number> = D extends 0
  ? 0
  : D extends 1
    ? 0
    : D extends 2
      ? 1
      : D extends 3
        ? 2
        : D extends 4
          ? 3
          : D extends 5
            ? 4
            : D extends 6
              ? 5
              : D extends 7
                ? 6
                : 0

type ExhaustiveInferFallback = Record<string, unknown>

type InferWithDepth<Def extends SchemaDef, Depth extends number> = Depth extends 0
  ? ExhaustiveInferFallback
  : Simplify<UnionToIntersection<InferItemWithDepth<Def[number], Depth>>>

export interface ParseResult<T> {
  value: T
  nextIndex: number
}

export interface Part<T> {
  parse(segment: string): T
  serialize(value: T): string
  isOptional?: boolean
  nullOnBlank?: boolean
}

export interface ContextualParser<V> {
  (context: Record<string, unknown>, lines: string[], startIndex: number): ParseResult<V> | null
}

export interface ContextualSerializer<V> {
  (context: Record<string, unknown>, value: V | undefined): string[]
}

export interface Recognizer {
  (line: string | undefined, lines: string[], index: number): boolean
}

type FieldSpec = Record<string, Part<unknown>>

type OptionalFieldKeys<F extends FieldSpec> = {
  [K in keyof F]: F[K] extends { isOptional: true } ? K : never
}[keyof F]

type RequiredFieldKeys<F extends FieldSpec> = Exclude<keyof F, OptionalFieldKeys<F>>

type RequiredFields<F extends FieldSpec> = {
  [K in RequiredFieldKeys<F>]: InferPart<F[K]>
}

type OptionalFields<F extends FieldSpec> = {
  [K in OptionalFieldKeys<F>]?: Exclude<InferPart<F[K]>, undefined>
}

export function fields<const Spec extends FieldSpec>(spec: Spec): Spec {
  return spec
}

export type InferPart<P extends Part<unknown>> = P extends Part<infer V> ? V : never
export type InferFields<F extends FieldSpec> = Simplify<RequiredFields<F> & OptionalFields<F>>

export interface MultiFieldItem<F extends FieldSpec> {
  kind: "multiField"
  label: string
  fields: F
}

export interface TupleArrayFieldItem<Key extends string, Tuple extends number> {
  kind: "tupleArrayField"
  label: string
  key: Key
  width: number
  maxWidth: number
  tupleSize: Tuple
  optional?: boolean
}

export interface ContextualItem<Key extends string, Value> {
  kind: "contextual"
  key: Key
  parser(
    context: Record<string, unknown>,
    lines: string[],
    startIndex: number,
  ): ParseResult<Value> | null
  serializer?(context: Record<string, unknown>, value: Value | undefined): string[]
}

export interface SectionItem<Key extends string, Def extends SchemaDef> {
  kind: "section"
  key: Key
  recognizer: Recognizer
  schema: Def
}

export interface RepeatItem<Key extends string, Def extends SchemaDef> {
  kind: "repeat"
  key: Key
  recognizer: Recognizer
  schema: Def
}

export interface IncludeItem<Def extends SchemaDef> {
  kind: "include"
  schema: Def
}

export interface BlankLineItem {
  kind: "blankLine"
}

export interface BlankLinesItem {
  kind: "blankLines"
  count: number
}

export type SchemaItem =
  | MultiFieldItem<FieldSpec>
  | TupleArrayFieldItem<string, number>
  | ContextualItem<string, unknown>
  | SectionItem<string, SchemaDef>
  | RepeatItem<string, SchemaDef>
  | IncludeItem<SchemaDef>
  | BlankLineItem
  | BlankLinesItem

export type SchemaDef = readonly SchemaItem[]

export function schema<const Def extends SchemaDef>(def: Def): Def {
  return def
}

type InferItemWithDepth<I, Depth extends number> =
  I extends MultiFieldItem<infer F>
    ? InferFields<F>
    : I extends TupleArrayFieldItem<infer Key, infer Tuple>
      ? I["optional"] extends true
        ? { [K in Key]?: TupleOf<Tuple, number>[] }
        : { [K in Key]: TupleOf<Tuple, number>[] }
      : I extends ContextualItem<infer Key, infer Value>
        ? { [K in Key]?: Value }
        : I extends SectionItem<infer Key, infer Schema>
          ? Depth extends 0
            ? { [K in Key]?: ExhaustiveInferFallback }
            : { [K in Key]?: InferWithDepth<Schema, DecrementDepth<Depth>> }
          : I extends RepeatItem<infer Key, infer Schema>
            ? Depth extends 0
              ? { [K in Key]: ExhaustiveInferFallback[] }
              : { [K in Key]: InferWithDepth<Schema, DecrementDepth<Depth>>[] }
            : I extends IncludeItem<infer Schema>
              ? Depth extends 0
                ? ExhaustiveInferFallback
                : InferWithDepth<Schema, DecrementDepth<Depth>>
              : object

export type InferItem<I> = InferItemWithDepth<I, SchemaDepthLimit>

export type Infer<Def extends SchemaDef> = InferWithDepth<Def, SchemaDepthLimit>
