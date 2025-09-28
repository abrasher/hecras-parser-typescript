import { formatChunkedLines } from "./serializationUtils"
import type {
  BlankLinesItem,
  TupleArrayFieldItem,
  ContextualItem,
  Infer,
  MultiFieldItem,
  ParseResult,
  Part,
  RepeatItem,
  SchemaDef,
  SchemaItem,
  SectionItem,
} from "./core"

interface ParseOptions {
  strict?: boolean
}

type ParseContext = Record<string, unknown>

type ItemOutcome =
  | { status: "success"; nextIndex: number }
  | { status: "skipped" }
  | { status: "terminate"; nextIndex: number }

type MultiFieldSpec = MultiFieldItem<Record<string, Part<unknown>>>

export function parseWithSchema<const Def extends SchemaDef>(
  schema: Def,
  lines: string[],
  startIndex: number,
  options: ParseOptions = {},
): ParseResult<Infer<Def>> {
  const { strict = false } = options
  const context: ParseContext = {}

  const { nextIndex } = parseSchemaInternal(schema, context, lines, startIndex, { strict })
  return {
    value: context as Infer<Def>,
    nextIndex,
  }
}

export function parseSectionWithSchema<const Def extends SchemaDef>(
  schema: Def,
  lines: string[],
  startIndex: number,
): ParseResult<Infer<Def>> {
  return parseWithSchema(schema, lines, startIndex, { strict: false })
}

function parseSchemaInternal(
  schema: SchemaDef,
  context: ParseContext,
  lines: string[],
  startIndex: number,
  options: ParseOptions,
): { nextIndex: number } {
  let index = startIndex

  for (const item of schema) {
    const outcome = parseItem(item, context, lines, index, options)

    if (outcome.status === "success") {
      index = outcome.nextIndex
      continue
    }

    if (outcome.status === "skipped") {
      continue
    }

    if (outcome.status === "terminate") {
      return { nextIndex: outcome.nextIndex }
    }
  }

  return { nextIndex: index }
}

function parseItem(
  item: SchemaItem,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  switch (item.kind) {
    case "multiField":
      return parseMultiField(item, context, lines, index, options)
    case "tupleArrayField":
      return parseTupleArrayField(item, context, lines, index, options)
    case "contextual":
      return parseContextual(item, context, lines, index)
    case "section":
      return parseSection(item, context, lines, index, options)
    case "repeat":
      return parseRepeat(item, context, lines, index, options)
    case "include": {
      const { nextIndex } = parseSchemaInternal(item.schema, context, lines, index, options)
      return nextIndex === index ? { status: "skipped" } : { status: "success", nextIndex }
    }
    case "blankLine":
      return parseBlankLine(lines, index)
    case "blankLines":
      return parseBlankLines(item, lines, index)
    default:
      return { status: "skipped" }
  }
}

function parseMultiField(
  item: MultiFieldSpec,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  const line = lines[index]
  const allOptional = areAllFieldsOptional(item)

  if (!line || !line.startsWith(item.label)) {
    if (allOptional) {
      return { status: "skipped" }
    }
    if (options.strict) {
      throw new Error(`Expected line starting with "${item.label}" at index ${index}`)
    }
    return { status: "terminate", nextIndex: index }
  }

  const raw = line.slice(item.label.length)
  const fieldEntries = Object.entries(item.fields)
  const updates: ParseContext = {}

  // Special handling for single-field items - don't split on commas
  if (fieldEntries.length === 1) {
    const [key, part] = fieldEntries[0]
    updates[key] = part.parse(raw)
  } else {
    // Multi-field items split on commas
    const segments = splitMultiFieldSegments(raw)
    for (let i = 0; i < fieldEntries.length; i++) {
      const [key, part] = fieldEntries[i]
      const segment = segments[i] ?? ""
      updates[key] = part.parse(segment)
    }
  }

  Object.assign(context, updates)

  return { status: "success", nextIndex: index + 1 }
}

