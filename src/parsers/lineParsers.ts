// Line-level parsers for HEC-RAS format (Tier 2)
// Use atomic parsers + logic for single lines

import {
  chunkStringToNumbers,
  chunkStringToNumbersOrNull,
  numbersToCoordinates,
  parseKeyValue,
} from "./atomic"

// ============================================================================
// LINE-LEVEL PARSERS
// ============================================================================

/**
 * Parse a line of fixed-width coordinate data (16 characters per number)
 * @param line Line containing coordinate data
 * @returns Array of [x, y] coordinate tuples
 */
export function parseLineToCoordinates(line: string): [number, number][] {
  return numbersToCoordinates(chunkStringToNumbers(line, 16))
}

/**
 * Parse a line of fixed-width station pairs (8 characters per number)
 * @param line Line containing station pair data
 * @returns Array of {upstreamStation, downstreamStation} objects
 */
export function parseLineStationPairs(
  line: string,
): { upstreamStation: number; downstreamStation: number }[] {
  const nums = chunkStringToNumbers(line, 8)
  const stationPairs: { upstreamStation: number; downstreamStation: number }[] = []

  for (let i = 0; i < nums.length; i += 2) {
    if (i + 1 < nums.length) {
      stationPairs.push({
        upstreamStation: nums[i],
        downstreamStation: nums[i + 1],
      })
    }
  }

  return stationPairs
}

/**
 * Parse a line of fixed-width station pairs with null support (8 characters per number)
 * @param line Line containing station pair data (may contain empty/null values)
 * @returns Array of {upstreamStation, downstreamStation} objects with possible null values
 */
export function parseLineStationPairsWithNulls(
  line: string,
): { upstreamStation: number | null; downstreamStation: number | null }[] {
  const nums = chunkStringToNumbersOrNull(line, 8)
  const stationPairs: { upstreamStation: number | null; downstreamStation: number | null }[] = []

  for (let i = 0; i < nums.length; i += 2) {
    if (i + 1 < nums.length) {
      stationPairs.push({
        upstreamStation: nums[i],
        downstreamStation: nums[i + 1],
      })
    }
  }

  return stationPairs
}

export function parseBooleanLine(line: string): boolean {
  const val = Number(parseKeyValue(line).value)
  if (val === -1) {
    return true
  } else if (val === 0) {
    return false
  } else {
    throw new Error(`Invalid boolean value: ${val}`)
  }
}
