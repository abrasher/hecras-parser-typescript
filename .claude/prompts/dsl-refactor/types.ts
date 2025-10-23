/**
 * Draft DSL types and helpers — updated to our finalized decisions:
 * - Rule.parse receives current accumulator (acc)
 * - Top-level parsing is strict (complete coverage), sections are non-strict
 * - Serialization order follows schema declaration order
 * - Reusable Parts for CSV fields; single multiField (CSV-only)
 * - Factories for counted fixed-width tuples, delimited blocks, CSV tables-after-count
 * - No scoped blocks, no unknown passthrough, custom one-off rules encouraged
 */

// ----------------------------------------------------------------------------
// Core contracts
// ----------------------------------------------------------------------------

export interface ParseResult<T> {
  value: Partial<T>
  nextIndex: number
}

export interface Rule<T> {
  parse(lines: string[], start: number, acc: Partial<T>): ParseResult<T> | null
  serialize(obj: T): string[]
}

export type Schema<T> = Rule<T>[]

// ----------------------------------------------------------------------------
// Parts (reusable CSV field parsing/serialization)
// ----------------------------------------------------------------------------

export interface Part<V> {
  parse(s: string): V
  serialize(v: V): string
}

export function stringPart(
  opts: { trim?: boolean; nullOnEmpty?: boolean; maxLen?: number } = {},
): Part<string | null> {
  return {
    parse(s) {
      let v = opts.trim ? s.trim() : s
      if (opts.nullOnEmpty && v.trim() === "") return null
      return v
    },
    serialize(v) {
      if (v == null) return ""
      const s = String(v)
      if (opts.maxLen && s.length > opts.maxLen) return s.slice(0, opts.maxLen)
      return s
    },
  }
}

export function numberPart(
  opts: { integer?: boolean; nullOnEmpty?: boolean; trim?: boolean } = {},
): Part<number | null> {
  return {
    parse(s) {
      const raw = opts.trim ? s.trim() : s
      if (opts.nullOnEmpty && raw === "") return null
      const n = opts.integer ? parseInt(raw, 10) : parseFloat(raw)
      return Number.isNaN(n) ? (opts.nullOnEmpty ? null : NaN) : n
    },
    serialize(v) {
      return v == null ? "" : String(v)
    },
  }
}

export function booleanPart(
  mode: "TF" | "10" | "trueFalse" | "enableDisable" = "trueFalse",
): Part<boolean> {
  const toBool = (s: string): boolean => {
    const t = s.trim()
    switch (mode) {
      case "TF":
        if (t === "T") return true
        if (t === "F") return false
        break
      case "10":
        if (t === "-1") return true
        if (t === "0") return false
        break
      case "trueFalse":
        if (/^true$/i.test(t)) return true
        if (/^false$/i.test(t)) return false
        break
      case "enableDisable":
        if (/^enable$/i.test(t)) return true
        if (/^disable$/i.test(t)) return false
        break
    }
    throw new Error(`Unable to parse boolean: ${s}`)
  }
  const fromBool = (b: boolean): string => {
    switch (mode) {
      case "TF":
        return b ? "T" : "F"
      case "10":
        return b ? "-1" : "0"
      case "trueFalse":
        return b ? "True" : "False"
      case "enableDisable":
        return b ? "Enable" : "Disable"
    }
  }
  return {
    parse: toBool,
    serialize: fromBool,
  }
}

