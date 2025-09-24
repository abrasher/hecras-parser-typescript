export type TupleOf<N extends number, T, R extends T[] = []> = R["length"] extends N
  ? R
  : TupleOf<N, T, [...R, T]>

export type Simplify<T> = { [K in keyof T]: T[K] }
export type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
  arg: infer R,
) => void
  ? R
  : never

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

export function fields<const Spec extends FieldSpec>(spec: Spec): Spec {
  return spec
}

export type InferPart<P extends Part<unknown>> = P extends Part<infer V> ? V : never
export type InferFields<F extends FieldSpec> = Simplify<{ [K in keyof F]: InferPart<F[K]> }>

export interface MultiFieldItem<F extends FieldSpec> {
  kind: "multiField"
  label: string
  fields: F
}

export interface CountedFixedWidthTuplesItem<Key extends string, Tuple extends number> {
  kind: "countedFixedWidthTuples"
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
  parser: ContextualParser<Value>
  serializer?: ContextualSerializer<Value>
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
  | CountedFixedWidthTuplesItem<string, number>
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

export type InferItem<I> = I extends MultiFieldItem<infer F>
  ? InferFields<F>
  : I extends CountedFixedWidthTuplesItem<infer Key, infer Tuple>
    ? I["optional"] extends true
      ? { [K in Key]?: TupleOf<Tuple, number>[] }
      : { [K in Key]: TupleOf<Tuple, number>[] }
    : I extends ContextualItem<infer Key, infer Value>
      ? { [K in Key]?: Value }
      : I extends SectionItem<infer Key, infer Schema>
        ? { [K in Key]?: Infer<Schema> }
        : I extends RepeatItem<infer Key, infer Schema>
          ? { [K in Key]: Infer<Schema>[] }
          : I extends IncludeItem<infer Schema>
            ? Infer<Schema>
            : {}

export type Infer<Def extends SchemaDef> = Simplify<UnionToIntersection<InferItem<Def[number]>>>
