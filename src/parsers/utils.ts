import { chunk } from "es-toolkit"

/**
 * Parse key-value pairs from HEC-RAS lines
 * @param line Line containing key=value or key:value format
 * @param separator Separator character (default: "=")
 * @throws Error if line doesn't contain valid key-value pair
 */
export function parseKeyValue(
  line: string,
  separator: string = "=",
): { key: string; value: string } {
  const parts = line.split(separator)
  if (parts.length >= 2) {
    return {
      key: parts[0].trim(),
      value: parts.slice(1).join(separator).trim(),
    }
  }
  throw new Error(`Error parsing line ${line}`)
}

/**
 * Parse comma-separated values
 * @param line String containing comma-separated values
 * @returns Array of trimmed string values
 */
export function parseCommaSeparated(line: string): string[] {
  return line.split(",").map((s) => s.trim())
}

/**
 * Parse a string to integer, returning null for empty/undefined values
 * @param value String value to parse
 * @returns Parsed integer or null if empty/undefined
 */
export function parseMaybeInt(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null
  }
  const num = parseInt(value)
  return isNaN(num) ? null : num
}

/**
 * Parse a string to float, returning null for empty/undefined values
 * @param value String value to parse
 * @returns Parsed float or null if empty/undefined
 */
export function parseMaybeFloat(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null
  }
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

/**
 * Parse HEC-RAS boolean string to boolean
 * @param val Boolean string
 * "-1", "0"
 * "-1", " 0"
 * "False", "True"
 * "Enable", "Disable"
 * @returns Boolean value
 * @throws Error if format is invalid
 */
export function parseBoolean(val: string): boolean {
  if (val === "True" || val === "Enable") {
    return true
  } else if (val === "False" || val === "Disable") {
    return false
  } else if (val === "-1") {
    return true
  } else if (val.trim() === "0") {
    return false
  } else {
    throw new Error(`Unable to parse boolean: ${val}`)
  }
}

/**
 * Parse HEC-RAS duration string to total seconds
 * @param value Duration string (e.g., "0.1SEC", "5MIN", "2HOUR", "1DAY","1YEAR")
 * @returns Duration in total seconds
 * @throws Error if format is invalid or unit is unknown
 */
export function parseDuration(value: string): number {
  const durationRegex = /(\d+\.?\d*)\s*(SEC|MIN|HOUR|DAY|WEEK|MONTH|YEAR)/i
  const match = value.match(durationRegex)
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`)
  }

  const amount = parseFloat(match[1])
  const unit = match[2]

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

/**
 *
 * @param lines Array of lines that contain the data, not including the header
 * @param width
 * @param maxWidth
 * @param numOfEntries
 * @param currentIndex
 */
export function parseMultilineArray(params: {
  lines: string[]
  width: number
  maxWidth: number
  numOfEntries: number
  currentIndex: number
}): { data: string[]; nextIndex: number } {
  const { lines, width, maxWidth, numOfEntries, currentIndex } = params

  function chunkString(str: string, width: number): string[] {
    const length = str.length
    const chunks = new Array(Math.ceil(length / width))

    for (let i = 0, j = 0; i < length; i += width, j++) {
      chunks[j] = str.slice(i, i + width)
    }

    return chunks
  }

  const entriesPerLine = maxWidth / width
  const numOfLines = Math.ceil(numOfEntries / entriesPerLine)

  const data = new Array(numOfEntries)

  let lineIndex = currentIndex
  for (let i = 0; i < numOfLines; i++) {
    const line = lines[lineIndex]
    const chunks = chunkString(line, width)

    for (let j = 0; j < chunks.length; j++) {
      const entryIndex = i * entriesPerLine + j
      if (entryIndex < numOfEntries) {
        data[entryIndex] = chunks[j].trim()
      }
    }
    lineIndex++
  }

  return { data, nextIndex: lineIndex }
}

export const chunkToTuples = <
  ArrayT extends Array<string | number | boolean>,
  TupleLength extends number,
>(
  arr: ArrayT,
  chunkSize: TupleLength,
) => chunk(arr, chunkSize) as NTuple<string | number | boolean, TupleLength>[]

// Helper type: build a tuple of length N
type NTuple<T, N extends number, R extends unknown[] = []> = R["length"] extends N
  ? R
  : NTuple<T, N, [T, ...R]>
