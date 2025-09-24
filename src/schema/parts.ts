import { parseDuration } from "../parsers/utils"
import { formatDuration } from "../serializers/atomic"
import type { Part } from "./core"
import { InferPart } from "./core"

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

interface NumberPartOptions {
  integer?: boolean
  nullOnBlank?: boolean
}

type NumberPartValue<Opts extends NumberPartOptions | undefined> = Opts extends {
  nullOnBlank: true
}
  ? number | null
  : number

export function numberPart<const Opts extends NumberPartOptions | undefined = undefined>(
  options?: Opts,
): Part<NumberPartValue<Opts>> {
  const { integer = false, nullOnBlank = false } = options ?? {}

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
      if (!Number.isFinite(numeric)) {
        throw new Error(`Cannot serialize non-finite number: ${numeric}`)
      }
      return numeric.toString()
    },
    nullOnBlank: nullOnBlank || undefined,
  }

  if (integer) {
    return part as Part<NumberPartValue<Opts>>
  }

  return part as Part<NumberPartValue<Opts>>
}

type BooleanMode = "TF" | "10" | "trueFalse" | "enableDisable"

interface BooleanPartOptions {
  mode: BooleanMode
}

export function booleanPart(options: BooleanPartOptions): Part<boolean> {
  const { mode } = options

  return {
    parse(segment) {
      const value = segment.trim()
      switch (mode) {
        case "TF": {
          if (value === "T") return true
          if (value === "F") return false
          break
        }
        case "10": {
          if (value === "1" || value === "-1") return true
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
      switch (mode) {
        case "TF":
          return value ? "T" : "F"
        case "10":
          return value ? "1" : "0"
        case "trueFalse":
          return value ? "True" : "False"
        case "enableDisable":
          return value ? "Enable" : "Disable"
        default:
          return value ? "True" : "False"
      }
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

export function opt<P extends Part<unknown>>(part: P): Part<InferPart<P> | undefined> {
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
