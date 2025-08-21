import { parseLineToCoordinates } from "../lineParsers"
import type { Coordinate } from "../../models/geometry/common"
import { parseCommaSeparated, parseKeyValue } from "../atomic"
import type { RiverReach, CrossSection, CrossSectionType } from "../../models/geometry/riverReach"

export function parseRiverReachData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: RiverReach; nextIndex: number } {
  if (!line.startsWith("River Reach=")) throw new Error(`riverReachParser was given a line it can't parse: ${line}`)

  const { value } = parseKeyValue(line)
  const riverReachNames = parseCommaSeparated(value)

  const riverReach: RiverReach = {
    riverName: riverReachNames[0].trim(),
    reachName: riverReachNames[1].trim(),
    coordinateCount: 0,
    coordinates: [],
    crossSections: [],
  }

  let index = currentIndex + 1

  if (lines[index]?.startsWith("Reach XY=")) {
    const { value: coordinateCountStr } = parseKeyValue(lines[index])
    riverReach.coordinateCount = parseInt(coordinateCountStr.trim())
    index++

    const numberOfPoints = riverReach.coordinateCount
    const coordinateLines = Math.ceil(numberOfPoints / 2) // 2 coordinates per line

    for (let i = 0; i < coordinateLines && index < lines.length; i++) {
      const coordLine = lines[index]
      const coordinates = parseLineToCoordinates(coordLine)
      riverReach.coordinates.push(...coordinates)
      index++
    }
  }

  while (index < lines.length) {
    const currentLine = lines[index]

    if (
      !currentLine ||
      currentLine.startsWith("River Reach=") ||
      currentLine.startsWith("Connection ") ||
      currentLine.startsWith("Storage Area") ||
      currentLine.startsWith("Junction") ||
      currentLine.startsWith("Boundary Conditions")
    ) {
      break
    }

    if (currentLine.startsWith("Rch Text X Y=")) {
      const { value } = parseKeyValue(currentLine)
      const coords = parseCommaSeparated(value)
      riverReach.textPosition = {
        x: parseFloat(coords[0]),
        y: parseFloat(coords[1]),
      }
      index++
    } else if (currentLine.startsWith("Reverse River Text=")) {
      const { value } = parseKeyValue(currentLine)
      riverReach.reverseRiverText = parseInt(value.trim())
      index++
    } else if (currentLine.startsWith("Type RM Length L Ch R")) {
      const crossSection = parseCrossSection(lines, index)
      riverReach.crossSections.push(crossSection.data)
      index = crossSection.nextIndex
    } else {
      index++
    }
  }

  return {
    data: riverReach,
    nextIndex: index,
  }
}

