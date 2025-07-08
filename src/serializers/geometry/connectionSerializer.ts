// Connection serializer for HEC-RAS format
// Reverses the connection parsing process to produce exact format output

import type { Connection } from "../../models/geometry/connection"
import type { StationElevationPoint } from "../../models/geometry/common"
import { formatKeyValue, formatCommaSeparated, formatCoordinateLines, formatStationPairs } from "../atomic"
import { serializeBridgeConnection } from "./bridgeSerializer"
import { serializeCulvertGroups } from "./culvertSerializer"

/**
 * Serialize connection to HEC-RAS format
 * @param connection Connection properties
 * @returns Array of formatted lines
 */
export function serializeConnection(connection: Connection): string[] {
  const lines: string[] = []

  // Basic connection properties
  lines.push(formatKeyValue("Connection", connection.name))

  if (connection.description !== undefined) {
    lines.push(formatKeyValue("Connection Desc", connection.description))
  }

  // Connection line coordinates
  lines.push(formatKeyValue("Connection Line", connection.connectionLine.length.toString()))
  if (connection.connectionLine.length > 0) {
    const coordinateLines = formatCoordinateLines(connection.connectionLine)
    lines.push(...coordinateLines)
  }

  // Centerline profile
  lines.push(formatKeyValue("Connection Centerline Profile", connection.centerlineProfile))

  // Optional basic properties
  if (connection.lastEditedTime !== undefined) {
    lines.push(formatKeyValue("Connection Last Edited Time", connection.lastEditedTime))
  }

  if (connection.cellSizeMin !== undefined) {
    lines.push(formatKeyValue("Conn CellSize Min", connection.cellSizeMin))
  }

  if (connection.nearRepeats !== undefined) {
    lines.push(formatKeyValue("Conn Near Repeats", connection.nearRepeats))
  }

  // Storage area connections
  lines.push(formatKeyValue("Connection Up SA", connection.upstreamStorageArea))
  lines.push(formatKeyValue("Connection Dn SA", connection.downstreamStorageArea))

  // Routing and flow settings
  if (connection.routingType !== undefined) {
    lines.push(formatKeyValue("Conn Routing Type", connection.routingType))
  }

  if (connection.useRCFamily !== undefined) {
    lines.push(formatKeyValue("Conn Use RC Family", connection.useRCFamily))
  }

  if (connection.overflowMethod2D !== undefined) {
    lines.push(formatKeyValue("Conn OverFlow Method 2D", connection.overflowMethod2D))
  }

  // Weir properties
  if (connection.weirWD !== undefined) {
    lines.push(formatKeyValue("Conn Weir WD", connection.weirWD))
  }

  if (connection.weirCoefficient !== undefined) {
    lines.push(formatKeyValue("Conn Weir Coef", connection.weirCoefficient))
  }

  if (connection.weirIsOgee !== undefined) {
    lines.push(formatKeyValue("Conn Weir Is Ogee", connection.weirIsOgee))
  }

  if (connection.weirDesignEG !== undefined) {
    lines.push(formatKeyValue("Conn Weir Design EG", connection.weirDesignEG))
  }

  if (connection.weirDesignHT !== undefined) {
    lines.push(formatKeyValue("Conn Weir Design HT", connection.weirDesignHT))
  }

  // Spill coefficients
  if (connection.simpleSpillPosCoef !== undefined) {
    lines.push(formatKeyValue("Conn Simple Spill Pos Coef", connection.simpleSpillPosCoef))
  }

  if (connection.simpleSpillNegCoef !== undefined) {
    lines.push(formatKeyValue("Conn Simple Spill Neg Coef", connection.simpleSpillNegCoef))
  }

  // Weir station-elevation data
  if (connection.weirSE !== undefined && connection.weirSE.length > 0) {
    lines.push(formatKeyValue("Conn Weir SE", connection.weirSE.length))
    lines.push(...serializeStationElevationPoints(connection.weirSE))
  }

  // Hydraulic table properties
  if (connection.hTabHWMax !== undefined) {
    lines.push(formatKeyValue("Conn HTab HWMax", connection.hTabHWMax))
  }

  // Outlet rating curve
  if (connection.outletRatingCurve !== undefined) {
    const values = [
      connection.outletRatingCurve.value,
      connection.outletRatingCurve.flag,
      connection.outletRatingCurve.param3 || "",
      connection.outletRatingCurve.param4 || "",
    ]
    lines.push(formatKeyValue("Conn Outlet Rating Curve", formatCommaSeparated(values)))
  }

  // Bridge connection data
  if (connection.bridge !== undefined) {
    lines.push(...serializeBridgeConnection(connection.bridge))
  }

  // Culvert connection data
  if (connection.culvert !== undefined && connection.culvert.length > 0) {
    lines.push(...serializeCulvertGroups(connection.culvert))
  }

  return lines
}

/**
 * Serialize station-elevation points for weir data (5 pairs per line)
 */
function serializeStationElevationPoints(points: StationElevationPoint[]): string[] {
  const lines: string[] = []
  const maxPairsPerLine = 5

  for (let i = 0; i < points.length; i += maxPairsPerLine) {
    const pointSlice = points.slice(i, i + maxPairsPerLine)
    const numbers: number[] = []

    for (const point of pointSlice) {
      numbers.push(point.station, point.elevation)
    }

    lines.push(formatStationPairs(numbers))
  }

  return lines
}

/**
 * Serialize a connection to a complete HEC-RAS string
 * @param connection Connection properties
 * @returns Formatted HEC-RAS string
 */
export function serializeConnectionString(connection: Connection): string {
  return serializeConnection(connection).join("\n")
}
