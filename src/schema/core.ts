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
  internal?: boolean
  internalKey?: string
  storeInternal?(state: Record<string, unknown>, value: T): void
  derive?(data: Record<string, unknown>, state: Record<string, unknown>): T
}

export interface ContextualParser<V> {
  (lines: string[], startIndex: number, context: Record<string, unknown>): ParseResult<V> | null
}

export interface ContextualSerializer<V> {
  (value: V | undefined, context: Record<string, unknown>): string[]
}

export interface Recognizer {
  (line: string | undefined, lines: string[], index: number): boolean
}

type FieldSpec = Record<string, Part<unknown>>

type ExternalFields<F extends FieldSpec> = {
  [K in keyof F as F[K] extends { internal: true } ? never : K]: F[K]
}

type ExternalFieldKeys<F extends FieldSpec> = keyof ExternalFields<F>

type OptionalFieldKeys<F extends FieldSpec> =
  ExternalFieldKeys<F> extends never
    ? never
    : {
        [K in ExternalFieldKeys<F>]: ExternalFields<F>[K] extends { isOptional: true } ? K : never
      }[ExternalFieldKeys<F>]

type RequiredFieldKeys<F extends FieldSpec> = Exclude<ExternalFieldKeys<F>, OptionalFieldKeys<F>>

type RequiredFields<F extends FieldSpec> = {
  [K in RequiredFieldKeys<F>]: InferPart<ExternalFields<F>[K]>
}

type OptionalFields<F extends FieldSpec> = {
  [K in OptionalFieldKeys<F>]?: Exclude<InferPart<ExternalFields<F>[K]>, undefined>
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
  optional?: true
}

export type InferTupleParts<Parts extends readonly Part<unknown>[]> = Simplify<{
  -readonly [Index in keyof Parts]: InferPart<Parts[Index]>
}>

export interface TupleFieldItem<Key extends string, Parts extends readonly Part<unknown>[]> {
  kind: "tupleField"
  label: string
  key: Key
  parts: Parts
  optional?: true
}

export interface TupleArrayFieldItem<
  Key extends string,
  Tuple extends number,
  Nullable extends boolean = false,
> {
  kind: "tupleArrayField"
  label: string
  key: Key
  width: number
  maxWidth: number
  tupleSize: Tuple
  optional?: true
  pad?: boolean
  formatter?: "station" | "coordinate" | ((value: number) => string)
  nullable: Nullable
}

export interface CountedArrayFieldItem<
  Key extends string,
  Tuple extends number,
  Nullable extends boolean = false,
> {
  kind: "countedArrayField"
  key: Key
  countKey: string
  width: number
  maxWidth: number
  tupleSize: Tuple
  optional?: true
  pad?: boolean
  formatter?: "station" | "coordinate" | ((value: number) => string)
  nullable: Nullable
  parseValue?(segment: string): number | null
}

export interface TextBlockFieldItem<Key extends string> {
  kind: "textBlockField"
  key: Key
  label: string
  optional?: true
}

export interface ContextualItem<Key extends string, Value> {
  kind: "contextual"
  key: Key
  parser(
    lines: string[],
    startIndex: number,
    context: Record<string, unknown>,
  ): ParseResult<Value> | null
  serializer?(value: Value | undefined, context: Record<string, unknown>): string[]
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

export interface ConditionalBlankLineItem {
  kind: "blankLineIfNotEmpty"
  key: string
  predicate?: (value: unknown) => boolean
}

export type SchemaItem =
  | MultiFieldItem<FieldSpec>
  | TupleFieldItem<string, readonly Part<unknown>[]>
  | TupleArrayFieldItem<string, number, boolean>
  | CountedArrayFieldItem<string, number, boolean>
  | TextBlockFieldItem<string>
  | ContextualItem<string, unknown>
  | SectionItem<string, SchemaDef>
  | RepeatItem<string, SchemaDef>
  | IncludeItem<SchemaDef>
  | BlankLineItem
  | BlankLinesItem
  | ConditionalBlankLineItem

export type SchemaDef = readonly SchemaItem[]

export function schema<const Def extends SchemaDef>(def: Def): Def {
  return def
}

type InferItemWithDepth<I, Depth extends number> =
  I extends MultiFieldItem<infer F>
    ? Simplify<I["optional"] extends true ? Partial<InferFields<F>> : InferFields<F>>
    : I extends TupleFieldItem<infer Key, infer Parts>
      ? I["optional"] extends true
        ? { [K in Key]?: InferTupleParts<Parts> }
        : { [K in Key]: InferTupleParts<Parts> }
      : I extends TupleArrayFieldItem<infer Key, infer Tuple, infer Nullable>
        ? I["optional"] extends true
          ? { [K in Key]?: TupleOf<Tuple, Nullable extends true ? number | null : number>[] }
          : { [K in Key]: TupleOf<Tuple, Nullable extends true ? number | null : number>[] }
        : I extends CountedArrayFieldItem<infer Key, infer Tuple, infer Nullable>
          ? I["optional"] extends true
            ? { [K in Key]?: TupleOf<Tuple, Nullable extends true ? number | null : number>[] }
            : { [K in Key]: TupleOf<Tuple, Nullable extends true ? number | null : number>[] }
          : I extends TextBlockFieldItem<infer Key>
            ? I["optional"] extends true
              ? { [K in Key]?: string }
              : { [K in Key]: string }
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
                    : I extends ConditionalBlankLineItem
                      ? object
                      : object

export type InferItem<I> = InferItemWithDepth<I, SchemaDepthLimit>

export type Infer<Def extends SchemaDef> = InferWithDepth<Def, SchemaDepthLimit>
