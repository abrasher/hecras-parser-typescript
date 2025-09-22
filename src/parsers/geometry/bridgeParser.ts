import {
  parseCommaSeparated,
  parseKeyValue,
  parseMaybeFloat,
  splitIntoTuples,
  parseMultilineArray,
} from "../utils"
import type {
  BridgeConnection,
  BridgeConfiguration,
  PressureWeirData,
  DeckParameters,
  DeckStationing,
  BridgeCrossSection,
  BridgeCoefficients,
  IneffectiveFlowArea,
  BankStations,
  BridgePier,
} from "../../models/geometry/bridge"
import { zip } from "es-toolkit"

/**
 * Parses bridge connection data starting from a "Conn BR: Bridge=" line
 * Handles the full bridge connection with all its components
 */
export function parseBridgeData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: BridgeConnection; nextIndex: number } {
  if (!line.startsWith("Conn BR: Bridge=")) {
    throw new Error(`bridgeParser was given a line it can't parse: ${line}`)
  }

  // Initialize bridge connection with empty values
  const bridgeConnection: BridgeConnection = {
    bridge: {} as BridgeConfiguration,
    deckParameters: {} as DeckParameters,
    insideUpstreamCrossSection: {} as BridgeCrossSection,
    insideDownstreamCrossSection: {} as BridgeCrossSection,
    externalUpstreamCrossSection: {} as BridgeCrossSection,
    externalDownstreamCrossSection: {} as BridgeCrossSection,
    upstreamIneffectiveFlowArea: {} as IneffectiveFlowArea,
    downstreamIneffectiveFlowArea: {} as IneffectiveFlowArea,
    piers: [],
  }

  let index = currentIndex

  // Parse the bridge connection starting from the first line
  while (index < lines.length && isBridgeLine(lines[index])) {
    const currentLine = lines[index]

    if (currentLine.startsWith("Conn BR: Bridge=")) {
      bridgeConnection.bridge = parseBridgeConfiguration(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: Pressure-Weir=")) {
      bridgeConnection.pressureWeir = parsePressureWeir(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn")) {
      const { data, nextIndex } = parseDeckParameters(lines, index)
      bridgeConnection.deckParameters = data
      index = nextIndex
    } else if (currentLine.startsWith("Conn BR: BR SE=")) {
      const { data, nextIndex } = parseBridgeSection(lines, index)
      if (data.id === 1) {
        bridgeConnection.insideUpstreamCrossSection = data
      } else if (data.id === 2) {
        bridgeConnection.insideDownstreamCrossSection = data
      }
      index = nextIndex
    } else if (currentLine.startsWith("Conn BR: BR Coef=")) {
      bridgeConnection.bridgeCoefficients = parseBridgeCoefficients(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: BR Skew=")) {
      bridgeConnection.bridgeSkew = parseBridgeSkew(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: XS SE=")) {
      const { data, nextIndex } = parseCrossSection(lines, index)
      if (data.id === 1) {
        bridgeConnection.externalUpstreamCrossSection = data
      } else if (data.id === 2) {
        bridgeConnection.externalDownstreamCrossSection = data
      }
      index = nextIndex
    } else if (currentLine.startsWith("Conn BR: USXS Ineff=")) {
      bridgeConnection.upstreamIneffectiveFlowArea = parseIneffectiveFlowArea(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: DSXS Ineff=")) {
      bridgeConnection.downstreamIneffectiveFlowArea = parseIneffectiveFlowArea(currentLine)
      index++
    } else if (currentLine.startsWith("Conn BR: Pier Skew, UpSta & Num, DnSta & Num=")) {
      const { data, nextIndex } = parsePier(lines, index)
      bridgeConnection.piers!.push(data)
      index = nextIndex
    } else {
      index++
    }
  }

  return { data: bridgeConnection, nextIndex: index }
}

function isBridgeLine(line: string): boolean {
  return line?.startsWith("Conn BR:")
}

function parseBridgeConfiguration(line: string): BridgeConfiguration {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  return {
    momentumEquationAddFriction: parseInt(parts[0]),
    momentumEquationAddWeight: parseInt(parts[1]),
    pressureFlowCriteria: parseInt(parts[2]),
    classBDefaults: parseInt(parts[3]),
    param5: parseInt(parts[4]),
    contractionCoefficient: parseMaybeFloat(parts[5]),
    expansionCoefficient: parseMaybeFloat(parts[6]),
  }
}

function parsePressureWeir(line: string): PressureWeirData {
  const { value } = parseKeyValue(line)
  const [value1, value2, value3, value4, value5] = parseCommaSeparated(value).map(parseMaybeFloat)

  return {
    value1,
    value2,
    value3,
    value4,
    value5,
  }
}

// Constants for deck parameter parsing
const DECK_PARSING_CONSTANTS = {
  WIDTH_PER_POINT: 8,
  MAX_POINTS_PER_LINE: 10, // 80 chars / 8 chars per point
} as const

/**
 * Parse a section of deck parameters (stations, high chords, low chords)
 */
function parseDeckSection(
  lines: string[],
  startIndex: number,
  numberOfStations: number,
  widthPerPoint: number,
  maxPointsPerLine: number,
): { stations: number[]; highChords: number[]; lowChords: (number | null)[]; nextIndex: number } {
  let index = startIndex
  const maxWidth = widthPerPoint * maxPointsPerLine

  const { data: stationData, nextIndex: stationNextIndex } = parseMultilineArray({
    width: widthPerPoint,
    maxWidth,
    numOfEntries: numberOfStations,
    currentIndex: index,
    lines,
  })
  const stations = stationData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing station value: ${value}`)
      }
      return parsed
    })
  if (stations.length !== numberOfStations) {
    throw new Error(
      `Expected ${numberOfStations} station values but parsed ${stations.length} while reading deck section`,
    )
  }
  index = stationNextIndex

  const { data: highChordData, nextIndex: highChordNextIndex } = parseMultilineArray({
    width: widthPerPoint,
    maxWidth,
    numOfEntries: numberOfStations,
    currentIndex: index,
    lines,
  })
  const highChords = highChordData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing high chord value: ${value}`)
      }
      return parsed
    })
  if (highChords.length !== numberOfStations) {
    throw new Error(
      `Expected ${numberOfStations} high chord values but parsed ${highChords.length} while reading deck section`,
    )
  }
  index = highChordNextIndex

  const { data: lowChordData, nextIndex: nextLowChordIndex } = parseMultilineArray({
    width: widthPerPoint,
    maxWidth,
    numOfEntries: numberOfStations,
    currentIndex: index,
    lines,
  })

  const lowChords = lowChordData.map((value) => parseMaybeFloat(value))
  index = nextLowChordIndex

  return { stations, highChords, lowChords, nextIndex: index }
}

/**
 * Build array of DeckStationing objects from parsed arrays
 */
function buildDeckStationingArray(
  stations: number[],
  highChords: number[],
  lowChords: (number | null)[],
): DeckStationing[] {
  const result: DeckStationing[] = []
  for (let i = 0; i < stations.length; i++) {
    result.push({
      station: stations[i],
      highChord: highChords[i],
      lowChord: lowChords[i],
    })
  }
  return result
}

export function parsePier(
  lines: string[],
  startIndex: number,
): { data: BridgePier; nextIndex: number } {
  let index = startIndex

  const [
    skew,
    upstreamCenter,
    upstreamPoints,
    downstreamCenter,
    downstreamPoints,
    _unknown1,
    _unknown2,
    debrisEnabled,
    debrisWidth,
    debrisHeight,
  ] = parseCommaSeparated(parseKeyValue(lines[index]).value)

  index++

  const upstreamPointCount = parseInt(upstreamPoints) || 0
  const downstreamPointCount = parseInt(downstreamPoints) || 0

  const { data: upstreamWidthData, nextIndex: upstreamWidthNext } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: upstreamPointCount,
    currentIndex: index,
    lines,
  })
  const upstreamWidths = upstreamWidthData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing upstream width: ${value}`)
      }
      return parsed
    })
  if (upstreamWidths.length !== upstreamPointCount) {
    throw new Error(
      `Expected ${upstreamPointCount} upstream widths but parsed ${upstreamWidths.length} while reading pier data`,
    )
  }
  index = upstreamWidthNext

  const { data: upstreamElevationData, nextIndex: upstreamElevationNext } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: upstreamPointCount,
    currentIndex: index,
    lines,
  })
  const upstreamElevations = upstreamElevationData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing upstream elevation: ${value}`)
      }
      return parsed
    })
  if (upstreamElevations.length !== upstreamPointCount) {
    throw new Error(
      `Expected ${upstreamPointCount} upstream elevations but parsed ${upstreamElevations.length} while reading pier data`,
    )
  }
  index = upstreamElevationNext

  const { data: downstreamWidthData, nextIndex: downstreamWidthNext } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: downstreamPointCount,
    currentIndex: index,
    lines,
  })
  const downstreamWidths = downstreamWidthData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing downstream width: ${value}`)
      }
      return parsed
    })
  if (downstreamWidths.length !== downstreamPointCount) {
    throw new Error(
      `Expected ${downstreamPointCount} downstream widths but parsed ${downstreamWidths.length} while reading pier data`,
    )
  }
  index = downstreamWidthNext

  const { data: downstreamElevationData, nextIndex: downstreamElevationNext } = parseMultilineArray(
    {
      width: 8,
      maxWidth: 80,
      numOfEntries: downstreamPointCount,
      currentIndex: index,
      lines,
    },
  )
  const downstreamElevations = downstreamElevationData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing downstream elevation: ${value}`)
      }
      return parsed
    })
  if (downstreamElevations.length !== downstreamPointCount) {
    throw new Error(
      `Expected ${downstreamPointCount} downstream elevations but parsed ${downstreamElevations.length} while reading pier data`,
    )
  }
  index = downstreamElevationNext

  const upstream = zip(upstreamWidths, upstreamElevations).map(([width, elevation]) => ({
    width,
    elevation,
  }))
  const downstream = zip(downstreamWidths, downstreamElevations).map(([width, elevation]) => ({
    width,
    elevation,
  }))

  return {
    data: {
      skew,
      centerlineStationUpstream: parseFloat(upstreamCenter),
      centerlineStationDownstream: parseFloat(downstreamCenter),
      upstream,
      downstream,
      applyFloatingDebris: parseInt(debrisEnabled),
      debrisWidth: debrisWidth === "" ? null : parseFloat(debrisWidth),
      debrisHeight: debrisHeight === "" ? null : parseFloat(debrisHeight),
    },
    nextIndex: index,
  }
}

