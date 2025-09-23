import type { RiverReach, CrossSection } from "../../models/geometry/riverReach"
import { formatFixedWidth, formatNumbersToChunks } from "../atomic"
import {
  formatStationElevationPairs,
  formatCoordinateMultipleLines,
  formatHECRASStationNumber,
} from "../utils"
import { chunk } from "es-toolkit"

export function serializeRiverReach(riverReach: RiverReach): string[] {
  const lines: string[] = []

  lines.push(
    `River Reach=${formatFixedWidth(riverReach.riverName, 16, " ", "end")},${formatFixedWidth(riverReach.reachName, 16, " ", "end")}`,
  )

  lines.push(...formatCoordinateMultipleLines("Reach XY", riverReach.coordinates, true))

  if (riverReach.textPosition) {
    const [tx, ty] = riverReach.textPosition
    lines.push(`Rch Text X Y=${tx},${ty}`)
  }

  const reverseText = riverReach.reverseRiverText === 0 ? " 0" : riverReach.reverseRiverText
  if (riverReach.reverseRiverText !== undefined) {
    lines.push(`Reverse River Text=${reverseText} `)
  }

  lines.push("") // Blank line before cross sections

  for (const crossSection of riverReach.crossSections) {
    lines.push(...serializeCrossSection(crossSection))
  }

  return lines
}

export function serializeCrossSection(xs: CrossSection): string[] {
  const lines: string[] = []

  const type = ` ${xs.type} `
  const riverMile = formatFixedWidth(xs.riverMile, 8, " ", "end")
  const lengthLeft = xs.lengthLeft
  const lengthChannel = xs.lengthChannel
  const lengthRight = xs.lengthRight

  lines.push(
    `Type RM Length L Ch R =${type},${riverMile},${lengthLeft},${lengthChannel},${lengthRight}`,
  )

  if (xs.gisLine && xs.gisLine.length > 0) {
    lines.push(...formatCoordinateMultipleLines("XS GIS Cut Line", xs.gisLine))
  }

  if (xs.lastEditedTime) {
    lines.push(`Node Last Edited Time=${xs.lastEditedTime}`)
  }

  // Station/Elevation data
  lines.push(...serializeStationElevation(xs.stationElevation))

  // Manning's n values
  if (xs.manningValues && xs.manningValues.length > 0) {
    lines.push(`#Mann= ${xs.manningValues.length} ,-1,0`)
    lines.push(...serializeManningData(xs.manningValues))
  }

  // Ineffective flow areas
  if (
    xs.ineffectiveCount !== undefined &&
    xs.ineffectiveFlowAreas &&
    xs.ineffectiveFlowAreas.length > 0
  ) {
    lines.push(`#XS Ineff= ${xs.ineffectiveFlowAreas.length} ,-1 `)
    lines.push(...serializeIneffectiveFlowData(xs.ineffectiveFlowAreas))
  }

  // Permanent ineffective areas
  if (xs.permanentIneffective !== undefined) {
    lines.push(`Permanent Ineff=`)
    lines.push(xs.permanentIneffective.map((val) => (val ? "       T" : "       F")).join(""))
  }

  if (xs.leftBankStation !== undefined && xs.rightBankStation !== undefined) {
    lines.push(`Bank Sta=${xs.leftBankStation},${xs.rightBankStation}`)
  }

  if (xs.ratingCurveType !== undefined && xs.ratingCurveValue !== undefined) {
    lines.push(`XS Rating Curve=${formatFixedWidth(xs.ratingCurveType, 2)} ,${xs.ratingCurveValue}`)
  }

  if (
    xs.htabStartingElevation !== undefined &&
    xs.htabIncrement !== undefined &&
    xs.htabCount !== undefined
  ) {
    lines.push(
      `XS HTab Starting El and Incr=${xs.htabStartingElevation},${xs.htabIncrement},${formatFixedWidth(xs.htabCount, 3)} `,
    )
  }

  if (xs.htabHorizontalDistribution) {
    const distribution = xs.htabHorizontalDistribution.map((d) => formatFixedWidth(d, 2)).join(" ,")
    lines.push(`XS HTab Horizontal Distribution=${distribution} `)
  }

  if (xs.expansionContractionCoefficients) {
    lines.push(
      `Exp/Cntr=${xs.expansionContractionCoefficients.expansion},${xs.expansionContractionCoefficients.contraction}`,
    )
  }

  // Blocked obstructions
  if (
    xs.blockedObstructionCount !== undefined &&
    xs.blockedObstructions &&
    xs.blockedObstructions.length > 0
  ) {
    lines.push(`#Block Obstruct=${formatFixedWidth(xs.blockedObstructionCount, 2)} ,-1`)
    lines.push(...serializeBlockedObstructionData(xs.blockedObstructions))
  }

  // Skew angle
  if (xs.skewAngle !== undefined) {
    lines.push(`Skew Angle=${formatFixedWidth(xs.skewAngle, 2)} `)
  }

  return lines
}

function serializeManningData(segments: [number, number, number][]): string[] {
  const values = segments.flatMap(([station, nValue, unknownParameter]) => [
    station,
    nValue,
    unknownParameter,
  ])

  const lines: string[] = []

  chunk(values, 9).forEach((chunk) => {
    lines.push(chunk.map((num) => formatFixedWidth(formatHECRASStationNumber(num), 8)).join(""))
  })

  return lines
}

function serializeIneffectiveFlowData(
  areas: { leftStation: number; rightStation: number; elevation: number }[],
): string[] {
  const values = areas.flatMap((seg) => [seg.leftStation, seg.rightStation, seg.elevation])

  const lines: string[] = []

  chunk(values, 9).forEach((chunk) => {
    lines.push(chunk.map((num) => formatFixedWidth(formatHECRASStationNumber(num), 8)).join(""))
  })

  return lines
}

function serializeBlockedObstructionData(
  obstructions: {
    leftStation: number
    rightStation: number
    elevation: number
  }[],
): string[] {
  const lines: string[] = []

  // Group obstructions into lines (about 3 triplets per line)
  const obstructionsPerLine = 3
  for (let i = 0; i < obstructions.length; i += obstructionsPerLine) {
    const lineObstructions = obstructions.slice(i, i + obstructionsPerLine)
    const formattedTriplets = lineObstructions
      .map((obstruction) =>
        formatNumbersToChunks(
          [obstruction.leftStation, obstruction.rightStation, obstruction.elevation],
          8,
        ),
      )
      .join("")
    lines.push(formattedTriplets)
  }

  return lines
}

/**
 * Serialize weir station elevation data
 */
function serializeStationElevation(stationElevation: [number, number][]): string[] {
  const lines: string[] = []

  // Header line with point count
  lines.push(`#Sta/Elev= ${stationElevation.length} `)

  if (stationElevation.length > 0) {
    // Convert station-elevation points to flat array of numbers
    const stationElevationData: number[] = []
    for (const [station, elevation] of stationElevation) {
      stationElevationData.push(station, elevation)
    }

    lines.push(...formatStationElevationPairs(stationElevationData))
  }

  return lines
}
