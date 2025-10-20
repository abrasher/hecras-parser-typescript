import type {
  TupleArrayFieldItem,
  TupleFieldItem,
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
  ConditionalBlankLineItem,
  InferPart,
  CountedArrayFieldItem,
  TextBlockFieldItem,
} from "./core"
import { schema as buildSchema, fields as buildFields } from "./core"
import { booleanPart, durationPart, numberPart, opt, stringPart } from "./parts"
import { formatFixedWidth } from "./serializationUtils"

interface MultiFieldOptions {
  optional?: boolean
}

export function multiField<const Spec extends Record<string, Part<unknown>>>(
  label: string,
  fieldSpec: Spec,
  options: MultiFieldOptions = {},
): MultiFieldItem<Spec> {
  const { optional } = options
  if (optional) {
    return {
      kind: "multiField",
      label,
      fields: fieldSpec,
      optional: true as const,
    }
  }

  return {
    kind: "multiField",
    label,
    fields: fieldSpec,
  }
}

interface TupleFieldOptions {
  optional?: boolean
}

export function tupleField<
  const Key extends string,
  const Parts extends readonly Part<unknown>[],
>(
  key: Key,
  label: string,
  parts: Parts,
  options: TupleFieldOptions = {},
): TupleFieldItem<Key, Parts> {
  if (options.optional) {
    return {
      kind: "tupleField",
      key,
      label,
      parts,
      optional: true as const,
    }
  }

  return {
    kind: "tupleField",
    key,
    label,
    parts,
  }
}

interface TupleArrayFieldConfig<Tuple extends number> {
  width: number
  maxWidth: number
  tuple: Tuple
  optional?: boolean
  pad?: boolean
  formatter?: "station" | "coordinate" | ((value: number) => string)
}

export function tupleArrayField<const Key extends string, const Tuple extends number>(
  label: string,
  key: Key,
  config: TupleArrayFieldConfig<Tuple> & { formatter: "station" },
): TupleArrayFieldItem<Key, Tuple, true>
export function tupleArrayField<const Key extends string, const Tuple extends number>(
  label: string,
  key: Key,
  config: TupleArrayFieldConfig<Tuple>,
): TupleArrayFieldItem<Key, Tuple, false>
export function tupleArrayField<const Key extends string, const Tuple extends number>(
  label: string,
  key: Key,
  config: TupleArrayFieldConfig<Tuple>,
): TupleArrayFieldItem<Key, Tuple, boolean> {
  const { width, maxWidth, tuple, optional, pad, formatter } = config
  const nullable = formatter === "station"
  if (optional) {
    return {
      kind: "tupleArrayField",
      label,
      key,
      width,
      maxWidth,
      tupleSize: tuple,
      optional: true as const,
      pad,
      formatter,
      nullable,
    }
  }

  return {
    kind: "tupleArrayField",
    label,
    key,
    width,
    maxWidth,
    tupleSize: tuple,
    pad,
    formatter,
    nullable,
  }
}

interface CountedFixedWidthArrayConfig<Tuple extends number> {
  width: number
  maxWidth: number
  tuple: Tuple
  countKey?: string
  optional?: boolean
  pad?: boolean
  formatter?: "station" | "coordinate" | ((value: number) => string)
  parseValue?(segment: string): number | null
}

export function countedFixedWidthArray<const Key extends string, const Tuple extends number>(
  key: Key,
  config: CountedFixedWidthArrayConfig<Tuple> & { formatter: "station" },
): CountedArrayFieldItem<Key, Tuple, true>
export function countedFixedWidthArray<const Key extends string, const Tuple extends number>(
  key: Key,
  config: CountedFixedWidthArrayConfig<Tuple>,
): CountedArrayFieldItem<Key, Tuple, false>
export function countedFixedWidthArray<const Key extends string, const Tuple extends number>(
  key: Key,
  config: CountedFixedWidthArrayConfig<Tuple>,
): CountedArrayFieldItem<Key, Tuple, boolean> {
  const { width, maxWidth, tuple, countKey, optional, pad, formatter, parseValue } = config
  const nullable = formatter === "station"
  if (optional) {
    return {
      kind: "countedArrayField",
      key,
      countKey: countKey ?? key,
      width,
      maxWidth,
      tupleSize: tuple,
      optional: true as const,
      pad,
      formatter,
      nullable,
      parseValue,
    }
  }

  return {
    kind: "countedArrayField",
    key,
    countKey: countKey ?? key,
    width,
    maxWidth,
    tupleSize: tuple,
    pad,
    formatter,
    nullable,
    parseValue,
  }
}

interface TextBlockFieldOptions {
  optional?: boolean
}

