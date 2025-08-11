import type { Connection } from "../../models/geometry/connection"
import type { Coordinate, StationElevationPoint } from "../../models/geometry/common"
import { serializeBridgeConnection } from "./bridgeSerializer"
import { serializeCulvertGroups } from "./culvertSerializer"
import { coordinatePairToString } from "../utils"
import { chunk } from "es-toolkit"

/**
 * Serialize connection to HEC-RAS format
 * @param connection Connection properties
 * @returns Array of formatted lines
 */
export function serializeConnection(connection: Connection): string[] {
  const lines: string[] = []

  // 1. Connection name
  lines.push(`Connection=${connection.name}      ,0,0`)

  // 2. Connection description (optional)
  if (connection.description) {
    lines.push(`Connection Desc=${connection.description}`)
  }

  // 3. Connection line coordinates
  lines.push(...serializeConnectionLine(connection.connectionLine))

  // 4. Basic connection properties
  lines.push(`Connection Centerline Profile=${connection.centerlineProfile}`)

  if (connection.lastEditedTime) {
    lines.push(`Connection Last Edited Time=${connection.lastEditedTime}`)
  }

  // 5. Computational settings
  if (connection.cellSizeMin !== undefined) {
    lines.push(`Conn CellSize Min=${connection.cellSizeMin}`)
  }

  if (connection.nearRepeats !== undefined) {
    lines.push(`Conn Near Repeats=${connection.nearRepeats}`)
  }

  // 6. Storage area connections
  lines.push(`Connection Up SA=${connection.upstreamStorageArea}         `)
  lines.push(`Connection Dn SA=${connection.downstreamStorageArea}         `)

  // 7. Routing and flow settings
  if (connection.routingType !== undefined) {
    lines.push(`Conn Routing Type= ${connection.routingType} `)
  }

  if (connection.useRCFamily !== undefined) {
    lines.push(`Conn Use RC Family=${connection.useRCFamily ? "True" : "False"}`)
  }

  if (connection.overflowMethod2D !== undefined) {
    lines.push(`Conn OverFlow Method 2D=${connection.overflowMethod2D ? "True" : "False"}`)
  }

  // 8. Weir properties
  if (connection.weirWD !== undefined) {
    lines.push(`Conn Weir WD=${connection.weirWD}`)
  }

  if (connection.weirCoefficient !== undefined) {
    lines.push(`Conn Weir Coef=${connection.weirCoefficient}`)
  }

  if (connection.weirIsOgee !== undefined) {
    lines.push(`Conn Weir Is Ogee= ${connection.weirIsOgee} `)
  }

  if (connection.weirDesignEG !== undefined) {
    lines.push(`Conn Weir Design EG=${connection.weirDesignEG}`)
  }

  if (connection.weirDesignHT !== undefined) {
    lines.push(`Conn Weir Design HT=${connection.weirDesignHT}`)
  }

  // 9. Spill coefficients
  if (connection.simpleSpillPosCoef !== undefined) {
    lines.push(`Conn Simple Spill Pos Coef=${connection.simpleSpillPosCoef}`)
  }

  if (connection.simpleSpillNegCoef !== undefined) {
    lines.push(`Conn Simple Spill Neg Coef=${connection.simpleSpillNegCoef}`)
  }

  // 10. Weir station elevation data
  if (connection.weirSE !== undefined) {
    lines.push(...serializeWeirStationElevation(connection.weirSE))
  }

  // 11. Hydraulic table properties
  if (connection.hTabHWMax !== undefined) {
    lines.push(`Conn HTab HWMax=${connection.hTabHWMax}`)
  }

  // 12. Add empty line before outlet rating curve
  lines.push("")

  // 13. Outlet rating curve
  if (connection.outletRatingCurve) {
    lines.push(serializeOutletRatingCurve(connection.outletRatingCurve))
  }

  // 14. Bridge connection data
  if (connection.bridge) {
    lines.push(...serializeBridgeConnection(connection.bridge))
  }

  // 15. Culvert connection data
  if (connection.culvert && connection.culvert.length > 0) {
    lines.push(...serializeCulvertGroups(connection.culvert))
  }

  return lines
}

/**
 * Serialize connection line coordinates
 */
function serializeConnectionLine(coordinates: Coordinate[]): string[] {
  const lines: string[] = []

  // Header line with coordinate count
  lines.push(`Connection Line=${coordinates.length}`)

  // Connection coordinates are 16 characters per number, 4 numbers per line (64 chars total)
  // This means 2 coordinate pairs per line
  if (coordinates.length > 0) {
    chunk(coordinates, 2).forEach((pair) => {
      // Format each coordinate pair with 16 characters per number
      const formattedPair = pair.map((coord) => coordinatePairToString(coord, 16)).join("")
      lines.push(formattedPair)
    })
  }

  return lines
}

/**
 * Serialize weir station elevation data
 */
function serializeWeirStationElevation(weirSE: StationElevationPoint[]): string[] {
  const lines: string[] = []

  // Header line with point count
  lines.push(`Conn Weir SE= ${weirSE.length} `)

  if (weirSE.length > 0) {
    // Station-elevation pairs are 8 characters each, 5 pairs per line (80 chars total)
    const stationElevationData: number[] = []
    for (const point of weirSE) {
      stationElevationData.push(point.station, point.elevation)
    }

    chunk(stationElevationData, 10).forEach((dataGroup) => {
      const formattedLine = dataGroup.map((value) => value.toString().padStart(8, " ")).join("")
      lines.push(formattedLine)
    })
  }

  return lines
}

/**
 * Serialize outlet rating curve
 */
function serializeOutletRatingCurve(curve: { value: number; flag: boolean; param3?: string; param4?: string }): string {
  // Format: "Conn Outlet Rating Curve= 0 ,False,,"
  const params = [
    `${curve.value} `, // Add space after first value
    curve.flag ? "True" : "False",
    curve.param3 || "",
    curve.param4 || "",
  ]

  return `Conn Outlet Rating Curve= ${params.join(",")}`
}

/**
 * Serialize connection to a complete HEC-RAS string
 * @param connection Connection properties
 * @returns Formatted HEC-RAS string
 */
export function serializeConnectionString(connection: Connection): string {
  return serializeConnection(connection).join("\n")
}
