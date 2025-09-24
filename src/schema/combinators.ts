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
  InferPart,
} from "./core"
import { schema as buildSchema, fields as buildFields } from "./core"
import { booleanPart, durationPart, numberPart, opt, stringPart } from "./parts"

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

type BaseFieldOptions = {
  optional?: boolean
  length?: number
}

type StringFieldOptions = BaseFieldOptions & Exclude<Parameters<typeof stringPart>[0], undefined>
type NumberFieldOptions = BaseFieldOptions & Exclude<Parameters<typeof numberPart>[0], undefined>
type BooleanFieldOptions = BaseFieldOptions & Parameters<typeof booleanPart>[0]
type DurationFieldOptions = BaseFieldOptions

function buildSingleFieldItem<Key extends string, P extends Part<unknown>>(
  key: Key,
  label: string,
  part: P,
): MultiFieldItem<Record<Key, P>> {
  const spec = buildFields({ [key]: part } as Record<Key, P>)
  return multiField(label, spec)
}

function applyLength<P extends Part<unknown>>(
  part: P,
  length: number | undefined,
  alignment: "left" | "right",
): P {
  if (length === undefined || length <= 0) {
    return part
  }

  const adjusted: Part<InferPart<P>> = {
    ...part,
    serialize(value) {
      const raw = part.serialize(value)
      if (raw === "") {
        return raw
      }
      if (raw.length >= length) {
        return raw
      }
      return alignment === "right" ? raw.padStart(length, " ") : raw.padEnd(length, " ")
    },
  }

  if (part.isOptional) {
    adjusted.isOptional = part.isOptional
  }
  if (part.nullOnBlank) {
    adjusted.nullOnBlank = part.nullOnBlank
  }

  return adjusted as P
}

export function stringField<const Key extends string>(
  key: Key,
  label: string,
  options: StringFieldOptions = {},
) {
  const { optional, length, ...stringOptions } = options
  const basePart = stringPart(stringOptions)
  const maybeOptional = optional ? opt(basePart) : basePart
  const finalPart = applyLength(maybeOptional, length, "left")
  return buildSingleFieldItem(key, label, finalPart)
}

export function numberField<const Key extends string>(
  key: Key,
  label: string,
  options: NumberFieldOptions = {},
) {
  const { optional, length, ...numberOptions } = options
  const basePart = numberPart(numberOptions)
  const maybeOptional = optional ? opt(basePart) : basePart
  const finalPart = applyLength(maybeOptional, length, "right")
  return buildSingleFieldItem(key, label, finalPart)
}

export function booleanField<const Key extends string>(
  key: Key,
  label: string,
  options: BooleanFieldOptions,
) {
  const { optional, length, ...booleanOptions } = options
  const basePart = booleanPart(booleanOptions)
  const maybeOptional = optional ? opt(basePart) : basePart
  const finalPart = applyLength(maybeOptional, length, "left")
  return buildSingleFieldItem(key, label, finalPart)
}

export function durationField<const Key extends string>(
  key: Key,
  label: string,
  options: DurationFieldOptions = {},
) {
  const { optional, length } = options
  const basePart = durationPart()
  const maybeOptional = optional ? opt(basePart) : basePart
  const finalPart = applyLength(maybeOptional, length, "right")
  return buildSingleFieldItem(key, label, finalPart)
}
