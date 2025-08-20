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

export function coordinatePairToString({ x, y }: Coordinate, width: number): string {
  const x2 = toFixedWidthString(removeLeadingZero(x), width)
  const y2 = toFixedWidthString(removeLeadingZero(y), width)

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

export function removeLeadingZero(num: number): string {
  // Handle numbers that start with 0. (like "0.584" -> "    .584"
  const str = num.toString()

  if (str.startsWith("0.")) {
    return str.replace("0.", " .")
  }

  return str
}

export function stationPairToString(station: UpstreamDownstreamPair): string {
  const upstream = toFixedWidthString(removeLeadingZero(station.upstreamStation), 8)
  const downstream = toFixedWidthString(removeLeadingZero(station.downstreamStation), 8)

  return `${upstream}${downstream}`
}

/**
 * Format station-elevation pairs into a fixed-width string (8 chars per number)
 */
export function formatStationElevationPairs(stationElevationData: number[]): string[] {
  const lines: string[] = []

  // Station-elevation pairs are 8 characters each, 5 pairs per line (80 chars total)
  chunk(stationElevationData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup.map((value) => toFixedWidthString(removeLeadingZero(value), 8)).join("")
    lines.push(formattedLine)
  })

  return lines
}
