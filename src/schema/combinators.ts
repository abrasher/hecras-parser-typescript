import type {
  CountedFixedWidthTuplesItem,
  ContextualItem,
  Recognizer,
  MultiFieldItem,
  Part,
  RepeatItem,
  SchemaDef,
  SectionItem,
  IncludeItem,
  BlankLineItem,
  BlankLinesItem,
} from "./core"
import { schema as buildSchema, fields as buildFields } from "./core"

export function multiField<const Spec extends Record<string, Part<unknown>>>(
  label: string,
  fieldSpec: Spec,
): MultiFieldItem<Spec> {
  return {
    kind: "multiField",
    label,
    fields: fieldSpec,
  }
}

interface CountedFixedWidthTuplesConfig<Tuple extends number> {
  width: number
  maxWidth: number
  tuple: Tuple
  optional?: boolean
}

export function countedFixedWidthTuples<const Key extends string, const Tuple extends number>(
  label: string,
  key: Key,
  config: CountedFixedWidthTuplesConfig<Tuple>,
): CountedFixedWidthTuplesItem<Key, Tuple> {
  const { width, maxWidth, tuple, optional } = config
  return {
    kind: "countedFixedWidthTuples",
    label,
    key,
    width,
    maxWidth,
    tupleSize: tuple,
    optional,
  }
}

export function contextual<const Key extends string, Value>(
  key: Key,
  parser: ContextualItem<Key, Value>["parser"],
  serializer?: ContextualItem<Key, Value>["serializer"],
): ContextualItem<Key, Value> {
  return {
    kind: "contextual",
    key,
    parser,
    serializer,
  }
}

export function section<const Key extends string, const Def extends SchemaDef>(
  key: Key,
  recognizer: Recognizer,
  subSchema: Def,
): SectionItem<Key, Def> {
  return {
    kind: "section",
    key,
    recognizer,
    schema: subSchema,
  }
}

export function repeat<const Key extends string, const Def extends SchemaDef>(
  key: Key,
  recognizer: Recognizer,
  subSchema: Def,
): RepeatItem<Key, Def> {
  return {
    kind: "repeat",
    key,
    recognizer,
    schema: subSchema,
  }
}

export function include<const Def extends SchemaDef>(schema: Def): IncludeItem<Def> {
  return {
    kind: "include",
    schema,
  }
}

export function blankLine(): BlankLineItem {
  return { kind: "blankLine" }
}

export function blankLines(count: number): BlankLinesItem {
  return { kind: "blankLines", count }
}

export function startsWith(prefix: string): Recognizer {
  return (line) => (line ?? "").startsWith(prefix)
}

export const schema = buildSchema
export const fields = buildFields
