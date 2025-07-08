import { chunk } from "es-toolkit"
import type { Coordinate, UpstreamDownstreamPair } from "../models/geometry/common"

export function formatCoordinateMultipleLines(key: string, coordinates: Coordinate[]): string[] {
  const lines: string[] = []
  lines.push(`${key}=${coordinates.length}`) // Start with the keys
  chunk(coordinates, 2).forEach((pair) => {
    // numbers pad left instead of right
    const formattedPair = pair.map((coord) => coordinatePairToString(coord, 16)).join("")
    lines.push(formattedPair)
  })

  return lines
}

export function coordinatePairToString({ x, y }: Coordinate, width: number): string {
  const x2 = toFixedWidthString(x.toString(), width)
  const y2 = toFixedWidthString(y.toString(), width)

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

export function stationPairToString(station: UpstreamDownstreamPair): string {
  const upstream = toFixedWidthString(station.upstreamStation.toString(), 8)
  const downstream = toFixedWidthString(station.downstreamStation.toString(), 8)

  return `${upstream}${downstream}`
}