function parseDeckParameters(
  lines: string[],
  startIndex: number,
): { data: DeckParameters; nextIndex: number } {
  // Skip the header line
  let index = startIndex + 1
  const paramsLine = lines[index]
  const parts = parseCommaSeparated(paramsLine)

  const deckParams = {
    deckDistance: parseFloat(parts[0]),
    width: parseFloat(parts[1]),
    weirCoefficient: parseFloat(parts[2]),
    skew: parseFloat(parts[3]),
    numberOfUpstreamStations: parseInt(parts[4]),
    numberOfDownstreamStations: parseInt(parts[5]),
    minLowCoordinate: parseMaybeFloat(parts[6]),
    maxHighCoordinate: parseMaybeFloat(parts[7]),
    maxSubmerge: parseFloat(parts[8]),
    isOgee: parseInt(parts[9]),
    upstreamEmbankmentSideSlope: parseMaybeFloat(parts[10]),
    downstreamEmbankmentSideSlope: parseMaybeFloat(parts[11]),
    spillwayApproachHeight: parseMaybeFloat(parts[12]),
    spillwayDesignHead: parseMaybeFloat(parts[13]),
    upstream: [],
    downstream: [],
  } as DeckParameters

  index++

  // Parse upstream deck parameters using extracted utility
  const upstreamResult = parseDeckSection(
    lines,
    index,
    deckParams.numberOfUpstreamStations,
    DECK_PARSING_CONSTANTS.WIDTH_PER_POINT,
    DECK_PARSING_CONSTANTS.MAX_POINTS_PER_LINE,
  )
  deckParams.upstream = buildDeckStationingArray(
    upstreamResult.stations,
    upstreamResult.highChords,
    upstreamResult.lowChords,
  )
  index = upstreamResult.nextIndex

  // Parse downstream deck parameters using extracted utility
  const downstreamResult = parseDeckSection(
    lines,
    index,
    deckParams.numberOfDownstreamStations,
    DECK_PARSING_CONSTANTS.WIDTH_PER_POINT,
    DECK_PARSING_CONSTANTS.MAX_POINTS_PER_LINE,
  )
  deckParams.downstream = buildDeckStationingArray(
    downstreamResult.stations,
    downstreamResult.highChords,
    downstreamResult.lowChords,
  )

  return { data: deckParams, nextIndex: downstreamResult.nextIndex }
}

