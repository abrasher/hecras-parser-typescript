import {
  formatChunkedLines,
  formatHECRASCoordinateNumber,
  formatHECRASStationNumber,
} from "./serializationUtils"
import type {
  BlankLinesItem,
  TupleArrayFieldItem,
  TupleFieldItem,
  ContextualItem,
  Infer,
  MultiFieldItem,
  ParseResult,
  Part,
  RepeatItem,
  SchemaDef,
  SchemaItem,
  SectionItem,
  CountedArrayFieldItem,
  TextBlockFieldItem,
} from "./core"
import { parseMultilineArray, splitIntoTuples } from "./parsingUtils"

const INTERNAL_STATE = Symbol("internalState")

type InternalState = Record<string, unknown>

interface ParseOptions {
  strict?: boolean
}

type ParseContext = Record<string, unknown> & { [INTERNAL_STATE]: InternalState }

function createContext(): ParseContext {
  const context = {} as ParseContext
  context[INTERNAL_STATE] = {}
  return context
}

function getInternalState(context: ParseContext): InternalState {
  let state = context[INTERNAL_STATE]
  if (!state) {
    state = {}
    context[INTERNAL_STATE] = state
  }
  return state
}

function isInternalPart(part: Part<unknown>): boolean {
  return part.internal === true
}

function storeInternalValue(
  part: Part<unknown>,
  fieldKey: string,
  context: ParseContext,
  value: unknown,
): void {
  const state = getInternalState(context)
  const key = (part.internalKey ?? fieldKey) as string
  state[key] = value
  if (part.storeInternal) {
    part.storeInternal(state, value as never)
  }
}

function deriveInternalValue(
  part: Part<unknown>,
  fieldKey: string,
  data: Record<string, unknown>,
  context: ParseContext,
): unknown {
  const state = getInternalState(context)
  if (part.derive) {
    const derived = part.derive(data, state)
    storeInternalValue(part, fieldKey, context, derived)
    return derived
  }
  const key = (part.internalKey ?? fieldKey) as string
  const existing = state[key]
  if (existing !== undefined) {
    return existing
  }
  const fallback = data[fieldKey]
  storeInternalValue(part, fieldKey, context, fallback)
  return fallback
}

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
  const context = createContext()

  const { nextIndex } = parseSchemaInternal(schema, context, lines, startIndex, { strict })
  const result = { ...context }
  delete (result as ParseContext)[INTERNAL_STATE]
  return {
    value: result as Infer<Def>,
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
    case "tupleField":
      return parseTupleField(item, context, lines, index, options)
    case "tupleArrayField":
      return parseTupleArrayField(item, context, lines, index, options)
    case "countedArrayField":
      return parseCountedArrayField(item, context, lines, index)
    case "contextual":
      return parseContextual(item, context, lines, index)
    case "textBlockField":
      return parseTextBlockField(item, context, lines, index, options)
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
  const updates: Record<string, unknown> = {}

  // Special handling for single-field items - don't split on commas
  if (fieldEntries.length === 1) {
    const [key, part] = fieldEntries[0]
    const parsed = part.parse(raw)
    if (isInternalPart(part)) {
      storeInternalValue(part, key, context, parsed)
    } else {
      updates[key] = parsed
    }
  } else {
    // Multi-field items split on commas
    const segments = splitMultiFieldSegments(raw)
    for (let i = 0; i < fieldEntries.length; i++) {
      const [key, part] = fieldEntries[i]
      const segment = segments[i] ?? ""
      const parsed = part.parse(segment)
      if (isInternalPart(part)) {
        storeInternalValue(part, key, context, parsed)
      } else {
        updates[key] = parsed
      }
    }
  }

  Object.assign(context, updates)

  return { status: "success", nextIndex: index + 1 }
}

