/**
 * Every parse result includes a partial object (just the properties parsed)
 * and the index after the last consumed line.
 */
export interface ParseResult<T> {
  value: Partial<T>
  nextIndex: number
}

/**
 * Every Rule knows how to parse (lines → object chunk)
 * and how to serialize (object → lines).
 */
export interface Rule<T> {
  parse(lines: string[], start: number): ParseResult<T> | null
  serialize(obj: T): string[]
}

/**
 * A Schema is just a collection of Rules for some object type.
 */
export type Schema<T> = Rule<T>[]

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
      if (opts.required && (val == null || val === "")) {
        throw new Error(`${String(key)} is required`)
      }
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
      let rhs = line.slice(prefix.length).trim()
      const num = opts.integer ? parseInt(rhs, 10) : parseFloat(rhs)
      return { value: { [key]: num } as Partial<T>, nextIndex: i + 1 }
    },
    serialize(obj) {
      const val = obj[key]
      if (opts.required && val == null) {
        throw new Error(`${String(key)} is required`)
      }
      return val != null ? [`${prefix}${val}`] : []
    },
  }
}

export function multiFieldRule<T extends object>(
  prefix: string,
  keys: (keyof T)[],
  parsers: ((s: string) => any)[],
  serializers: ((v: any) => string)[],
): Rule<T> {
  return {
    parse(lines, i) {
      const line = lines[i]
      if (!line.startsWith(prefix)) return null
      const rhs = line.slice(prefix.length).trim()
      const parts = rhs.split(",")
      const obj: Partial<T> = {}
      keys.forEach((k, idx) => {
        obj[k] = parsers[idx](parts[idx])
      })
      return { value: obj, nextIndex: i + 1 }
    },

    serialize(obj) {
      const fields = keys.map((k, idx) => {
        const val = obj[k]
        return serializers[idx](val)
      })
      return [`${prefix}${fields.join(",")}`]
    },
  }
}

export function repeat<TParent, TItem>(
  key: keyof TParent,
  schema: Schema<TItem>,
  recognizer: (line: string) => boolean,
): Rule<TParent> {
  return {
    parse(lines, i) {
      let idx = i
      const items: TItem[] = []

      while (idx < lines.length && recognizer(lines[idx])) {
        const { value: item, nextIndex } = parseWithSchema(schema, lines, idx)
        items.push(item as TItem)
        idx = nextIndex
      }

      if (items.length === 0) return null
      return { value: { [key]: items } as Partial<TParent>, nextIndex: idx }
    },

    serialize(parent) {
      const items = (parent as any)[key] as TItem[] | undefined
      if (!items) return []
      const lines: string[] = []
      for (const item of items) {
        for (const r of schema) {
          lines.push(...r.serialize(item))
        }
      }
      return lines
    },
  }
}

export function parseWithSchema<T>(
  schema: Schema<T>,
  lines: string[],
  start: number,
): ParseResult<T> {
  let obj = {} as T
  let i = start

  while (i < lines.length) {
    let matched = false
    for (const rule of schema) {
      const res = rule.parse(lines, i)
      if (res) {
        Object.assign(obj, res.value)
        i = res.nextIndex
        matched = true
        break
      }
    }
    if (!matched) break // bubble up
  }

  return { value: obj, nextIndex: i }
}

export function serializeWithSchema<T>(schema: Schema<T>, obj: T): string[] {
  return schema.flatMap((rule) => rule.serialize(obj))
}

export interface CrossSection {
  type: number
  riverMile: string
  lengthLeft: number
  lengthChannel: number
  lengthRight: number
}

export interface RiverReach {
  riverName: string
  reachName: string
  crossSections: CrossSection[]
}

// CrossSection schema
export const crossSectionSchema: Schema<CrossSection> = [
  multiFieldRule<CrossSection>(
    "Type RM Length L Ch R=",
    ["type", "riverMile", "lengthLeft", "lengthChannel", "lengthRight"],
    [Number, (s) => s.trim(), Number, Number, Number],
    [String, String, String, String, String],
  ),
]

// RiverReach schema embedding CrossSections
export const riverReachSchema: Schema<RiverReach> = [
  multiFieldRule<RiverReach>(
    "River Reach=",
    ["riverName", "reachName"],
    [(s) => s.trim(), (s) => s.trim()],
    [String, String],
  ),

  repeat<RiverReach, CrossSection>("crossSections", crossSectionSchema, (line) =>
    line.startsWith("Type RM Length"),
  ),
]
