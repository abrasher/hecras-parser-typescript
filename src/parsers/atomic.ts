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

export function parseValueAsCSV(line: string) {
  const value = parseKeyValue(line).value
  return parseCommaSeparated(value)
}

/**
 * Chunk fixed-width string into numbers
 * @param str Fixed-width string to parse
 * @param chunkWidth Width of each number field in characters
 * @throws Error if any chunk cannot be parsed as a number
 */
export function chunkStringToNumbers(str: string, chunkWidth: number): number[] {
  if (chunkWidth <= 0) {
    throw new Error("Chunk width must be greater than 0")
  }

  if (str.length === 0) {
    return []
  }

  const expectedChunks = Math.ceil(str.length / chunkWidth)
  const numbers: number[] = []

  for (let i = 0; i < expectedChunks; i++) {
    const chunk = str.slice(i * chunkWidth, (i + 1) * chunkWidth)

    if (chunk.trim() === "") {
      // Skip empty chunks
    } else {
      const num = parseFloat(chunk)
      if (isNaN(num)) {
        throw new Error(`Error parsing ${str} at chunk index ${i}`)
      }
      numbers.push(num)
    }
  }
  return numbers
}

/**
 * Same as chunkStringToNumbers but instead of returning for blank chunks, it returns null
 * This is nessecary for some HECRAS formats where there are series of numbers that have null gaps (i.e. bridge deck low chord)
 * @param str Fixed-width string to parse
 * @param chunkWidth Width of each number field in characters
 * @throws Error if any chunk cannot be parsed as a number
 */
export function chunkStringToNumbersOrNull(str: string, chunkWidth: number): (number | null)[] {
  if (chunkWidth <= 0) {
    throw new Error("Chunk width must be greater than 0")
  }

  if (str.length === 0) {
    return []
  }

  const expectedChunks = Math.ceil(str.length / chunkWidth)
  const numbers: (number | null)[] = []

  for (let i = 0; i < expectedChunks; i++) {
    const chunk = str.slice(i * chunkWidth, (i + 1) * chunkWidth)

    if (chunk.trim() === "") {
      numbers.push(null)
    } else {
      const num = parseFloat(chunk)
      if (isNaN(num)) {
        throw new Error(`Error parsing ${str} at chunk index ${i}`)
      }
      numbers.push(num)
    }
  }
  return numbers
}
/**
 * Chunk fixed-width string into substrings
 * @param str Fixed-width string to chunk
 * @param chunkWidth Width of each substring in characters
 * @throws Error if chunkWidth is less than or equal to 0
 */
export function chunkStringToStrings(str: string, chunkWidth: number): string[] {
  if (chunkWidth <= 0) {
    throw new Error("Chunk width must be greater than 0")
  }
  if (str.length === 0) {
    return []
  }

  const numChunks = Math.ceil(str.length / chunkWidth)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += chunkWidth) {
    chunks[i] = str.substring(o, chunkWidth)
  }

  return chunks
}

/**
 * Convert array of numbers to coordinate pairs
 * @param nums Array of numbers (must be even length)
 * @returns Array of {x, y} coordinate objects
 */
export function numbersToCoordinates(nums: number[]): [number, number][] {
  const coordinates: [number, number][] = []

  for (let i = 0; i < nums.length; i += 2) {
    if (i + 1 < nums.length) {
      coordinates.push([nums[i], nums[i + 1]])
    }
  }

  return coordinates
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

export const parseDurationLine = (line: string) => {
  const value = parseKeyValue(line).value
  return parseHECRASDuration(value)
}

/**
 * Parse HEC-RAS duration string to total seconds
 * @param value Duration string (e.g., "0.1SEC", "5MIN", "2HOUR", "1DAY","1YEAR")
 * @returns Duration in total seconds
 * @throws Error if format is invalid or unit is unknown
 */
export function parseHECRASDuration(value: string): number {
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
