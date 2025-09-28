/**
 * Consolidated serialization utilities for schema-driven HEC-RAS formatting
 *
 * This module provides enhanced and unified serializer utilities that work well
 * with schema-driven `contextual()` serializers. Functions preserve HEC-RAS
 * formatting quirks critical for format compatibility.
 */

import type { Coordinate } from "../models/geometry/common"

// ============================================================================
// PRIMITIVE FORMATTERS
// ============================================================================

/**
 * Format key-value pairs for HEC-RAS lines
 * @param key The key part
 * @param value The value part (undefined values are omitted)
 * @param separator Separator character (default: "=")
 * @returns Formatted key=value string, or empty string if value is undefined
 */
export function formatKeyValue(
  key: string,
  value: string | number | undefined,
  separator: string = "=",
): string {
  if (value === undefined) return ""
  return `${key}${separator}${value}`
}

/**
 * Format comma-separated values
 * @param values Array of values to join
 * @returns Comma-separated string
 */
export function formatCommaSeparated(values: readonly (string | number)[]): string {
  return values.join(",")
}

/**
 * Format boolean values using HEC-RAS conventions
 * @param value Boolean value to format
 * @param mode Format mode: "TF" | "10" | "trueFalse" | "enableDisable"
 * @param extraSpaceBeforeZero For "10" mode, adds extra space before "0" (default: true)
 * @returns Formatted boolean string
 */
export function formatBoolean(
  value: boolean,
  mode: "TF" | "10" | "trueFalse" | "enableDisable" = "10",
  extraSpaceBeforeZero: boolean = true,
): string {
  switch (mode) {
    case "TF":
      return value ? "T" : "F"
    case "10":
      if (value) return "-1"
      return extraSpaceBeforeZero ? " 0" : "0"
    case "trueFalse":
      return value ? "True" : "False"
    case "enableDisable":
      return value ? "Enable" : "Disable"
    default:
      throw new Error(`Unknown boolean format mode: ${mode}`)
  }
}

/**
 * Format duration in seconds to HEC-RAS duration string
 * @param seconds Duration in seconds
 * @returns HEC-RAS duration string (e.g., "5SEC", "2MIN", "1HOUR")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}SEC`
  } else if (seconds < 3600) {
    return `${seconds / 60}MIN`
  } else if (seconds < 86400) {
    return `${seconds / 3600}HOUR`
  } else if (seconds < 604800) {
    return `${seconds / 86400}DAY`
  } else if (seconds < 2592000) {
    return `${seconds / 604800}WEEK`
  } else if (seconds < 31536000) {
    return `${seconds / 2592000}MONTH`
  } else {
    return `${seconds / 31536000}YEAR`
  }
}

// ============================================================================
// ENHANCED FIXED-WIDTH FORMATTING
// ============================================================================

/**
 * Enhanced fixed-width formatter consolidating previous implementations
 * @param value Value to format (number, string, or null)
 * @param width Fixed width in characters
 * @param options Formatting options
 * @returns Fixed-width formatted string
 */
export function formatFixedWidth(
  value: number | string | null | undefined,
  width: number,
  options: {
    padDirection?: "start" | "end"
    padChar?: string
    nullToken?: string
  } = {},
): string {
  const { padDirection = "start", padChar = " ", nullToken = "" } = options

  // Handle null/undefined cases
  if (value === null) {
    return nullToken.length <= width
      ? nullToken.padStart(width, padChar)
      : nullToken.slice(0, width)
  }
  if (value === undefined) {
    return padChar.repeat(width)
  }

  let str: string
  if (typeof value === "number") {
    // Format numbers with decimal place if they're whole numbers (HEC-RAS convention)
    str = value % 1 === 0 ? value.toFixed(1) : value.toString()
  } else {
    str = value.toString()
  }

  // Truncate if too long
  if (str.length >= width) {
    return str.slice(0, width)
  }

  // Apply padding
  return padDirection === "end" ? str.padEnd(width, padChar) : str.padStart(width, padChar)
}

/**
 * Format nullable number with semantics mirroring parseMaybeFloat
 * @param value Number, null, or undefined
 * @param options Formatting options
 * @returns Formatted string (blank for undefined, custom token for null)
 */
export function formatNullableNumber(
  value: number | null | undefined,
  options: {
    width?: number
    blankToken?: string
  } = {},
): string {
  const { width, blankToken = "" } = options

  if (value === undefined) {
    return "" // Blank for undefined (mirrors parseMaybeFloat)
  }
  if (value === null) {
    return blankToken // Custom token for null
  }

  return width !== undefined ? formatFixedWidth(value, width) : value.toString()
}