function parseCrossSection(lines: string[], currentIndex: number): { data: CrossSection; nextIndex: number } {
  const line = lines[currentIndex]
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  const crossSection: CrossSection = {
    type: parseInt(parts[0]) as CrossSectionType,
    riverMile: parseFloat(parts[1]),
    lengthLeft: parseFloat(parts[2]),
    lengthChannel: parseFloat(parts[3]),
    lengthRight: parseFloat(parts[4]),
    stationElevationPoints: [],
  }

  let index = currentIndex + 1

  while (index < lines.length) {
    const currentLine = lines[index]

    if (
      !currentLine ||
      currentLine.startsWith("Type RM Length") ||
      currentLine.startsWith("River Reach=") ||
      currentLine.startsWith("Connection ") ||
      currentLine.startsWith("Storage Area") ||
      currentLine.startsWith("Junction") ||
      currentLine.startsWith("Boundary Conditions")
    ) {
      break
    }

    if (currentLine.startsWith("XS GIS Cut Line=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.gisLineCount = parseInt(value.trim())
      index++

      if (crossSection.gisLineCount && crossSection.gisLineCount > 0) {
        const gisCoords: Coordinate[] = []
        const coordsNeeded = crossSection.gisLineCount

        while (gisCoords.length < coordsNeeded && index < lines.length) {
          const coordLine = lines[index]
          if (
            coordLine.trim() === "" ||
            coordLine.startsWith("Node ") ||
            coordLine.startsWith("#") ||
            coordLine.startsWith("Bank ") ||
            coordLine.startsWith("XS ") ||
            coordLine.startsWith("Exp/") ||
            coordLine.startsWith("Type ")
          ) {
            break
          }

          const lineCoords = parseLineToCoordinates(coordLine)
          gisCoords.push(...lineCoords)
          index++
        }

        crossSection.gisLine = gisCoords.slice(0, coordsNeeded)
      }
    } else if (currentLine.startsWith("Node Last Edited Time=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.lastEditedTime = value
      index++
    } else if (currentLine.startsWith("Bank Sta=")) {
      const { value } = parseKeyValue(currentLine)
      const bankStations = parseCommaSeparated(value)
      crossSection.leftBankStation = parseFloat(bankStations[0])
      crossSection.rightBankStation = parseFloat(bankStations[1])
      index++
    } else if (currentLine.startsWith("XS Rating Curve=")) {
      const { value } = parseKeyValue(currentLine)
      const ratingParts = parseCommaSeparated(value)
      crossSection.ratingCurveType = parseInt(ratingParts[0])
      crossSection.ratingCurveValue = parseInt(ratingParts[1])
      index++
    } else if (currentLine.startsWith("XS HTab Starting El and Incr=")) {
      const { value } = parseKeyValue(currentLine)
      const htabParts = parseCommaSeparated(value)
      crossSection.htabStartingElevation = parseFloat(htabParts[0])
      crossSection.htabIncrement = parseFloat(htabParts[1])
      crossSection.htabCount = parseInt(htabParts[2])
      index++
    } else if (currentLine.startsWith("XS HTab Horizontal Distribution=")) {
      const { value } = parseKeyValue(currentLine)
      const distribution = parseCommaSeparated(value)
      crossSection.htabHorizontalDistribution = distribution.map((d) => parseInt(d))
      index++
    } else if (currentLine.startsWith("Exp/Cntr=")) {
      const { value } = parseKeyValue(currentLine)
      const expCntr = parseCommaSeparated(value)
      crossSection.expansionContractionCoefficients = {
        expansion: parseFloat(expCntr[0]),
        contraction: parseFloat(expCntr[1]),
      }
      index++
    } else if (currentLine.startsWith("#Sta/Elev=")) {
      const { value } = parseKeyValue(currentLine)
      const stationElevCount = parseInt(value.trim())
      crossSection.stationElevationCount = stationElevCount
      index++

      // Parse station/elevation data from following lines
      const stationElevPoints = parseStationElevationData(lines, index, stationElevCount * 2) // Each point has station + elevation
      crossSection.stationElevationPoints = stationElevPoints.data
      index = stationElevPoints.nextIndex
    } else if (currentLine.startsWith("#Mann=")) {
      const { value } = parseKeyValue(currentLine)
      const parts = parseCommaSeparated(value)
      const manningCount = parseInt(parts[0])
      crossSection.manningCount = manningCount
      index++

      // Parse Manning's n data from following lines
      const manningData = parseManningData(lines, index, manningCount * 3) // Each segment has station + nValue + unknown
      crossSection.manningValues = manningData.data
      index = manningData.nextIndex
    } else if (currentLine.startsWith("#XS Ineff=")) {
      const { value } = parseKeyValue(currentLine)
      const parts = parseCommaSeparated(value)
      const ineffectiveCount = parseInt(parts[0])
      crossSection.ineffectiveCount = ineffectiveCount
      index++

      // Parse ineffective flow areas from following lines
      const ineffectiveData = parseIneffectiveFlowData(lines, index, ineffectiveCount * 3) // Each area has left + right + elevation
      crossSection.ineffectiveFlowAreas = ineffectiveData.data
      index = ineffectiveData.nextIndex
    } else if (currentLine.startsWith("#Block Obstruct=")) {
      const { value } = parseKeyValue(currentLine)
      const parts = parseCommaSeparated(value)
      const blockedCount = parseInt(parts[0])
      crossSection.blockedObstructionCount = blockedCount
      index++

      // Parse blocked obstructions from following lines
      const blockedData = parseBlockedObstructionData(lines, index, blockedCount * 3) // Each obstruction has left + right + elevation
      crossSection.blockedObstructions = blockedData.data
      index = blockedData.nextIndex
    } else if (currentLine.startsWith("Permanent Ineff=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.permanentIneffective = value
      index++
    } else if (currentLine.startsWith("Skew Angle=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.skewAngle = parseFloat(value.trim())
      index++
    } else {
      index++
    }
  }

  return {
    data: crossSection,
    nextIndex: index,
  }
}

function parseStationElevationData(
  lines: string[],
  currentIndex: number,
  expectedNumbers: number,
): { data: { station: number; elevation: number }[]; nextIndex: number } {
  const stationElevPoints: { station: number; elevation: number }[] = []
  let index = currentIndex
  let numbersFound = 0

  while (numbersFound < expectedNumbers && index < lines.length) {
    const line = lines[index]
    if (
      !line ||
      line.trim() === "" ||
      line.startsWith("#") ||
      line.startsWith("Type ") ||
      line.startsWith("River Reach") ||
      line.startsWith("Connection ")
    ) {
      break
    }

    // Parse numbers from the line (variable width, space separated)
    const numbers = line
      .trim()
      .split(/\s+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n))

    // Group numbers into station/elevation pairs
    for (let i = 0; i < numbers.length - 1; i += 2) {
      if (numbersFound >= expectedNumbers) break
      stationElevPoints.push({
        station: numbers[i],
        elevation: numbers[i + 1],
      })
      numbersFound += 2
    }
    index++
  }

  return {
    data: stationElevPoints,
    nextIndex: index,
  }
}

function parseManningData(
  lines: string[],
  currentIndex: number,
  expectedNumbers: number,
): { data: { station: number; nValue: number; unknownParameter: number }[]; nextIndex: number } {
  const manningSegments: { station: number; nValue: number; unknownParameter: number }[] = []
  let index = currentIndex
  let numbersFound = 0

  while (numbersFound < expectedNumbers && index < lines.length) {
    const line = lines[index]
    if (
      !line ||
      line.trim() === "" ||
      line.startsWith("#") ||
      line.startsWith("Type ") ||
      line.startsWith("River Reach") ||
      line.startsWith("Connection ")
    ) {
      break
    }

    // Parse numbers from the line
    const numbers = line
      .trim()
      .split(/\s+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n))

    // Group numbers into station/nValue/unknown triplets
    for (let i = 0; i < numbers.length - 2; i += 3) {
      if (numbersFound >= expectedNumbers) break
      manningSegments.push({
        station: numbers[i],
        nValue: numbers[i + 1],
        unknownParameter: numbers[i + 2],
      })
      numbersFound += 3
    }
    index++
  }

  return {
    data: manningSegments,
    nextIndex: index,
  }
}

function parseIneffectiveFlowData(
  lines: string[],
  currentIndex: number,
  expectedNumbers: number,
): { data: { leftStation: number; rightStation: number; elevation: number }[]; nextIndex: number } {
  const ineffectiveAreas: { leftStation: number; rightStation: number; elevation: number }[] = []
  let index = currentIndex
  let numbersFound = 0

  while (numbersFound < expectedNumbers && index < lines.length) {
    const line = lines[index]
    if (
      !line ||
      line.trim() === "" ||
      line.startsWith("#") ||
      line.startsWith("Type ") ||
      line.startsWith("River Reach") ||
      line.startsWith("Connection ")
    ) {
      break
    }

    // Parse numbers from the line
    const numbers = line
      .trim()
      .split(/\s+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n))

    // Group numbers into left/right/elevation triplets
    for (let i = 0; i < numbers.length - 2; i += 3) {
      if (numbersFound >= expectedNumbers) break
      ineffectiveAreas.push({
        leftStation: numbers[i],
        rightStation: numbers[i + 1],
        elevation: numbers[i + 2],
      })
      numbersFound += 3
    }
    index++
  }

  return {
    data: ineffectiveAreas,
    nextIndex: index,
  }
}

function parseBlockedObstructionData(
  lines: string[],
  currentIndex: number,
  expectedNumbers: number,
): { data: { leftStation: number; rightStation: number; elevation: number }[]; nextIndex: number } {
  const blockedObstructions: { leftStation: number; rightStation: number; elevation: number }[] = []
  let index = currentIndex
  let numbersFound = 0

  while (numbersFound < expectedNumbers && index < lines.length) {
    const line = lines[index]
    if (
      !line ||
      line.trim() === "" ||
      line.startsWith("#") ||
      line.startsWith("Type ") ||
      line.startsWith("River Reach") ||
      line.startsWith("Connection ")
    ) {
      break
    }

    // Parse numbers from the line
    const numbers = line
      .trim()
      .split(/\s+/)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n))

    // Group numbers into left/right/elevation triplets
    for (let i = 0; i < numbers.length - 2; i += 3) {
      if (numbersFound >= expectedNumbers) break
      blockedObstructions.push({
        leftStation: numbers[i],
        rightStation: numbers[i + 1],
        elevation: numbers[i + 2],
      })
      numbersFound += 3
    }
    index++
  }

  return {
    data: blockedObstructions,
    nextIndex: index,
  }
}
