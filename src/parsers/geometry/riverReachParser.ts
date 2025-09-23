import {
  parseKeyValue,
  parseCommaSeparated,
  splitIntoTuples,
  parseMultilineArray,
  parseBoolean,
  parseMaybeFloat,
} from "../utils"
import type {
  RiverReach,
  CrossSection,
  CrossSectionType,
  LateralWeir,
} from "../../models/geometry/riverReach"

/**
 * Parses river reach data starting from a "River Reach=" line
 * Handles river reach properties, coordinates, and cross-sections
 */
export function parseRiverReachData(
  lines: string[],
  currentIndex: number,
): { data: RiverReach; nextIndex: number } {
  if (!lines[currentIndex].startsWith("River Reach=")) {
    throw new Error(`riverReachParser was given a line it can't parse: ${lines[currentIndex]}`)
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
      const { value } = parseKeyValue(currentLine)
      const [riverName, reachName] = parseCommaSeparated(value).map((s) => s.trim())
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

      const dataAsFloats = data.map((value) => parseFloat(value))
      riverReach.coordinates = splitIntoTuples(dataAsFloats, 2)

      index = nextIndex
    } else if (currentLine.startsWith("Rch Text X Y=")) {
      const { value } = parseKeyValue(currentLine)
      const [x, y] = parseCommaSeparated(value).map((s) => parseFloat(s))
      riverReach.textPosition = [x, y]
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
      const dataAsFloats = data.map((value) => parseFloat(value))
      crossSection.gisLine = splitIntoTuples(dataAsFloats, 2)
      index = nextIndex
    } else if (currentLine.startsWith("Node Last Edited Time=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.lastEditedTime = value
      index++
    } else if (currentLine.startsWith("Bank Sta=")) {
      const { value } = parseKeyValue(currentLine)
      const [leftBank, rightBank] = parseCommaSeparated(value).map((s) => parseFloat(s))
      crossSection.leftBankStation = leftBank
      crossSection.rightBankStation = rightBank
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
      const dataAsFloats = data.map((value) => parseFloat(value))
      crossSection.stationElevation = splitIntoTuples(dataAsFloats, 2)

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
      {
        const dataAsFloats = data.map((value) => parseFloat(value))
        crossSection.manningValues = splitIntoTuples(dataAsFloats, 3)
      }
      index = nextIndex
    } else if (currentLine.startsWith("#XS Ineff=")) {
      const { value } = parseKeyValue(currentLine)
      const [numIneff, _flag] = parseCommaSeparated(value)
      index++

      const numberOfValues = parseInt(numIneff)

      const pointsPerEntry = 3
      const { data, nextIndex } = parseMultilineArray({
        width: 8,
        maxWidth: 72,
        numOfEntries: numberOfValues * pointsPerEntry,
        currentIndex: index,
        lines,
      })
      {
        const dataAsFloats = data.map((value) => parseFloat(value))
        crossSection.ineffectiveFlowAreas = splitIntoTuples(dataAsFloats, 3) as [
          number,
          number,
          number,
        ][]
      }
      index = nextIndex
    } else if (currentLine.startsWith("#Block Obstruct=")) {
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
      {
        const dataAsFloats = data.map((value) => parseFloat(value))
        crossSection.blockedObstructions = splitIntoTuples(dataAsFloats, 3)
      }
      index = nextIndex
    } else if (currentLine.startsWith("Permanent Ineff=")) {
      index++

      const { entriesFromDataLines, dataLineCount } = (() => {
        let lookahead = index
        let totalEntries = 0
        while (lookahead < lines.length) {
          const candidate = lines[lookahead]
          if (!candidate || !/^[TF\s]*$/.test(candidate)) {
            break
          }
          const chunks = candidate.match(/.{1,8}/g) ?? []
          totalEntries += chunks.filter((chunk) => chunk.trim() !== "").length
          lookahead++
        }
        return { entriesFromDataLines: totalEntries, dataLineCount: lookahead - index }
      })()

      const countFromIneff = crossSection.ineffectiveFlowAreas?.length ?? 0
      const expectedCount = countFromIneff > 0 ? countFromIneff : entriesFromDataLines

      if (expectedCount === 0) {
        crossSection.permanentIneffective = []
        index += dataLineCount
        continue
      }

      const { data, nextIndex } = parseMultilineArray({
        width: 8,
        maxWidth: 80,
        numOfEntries: expectedCount,
        currentIndex: index,
        lines,
      })

      crossSection.permanentIneffective = data.map((value) => value.trim() === "T")
      index = nextIndex
    } else if (currentLine.startsWith("Skew Angle=")) {
      const { value } = parseKeyValue(currentLine)
      crossSection.skewAngle = parseFloat(value.trim())
      index++
    } else {
      // If we don't recognize the line, skip it to avoid infinite loop
      console.error(`Unrecognized cross-section line: ${currentLine}`)
      index++
    }
  }

  return {
    data: crossSection,
    nextIndex: index,
  }
}