export function durationPart(): Part<number> {
  const parseDuration = (value: string): number => {
    const durationRegex = /(\d+\.?\d*)\s*(SEC|MIN|HOUR|DAY|WEEK|MONTH|YEAR)/i
    const match = value.match(durationRegex)
    if (!match) throw new Error(`Invalid duration format: ${value}`)
    const amount = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    switch (unit) {
      case "SEC":
        return amount
      case "MIN":
        return amount * 60
      case "HOUR":
        return amount * 3600
      case "DAY":
        return amount * 86400
      case "WEEK":
        return amount * 604800
      case "MONTH":
        return amount * 2592000
      case "YEAR":
        return amount * 31536000
      default:
        throw new Error(`Unknown duration unit: ${unit}`)
    }
  }
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}SEC`
    if (seconds < 3600) return `${seconds / 60}MIN`
    if (seconds < 86400) return `${seconds / 3600}HOUR`
    if (seconds < 604800) return `${seconds / 86400}DAY`
    if (seconds < 2592000) return `${seconds / 604800}WEEK`
    if (seconds < 31536000) return `${seconds / 2592000}MONTH`
    return `${seconds / 31536000}YEAR`
  }
  return { parse: parseDuration, serialize: formatDuration }
}

// ----------------------------------------------------------------------------
// Primitive rules (single line)
// ----------------------------------------------------------------------------

export function stringField<T extends object>(
  prefix: string,
  key: keyof T,
  opts: { trim?: boolean; required?: boolean } = {},
): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      let rhs = line.slice(prefix.length)
      if (opts.trim) rhs = rhs.trim()
      return { value: { [key]: rhs } as Partial<T>, nextIndex: i + 1 }
    },
    serialize(obj) {
      const val = obj[key]
      if (opts.required && (val == null || val === ""))
        throw new Error(`${String(key)} is required`)
      return val != null ? [`${prefix}${val}`] : []
    },
  }
}

export function numberField<T extends object>(
  prefix: string,
  key: keyof T,
  opts: { integer?: boolean; required?: boolean } = {},
): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      const rhs = line.slice(prefix.length).trim()
      const num = opts.integer ? parseInt(rhs, 10) : parseFloat(rhs)
      return { value: { [key]: num } as Partial<T>, nextIndex: i + 1 }
    },
    serialize(obj) {
      const val = obj[key]
      if (opts.required && val == null) throw new Error(`${String(key)} is required`)
      return val != null ? [`${prefix}${val}`] : []
    },
  }
}

export function booleanField<T extends object>(
  prefix: string,
  key: keyof T,
  mode: "TF" | "10" | "trueFalse" | "enableDisable" = "trueFalse",
): Rule<T> {
  const part = booleanPart(mode)
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      const rhs = line.slice(prefix.length)
      return { value: { [key]: part.parse(rhs) } as Partial<T>, nextIndex: i + 1 }
    },
    serialize(obj) {
      const v = obj[key] as unknown as boolean | undefined
      return v === undefined ? [] : [`${prefix}${part.serialize(v)}`]
    },
  }
}

export function durationField<T extends object>(prefix: string, key: keyof T): Rule<T> {
  const part = durationPart()
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      const rhs = line.slice(prefix.length)
      return { value: { [key]: part.parse(rhs) } as Partial<T>, nextIndex: i + 1 }
    },
    serialize(obj) {
      const v = obj[key] as unknown as number | undefined
      return v === undefined ? [] : [`${prefix}${part.serialize(v)}`]
    },
  }
}

// ----------------------------------------------------------------------------
// Blank line rules (explicit formatting control)
// ----------------------------------------------------------------------------

export function blankLine<T extends object>(): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (line != null && line.trim() === "") {
        return { value: {}, nextIndex: i + 1 }
      }
      return null
    },
    serialize() {
      return [""]
    },
  }
}

export function blankLines<T extends object>(n: number): Rule<T> {
  return {
    parse(lines, i) {
      for (let k = 0; k < n; k++) {
        const line = lines[i + k]
        if (!(line != null && line.trim() === "")) return null
      }
      return { value: {}, nextIndex: i + n }
    },
    serialize() {
      return Array.from({ length: n }, () => "")
    },
  }
}

// ----------------------------------------------------------------------------
// Multi‑field CSV rule
// ----------------------------------------------------------------------------

export type FieldSpec<T> = { key: keyof T; part: Part<any> }

export function multiField<T extends object>(prefix: string, fields: FieldSpec<T>[]): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      const rhs = line.slice(prefix.length).trim()
      const parts = rhs.split(",")
      const obj: Partial<T> = {}
      fields.forEach((f, idx) => {
        const seg = parts[idx] ?? ""
        ;(obj as any)[f.key] = f.part.parse(seg)
      })
      return { value: obj, nextIndex: i + 1 }
    },
    serialize(obj) {
      const values = fields.map((f) => f.part.serialize((obj as any)[f.key]))
      return [`${prefix}${values.join(",")}`]
    },
  }
}

// ----------------------------------------------------------------------------
// Counted fixed‑width tuples (multiline arrays)
// ----------------------------------------------------------------------------

export function countedFixedWidthTuples<T extends object, Item = number[]>(
  prefix: string,
  key: keyof T,
  opts: {
    width: number
    maxWidth: number
    tuple: number
    map?: (nums: number[]) => Item
    unmap?: (item: Item) => number[]
    allowNulls?: boolean
  },
): Rule<T> {
  const { width, maxWidth, tuple, map, unmap, allowNulls } = opts
  const perLine = Math.floor(maxWidth / width)

  return {
    parse(lines, i) {
      const header = lines[i]
      if (!header.startsWith(prefix)) return null
      const count = parseInt(header.slice(prefix.length).trim(), 10) || 0
      let idx = i + 1
      const totalEntries = count * tuple
      const entries: (number | null)[] = []
      while (entries.length < totalEntries) {
        const line = lines[idx] ?? ""
        const chunks = line.match(new RegExp(`.{1,${width}}`, "g")) ?? []
        for (const c of chunks) {
          const s = c.trim()
          if (s === "") {
            entries.push(allowNulls ? null : NaN)
          } else {
            entries.push(parseFloat(s))
          }
          if (entries.length === totalEntries) break
        }
        idx++
      }
      const out: any[] = []
      for (let k = 0; k < totalEntries; k += tuple) {
        const slice = entries
          .slice(k, k + tuple)
          .map((x) => (x == null ? (allowNulls ? null : NaN) : x)) as number[]
        out.push(map ? map(slice) : (slice as any))
      }
      return { value: { [key]: out } as Partial<T>, nextIndex: idx }
    },
    serialize(obj) {
      const items = ((obj as any)[key] as Item[] | undefined) ?? []
      const header = `${prefix}${items.length}`
      if (items.length === 0) return [header]
      const numbers: (number | null)[] = []
      for (const it of items) {
        const arr = unmap ? unmap(it) : (it as any as number[])
        numbers.push(...arr)
      }
      const linesOut: string[] = [header]
      for (let i = 0; i < numbers.length; i += perLine) {
        const chunk = numbers.slice(i, i + perLine)
        const line = chunk.map((n) => (n == null ? "" : String(n)).padStart(width, " ")).join("")
        linesOut.push(line)
      }
      return linesOut
    },
  }
}

// ----------------------------------------------------------------------------
// CSV table after count
// ----------------------------------------------------------------------------

export function csvTableAfterCount<T extends object, R = string[]>(
  prefix: string,
  key: keyof T,
  rowParser: (cols: string[]) => R,
  rowSerializer?: (row: R) => string,
): Rule<T> {
  return {
    parse(lines, i) {
      const header = lines[i]
      if (!header.startsWith(prefix)) return null
      const count = parseInt(header.slice(prefix.length).trim(), 10) || 0
      const out: R[] = []
      let idx = i + 1
      for (let k = 0; k < count; k++, idx++) {
        const cols = (lines[idx] ?? "").split(",")
        out.push(rowParser(cols))
      }
      return { value: { [key]: out } as Partial<T>, nextIndex: idx }
    },
    serialize(obj) {
      const rows = ((obj as any)[key] as R[] | undefined) ?? []
      const header = `${prefix}${rows.length}`
      const body = rows.map((r) => (rowSerializer ? rowSerializer(r) : (r as any[]).join(",")))
      return [header, ...body]
    },
  }
}

// ----------------------------------------------------------------------------
// Delimited block (e.g., BEGIN/END description)
// ----------------------------------------------------------------------------

export function delimitedBlock<T extends object>(
  begin: string,
  end: string,
  key: keyof T,
): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(begin)) return null
      const buf: string[] = []
      let idx = i + 1
      for (; idx < lines.length; idx++) {
        if (lines[idx].startsWith(end)) {
          idx++
          break
        }
        buf.push(lines[idx])
      }
      return { value: { [key]: buf.join("\n") } as Partial<T>, nextIndex: idx }
    },
    serialize(obj) {
      const v = (obj as any)[key] as string | undefined
      if (v == null) return []
      const lines = v === "" ? [""] : v.split("\n")
      return [begin, ...lines, end]
    },
  }
}

// ----------------------------------------------------------------------------
// Combinators
// ----------------------------------------------------------------------------

export function repeat<TParent, TItem>(
  key: keyof TParent,
  schema: Schema<TItem>,
  recognizer: (line: string) => boolean,
): Rule<TParent> {
  return {
    parse(lines, i) {
      let idx = i
      const items: TItem[] = []
      while (idx < lines.length && recognizer(lines[idx] ?? "")) {
        const { value, nextIndex } = parseWithSchema(schema, lines, idx, { strict: false })
        items.push(value as TItem)
        idx = nextIndex
      }
      if (items.length === 0) return null
      return { value: { [key]: items } as Partial<TParent>, nextIndex: idx }
    },
    serialize(parent) {
      const items = ((parent as any)[key] as TItem[] | undefined) ?? []
      const out: string[] = []
      for (const it of items) out.push(...serializeWithSchema(schema, it as any))
      return out
    },
  }
}

// ----------------------------------------------------------------------------
// Driver
// ----------------------------------------------------------------------------

export function parseWithSchema<T>(
  schema: Schema<T>,
  lines: string[],
  start: number,
  opts: { strict?: boolean } = {},
): ParseResult<T> {
  let obj = {} as T
  let i = start
  const strict = opts.strict === true

  while (i < lines.length) {
    const current = lines[i]
    let matched = false
    for (const rule of schema) {
      const res = rule.parse(lines, i, obj)
      if (res) {
        Object.assign(obj as any, res.value)
        i = res.nextIndex
        matched = true
        break
      }
    }
    if (!matched) {
      if (strict) throw new Error(`No rule matched for line: ${current}`)
      break
    }
  }

  return { value: obj, nextIndex: i }
}

export function serializeWithSchema<T>(schema: Schema<T>, obj: T): string[] {
  return schema.flatMap((rule) => rule.serialize(obj))
}

// ----------------------------------------------------------------------------
// Example interfaces and schemas (illustrative only)
// ----------------------------------------------------------------------------

export interface CrossSection {
  type: number
  riverMile: string
  lengthLeft: number
  lengthChannel: number
  lengthRight: number
  stationElevation?: [number, number][]
  ineffectiveFlowAreas?: [number, number, number][]
  permanentIneffective?: boolean[]
}

export interface RiverReach {
  riverName: string
  reachName: string
  coordinates?: [number, number][]
  crossSections: CrossSection[]
}

export const crossSectionSchema: Schema<CrossSection> = [
  multiField<CrossSection>("Type RM Length L Ch R=", [
    { key: "type", part: numberPart({ integer: true }) },
    { key: "riverMile", part: stringPart({ trim: true }) },
    { key: "lengthLeft", part: numberPart() },
    { key: "lengthChannel", part: numberPart() },
    { key: "lengthRight", part: numberPart() },
  ]),
  countedFixedWidthTuples<CrossSection, [number, number]>("#Sta/Elev=", "stationElevation", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
  }),
  countedFixedWidthTuples<CrossSection, [number, number, number]>(
    "#XS Ineff=",
    "ineffectiveFlowAreas",
    {
      width: 8,
      maxWidth: 72,
      tuple: 3,
    },
  ),
]

export const riverReachSchema: Schema<RiverReach> = [
  multiField<RiverReach>("River Reach=", [
    { key: "riverName", part: stringPart({ trim: true }) },
    { key: "reachName", part: stringPart({ trim: true }) },
  ]),
  countedFixedWidthTuples<RiverReach, [number, number]>("Reach XY=", "coordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2,
  }),
  repeat<RiverReach, CrossSection>("crossSections", crossSectionSchema, (line) =>
    line.startsWith("Type RM Length L Ch R="),
  ),
]