function parseTupleArrayField(
  item: TupleArrayFieldItem<string, number>,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  const line = lines[index]
  if (!line || !line.startsWith(item.label)) {
    if (item.optional) {
      return { status: "skipped" }
    }
    if (options.strict) {
      throw new Error(`Expected line starting with "${item.label}" at index ${index}`)
    }
    return { status: "terminate", nextIndex: index }
  }

  const countSegment = line.slice(item.label.length).trim()
  const count = parseInt(countSegment, 10)
  if (Number.isNaN(count)) {
    throw new Error(`Invalid count for "${item.label}": ${countSegment}`)
  }

  const totalNumbers = count * item.tupleSize
  const values: number[] = []
  let cursor = index + 1

  while (values.length < totalNumbers && cursor < lines.length) {
    const row = lines[cursor] ?? ""
    const chunks = chunkFixedWidth(row, item.width)
    for (const chunk of chunks) {
      if (values.length >= totalNumbers) {
        break
      }
      const trimmed = chunk.trim()
      if (trimmed === "") {
        values.push(0)
      } else {
        const num = parseFloat(trimmed)
        if (Number.isNaN(num)) {
          throw new Error(`Invalid numeric chunk "${chunk}" for "${item.label}"`)
        }
        values.push(num)
      }
    }
    cursor++
  }

  if (values.length < totalNumbers) {
    throw new Error(`Insufficient data for "${item.label}" tuples`)
  }

  const tuples: number[][] = []
  for (let i = 0; i < values.length; i += item.tupleSize) {
    const slice = values.slice(i, i + item.tupleSize)
    tuples.push(slice)
  }

  context[item.key] = tuples

  return { status: "success", nextIndex: cursor }
}

function parseContextual(
  item: ContextualItem<string, unknown>,
  context: ParseContext,
  lines: string[],
  index: number,
): ItemOutcome {
  const result = item.parser(lines, index, context)
  if (!result) {
    return { status: "skipped" }
  }

  context[item.key] = result.value
  return { status: "success", nextIndex: result.nextIndex }
}

function parseSection(
  item: SectionItem<string, SchemaDef>,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  const line = lines[index]
  if (!item.recognizer(line, lines, index)) {
    return { status: "skipped" }
  }

  const nestedContext: ParseContext = {}
  const { nextIndex } = parseSchemaInternal(item.schema, nestedContext, lines, index, {
    strict: options.strict ?? false,
  })

  context[item.key] = nestedContext
  return { status: "success", nextIndex }
}

function parseRepeat(
  item: RepeatItem<string, SchemaDef>,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  const items: unknown[] = []
  let cursor = index

  while (cursor < lines.length && item.recognizer(lines[cursor], lines, cursor)) {
    const nestedContext: ParseContext = {}
    const { nextIndex } = parseSchemaInternal(item.schema, nestedContext, lines, cursor, {
      strict: options.strict ?? false,
    })
    items.push(nestedContext)
    if (nextIndex === cursor) {
      break
    }
    cursor = nextIndex
  }

  context[item.key] = items
  return { status: "success", nextIndex: cursor }
}

function parseBlankLine(lines: string[], index: number): ItemOutcome {
  const line = lines[index]
  if (line !== undefined && line.trim() === "") {
    return { status: "success", nextIndex: index + 1 }
  }
  return { status: "skipped" }
}

function parseBlankLines(item: BlankLinesItem, lines: string[], index: number): ItemOutcome {
  let cursor = index
  let consumed = 0
  while (cursor < lines.length && consumed < item.count) {
    const line = lines[cursor]
    if (line === undefined || line.trim() !== "") {
      break
    }
    cursor++
    consumed++
  }

  if (consumed === 0) {
    return { status: "skipped" }
  }

  return { status: "success", nextIndex: cursor }
}

function areAllFieldsOptional(item: MultiFieldSpec): boolean {
  return Object.values(item.fields).every((part) => part.isOptional === true)
}

function splitMultiFieldSegments(value: string): string[] {
  return value.split(",")
}

function chunkFixedWidth(value: string, width: number): string[] {
  if (width <= 0) {
    throw new Error("Width must be positive")
  }
  const chunks: string[] = []
  for (let i = 0; i < value.length; i += width) {
    chunks.push(value.slice(i, i + width))
  }
  if (chunks.length === 0) {
    chunks.push("")
  }
  return chunks
}

