import { parseKeyValue } from "../atomic"
import type { BoundaryCondition, TextPosition } from "../../models/geometry/boundaryCondition"
import type { Coordinate } from "../../models/geometry/common"
import { parseMultilineArray, arrayToCoordinates } from "../multiLineParsers"

/**
 * Parses boundary condition data starting from a "BC Line Name=" line
 */
export function parseBoundaryConditionData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: BoundaryCondition; linesConsumed: number } {
  if (!line.startsWith("BC Line Name=")) {
    throw new Error(`boundaryConditionParser was given a line it can't parse: ${line}`)
  }

  let index = currentIndex

  // Parse BC Line Name
  const nameResult = parseKeyValue(lines[index])
  const name = nameResult.value.trim()
  index++

  // Parse BC Line Storage Area
  const storageAreaResult = parseKeyValue(lines[index])
  const storageArea = storageAreaResult.value.trim()
  index++

  // Parse BC Line Start Position
  const startPositionResult = parseKeyValue(lines[index])
  const startPosition = parseCoordinateFromString(startPositionResult.value)
  index++

  // Parse BC Line Middle Position
  const middlePositionResult = parseKeyValue(lines[index])
  const middlePosition = parseCoordinateFromString(middlePositionResult.value)
  index++

  // Parse BC Line End Position
  const endPositionResult = parseKeyValue(lines[index])
  const endPosition = parseCoordinateFromString(endPositionResult.value)
  index++

  // Parse BC Line Arc
  const arcResult = parseKeyValue(lines[index])
  const arc = parseInt(arcResult.value.trim())
  index++

  // Parse arc coordinates (variable number of coordinate pairs)
  const { data: arcCoordinates, nextIndex } = parseArcCoordinates(lines, index, arc)
  index = nextIndex // Each line can contain 2 coordinate pairs (32 chars each)

  // Parse BC Line Text Position
  const textPositionResult = parseKeyValue(lines[index])
  const textPosition = parseTextPositionFromString(textPositionResult.value)
  index++

  const linesConsumed = index - currentIndex

  return {
    data: {
      name,
      storageArea,
      startPosition,
      middlePosition,
      endPosition,
      arcCoordinates,
      textPosition,
    },
    linesConsumed,
  }
}

/**
 * Parse coordinate from string format "x , y"
 */
function parseCoordinateFromString(coordinateString: string): Coordinate {
  const parts = coordinateString.split(",")
  if (parts.length !== 2) {
    throw new Error(`Invalid coordinate format: ${coordinateString}`)
  }
  return [parseFloat(parts[0].trim()), parseFloat(parts[1].trim())]
}

/**
 * Parse text position from string format "x , y" keeping as strings
 */
function parseTextPositionFromString(coordinateString: string): TextPosition {
  const parts = coordinateString.split(",")
  if (parts.length !== 2) {
    throw new Error(`Invalid coordinate format: ${coordinateString}`)
  }
  return {
    x: parts[0].trim(),
    y: parts[1].trim(),
  }
}

/**
 * Parse arc coordinates from fixed-width format lines
 * Each coordinate pair is 32 characters (16 chars for X, 16 chars for Y)
 */
function parseArcCoordinates(
  lines: string[],
  startIndex: number,
  numberOfCoordinates: number,
): { data: Coordinate[]; nextIndex: number } {
  const pointsPerEntry = 2
  const { data, nextIndex } = parseMultilineArray({
    width: 16,
    maxWidth: 64,
    numOfEntries: numberOfCoordinates * pointsPerEntry,
    currentIndex: startIndex,
    lines,
  })

  const res = arrayToCoordinates(data)

  return { data: res, nextIndex }
}
