// Atomic parsers for HEC-RAS format (Tier 1)
// Simple functions that throw on error

// ============================================================================
// BASIC ATOMIC PARSERS
// ============================================================================

/**
 * Parse key-value pairs from HEC-RAS lines
 * @param line Line containing key=value or key:value format
 * @param separator Separator character (default: "=")
 * @throws Error if line doesn't contain valid key-value pair
 */
export function parseKeyValue(line: string, separator: string = "="): { key: string; value: string } {
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
 * Convert array of numbers to coordinate pairs
 * @param nums Array of numbers (must be even length)
 * @returns Array of {x, y} coordinate objects
 */
export function numbersToCoordinates(nums: number[]): { x: number; y: number }[] {
  const coordinates: { x: number; y: number }[] = []

  for (let i = 0; i < nums.length; i += 2) {
    if (i + 1 < nums.length) {
      coordinates.push({
        x: nums[i],
        y: nums[i + 1],
      })
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
