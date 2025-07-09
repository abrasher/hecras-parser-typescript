import { parseKeyValue, parseCommaSeparated, chunkStringToNumbers } from "../atomic"
import { parseLineToCoordinates } from "../lineParsers"
import { parseBridgeData } from "./bridgeParser"
import type { Connection } from "../../models/geometry/connection"
import type { Coordinate, StationElevationPoint } from "../../models/geometry/common"

/**
 * Parses connection data starting from a "Connection=" line
 * Handles all connection types including bridge, culvert, and weir connections
 */
export function parseConnectionData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: Connection; nextIndex: number } {
  if (!line.startsWith("Connection=")) {
    throw new Error(`connectionParser was given a line it can't parse: ${line}`)
  }

  // Initialize connection with default values
  const connection = {
    name: "",
    connectionLine: [],
    centerlineProfile: 0,
    upstreamStorageArea: "",
    downstreamStorageArea: "",
  } as Connection

  let index = currentIndex

  // Parse the connection starting from the first line
  while (index < lines.length) {
    const currentLine = lines[index]

    // Skip empty lines
    if (!currentLine || currentLine.trim() === "") {
      index++
      continue
    }

    // Stop if we hit a non-connection line
    if (!isConnectionLine(currentLine)) {
      break
    }

    if (currentLine.startsWith("Connection=")) {
      connection.name = parseConnectionName(currentLine)
      index++
    } else if (currentLine.startsWith("Connection Desc=")) {
      connection.description = parseKeyValue(currentLine).value.trim()
      index++
    } else if (currentLine.startsWith("Connection Line=")) {
      const { data, nextIndex } = parseConnectionLine(lines, index)
      connection.connectionLine = data
      index = nextIndex
    } else if (currentLine.startsWith("Connection Centerline Profile=")) {
      connection.centerlineProfile = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.startsWith("Connection Last Edited Time=")) {
      connection.lastEditedTime = parseKeyValue(currentLine).value.trim()
      index++
    } else if (currentLine.startsWith("Conn CellSize Min=")) {
      connection.cellSizeMin = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.startsWith("Conn Near Repeats=")) {
      connection.nearRepeats = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.startsWith("Connection Up SA=")) {
      connection.upstreamStorageArea = parseKeyValue(currentLine).value.trim()
      index++
    } else if (currentLine.startsWith("Connection Dn SA=")) {
      connection.downstreamStorageArea = parseKeyValue(currentLine).value.trim()
      index++
    } else if (currentLine.includes("Conn Routing Type=")) {
      connection.routingType = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Use RC Family=")) {
      connection.useRCFamily = parseKeyValue(currentLine).value.trim().toLowerCase() === "true"
      index++
    } else if (currentLine.includes("Conn OverFlow Method 2D=")) {
      connection.overflowMethod2D = parseKeyValue(currentLine).value.trim().toLowerCase() === "true"
      index++
    } else if (currentLine.includes("Conn Weir WD=")) {
      connection.weirWD = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Weir Coef=")) {
      connection.weirCoefficient = parseFloat(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Weir Is Ogee=")) {
      connection.weirIsOgee = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Weir Design EG=")) {
      connection.weirDesignEG = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Weir Design HT=")) {
      connection.weirDesignHT = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Simple Spill Pos Coef=")) {
      connection.simpleSpillPosCoef = parseFloat(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Simple Spill Neg Coef=")) {
      connection.simpleSpillNegCoef = parseFloat(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Weir SE=")) {
      const { data, nextIndex } = parseWeirStationElevation(lines, index)
      connection.weirSE = data
      index = nextIndex + 1
    } else if (currentLine.includes("Conn HTab HWMax=")) {
      connection.hTabHWMax = parseInt(parseKeyValue(currentLine).value.trim())
      index++
    } else if (currentLine.includes("Conn Outlet Rating Curve=")) {
      connection.outletRatingCurve = parseConnOutletRatingCurve(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: Bridge=")) {
      const { data, nextIndex } = parseBridgeData(currentLine, lines, index)
      connection.bridge = data
      index = nextIndex
    } else {
      index++
    }
  }

  return { data: connection, nextIndex: index }
}

function isConnectionLine(line: string): boolean {
  const connectionPrefixes = [
    "Connection=",
    "Connection Desc=",
    "Connection Line=",
    "Connection Centerline Profile=",
    "Connection Last Edited Time=",
    "Connection Up SA=",
    "Connection Dn SA=",
    "Conn CellSize Min=",
    "Conn Near Repeats=",
    "Conn Routing Type=",
    "Conn Use RC Family=",
    "Conn OverFlow Method 2D=",
    "Conn Weir WD=",
    "Conn Weir Coef=",
    "Conn Weir Is Ogee=",
    "Conn Weir Design EG=",
    "Conn Weir Design HT=",
    "Conn Simple Spill Pos Coef=",
    "Conn Simple Spill Neg Coef=",
    "Conn Weir SE=",
    "Conn HTab HWMax=",
    "Conn Outlet Rating Curve=",
    "Conn BR:", // Add bridge connection prefix
  ]
  return connectionPrefixes.some((prefix) => line?.startsWith(prefix))
}

// Basic connection property parsers
function parseConnectionName(line: string): string {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)
  return parts[0].trim()
}

function parseConnectionLine(lines: string[], startIndex: number): { data: Coordinate[]; nextIndex: number } {
  const headerLine = lines[startIndex]
  const { value } = parseKeyValue(headerLine)
  const numberOfCoordinates = parseInt(value.trim())

  let index = startIndex + 1
  const coordinates: Coordinate[] = []

  // Connection coordinates may not be defined, so we need to check and escape if there are none
  if (numberOfCoordinates === 0) return { data: coordinates, nextIndex: index }

  // Connection coordinates are 64 characters wide, 16 characters per number, 4 coordinates per line
  // This means we can fit 2 coordinate pair per line, so number of lines equals numberOfCoordinates
  const lineCount = Math.ceil(numberOfCoordinates / 2) // 64 char line, 16 per char, 2 coord per pair

  const endIndex = index + lineCount

  for (; index < endIndex; index++) {
    const nextLine = lines[index]
    // Use the same fixed-width parsing as culvert barrel coordinates
    const lineCoords = parseLineToCoordinates(nextLine)
    coordinates.push(...lineCoords)
  }

  return { data: coordinates, nextIndex: index }
}

function parseConnOutletRatingCurve(line: string): {
  value: number
  flag: boolean
  param3?: string
  param4?: string
} {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  return {
    value: parseInt(parts[0]),
    flag: parts[1].toLowerCase() === "true",
    param3: parts[2] || "",
    param4: parts[3] || "",
  }
}

function parseWeirStationElevation(lines: string[], currentIndex: number) {
  const currentLine = lines[currentIndex]
  const pointCount = parseInt(parseKeyValue(currentLine).value)

  // If no points, return immediately without advancing index
  if (pointCount === 0) {
    return { data: [], nextIndex: currentIndex }
  }

  let index = currentIndex + 1

  // Parse station-elevation points
  const points: StationElevationPoint[] = []
  const pointLines = Math.ceil(pointCount / 5) // 5 pairs per line

  for (let i = 0; i < pointLines; i++) {
    const pointLine = lines[index + i]
    const nums = chunkStringToNumbers(pointLine, 8)

    for (let j = 0; j < nums.length; j += 2) {
      if (j + 1 < nums.length) {
        points.push({
          station: nums[j],
          elevation: nums[j + 1],
        })
      }
    }
  }
  index += pointLines

  return { data: points, nextIndex: index }
}
