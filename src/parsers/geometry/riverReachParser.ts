import {
  chunkStringToStrings,
  parseCommaSeparated,
  parseKeyValue,
  parseValueAsCSV,
} from "../atomic"
import type { RiverReach, CrossSection, CrossSectionType } from "../../models/geometry/riverReach"
import { parseMultilineArray, arrayToCoordinates, arrayToNumberPairs } from "../multiLineParsers"

/**
 * Parses river reach data starting from a "River Reach=" line
 * Handles river reach properties, coordinates, and cross-sections
 */
export function parseRiverReachData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: RiverReach; nextIndex: number } {
  if (!line.startsWith("River Reach=")) {
    throw new Error(`riverReachParser was given a line it can't parse: ${line}`)
  }

  // Initialize river reach with default values
  const riverReach = {
    riverName: "",
    reachName: "",
    coordinateCount: 0,
    coordinates: [],
    crossSections: [],
  } as RiverReach

  let index = currentIndex

  // Parse the river reach starting from the first line
  while (index < lines.length) {
    const currentLine = lines[index]

    // Skip empty lines
    if (!currentLine || currentLine.trim() === "") {
      index++
      continue
    }

    // Stop if we hit another river reach (but allow the first River Reach= line)
    if (currentLine.startsWith("River Reach=") && index !== currentIndex) {
      break
    }

    // Stop if we hit a non-river-reach line
    if (!isRiverReachLine(currentLine) && !currentLine.startsWith("River Reach=")) {
      break
    }

    if (currentLine.startsWith("River Reach=")) {
      const [riverName, reachName] = parseCommaSeparated(currentLine).map((s) => s.trim())
      riverReach.riverName = riverName
      riverReach.reachName = reachName
      index++
    } else if (currentLine.startsWith("Reach XY=")) {
      const numberOfPoints = parseInt(parseKeyValue(currentLine).value)
      index++

      const pointsPerEntry = 2
      const { data, nextIndex } = parseMultilineArray({
        width: 16,
        maxWidth: 64,
        numOfEntries: numberOfPoints * pointsPerEntry,
        currentIndex: index,
        lines,
      })

      riverReach.coordinates = arrayToCoordinates(data)

      index = nextIndex
    } else if (currentLine.startsWith("Rch Text X Y=")) {
      const [x, y] = parseValueAsCSV(currentLine).map((s) => parseFloat(s))
      riverReach.textPosition = { x, y }
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

  return { data: riverReach, nextIndex: index }
}

function isRiverReachLine(line: string): boolean {
  const riverReachPrefixes = [
    "River Reach=",
    "Reach XY=",
    "Rch Text X Y=",
    "Reverse River Text=",
    "Type RM Length L Ch R", // Cross-section start
  ]
  return riverReachPrefixes.some((prefix) => line?.startsWith(prefix))
}

function parseCrossSection(
  lines: string[],
  currentIndex: number,
): { data: CrossSection; nextIndex: number } {
  const line = lines[currentIndex]
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  const crossSection: CrossSection = {
    type: parseInt(parts[0]) as CrossSectionType,
    riverMile: parts[1].trim(),
    lengthLeft: parseFloat(parts[2]),
    lengthChannel: parseFloat(parts[3]),
    lengthRight: parseFloat(parts[4]),
    gisLine: [],
    stationElevation: [],
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
      const numberOfValues = parseInt(parseKeyValue(currentLine).value)
      index++

      const pointsPerEntry = 2
      const { data, nextIndex } = parseMultilineArray({
        width: 16,
        maxWidth: 64,
        numOfEntries: numberOfValues * pointsPerEntry,
        currentIndex: index,
        lines,
      })
      crossSection.gisLine = arrayToCoordinates(data)
      index = nextIndex
    }
    if (currentLine.startsWith("Node Last Edited Time=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.lastEditedTime = value
      index++
    }
    if (currentLine.startsWith("Bank Sta=")) {
      const [leftBank, rightBank] = parseValueAsCSV(currentLine).map((s) => parseFloat(s))
      crossSection.leftBankStation = leftBank
      crossSection.rightBankStation = rightBank
      index++
    }
    if (currentLine.startsWith("XS Rating Curve=")) {
      const { value } = parseKeyValue(currentLine)
      const ratingParts = parseCommaSeparated(value)
      crossSection.ratingCurveType = parseInt(ratingParts[0])
      crossSection.ratingCurveValue = parseInt(ratingParts[1])
      index++
    }
    if (currentLine.startsWith("XS HTab Starting El and Incr=")) {
      const { value } = parseKeyValue(currentLine)
      const htabParts = parseCommaSeparated(value)
      crossSection.htabStartingElevation = parseFloat(htabParts[0])
      crossSection.htabIncrement = parseFloat(htabParts[1])
      crossSection.htabCount = parseInt(htabParts[2])
      index++
    }
    if (currentLine.startsWith("XS HTab Horizontal Distribution=")) {
      const { value } = parseKeyValue(currentLine)
      const distribution = parseCommaSeparated(value)
      crossSection.htabHorizontalDistribution = distribution.map((d) => parseInt(d))
      index++
    }
    if (currentLine.startsWith("Exp/Cntr=")) {
      const { value } = parseKeyValue(currentLine)
      const expCntr = parseCommaSeparated(value)
      crossSection.expansionContractionCoefficients = {
        expansion: parseFloat(expCntr[0]),
        contraction: parseFloat(expCntr[1]),
      }
      index++
    }
    if (currentLine.startsWith("#Sta/Elev=")) {
      const numberOfValues = parseInt(parseKeyValue(currentLine).value)
      index++

      const pointsPerEntry = 2
      const { data, nextIndex } = parseMultilineArray({
        width: 8,
        maxWidth: 80,
        numOfEntries: numberOfValues * pointsPerEntry,
        currentIndex: index,
        lines,
      })
      crossSection.stationElevation = arrayToNumberPairs(data, 2)
      index = nextIndex
    } else if (currentLine.startsWith("#Mann=")) {
      const numberOfValues = parseInt(parseKeyValue(currentLine).value)
      index++

      const pointsPerEntry = 3
      const { data, nextIndex } = parseMultilineArray({
        width: 8,
        maxWidth: 72,
        numOfEntries: numberOfValues * pointsPerEntry,
        currentIndex: index,
        lines,
      })
      crossSection.manningValues = arrayToNumberPairs(data, 3)
      index = nextIndex
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
    }
    if (currentLine.startsWith("#Block Obstruct=")) {
      const { value } = parseKeyValue(currentLine)
      const parts = parseCommaSeparated(value)
      const blockedCount = parseInt(parts[0])
      crossSection.blockedObstructionCount = blockedCount
      index++

      // Parse blocked obstructions from following lines
      const blockedData = parseBlockedObstructionData(lines, index, blockedCount * 3) // Each obstruction has left + right + elevation
      crossSection.blockedObstructions = blockedData.data
      index = blockedData.nextIndex
    }
    if (currentLine.startsWith("Permanent Ineff=")) {
      const nextLine = lines[index + 1]
      const permAreas = chunkStringToStrings(nextLine, 8).map((s) => s.trim() === "T")

      crossSection.permanentIneffective = permAreas
      index++
    }
    if (currentLine.startsWith("Skew Angle=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.skewAngle = parseFloat(value.trim())
      index++
    }
  }

  return {
    data: crossSection,
    nextIndex: index,
  }
}