const parseLateralWeir = (lines: string[], currentIndex: number) => {
  let index = currentIndex

  const lw: LateralWeir = {
    position: 0,
    end: {
      param1: null,
      param2: null,
      param3: null,
      param4: 0,
    },
    distance: 0,
    twMultipleXS: 0,
    width: 0,
    coefficient: 0,
    waterSurfaceCriteria: false,
    flapGates: 0,
    hagesEquation: {
      param1: 0,
      param2: null,
      param3: null,
      param4: null,
      param5: null,
      param6: null,
    },
    slipeSlope: [0, 0],
    type: 0,
    stationElevation: [],
    centerline: [],
    headwaterConnections: [],
    tailwaterConnections: [],
    diversion: {
      useFlow: false,
      stationForOutletFlows: null,
      outletWidth: null,
      curvePoints: [],
    },
  }
  while (index < lines.length) {
    if (lines[index].startsWith("Lateral Weir Pos=")) {
      const { value } = parseKeyValue(lines[index])
      lw.position = parseInt(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir End=")) {
      const { value } = parseKeyValue(lines[index])
      const parts = parseCommaSeparated(value)

      lw.end.param1 = parts[0]
      lw.end.param2 = parts[1]
      lw.end.param3 = parts[2]
      lw.end.param4 = parts[3]
      index++
    } else if (lines[index].startsWith("Lateral Weir Distance=")) {
      const { value } = parseKeyValue(lines[index])
      lw.distance = parseFloat(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir TW Multiple XS=")) {
      const { value } = parseKeyValue(lines[index])
      lw.twMultipleXS = parseInt(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir WD=")) {
      const { value } = parseKeyValue(lines[index])
      lw.width = parseFloat(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir Coef=")) {
      const { value } = parseKeyValue(lines[index])
      lw.coefficient = parseFloat(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir WSCriteria=")) {
      const { value } = parseKeyValue(lines[index])
      lw.waterSurfaceCriteria = parseBoolean(value)
      index++
    } else if (lines[index].startsWith("Lateral Weir Flap Gates=")) {
      const { value } = parseKeyValue(lines[index])
      lw.flapGates = parseInt(value) as 0 | 1 | 2
      index++
    } else if (lines[index].startsWith("Lateral Weir Hagers EQN=")) {
      const { value } = parseKeyValue(lines[index])
      const parts = parseCommaSeparated(value)
      lw.hagesEquation.param1 = parseFloat(parts[0])
      lw.hagesEquation.param2 = parseMaybeFloat(parts[1])
      lw.hagesEquation.param3 = parseMaybeFloat(parts[2])
      lw.hagesEquation.param4 = parseMaybeFloat(parts[3])
      lw.hagesEquation.param5 = parseMaybeFloat(parts[4])
      lw.hagesEquation.param6 = parseMaybeFloat(parts[5])
      index++
    } else if (lines[index].startsWith("Lateral Weir SS=")) {
      // number?
    } else if (lines[index].startsWith("Lateral Weir Type=")) {
      // number?
    } else if (lines[index].startsWith("Lateral Weir Connection Pos and Dist=")) {
      // number?
    } else if (lines[index].startsWith("Lateral Weir SE=")) {
      // multiline
    } else if (lines[index].startsWith("Lateral Weir Centerline=")) {
      // csv
      const { value } = parseKeyValue(lines[index])
    } else if (lines[index].startsWith("Lateral Weir HW RS Station=")) {
      // number?
    } else if (lines[index].startsWith("Lateral Weir TW RS Station=")) {
      // number?
    }
  }
}
