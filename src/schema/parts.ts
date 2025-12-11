import { parseDuration } from "./parsingUtils"
import { formatDuration } from "./serializationUtils"
import type { Part } from "./core"
import type { InferPart } from "./core"

interface StringPartOptions {
  trim?: boolean
  width?: number
  pad?: string
}

export function stringPart(options: StringPartOptions = {}): Part<string> {
  const { trim = true, width, pad = " " } = options

  return {
    parse(segment) {
      const value = trim ? segment.trim() : segment
      return value
    },
    serialize(value) {
      let str = value ?? ""
      if (typeof str !== "string") {
        str = String(str)
      }

      if (width !== undefined) {
        const padChar = pad.length > 0 ? pad[0] : " "
        if (str.length >= width) {
          return str.slice(0, width)
        }
        return str.padEnd(width, padChar)
      }

      return str
    },
  }
}

export interface NumberPartOptions {
  integer?: boolean
  nullOnBlank?: boolean
  pad?: boolean
}

export function numberPart(): Part<number>
export function numberPart<const Opts extends NumberPartOptions>(
  options: Opts,
): Part<Opts extends { nullOnBlank: true } ? number | null : number>
export function numberPart(options?: NumberPartOptions): Part<number> | Part<number | null> {
  const { integer = false, nullOnBlank = false, pad = false } = options ?? {}

  const part: Part<number | null> = {
    parse(segment) {
      const raw = segment.trim()

      if (raw === "") {
        if (nullOnBlank) {
          return null
        }
        throw new Error("Expected number but found blank segment")
      }

      const value = integer ? parseInt(raw, 10) : parseFloat(raw)
      if (Number.isNaN(value)) {
        throw new Error(`Invalid number segment: ${segment}`)
      }
      return value
    },
    serialize(value) {
      if (value === null) {
        if (nullOnBlank) {
          return ""
        }
        throw new Error("Cannot serialize null without nullOnBlank enabled")
      }
      if (value === undefined) {
        return ""
      }

      const numeric = integer ? Math.trunc(value) : value

      let serialized: string

      // Handle HEC-RAS infinity representation
      if (numeric === Infinity) {
        serialized = "1.79769313486232E+308"
      } else {
        if (!Number.isFinite(numeric)) {
          throw new Error(`Cannot serialize non-finite number: ${numeric}`)
        }

        // Check if we should use scientific notation (16+ digits before decimal)
        const numStr = Math.abs(numeric).toString()
        const decimalIndex = numStr.indexOf(".")
        const digitsBeforeDecimal = decimalIndex === -1 ? numStr.length : decimalIndex

        serialized = numeric.toString()

        if (digitsBeforeDecimal >= 16) {
          // Use scientific notation with appropriate precision
          serialized = numeric.toExponential()
        }

        // Convert lowercase 'e' to uppercase 'E' to match HEC-RAS format
        if (serialized.includes("e")) {
          serialized = serialized.replace("e", "E")
        }
      }

      if (pad) {
        const leftPad = numeric < 0 ? "" : " "
        return `${leftPad}${serialized} `
      }

      return serialized
    },
    nullOnBlank: nullOnBlank || undefined,
  }

  if (nullOnBlank) {
    return part
  }

  return part as Part<number>
}
type CountedArrayLengthPartOptions = NumberPartOptions

type CountedArrayLengthPart = Part<number> & { internal: true; internalKey: string }

export function countedArrayLengthPart(
  arrayKey: string,
  options?: CountedArrayLengthPartOptions,
): CountedArrayLengthPart {
  const base = numberPart({ integer: true, ...(options ?? {}) }) as Part<number>

  const part: CountedArrayLengthPart = {
    ...base,
    internal: true as const,
    internalKey: arrayKey,
    parse(segment) {
      const value = base.parse(segment)
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(`Invalid count for ${arrayKey}`)
      }
      return value
    },
    serialize(value) {
      return base.serialize(value)
    },
    storeInternal(state, value) {
      state[arrayKey] = value ?? 0
    },
    derive(data) {
      const arrayValue = data[arrayKey]
      if (!Array.isArray(arrayValue)) {
        return 0
      }
      return arrayValue.length
    },
  }

  return part
}

type BooleanMode = "TF" | "-1,0" | "10" | "trueFalse" | "enableDisable"

interface BooleanPartOptions {
  mode: BooleanMode
  pad?: boolean
}

export function booleanPart(options: BooleanPartOptions): Part<boolean> {
  const { mode, pad = false } = options

  return {
    parse(segment) {
      const value = segment.trim()
      switch (mode) {
        case "TF": {
          if (value === "T") return true
          if (value === "F") return false
          break
        }
        case "-1,0": {
          if (value === "-1") return true
          if (value === "0") return false
          break
        }
        case "10": {
          if (value === "1") return true
          if (value === "0") return false
          break
        }
        case "trueFalse": {
          if (value.toLowerCase() === "true") return true
          if (value.toLowerCase() === "false") return false
          break
        }
        case "enableDisable": {
          if (value.toLowerCase() === "enable") return true
          if (value.toLowerCase() === "disable") return false
          break
        }
        default:
          break
      }
      throw new Error(`Invalid boolean segment for mode ${mode}: ${segment}`)
    },
    serialize(value) {
      if (value === undefined) {
        return ""
      }

      let raw: string
      switch (mode) {
        case "TF":
          raw = value ? "T" : "F"
          break
        case "-1,0":
          raw = value ? "-1" : "0"
          break
        case "10":
          raw = value ? "1" : "0"
          break
        case "trueFalse":
          raw = value ? "True" : "False"
          break
        case "enableDisable":
          raw = value ? "Enable" : "Disable"
          break
        default:
          raw = value ? "True" : "False"
          break
      }

      if (pad) {
        return raw.startsWith("-") ? `${raw} ` : ` ${raw} `
      }

      return raw
    },
  }
}

export function durationPart(): Part<number> {
  return {
    parse(segment) {
      const value = segment.trim()
      if (value === "") {
        throw new Error("Duration segment cannot be blank")
      }
      return parseDuration(value)
    },
    serialize(value) {
      if (value === undefined) {
        return ""
      }
      return formatDuration(value)
    },
  }
}

export function opt<P extends Part<unknown>>(
  part: P,
): Part<InferPart<P> | undefined> & { isOptional: true } {
  return {
    parse(segment) {
      return part.parse(segment) as InferPart<P>
    },
    serialize(value) {
      if (value === undefined) {
        return ""
      }
      return part.serialize(value)
    },
    isOptional: true,
    nullOnBlank: part.nullOnBlank,
  }
}