function parseBridgeSection(
  lines: string[],
  startIndex: number,
): { data: BridgeCrossSection; nextIndex: number } {
  const headerLine = lines[startIndex]

  const { value } = parseKeyValue(headerLine)
  const [id, numberOfPoints] = parseCommaSeparated(value).map((s) => parseInt(s))

  let index = startIndex + 1

  const pointsPerEntry = 2
  const { data, nextIndex: nextIndex1 } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const dataAsFloats = data.map((value) => parseFloat(value))
  const points = splitIntoTuples(dataAsFloats, 2)

  index = nextIndex1

  // Parse bank stations
  const bankStationsLine = lines[index]
  const bankStations = parseBankStations(bankStationsLine)
  index++

  // Parse Manning coefficients
  const { data: manningCoefficients, nextIndex } = parseManningCoefficients(lines, index)
  index = nextIndex

  return {
    data: {
      id,
      points,
      bankStations,
      manningCoefficients,
    },
    nextIndex: index,
  }
}

function parseCrossSection(
  lines: string[],
  startIndex: number,
): { data: BridgeCrossSection; nextIndex: number } {
  const headerLine = lines[startIndex]

  const { value } = parseKeyValue(headerLine)
  const [id, numberOfPoints] = parseCommaSeparated(value).map((s) => parseInt(s))

  let index = startIndex + 1

  const pointsPerEntry = 2
  const { data, nextIndex: nextIndex1 } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const dataAsFloats = data.map((value) => parseFloat(value))
  const points = splitIntoTuples(dataAsFloats, 2)

  index = nextIndex1

  // Parse bank stations
  const bankStationsLine = lines[index]
  const bankStations = parseBankStations(bankStationsLine)
  index++

  // Parse Manning coefficients
  const { data: manningCoefficients, nextIndex } = parseManningCoefficients(lines, index)
  index = nextIndex

  return {
    data: {
      id,
      points,
      bankStations,
      manningCoefficients,
    },
    nextIndex: index,
  }
}

