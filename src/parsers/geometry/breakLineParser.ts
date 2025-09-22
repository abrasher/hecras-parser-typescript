import { parseKeyValue, splitIntoTuples, parseMultilineArray } from "../utils"
import type { BreakLine } from "../../models/geometry/breakLine"

/**
 * Parse a BreakLine geometry definition from HEC-RAS format
 * @param lines Array of lines to parse
 * @param startIndex Index to start parsing from
 * @returns ParseResult containing the parsed BreakLine and lines consumed
 */
export function parseBreakLine(lines: string[], startIndex: number) {
  let index = startIndex
  const breakLine: BreakLine = {
    name: "",
    cellSizeMin: 0,
    cellSizeMax: null,
    nearRepeats: 0,
    protectionRadius: 0,
    polylinePoints: [],
  }

  // Parse BreakLine Name
  const nameResult = parseKeyValue(lines[index])
  if (nameResult.key !== "BreakLine Name") {
    throw new Error(`Expected BreakLine Name at line ${index + 1}`)
  }
  breakLine.name = nameResult.value
  index++

  // Parse BreakLine CellSize Min
  const cellSizeMinResult = parseKeyValue(lines[index])
  if (cellSizeMinResult.key !== "BreakLine CellSize Min") {
    throw new Error(`Expected BreakLine CellSize Min at line ${index + 1}`)
  }
  breakLine.cellSizeMin = parseFloat(cellSizeMinResult.value)
  index++

  // Parse BreakLine CellSize Max (can be empty)
  const cellSizeMaxResult = parseKeyValue(lines[index])
  if (cellSizeMaxResult.key !== "BreakLine CellSize Max") {
    throw new Error(`Expected BreakLine CellSize Max at line ${index + 1}`)
  }
  breakLine.cellSizeMax =
    cellSizeMaxResult.value === "" ? null : parseFloat(cellSizeMaxResult.value)
  index++

  // Parse BreakLine Near Repeats
  const nearRepeatsResult = parseKeyValue(lines[index])
  if (nearRepeatsResult.key !== "BreakLine Near Repeats") {
    throw new Error(`Expected BreakLine Near Repeats at line ${index + 1}`)
  }
  breakLine.nearRepeats = parseFloat(nearRepeatsResult.value)
  index++

  // Parse BreakLine Protection Radius
  const protectionRadiusResult = parseKeyValue(lines[index])
  if (protectionRadiusResult.key !== "BreakLine Protection Radius") {
    throw new Error(`Expected BreakLine Protection Radius at line ${index + 1}`)
  }
  breakLine.protectionRadius = parseFloat(protectionRadiusResult.value)
  index++

  // Parse BreakLine Polyline with coordinate count
  const polylineResult = parseKeyValue(lines[index])
  if (polylineResult.key !== "BreakLine Polyline") {
    throw new Error(`Expected BreakLine Polyline at line ${index + 1}`)
  }
  const numberOfPoints = parseInt(polylineResult.value.trim())
  index++

  const pointsPerEntry = 2
  const { data, nextIndex } = parseMultilineArray({
    width: 16,
    maxWidth: 64,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const dataAsFloats = data.map((value) => parseFloat(value))
  const res = splitIntoTuples(dataAsFloats, 2) as BreakLine["polylinePoints"]

  breakLine.polylinePoints = res

  index = nextIndex

  // Validate we got the expected number of points
  if (breakLine.polylinePoints.length !== numberOfPoints) {
    throw new Error(
      `Expected ${numberOfPoints} coordinate points, but parsed ${breakLine.polylinePoints.length}`,
    )
  }

  return {
    data: breakLine,
    linesConsumed: index - startIndex,
  }
}
