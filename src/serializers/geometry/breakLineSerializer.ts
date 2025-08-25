import { chunk } from "es-toolkit"
import { coordinatePairToString } from "../utils"
import type { BreakLine } from "../../models/geometry/breakLine"

/**
 * Serialize a BreakLine to HEC-RAS format
 * @param breakLine BreakLine data
 * @returns Array of formatted lines
 */
export function serializeBreakLine(breakLine: BreakLine): string[] {
  const lines: string[] = []

  // BreakLine Name
  lines.push(`BreakLine Name=${breakLine.name}`)

  // BreakLine CellSize Min
  lines.push(`BreakLine CellSize Min=${breakLine.cellSizeMin}`)

  // BreakLine CellSize Max (can be empty)
  const cellSizeMax = breakLine.cellSizeMax !== null ? breakLine.cellSizeMax.toString() : ""
  lines.push(`BreakLine CellSize Max=${cellSizeMax}`)

  // BreakLine Near Repeats
  lines.push(`BreakLine Near Repeats=${breakLine.nearRepeats}`)

  // BreakLine Protection Radius
  lines.push(`BreakLine Protection Radius=${breakLine.protectionRadius}`)

  // BreakLine Polyline with point count
  lines.push(`BreakLine Polyline= ${breakLine.polylinePoints.length} `)

  // Coordinate points - 2 coordinate pairs per line (4 numbers total, 16 chars each)
  if (breakLine.polylinePoints.length > 0) {
    chunk(breakLine.polylinePoints, 2).forEach((coordPair) => {
      const formattedLine = coordPair.map((coord) => coordinatePairToString(coord, 16)).join("")
      lines.push(formattedLine)
    })
  }

  return lines
}
