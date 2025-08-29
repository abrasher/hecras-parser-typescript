// Atomic serializers for HEC-RAS format (Tier 1)
// Low-level formatting functions that mirror atomic parsers

import type { Coordinate } from "../models/geometry/common"

// ============================================================================
// BASIC ATOMIC SERIALIZERS
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
export function formatCommaSeparated(values: (string | number)[]): string {
  return values.join(",")
}

/**
 * Format a number or string to fixed width with proper padding
 * @param value Value to format
 * @param width Fixed width in characters
 * @param padChar Character to pad with (default: space)
 * @returns Fixed-width formatted string
 */
export function formatFixedWidth(
  value: number | string,
  width: number,
  padChar: string = " ",
  padPlacement: "start" | "end" = "start",
): string {
  let str: string
  if (typeof value === "number") {
    // Format numbers with decimal place if they're whole numbers
    str = value % 1 === 0 ? value.toFixed(1) : value.toString()
  } else {
    str = value.toString()
  }

  if (str.length >= width) {
    return str.slice(0, width)
  }
  if (padPlacement === "end") {
    return str.padEnd(width, padChar)
  }
  return str.padStart(width, padChar)
}

/**
 * Format numbers to fixed-width string chunks
 * @param numbers Array of numbers to format
 * @param chunkWidth Width of each number field in characters
 * @returns Fixed-width formatted string
 */
export function formatNumbersToChunks(numbers: number[], chunkWidth: number): string {
  return numbers.map((num) => formatFixedWidth(num, chunkWidth)).join("")
}

/**
 * Format numbers with null gaps to fixed-width string chunks
 * @param numbers Array of numbers or null values to format
 * @param chunkWidth Width of each number field in characters
 * @returns Fixed-width formatted string with blank spaces for null values
 */
export function formatNumbersOrNullToChunks(
  numbers: (number | null)[],
  chunkWidth: number,
): string {
  return numbers
    .map((num) => (num === null ? " ".repeat(chunkWidth) : formatFixedWidth(num, chunkWidth)))
    .join("")
}

/**
 * Format coordinates to fixed-width coordinate string (16 characters per number)
 * @param coordinates Array of coordinate objects
 * @returns Fixed-width formatted coordinate string
 */
export function formatCoordinates(coordinates: Coordinate[]): string {
  const numbers: number[] = []
  for (const coord of coordinates) {
    numbers.push(coord.x, coord.y)
  }
  return formatNumbersToChunks(numbers, 16)
}

/**
 * Format coordinates into multiple lines (1 coordinate per line, 32 chars per line)
 * @param coordinates Array of coordinate objects
 * @returns Array of formatted coordinate lines
 */
export function formatCoordinateLines(coordinates: Coordinate[]): string[] {
  const lines: string[] = []

  for (const coord of coordinates) {
    const numbers = [coord.x, coord.y]
    lines.push(formatNumbersToChunks(numbers, 16))
  }

  return lines
}

export function formatMaybeNullorUndefined(
  value: number | null | undefined,
  nullReturnValue: string = "",
): string {
  if (value === null) return nullReturnValue
  if (value === undefined) return ""
  return value.toString()
}

/**
 * Format station pairs to fixed-width string (8 characters per number, no decimals)
 * @param stations Array of numbers representing station pairs
 * @returns Fixed-width formatted station string
 */
export function formatStationPairs(stations: number[]): string {
  return stations.map((num) => Math.round(num).toString().padStart(8, " ")).join("")
}

/**
 * Format station pairs into multiple lines (5 pairs per line, 80 chars per line)
 * @param stationPairs Array of station pair objects
 * @returns Array of formatted station lines
 */
export function formatStationPairLines(
  stationPairs: { upstreamStation: number; downstreamStation: number }[],
): string[] {
  const lines: string[] = []

  for (let i = 0; i < stationPairs.length; i += 5) {
    const pairsForLine = stationPairs.slice(i, i + 5)
    const numbers: number[] = []

    for (const pair of pairsForLine) {
      numbers.push(pair.upstreamStation, pair.downstreamStation)
    }

    lines.push(formatStationPairs(numbers))
  }

  return lines
}

/**
 * Format description block with BEGIN/END markers
 * @param description Description text
 * @returns Array of formatted description lines
 */
export function formatDescriptionBlock(description: string): string[] {
  if (!description || description.trim() === "") return []

  const lines = description.split("\n")
  return ["BEGIN DESCRIPTION:", ...lines, "END DESCRIPTION:"]
}