// ============================================================================
// CHUNKED LINE FORMATTING
// ============================================================================

/**
 * Internal chunking implementation (replaces es-toolkit dependency)
 */
function chunk<T>(array: readonly T[], size: number): T[][] {
  if (size <= 0) throw new Error("Chunk size must be positive")

  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size) as T[])
  }
  return result
}

/**
 * Format values into fixed-width chunked lines
 * @param values Array of values to format
 * @param options Chunking and formatting options
 * @returns Array of formatted lines
 */
export function formatChunkedLines<T>(
  values: readonly T[],
  options: {
    width: number
    perLine: number
    formatter: (value: T) => string
    nullFormatter?: (value: T) => string
    padDirection?: "start" | "end"
  },
): string[] {
  const { width, perLine, formatter, nullFormatter, padDirection = "start" } = options

  return chunk(values, perLine).map((valuesChunk) => {
    const formattedChunk = valuesChunk.map((value) => {
      const formatted = nullFormatter && value === null ? nullFormatter(value) : formatter(value)

      return formatFixedWidth(formatted, width, { padDirection })
    })
    return formattedChunk.join("")
  })
}

// ============================================================================
// HEC-RAS SPECIFIC NUMBER FORMATTERS
// ============================================================================

/**
 * Format number using HEC-RAS coordinate conventions
 * - Exactly zero → "0"
 * - Whole numbers → append trailing decimal (e.g., "123.")
 * - Remove leading zero from decimals (e.g., "0.584" → " .584")
 * @param num Number to format
 * @returns HEC-RAS formatted coordinate string
 */
export function formatHECRASCoordinateNumber(num: number): string {
  // Special case: exactly zero
  if (num === 0) return "0"

  const str = String(num)

  // Whole numbers: append trailing decimal
  if (Number.isInteger(num)) {
    return str + "."
  }

  // Remove leading zero from decimals
  if (str[0] === "0" && str[1] === ".") {
    return " " + str.slice(1)
  }

  return str
}

/**
 * Format number using HEC-RAS station conventions
 * - null → empty string
 * - 0.0 → "0" (no trailing decimal)
 * - Remove leading zero from decimals (e.g., "0.584" → ".584", "-0.584" → "-.584")
 * @param num Number or null to format
 * @returns HEC-RAS formatted station string
 */
export function formatHECRASStationNumber(num: number | null): string {
  if (num === null) return ""
  if (num === 0) return "0"

  const str = num.toString()

  if (str.startsWith("0.")) {
    return str.replace("0.", ".")
  }
  if (str.startsWith("-0.")) {
    return str.replace("-0.", "-.")
  }

  return str
}

// ============================================================================
// SCHEMA-SPECIFIC UTILITIES
// ============================================================================

/**
 * Format coordinates into chunked lines (2 coordinates per line, 16 chars per number)
 * @param coordinates Array of coordinate pairs
 * @returns Array of formatted coordinate lines
 */
export function formatCoordinateChunks(coordinates: readonly Coordinate[]): string[] {
  const numbers = coordinates.flat()

  return formatChunkedLines(numbers, {
    width: 16,
    perLine: 2,
    formatter: (num) => formatHECRASCoordinateNumber(num),
  })
}

/**
 * Format coordinate data with header line
 * @param key Header key name
 * @param coordinates Array of coordinate pairs
 * @param padLengthValue If true, pad length value with spaces (for BC Line Arc)
 * @returns Array of lines including header
 */
export function formatCoordinateMultipleLines(
  key: string,
  coordinates: readonly Coordinate[],
  padLengthValue: boolean = false,
): string[] {
  const headerLine = padLengthValue
    ? `${key}= ${coordinates.length} `
    : `${key}=${coordinates.length}`

  return [headerLine, ...formatCoordinateChunks(coordinates)]
}

/**
 * Format station/elevation data into chunked lines (5 pairs per line, 8 chars per number)
 * @param stationElevationData Array of alternating station/elevation values
 * @returns Array of formatted lines
 */
export function formatStationChunks(stationElevationData: readonly number[]): string[] {
  return formatChunkedLines(stationElevationData, {
    width: 8,
    perLine: 10, // 5 pairs = 10 values per line
    formatter: (num) => formatHECRASStationNumber(num),
  })
}

/**
 * Format station-elevation pairs into fixed-width lines
 * @param stationElevationData Array of alternating station/elevation values
 * @returns Array of formatted lines
 */
export function formatStationElevationPairs(stationElevationData: readonly number[]): string[] {
  return formatStationChunks(stationElevationData)
}
