import { chunk } from "es-toolkit"
import type { Coordinate, UpstreamDownstreamPair } from "../models/geometry/common"

/**
 * Format coordinates into multiple lines (1 coordinate per line, 16 chars per number)
 * For boundary condition arcs, the value is padded by one space on left and right.
 * @param key The name of the key
 * @param coordinates Array of coordinate objects
 * @param padLengthValue If true, the length value is padded by one space on left and right
 * @returns Array of formatted coordinate lines
 */
export function formatCoordinateMultipleLines(
  key: string,
  coordinates: Coordinate[],
  padLengthValue = false,
): string[] {
  const lines: string[] = []
  if (padLengthValue) {
    // For BC Line Arc, the value is padded by one space on left and right, this allows that
    lines.push(`${key}= ${coordinates.length} `)
  } else {
    lines.push(`${key}=${coordinates.length}`)
  }

  // Start with the keys
  chunk(coordinates, 2).forEach((pair) => {
    // numbers pad left instead of right
    const formattedPair = pair.map((coord) => coordinatePairToString(coord, 16)).join("")
    lines.push(formattedPair)
  })

  return lines
}

export function coordinatePairToString([x, y]: Coordinate, width: number): string {
  const x2 = toFixedWidthString(formatHECRASCoordinateNumber(x), width)
  const y2 = toFixedWidthString(formatHECRASCoordinateNumber(y), width)

  return `${x2}${y2}`
}

export function toFixedWidthString(str: string, width: number): string {
  if (str.length >= width) {
    return str.slice(0, width)
  }
  return str.padStart(width, " ")
}

export function formatStationPairs(stations: UpstreamDownstreamPair[]): string[] {
  const lines: string[] = []

  // Station pairs are formatted with 8 characters per number, 5 pairs per line (80 char limit)
  chunk(stations, 5).forEach((stationGroup) => {
    const formattedLine = stationGroup.map((station) => stationPairToString(station)).join("")
    lines.push(formattedLine)
  })

  return lines
}

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

export function formatHECRASStationNumber(num: number | null): string {
  // Format numbers to match HEC-RAS conventions:
  // 1. 0.0 -> 0
  // 2. Remove leading zero from decimals (like "0.584" -> " .584" and "-0.584" -> "-.584")
  // 3. null -> empty string
  // Does not add trailing decimal to whole numbers

  // Rule 1: Handle null case
  if (num === null) {
    return ""
  }

  // Rule 2: Handle 0.0 case
  if (num === 0) {
    return "0"
  }

  const str = num.toString()

  if (str.startsWith("0.")) {
    return str.replace("0.", ".")
  }

  if (str.startsWith("-0.")) {
    return str.replace("-0.", "-.")
  }

  return str
}

export function stationPairToString(station: UpstreamDownstreamPair): string {
  const upstream = toFixedWidthString(formatHECRASStationNumber(station.upstreamStation), 8)
  const downstream = toFixedWidthString(formatHECRASStationNumber(station.downstreamStation), 8)

  return `${upstream}${downstream}`
}

/**
 * Format station-elevation pairs into a fixed-width string (8 chars per number)
 */
export function formatStationElevationPairs(stationElevationData: number[]): string[] {
  const lines: string[] = []

  // Station-elevation pairs are 8 characters each, 5 pairs per line (80 chars total)
  chunk(stationElevationData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup
      .map((value) => toFixedWidthString(formatHECRASStationNumber(value), 8))
      .join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Function that converts an array into multiple lines with header
 * @example
 * `formatArray('Points',[1, 2, 3], 8, 80)` ->
 * [
 *    "       1       2       3"
 * ]
 * @param arr Array to convert
 * @param width Width of each field
 * @param maxWidth Maximum width of each line
 * @returns Array of formatted lines with key header line
 */
export function formatArray<T extends readonly T[]>(
  arr: T,
  width: number,
  maxWidth: number,
): string[] {
  const lines: string[] = []

  chunk(arr, maxWidth / width).forEach((chunk) => {
    const formattedLine = chunk.map((value) => toFixedWidthString(value.toString(), width)).join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Format a boolean value into a string for HECRAS
 * HECRAS uses "-1" for true, "0" for false
 * @param value Boolean value to format
 * @param extraSpaceBeforeZero Default is true, which adds an extra space before "0". This is generally how HECRAS formats booleans in geometry, but not in unsteady flow files
 * @returns Formatted string
 */
export function formatBoolean(value: boolean, extraSpaceBeforeZero: boolean = true): string {
  if (value) {
    return "-1"
  }
  if (extraSpaceBeforeZero) {
    return " 0"
  }
  return "0"
}
