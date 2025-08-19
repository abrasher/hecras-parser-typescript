import type { RiverReach, CrossSection } from "../../models/geometry/riverReach"
import { coordinatePairToString } from "../utils"
import { chunk } from "es-toolkit"

export function serializeRiverReach(riverReach: RiverReach): string[] {
  const lines: string[] = []

  lines.push(`River Reach=${riverReach.riverName.padEnd(16)},${riverReach.reachName.padEnd(16)}`)

  lines.push(`Reach XY=${riverReach.coordinateCount.toString().padStart(5)} `)

  const coordChunks = chunk(riverReach.coordinates, 2)
  for (const coordPair of coordChunks) {
    const coordStrings = coordPair.map((coord) => coordinatePairToString(coord, 16))
    lines.push("     " + coordStrings.join("     "))
  }

  if (riverReach.textPosition) {
    lines.push(`Rch Text X Y=${riverReach.textPosition.x},${riverReach.textPosition.y}`)
  }

  if (riverReach.reverseRiverText !== undefined) {
    lines.push(`Reverse River Text=${riverReach.reverseRiverText.toString().padStart(2)} `)
  }

  for (const crossSection of riverReach.crossSections) {
    lines.push(...serializeCrossSection(crossSection))
  }

  return lines
}

export function serializeCrossSection(crossSection: CrossSection): string[] {
  const lines: string[] = []

  lines.push(
    `Type RM Length L Ch R =${crossSection.type.toString().padStart(2)} ,${crossSection.riverMile.toString().padStart(8)}    ,${crossSection.lengthLeft},${crossSection.lengthChannel},${crossSection.lengthRight}`,
  )

  if (crossSection.gisLineCount && crossSection.gisLine) {
    lines.push(`XS GIS Cut Line=${crossSection.gisLineCount}`)

    const gisCoordChunks = chunk(crossSection.gisLine, 2)
    for (const coordPair of gisCoordChunks) {
      const coordStrings = coordPair.map((coord) => coordinatePairToString(coord, 16))
      lines.push("     " + coordStrings.join("     "))
    }
  }

  if (crossSection.lastEditedTime) {
    lines.push(`Node Last Edited Time=${crossSection.lastEditedTime}`)
  }

  if (crossSection.leftBankStation !== undefined && crossSection.rightBankStation !== undefined) {
    lines.push(`Bank Sta=${crossSection.leftBankStation},${crossSection.rightBankStation}`)
  }

  if (crossSection.ratingCurveType !== undefined && crossSection.ratingCurveValue !== undefined) {
    lines.push(
      `XS Rating Curve=${crossSection.ratingCurveType.toString().padStart(2)} ,${crossSection.ratingCurveValue}`,
    )
  }

  if (
    crossSection.htabStartingElevation !== undefined &&
    crossSection.htabIncrement !== undefined &&
    crossSection.htabCount !== undefined
  ) {
    lines.push(
      `XS HTab Starting El and Incr=${crossSection.htabStartingElevation},${crossSection.htabIncrement},${crossSection.htabCount.toString().padStart(3)} `,
    )
  }

  if (crossSection.htabHorizontalDistribution) {
    const distribution = crossSection.htabHorizontalDistribution.map((d) => d.toString().padStart(2)).join(" ,")
    lines.push(`XS HTab Horizontal Distribution=${distribution} `)
  }

  if (crossSection.expansionContractionCoefficients) {
    lines.push(
      `Exp/Cntr=${crossSection.expansionContractionCoefficients.expansion},${crossSection.expansionContractionCoefficients.contraction}`,
    )
  }

  // Station/Elevation data
  if (crossSection.stationElevationCount !== undefined && crossSection.stationElevationPoints.length > 0) {
    lines.push(`#Sta/Elev=${crossSection.stationElevationCount.toString().padStart(4)} `)
    lines.push(...serializeStationElevationData(crossSection.stationElevationPoints))
  }

  // Manning's n values
  if (crossSection.manningCount !== undefined && crossSection.manningValues && crossSection.manningValues.length > 0) {
    lines.push(`#Mann=${crossSection.manningCount.toString().padStart(3)} ,-1,0`)
    lines.push(...serializeManningData(crossSection.manningValues))
  }

  // Ineffective flow areas
  if (
    crossSection.ineffectiveCount !== undefined &&
    crossSection.ineffectiveFlowAreas &&
    crossSection.ineffectiveFlowAreas.length > 0
  ) {
    lines.push(`#XS Ineff=${crossSection.ineffectiveCount.toString().padStart(2)} ,-1`)
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
    lines.push(`#Block Obstruct=${crossSection.blockedObstructionCount.toString().padStart(2)} ,-1`)
    lines.push(...serializeBlockedObstructionData(crossSection.blockedObstructions))
  }

  // Skew angle
  if (crossSection.skewAngle !== undefined) {
    lines.push(`Skew Angle=${crossSection.skewAngle.toString().padStart(2)} `)
  }

  return lines
}

function serializeStationElevationData(points: { station: number; elevation: number }[]): string[] {
  const lines: string[] = []

  // Group points into lines (about 5 pairs per line to stay under typical line limits)
  const pointsPerLine = 5
  for (let i = 0; i < points.length; i += pointsPerLine) {
    const linePoints = points.slice(i, i + pointsPerLine)
    const formattedPairs = linePoints
      .map((point) => `${point.station.toString().padStart(8)}${point.elevation.toString().padStart(8)}`)
      .join("")
    lines.push(formattedPairs)
  }

  return lines
}

function serializeManningData(segments: { station: number; nValue: number; unknownParameter: number }[]): string[] {
  const lines: string[] = []

  // Group segments into lines (about 3 triplets per line)
  const segmentsPerLine = 3
  for (let i = 0; i < segments.length; i += segmentsPerLine) {
    const lineSegments = segments.slice(i, i + segmentsPerLine)
    const formattedTriplets = lineSegments
      .map(
        (segment) =>
          `${segment.station.toString().padStart(8)}${segment.nValue.toString().padStart(8)}${segment.unknownParameter.toString().padStart(8)}`,
      )
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
      .map(
        (area) =>
          `${area.leftStation.toString().padStart(8)}${area.rightStation.toString().padStart(8)}${area.elevation.toString().padStart(8)}`,
      )
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
      .map(
        (obstruction) =>
          `${obstruction.leftStation.toString().padStart(8)}${obstruction.rightStation.toString().padStart(8)}${obstruction.elevation.toString().padStart(8)}`,
      )
      .join("")
    lines.push(formattedTriplets)
  }

  return lines
}