export function textBlockField<const Key extends string>(
  key: Key,
  label: string,
  options: TextBlockFieldOptions = {},
): TextBlockFieldItem<Key> {
  const { optional = false } = options
  if (optional) {
    return {
      kind: "textBlockField",
      key,
      label,
      optional: true as const,
    }
  }

  return {
    kind: "textBlockField",
    key,
    label,
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

interface BlankLineIfNotEmptyOptions {
  predicate?: (value: unknown) => boolean
}

export function blankLineIfNotEmpty(
  key: string,
  options: BlankLineIfNotEmptyOptions = {},
): ConditionalBlankLineItem {
  return {
    kind: "blankLineIfNotEmpty",
    key,
    predicate: options.predicate,
  }
}

export function startsWith(prefix: string): Recognizer {
  return (line) => (line ?? "").startsWith(prefix)
}

export const schema = buildSchema
export const fields = buildFields

type LengthOption = {
  length?: number
}

type StringFieldOptions = LengthOption &
  NonNullable<Parameters<typeof stringPart>[0]> & {
    optional?: boolean
  }

type NumberFieldOptions = LengthOption &
  NonNullable<Parameters<typeof numberPart>[0]> & {
    optional?: boolean
  }

type BooleanFieldOptions = LengthOption &
  Parameters<typeof booleanPart>[0] & {
    optional?: boolean
  }

type DurationFieldOptions = LengthOption & {
  optional?: boolean
}

type WithOptional<Value, Options> = Options extends { optional: true }
  ? Part<Value | undefined> & { isOptional: true }
  : Part<Value>

type NumberFieldValue<Options> = Options extends { nullOnBlank: true } ? number | null : number

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

  const adjusted: P = {
    ...part,
    serialize(value: InferPart<P>) {
      const raw = part.serialize(value)
      if (raw === "") {
        return raw
      }
      return formatFixedWidth(raw, length, {
        padDirection: alignment === "right" ? "start" : "end",
      })
    },
  }

  return adjusted
}

export function stringField<const Key extends string, const Options extends StringFieldOptions | undefined = undefined>(
  key: Key,
  label: string,
  options?: Options,
): MultiFieldItem<Record<Key, WithOptional<string, Options>>> {
  const { optional, length, ...stringOptions } = (options ?? {}) as StringFieldOptions
  const basePart = stringPart(stringOptions)

  if (optional) {
    const finalPart = applyLength(opt(basePart), length, "left")
    return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
      Record<Key, WithOptional<string, Options>>
    >
  }

  const finalPart = applyLength(basePart, length, "left")
  return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
    Record<Key, WithOptional<string, Options>>
  >
}

export function numberField<const Key extends string, const Options extends NumberFieldOptions | undefined = undefined>(
  key: Key,
  label: string,
  options?: Options,
): MultiFieldItem<Record<Key, WithOptional<NumberFieldValue<Options>, Options>>> {
  const { optional, length, ...numberOptions } = (options ?? {}) as NumberFieldOptions
  const basePart = numberPart(numberOptions)

  if (optional) {
    const finalPart = applyLength(opt(basePart), length, "right")
    return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
      Record<Key, WithOptional<NumberFieldValue<Options>, Options>>
    >
  }

  const finalPart = applyLength(basePart, length, "right")
  return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
    Record<Key, WithOptional<NumberFieldValue<Options>, Options>>
  >
}

export function booleanField<const Key extends string, const Options extends BooleanFieldOptions>(
  key: Key,
  label: string,
  options: Options,
): MultiFieldItem<Record<Key, WithOptional<boolean, Options>>> {
  const { optional, length, ...booleanOptions } = options
  const basePart = booleanPart(booleanOptions)

  if (optional) {
    const finalPart = applyLength(opt(basePart), length, "left")
    return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
      Record<Key, WithOptional<boolean, Options>>
    >
  }

  const finalPart = applyLength(basePart, length, "left")
  return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
    Record<Key, WithOptional<boolean, Options>>
  >
}

export function durationField<const Key extends string, const Options extends DurationFieldOptions | undefined = undefined>(
  key: Key,
  label: string,
  options?: Options,
): MultiFieldItem<Record<Key, WithOptional<number, Options>>> {
  const { optional, length } = (options ?? {}) as DurationFieldOptions
  const basePart = durationPart()

  if (optional) {
    const finalPart = applyLength(opt(basePart), length, "right")
    return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
      Record<Key, WithOptional<number, Options>>
    >
  }

  const finalPart = applyLength(basePart, length, "right")
  return buildSingleFieldItem(key, label, finalPart) as MultiFieldItem<
    Record<Key, WithOptional<number, Options>>
  >
}
