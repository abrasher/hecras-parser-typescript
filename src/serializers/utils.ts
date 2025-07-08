import { chunk } from "es-toolkit"
import type { Coordinate } from "../models/geometry/common"

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