function parseTupleField(
  item: TupleFieldItem<string, readonly Part<unknown>[]>,
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

  const raw = line.slice(item.label.length)
  const segments = splitMultiFieldSegments(raw)

  if (segments.length < item.parts.length) {
    throw new Error(`Insufficient segments for tuple field "${item.label}"`)
  }

  const values: unknown[] = []
  for (let i = 0; i < item.parts.length; i++) {
    const part = item.parts[i]
    const segment = segments[i] ?? ""
    values.push(part.parse(segment))
  }

  context[item.key] = values

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

function parseCountedArrayField(
  item: CountedArrayFieldItem<string, number>,
  context: ParseContext,
  lines: string[],
  index: number,
): ItemOutcome {
  const state = getInternalState(context)
  const stored = state[item.countKey]

  if (stored === undefined) {
    if (item.optional) {
      return { status: "skipped" }
    }
    context[item.key] = []
    return { status: "success", nextIndex: index }
  }

  const count = typeof stored === "number" ? stored : parseInt(String(stored), 10)
  if (!Number.isFinite(count) || Number.isNaN(count)) {
    throw new Error(`Invalid count for counted array field "${item.key}"`)
  }

  if (count <= 0) {
    context[item.key] = []
    state[item.countKey] = 0
    return { status: "success", nextIndex: index }
  }

  const totalNumbers = count * item.tupleSize
  const { data, nextIndex } = parseMultilineArray({
    lines,
    width: item.width,
    maxWidth: item.maxWidth,
    numOfEntries: totalNumbers,
    currentIndex: index,
  })

  const parser = item.parseValue ?? defaultCountedArrayParser
  const values = data.map((segment, idx) => {
    const value = parser(segment ?? "")
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(
        `Invalid numeric segment for counted array field "${item.key}" at index ${idx}`,
      )
    }
    return value
  })

  const tuples = splitIntoTuples(values, item.tupleSize)
  context[item.key] = tuples
  state[item.countKey] = count

  return { status: "success", nextIndex }
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

function parseTextBlockField(
  item: TextBlockFieldItem<string>,
  context: ParseContext,
  lines: string[],
  index: number,
  options: ParseOptions,
): ItemOutcome {
  const startLine = `BEGIN ${item.label}:`
  const endLine = `END ${item.label}:`
  const line = lines[index]

  if (line !== startLine) {
    if (item.optional) {
      return { status: "skipped" }
    }
    if (options.strict) {
      throw new Error(`Expected line "${startLine}" at index ${index}`)
    }
    return { status: "terminate", nextIndex: index }
  }

  const blockLines: string[] = []
  let cursor = index + 1

  while (cursor < lines.length) {
    const current = lines[cursor]
    if (current === endLine) {
      const value = blockLines.join("\n")
      context[item.key] = value
      return { status: "success", nextIndex: cursor + 1 }
    }

    blockLines.push(current ?? "")
    cursor++
  }

  throw new Error(`Missing closing line "${endLine}" for block starting at index ${index}`)
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

  const nestedContext = createContext()
  const { nextIndex } = parseSchemaInternal(item.schema, nestedContext, lines, index, {
    strict: options.strict ?? false,
  })

  const result = { ...nestedContext }
  delete result[INTERNAL_STATE]
  context[item.key] = result
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
    const nestedContext = createContext()
    const { nextIndex } = parseSchemaInternal(item.schema, nestedContext, lines, cursor, {
      strict: options.strict ?? false,
    })
    const result = { ...nestedContext }
    delete result[INTERNAL_STATE]
    items.push(result)
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

function defaultCountedArrayParser(segment: string): number {
  const trimmed = segment.trim()
  if (trimmed === "") {
    throw new Error("Encountered blank segment when parsing counted array")
  }
  const value = parseFloat(trimmed)
  if (Number.isNaN(value)) {
    throw new Error(`Unable to parse counted array value: ${segment}`)
  }
  return value
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
  return Object.values(item.fields).every((part) => part.isOptional === true || part.internal)
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
  const context = createContext()
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
      case "tupleField":
        serializeTupleField(item, data, lines, context)
        break
      case "tupleArrayField":
        serializeTupleArrayField(item, data, lines, context)
        break
      case "countedArrayField":
        serializeCountedArrayField(item, data, lines, context)
        break
      case "contextual":
        serializeContextual(item, data, lines, context)
        break
      case "textBlockField":
        serializeTextBlockField(item, data, lines)
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
  const hasExternalDefined = entries.some(([key, part]) => {
    if (isInternalPart(part)) {
      return false
    }
    return data[key] !== undefined
  })
  const allInternal = entries.every(([, part]) => isInternalPart(part))

  if (entries.length === 1) {
    const [key, part] = entries[0]
    if (isInternalPart(part)) {
      const derived = deriveInternalValue(part, key, data, context)
      const serialized = part.serialize(derived as never)
      lines.push(`${item.label}${serialized}`)
      return
    }
    const value = data[key]
    if (value === undefined) {
      return
    }
    const serialized = part.serialize(value)
    lines.push(`${item.label}${serialized}`)
    context[key] = value
    return
  }

  if (!hasExternalDefined && !allInternal) {
    return
  }

  const segments = entries.map(([key, part]) => {
    if (isInternalPart(part)) {
      const derived = deriveInternalValue(part, key, data, context)
      return part.serialize(derived as never)
    }
    return part.serialize(data[key])
  })
  lines.push(`${item.label}${segments.join(",")}`)

  for (const [key, part] of entries) {
    if (isInternalPart(part)) {
      continue
    }
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
  const valueFormatter = (() => {
    if (item.formatter === "station") {
      return (num: number) => formatHECRASStationNumber(num)
    }
    if (item.formatter === "coordinate") {
      return (num: number) => formatHECRASCoordinateNumber(num)
    }
    if (typeof item.formatter === "function") {
      return item.formatter
    }
    return (num: number) => num.toString()
  })()
  const formattedLines = formatChunkedLines(flat, {
    width: item.width,
    perLine,
    formatter: valueFormatter,
  })
  lines.push(...formattedLines)

  context[item.key] = value
}

function serializeCountedArrayField(
  item: CountedArrayFieldItem<string, number>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  const state = getInternalState(context)

  if (value === undefined) {
    state[item.countKey] = 0
    return
  }

  if (!Array.isArray(value)) {
    throw new Error(`Expected array for counted array field "${item.key}"`)
  }

  const tuples = value as unknown[]
  state[item.countKey] = tuples.length

  if (tuples.length === 0) {
    context[item.key] = value
    return
  }

  const flat: number[] = []
  for (const tuple of tuples) {
    if (!Array.isArray(tuple) || tuple.length !== item.tupleSize) {
      throw new Error(
        `Tuple for counted array field "${item.key}" must have length ${item.tupleSize}`,
      )
    }
    for (const entry of tuple) {
      if (typeof entry !== "number" || Number.isNaN(entry)) {
        throw new Error(`Entries for counted array field "${item.key}" must be finite numbers`)
      }
      flat.push(entry)
    }
  }

  const perLine = Math.max(1, Math.floor(item.maxWidth / item.width))
  const valueFormatter = (() => {
    if (item.formatter === "station") {
      return (num: number) => formatHECRASStationNumber(num)
    }
    if (item.formatter === "coordinate") {
      return (num: number) => formatHECRASCoordinateNumber(num)
    }
    if (typeof item.formatter === "function") {
      return item.formatter
    }
    return (num: number) => num.toString()
  })()

  const formattedLines = formatChunkedLines(flat, {
    width: item.width,
    perLine,
    formatter: valueFormatter,
  })
  lines.push(...formattedLines)

  context[item.key] = value
}

function serializeTupleField(
  item: TupleFieldItem<string, readonly Part<unknown>[]>,
  data: Record<string, unknown>,
  lines: string[],
  context: ParseContext,
): void {
  const value = data[item.key]
  if (value === undefined) {
    return
  }

  if (!Array.isArray(value)) {
    throw new Error(`Expected array for tuple field key "${item.key}"`)
  }

  if (value.length !== item.parts.length) {
    throw new Error(`Tuple field "${item.key}" must contain exactly ${item.parts.length} entries`)
  }

  const segments = item.parts.map((part, index) => part.serialize(value[index]))
  const serialized = segments.join(",")
  lines.push(`${item.label}${serialized}`)
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

function serializeTextBlockField(
  item: TextBlockFieldItem<string>,
  data: Record<string, unknown>,
  lines: string[],
): void {
  const value = data[item.key]
  if (value === undefined) {
    return
  }
  if (typeof value !== "string") {
    throw new Error(`Expected string value for text block field "${item.key}"`)
  }

  const startLine = `BEGIN ${item.label}:`
  const endLine = `END ${item.label}:`

  lines.push(startLine)
  if (value !== "") {
    lines.push(...value.split("\n"))
  }
  lines.push(endLine)
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

  const nestedContext = createContext()
  serializeSchemaInternal(item.schema, value as Record<string, unknown>, lines, nestedContext)
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
    const nestedContext = createContext()
    serializeSchemaInternal(item.schema, entry as Record<string, unknown>, lines, nestedContext)
    serializedItems.push(entry)
  }

  context[item.key] = serializedItems
}