export function serializeWithSchema<const Def extends SchemaDef>(
  schema: Def,
  data: Infer<Def>,
): string[] {
  const lines: string[] = []
  const context: ParseContext = {}
  serializeSchemaInternal(schema, data, lines, context)
  return lines
}

function serializeSchemaInternal(
  schema: SchemaDef,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  for (const item of schema) {
    switch (item.kind) {
      case "multiField":
        serializeMultiField(item, data, lines, context)
        break
      case "tupleArrayField":
        serializeTupleArrayField(item, data, lines, context)
        break
      case "contextual":
        serializeContextual(item, data, lines, context)
        break
      case "section":
        serializeSection(item, data, lines, context)
        break
      case "repeat":
        serializeRepeat(item, data, lines, context)
        break
      case "include":
        serializeSchemaInternal(item.schema, data, lines, context)
        break
      case "blankLine":
        lines.push("")
        break
      case "blankLines":
        lines.push(...Array.from({ length: item.count }, () => ""))
        break
      default:
        break
    }
  }
}

function serializeMultiField(
  item: MultiFieldSpec,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const entries = Object.entries(item.fields)
  const values = entries.map(([key]) => data[key])
  const hasDefined = values.some((value) => value !== undefined)

  if (entries.length === 1) {
    const [key, part] = entries[0]
    const value = data[key]
    if (value === undefined) {
      return
    }
    const serialized = part.serialize(value)
    lines.push(`${item.label}${serialized}`)
    context[key] = value
    return
  }

  if (!hasDefined) {
    return
  }

  const segments = entries.map(([key, part]) => part.serialize(data[key]))
  lines.push(`${item.label}${segments.join(",")}`)

  for (const [key] of entries) {
    context[key] = data[key]
  }
}

function serializeTupleArrayField(
  item: TupleArrayFieldItem<string, number>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  if (value === undefined) {
    return
  }
  if (!Array.isArray(value)) {
    throw new Error(`Expected array for key "${item.key}" in counted tuples`)
  }

  const tuples = value as unknown[]
  const count = tuples.length
  const countSegment = item.pad ? ` ${count} ` : String(count)
  lines.push(`${item.label}${countSegment}`)

  const flat: number[] = []
  for (const tuple of tuples) {
    if (!Array.isArray(tuple) || tuple.length !== item.tupleSize) {
      throw new Error(`Tuple for key "${item.key}" must have length ${item.tupleSize}`)
    }
    for (const entry of tuple) {
      if (typeof entry !== "number" || Number.isNaN(entry)) {
        throw new Error(`Tuple entries for key "${item.key}" must be numbers`)
      }
      flat.push(entry)
    }
  }

  const perLine = Math.max(1, Math.floor(item.maxWidth / item.width))
  const formattedLines = formatChunkedLines(flat, {
    width: item.width,
    perLine,
    formatter: (num) => num.toString(),
  })
  lines.push(...formattedLines)

  context[item.key] = value
}

function serializeContextual(
  item: ContextualItem<string, unknown>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  if (value === undefined) {
    return
  }

  if (item.serializer) {
    const produced = item.serializer(value, context)
    lines.push(...produced)
  } else {
    throw new Error(`No serializer provided for contextual item "${item.key}"`)
  }

  context[item.key] = value
}

function serializeSection(
  item: SectionItem<string, SchemaDef>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  if (value === undefined) {
    return
  }

  if (typeof value !== "object" || value === null) {
    throw new Error(`Section "${item.key}" must be an object when serializing`)
  }

  serializeSchemaInternal(item.schema, value as Record<string, unknown>, lines, {})
  context[item.key] = value
}

function serializeRepeat(
  item: RepeatItem<string, SchemaDef>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  if (!value || !Array.isArray(value)) {
    context[item.key] = []
    return
  }

  const serializedItems: unknown[] = []
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`Repeat entry for "${item.key}" must be an object`)
    }
    serializeSchemaInternal(item.schema, entry as Record<string, unknown>, lines, {})
    serializedItems.push(entry)
  }

  context[item.key] = serializedItems
}
