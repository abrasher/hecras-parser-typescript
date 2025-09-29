import { parseDuration } from "../parsers/utils"
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

interface NumberPartOptions {
  integer?: boolean
  nullOnBlank?: boolean
  padded?: boolean
}

type NumberPartValue<Opts extends NumberPartOptions | undefined> = Opts extends {
  nullOnBlank: true
}
  ? number | null
  : number

export function numberPart<const Opts extends NumberPartOptions | undefined = undefined>(
  options?: Opts,
): Part<NumberPartValue<Opts>> {
  const { integer = false, nullOnBlank = false, padded = false } = options ?? {}

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

      // Handle HEC-RAS infinity representation
      if (numeric === Infinity) {
        const infinitySentinel = "1.79769313486232E+308"
        return padded ? ` ${infinitySentinel} ` : infinitySentinel
      }

      if (!Number.isFinite(numeric)) {
        throw new Error(`Cannot serialize non-finite number: ${numeric}`)
      }

      // Check if we should use scientific notation (16+ digits before decimal)
      const numStr = Math.abs(numeric).toString()
      const decimalIndex = numStr.indexOf(".")
      const digitsBeforeDecimal = decimalIndex === -1 ? numStr.length : decimalIndex

      let serialized = numeric.toString()

      if (digitsBeforeDecimal >= 16) {
        // Use scientific notation with appropriate precision
        serialized = numeric.toExponential()
      }

      return padded ? ` ${serialized} ` : serialized
    },
    nullOnBlank: nullOnBlank || undefined,
  }

  if (integer) {
    return part as Part<NumberPartValue<Opts>>
  }

  return part as Part<NumberPartValue<Opts>>
}

type BooleanMode = "TF" | "-1,0" | "10" | "trueFalse" | "enableDisable"

type BooleanFormat = "trimmed" | "listDirected"

interface BooleanPartOptions {
  mode: BooleanMode
  format?: BooleanFormat
}

export function booleanPart(options: BooleanPartOptions): Part<boolean> {
  const { mode, format = "trimmed" } = options

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

      if (format === "listDirected" && (mode === "-1,0" || mode === "10")) {
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
