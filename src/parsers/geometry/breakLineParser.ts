import { parseLineToCoordinates } from "../lineParsers"
import { parseKeyValue } from "../atomic"
import type { BreakLine } from "../../models/geometry/breakLine"

/**
 * Parse a BreakLine geometry definition from HEC-RAS format
 * @param lines Array of lines to parse
 * @param startIndex Index to start parsing from
 * @returns ParseResult containing the parsed BreakLine and lines consumed
 */
export function parseBreakLine(lines: string[], startIndex: number) {
  let currentIndex = startIndex
  const breakLine: BreakLine = {
    name: "",
    cellSizeMin: 0,
    cellSizeMax: null,
    nearRepeats: 0,
    protectionRadius: 0,
    polylinePoints: [],
  }

  // Parse BreakLine Name
  const nameResult = parseKeyValue(lines[currentIndex])
  if (nameResult.key !== "BreakLine Name") {
    throw new Error(`Expected BreakLine Name at line ${currentIndex + 1}`)
  }
  breakLine.name = nameResult.value
  currentIndex++

  // Parse BreakLine CellSize Min
  const cellSizeMinResult = parseKeyValue(lines[currentIndex])
  if (cellSizeMinResult.key !== "BreakLine CellSize Min") {
    throw new Error(`Expected BreakLine CellSize Min at line ${currentIndex + 1}`)
  }
  breakLine.cellSizeMin = parseFloat(cellSizeMinResult.value)
  currentIndex++

  // Parse BreakLine CellSize Max (can be empty)
  const cellSizeMaxResult = parseKeyValue(lines[currentIndex])
  if (cellSizeMaxResult.key !== "BreakLine CellSize Max") {
    throw new Error(`Expected BreakLine CellSize Max at line ${currentIndex + 1}`)
  }
  breakLine.cellSizeMax = cellSizeMaxResult.value === "" ? null : parseFloat(cellSizeMaxResult.value)
  currentIndex++

  // Parse BreakLine Near Repeats
  const nearRepeatsResult = parseKeyValue(lines[currentIndex])
  if (nearRepeatsResult.key !== "BreakLine Near Repeats") {
    throw new Error(`Expected BreakLine Near Repeats at line ${currentIndex + 1}`)
  }
  breakLine.nearRepeats = parseFloat(nearRepeatsResult.value)
  currentIndex++

  // Parse BreakLine Protection Radius
  const protectionRadiusResult = parseKeyValue(lines[currentIndex])
  if (protectionRadiusResult.key !== "BreakLine Protection Radius") {
    throw new Error(`Expected BreakLine Protection Radius at line ${currentIndex + 1}`)
  }
  breakLine.protectionRadius = parseFloat(protectionRadiusResult.value)
  currentIndex++

  // Parse BreakLine Polyline with coordinate count
  const polylineResult = parseKeyValue(lines[currentIndex])
  if (polylineResult.key !== "BreakLine Polyline") {
    throw new Error(`Expected BreakLine Polyline at line ${currentIndex + 1}`)
  }
  const pointCount = parseInt(polylineResult.value.trim())
  currentIndex++

  // Parse coordinate points (up to 2 coordinates per line, 16 chars per number)
  let pointsRemaining = pointCount

  while (pointsRemaining > 0 && currentIndex < lines.length) {
    const coordinateLine = lines[currentIndex]
    const lineCoords = parseLineToCoordinates(coordinateLine)

    // Add coordinates from this line (but don't exceed the expected count)
    const coordsToAdd = lineCoords.slice(0, pointsRemaining)
    breakLine.polylinePoints.push(...coordsToAdd)

    // Update remaining points based on how many we actually added
    pointsRemaining -= coordsToAdd.length
    currentIndex++
  }

  // Validate we got the expected number of points
  if (breakLine.polylinePoints.length !== pointCount) {
    throw new Error(`Expected ${pointCount} coordinate points, but parsed ${breakLine.polylinePoints.length}`)
  }

  return {
    data: breakLine,
    linesConsumed: currentIndex - startIndex,
  }
}
