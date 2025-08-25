import type { RiverReach, CrossSection } from "../../models/geometry/riverReach"
import { formatCoordinates, formatFixedWidth, formatNumbersToChunks } from "../atomic"
import { formatStationElevationPairs, formatCoordinateMultipleLines } from "../utils"
import { chunk } from "es-toolkit"

export function serializeRiverReach(riverReach: RiverReach): string[] {
  const lines: string[] = []

  lines.push(
    `River Reach=${formatFixedWidth(riverReach.riverName, 16, " ", "end")},${formatFixedWidth(riverReach.reachName, 16, " ", "end")}`,
  )

  lines.push(...formatCoordinateMultipleLines("Reach XY", riverReach.coordinates, true))

  if (riverReach.textPosition) {
    lines.push(`Rch Text X Y=${riverReach.textPosition.x},${riverReach.textPosition.y}`)
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

export function serializeCrossSection(crossSection: CrossSection): string[] {
  const lines: string[] = []

  lines.push(
    `Type RM Length L Ch R =${formatFixedWidth(crossSection.type, 2)} ,${formatFixedWidth(crossSection.riverMile, 8)}    ,${crossSection.lengthLeft},${crossSection.lengthChannel},${crossSection.lengthRight}`,
  )

  if (crossSection.gisLineCount && crossSection.gisLine) {
    lines.push(`XS GIS Cut Line=${crossSection.gisLineCount}`)

    const gisCoordChunks = chunk(crossSection.gisLine, 2)
    for (const coordPair of gisCoordChunks) {
      lines.push("     " + formatCoordinates(coordPair))
    }
  }

  if (crossSection.lastEditedTime) {
    lines.push(`Node Last Edited Time=${crossSection.lastEditedTime}`)
  }

  if (crossSection.leftBankStation !== undefined && crossSection.rightBankStation !== undefined) {
    lines.push(`Bank Sta=${crossSection.leftBankStation},${crossSection.rightBankStation}`)
  }

  if (crossSection.ratingCurveType !== undefined && crossSection.ratingCurveValue !== undefined) {
    lines.push(`XS Rating Curve=${formatFixedWidth(crossSection.ratingCurveType, 2)} ,${crossSection.ratingCurveValue}`)
  }

  if (
    crossSection.htabStartingElevation !== undefined &&
    crossSection.htabIncrement !== undefined &&
    crossSection.htabCount !== undefined
  ) {
    lines.push(
      `XS HTab Starting El and Incr=${crossSection.htabStartingElevation},${crossSection.htabIncrement},${formatFixedWidth(crossSection.htabCount, 3)} `,
    )
  }

  if (crossSection.htabHorizontalDistribution) {
    const distribution = crossSection.htabHorizontalDistribution.map((d) => formatFixedWidth(d, 2)).join(" ,")
    lines.push(`XS HTab Horizontal Distribution=${distribution} `)
  }

  if (crossSection.expansionContractionCoefficients) {
    lines.push(
      `Exp/Cntr=${crossSection.expansionContractionCoefficients.expansion},${crossSection.expansionContractionCoefficients.contraction}`,
    )
  }

  // Station/Elevation data
  if (crossSection.stationElevationCount !== undefined && crossSection.stationElevationPoints.length > 0) {
    lines.push(`#Sta/Elev=${formatFixedWidth(crossSection.stationElevationCount, 4)} `)
    lines.push(...serializeStationElevationData(crossSection.stationElevationPoints))
  }

  // Manning's n values
  if (crossSection.manningCount !== undefined && crossSection.manningValues && crossSection.manningValues.length > 0) {
    lines.push(`#Mann=${formatFixedWidth(crossSection.manningCount, 3)} ,-1,0`)
    lines.push(...serializeManningData(crossSection.manningValues))
  }

  // Ineffective flow areas
  if (
    crossSection.ineffectiveCount !== undefined &&
    crossSection.ineffectiveFlowAreas &&
    crossSection.ineffectiveFlowAreas.length > 0
  ) {
    lines.push(`#XS Ineff=${formatFixedWidth(crossSection.ineffectiveCount, 2)} ,-1`)
    lines.push(...serializeIneffectiveFlowData(crossSection.ineffectiveFlowAreas))
  }

  // Permanent ineffective areas
  if (crossSection.permanentIneffective !== undefined) {
    lines.push(`Permanent Ineff=${crossSection.permanentIneffective}`)
  }

  // Blocked obstructions
  if (
    crossSection.blockedObstructionCount !== undefined &&
    crossSection.blockedObstructions &&
    crossSection.blockedObstructions.length > 0
  ) {
    lines.push(`#Block Obstruct=${formatFixedWidth(crossSection.blockedObstructionCount, 2)} ,-1`)
    lines.push(...serializeBlockedObstructionData(crossSection.blockedObstructions))
  }

  // Skew angle
  if (crossSection.skewAngle !== undefined) {
    lines.push(`Skew Angle=${formatFixedWidth(crossSection.skewAngle, 2)} `)
  }

  return lines
}

function serializeStationElevationData(points: { station: number; elevation: number }[]): string[] {
  const stationElevationData: number[] = []
  for (const point of points) {
    stationElevationData.push(point.station, point.elevation)
  }
  return formatStationElevationPairs(stationElevationData)
}

function serializeManningData(segments: { station: number; nValue: number; unknownParameter: number }[]): string[] {
  const lines: string[] = []

  // Group segments into lines (about 3 triplets per line)
  const segmentsPerLine = 3
  for (let i = 0; i < segments.length; i += segmentsPerLine) {
    const lineSegments = segments.slice(i, i + segmentsPerLine)
    const formattedTriplets = lineSegments
      .map((segment) => formatNumbersToChunks([segment.station, segment.nValue, segment.unknownParameter], 8))
      .join("")
    lines.push(formattedTriplets)
  }

  return lines
}

function serializeIneffectiveFlowData(
  areas: { leftStation: number; rightStation: number; elevation: number }[],
): string[] {
  const lines: string[] = []

  // Group areas into lines (about 3 triplets per line)
  const areasPerLine = 3
  for (let i = 0; i < areas.length; i += areasPerLine) {
    const lineAreas = areas.slice(i, i + areasPerLine)
    const formattedTriplets = lineAreas
      .map((area) => formatNumbersToChunks([area.leftStation, area.rightStation, area.elevation], 8))
      .join("")
    lines.push(formattedTriplets)
  }

  return lines
}

function serializeBlockedObstructionData(
  obstructions: { leftStation: number; rightStation: number; elevation: number }[],
): string[] {
  const lines: string[] = []

  // Group obstructions into lines (about 3 triplets per line)
  const obstructionsPerLine = 3
  for (let i = 0; i < obstructions.length; i += obstructionsPerLine) {
    const lineObstructions = obstructions.slice(i, i + obstructionsPerLine)
    const formattedTriplets = lineObstructions
      .map((obstruction) =>
        formatNumbersToChunks([obstruction.leftStation, obstruction.rightStation, obstruction.elevation], 8),
      )
      .join("")
    lines.push(formattedTriplets)
  }

  return lines
}