function parseBankStations(line: string): BankStations {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  return {
    sectionId: parseInt(parts[0]),
    leftBank: parts[1] === "" ? NaN : parseFloat(parts[1]),
    rightBank: parts[2] === "" ? NaN : parseFloat(parts[2]),
  }
}

function parseManningCoefficients(
  lines: string[],
  startIndex: number,
): { data: [number, number][]; nextIndex: number } {
  const headerLine = lines[startIndex]

  const { value } = parseKeyValue(headerLine)
  const [_id, numberOfPoints] = parseCommaSeparated(value).map((s) => parseInt(s))

  const index = startIndex + 1

  const pointsPerEntry = 2
  const { data, nextIndex } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const dataAsFloats = data.map((value) => parseFloat(value))
  const points = splitIntoTuples(dataAsFloats, 2)

  return {
    data: points,
    nextIndex,
  }
}

function parseBridgeCoefficients(line: string): BridgeCoefficients {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  return {
    coef1: parseInt(parts[0]), // -1
    coef2: parseInt(parts[1]), // 0
    coef3: parseInt(parts[2]), // 0
    coef4: parts[3] === "" ? null : parseInt(parts[3]), // null (empty)
    coef5: parts[4] === "" ? null : parseInt(parts[4]), // null (empty)
    coef6: null, // always null based on expected
    coef7: parseFloat(parts[5]), // 0.8 (from parts[5])
    coef8: parseInt(parts[6]), // 0 (from parts[6])
    coef9: parts[7] === "" ? null : parseFloat(parts[7]), // 1.2
    coef10: parseInt(parts[8]), // 0 (from parts[8])
    coef11: parts[9] === "" ? null : parseInt(parts[9]), // null (empty)
  }
}

function parseBridgeSkew(line: string): number {
  const { value } = parseKeyValue(line)
  return parseInt(value)
}

function parseIneffectiveFlowArea(line: string): IneffectiveFlowArea {
  const { value } = parseKeyValue(line)
  const parts = parseCommaSeparated(value)

  return {
    leftStation: parseFloat(parts[0]),
    leftElevation: parseFloat(parts[1]),
    rightStation: parseFloat(parts[2]),
    rightElevation: parseFloat(parts[3]),
  }
}
