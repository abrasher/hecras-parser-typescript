import { parseKeyValue, parseCommaSeparated } from "../atomic"
import { parseLineToCoordinates } from "../lineParsers"
import { parseBridgeData } from "./bridgeParser"
import type { Connection } from "../../models/geometry/connection"
import type { Coordinate } from "../../models/geometry/common"

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
      connection.description = parseConnectionDescription(currentLine)
      index++
    } else if (currentLine.startsWith("Connection Line=")) {
      const { data, nextIndex } = parseConnectionLine(lines, index)
      connection.connectionLine = data
      index = nextIndex
    } else if (currentLine.startsWith("Connection Centerline Profile=")) {
      connection.centerlineProfile = parseConnectionCenterlineProfile(currentLine)
      index++
    } else if (currentLine.startsWith("Connection Last Edited Time=")) {
      connection.lastEditedTime = parseConnectionLastEditedTime(currentLine)
      index++
    } else if (currentLine.startsWith("Conn CellSize Min=")) {
      connection.cellSizeMin = parseConnCellSizeMin(currentLine)
      index++
    } else if (currentLine.startsWith("Conn Near Repeats=")) {
      connection.nearRepeats = parseConnNearRepeats(currentLine)
      index++
    } else if (currentLine.startsWith("Connection Up SA=")) {
      connection.upstreamStorageArea = parseConnectionUpSA(currentLine)
      index++
    } else if (currentLine.startsWith("Connection Dn SA=")) {
      connection.downstreamStorageArea = parseConnectionDnSA(currentLine)
      index++
    } else if (currentLine.includes("Conn Routing Type=")) {
      connection.routingType = parseConnRoutingType(currentLine)
      index++
    } else if (currentLine.includes("Conn Use RC Family=")) {
      connection.useRCFamily = parseConnUseRCFamily(currentLine)
      index++
    } else if (currentLine.includes("Conn OverFlow Method 2D=")) {
      connection.overflowMethod2D = parseConnOverFlowMethod2D(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir WD=")) {
      connection.weirWD = parseConnWeirWD(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir Coef=")) {
      connection.weirCoefficient = parseConnWeirCoef(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir Is Ogee=")) {
      connection.weirIsOgee = parseConnWeirIsOgee(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir Design EG=")) {
      connection.weirDesignEG = parseConnWeirDesignEG(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir Design HT=")) {
      connection.weirDesignHT = parseConnWeirDesignHT(currentLine)
      index++
    } else if (currentLine.includes("Conn Simple Spill Pos Coef=")) {
      connection.simpleSpillPosCoef = parseConnSimpleSpillPosCoef(currentLine)
      index++
    } else if (currentLine.includes("Conn Simple Spill Neg Coef=")) {
      connection.simpleSpillNegCoef = parseConnSimpleSpillNegCoef(currentLine)
      index++
    } else if (currentLine.includes("Conn Weir SE=")) {
      connection.weirSE = parseConnWeirSE(currentLine)
      index++
    } else if (currentLine.includes("Conn HTab HWMax=")) {
      connection.hTabHWMax = parseConnHTabHWMax(currentLine)
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
    "Conn ",
  ]
  return connectionPrefixes.some((prefix) => line?.startsWith(prefix))
}

// Basic connection property parsers
function parseConnectionName(line: string): string {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)
  return parts[0].trim()
}

function parseConnectionDescription(line: string): string {
  const { value } = parseKeyValue(line)
  return value.trim()
}

function parseConnectionLine(lines: string[], startIndex: number): { data: Coordinate[]; nextIndex: number } {
  const headerLine = lines[startIndex]
  const { value } = parseKeyValue(headerLine)
  const numberOfCoordinates = parseInt(value.trim())

  let index = startIndex + 1
  const coordinates: Coordinate[] = []

  // Connection coordinates may not be defined, so we need to check and escape if there are none
  if (numberOfCoordinates === 0) return { data: coordinates, nextIndex: index }

  // Connection coordinates are 32 characters wide, 16 characters per number, 2 coordinates per line
  // This means we can fit 1 coordinate pair per line, so number of lines equals numberOfCoordinates
  const lineCount = numberOfCoordinates

  const endIndex = index + lineCount

  for (; index < endIndex; index++) {
    const nextLine = lines[index]
    // Use the same fixed-width parsing as culvert barrel coordinates
    const lineCoords = parseLineToCoordinates(nextLine)
    coordinates.push(...lineCoords)
  }

  return { data: coordinates, nextIndex: index }
}

function parseConnectionCenterlineProfile(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnectionLastEditedTime(line: string): string {
  const { value } = parseKeyValue(line)
  return value.trim()
}

// Computational settings parsers
function parseConnCellSizeMin(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnNearRepeats(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnectionUpSA(line: string): string {
  const { value } = parseKeyValue(line)
  return value.trim()
}

function parseConnectionDnSA(line: string): string {
  const { value } = parseKeyValue(line)
  return value.trim()
}

function parseConnRoutingType(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnUseRCFamily(line: string): boolean {
  const { value } = parseKeyValue(line)
  return value.trim().toLowerCase() === "true"
}

function parseConnOverFlowMethod2D(line: string): boolean {
  const { value } = parseKeyValue(line)
  return value.trim().toLowerCase() === "true"
}

// Weir properties parsers
function parseConnWeirWD(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnWeirCoef(line: string): number {
  const { value } = parseKeyValue(line)
  return parseFloat(value.trim())
}

function parseConnWeirIsOgee(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnWeirDesignEG(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnWeirDesignHT(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnSimpleSpillPosCoef(line: string): number {
  const { value } = parseKeyValue(line)
  return parseFloat(value.trim())
}

function parseConnSimpleSpillNegCoef(line: string): number {
  const { value } = parseKeyValue(line)
  return parseFloat(value.trim())
}

function parseConnWeirSE(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
}

function parseConnHTabHWMax(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value.trim())
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
