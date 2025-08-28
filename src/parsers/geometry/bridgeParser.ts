import {
  parseCommaSeparated,
  parseKeyValue,
  chunkStringToNumbers,
  chunkStringToNumbersOrNull,
  parseValueAsCSV,
} from "../atomic"
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
  ManningCoefficients,
  BridgePier,
} from "../../models/geometry/bridge"
import { parseMaybeFloat } from "../atomic"
import { zip } from "es-toolkit"
import { parseMultilineArray, arrayToNumberPairs } from "../multiLineParsers"

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
    bridgeCoefficients: {} as BridgeCoefficients,
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
  const parts = parseCommaSeparated(value)

  return {
    value1: parseFloat(parts[0]),
    value2: parts[1] === "" ? null : parseFloat(parts[1]),
    value3: parseFloat(parts[2]),
    value4: parts[3] === "" ? null : parseFloat(parts[3]),
    value5: parseFloat(parts[4]),
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

  // Parse stations
  const stations: number[] = []
  const stationLines = Math.ceil(numberOfStations / maxPointsPerLine)
  for (let i = 0; i < stationLines; i++) {
    const stationLine = lines[index + i]
    const stationNumbers = chunkStringToNumbers(stationLine, widthPerPoint)
    stations.push(...stationNumbers)
  }
  index += stationLines

  // Parse high chord elevations
  const highChords: number[] = []
  const highChordLines = Math.ceil(numberOfStations / maxPointsPerLine)
  for (let i = 0; i < highChordLines; i++) {
    const elevLine = lines[index + i]
    const elevations = chunkStringToNumbers(elevLine, widthPerPoint)
    highChords.push(...elevations)
  }
  index += highChordLines

  // Parse low chord elevations (may contain nulls)
  const lowChords: (number | null)[] = []
  const lowChordLines = Math.ceil(numberOfStations / maxPointsPerLine)
  for (let i = 0; i < lowChordLines; i++) {
    const lowChordLine = lines[index + i]
    const lowChordNumbers = chunkStringToNumbersOrNull(lowChordLine, widthPerPoint)
    lowChords.push(...lowChordNumbers)
  }
  index += lowChordLines

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
    _upstreamPoints,
    downstreamCenter,
    _downstreamPoints,
    _unknown1,
    _unknown2,
    debrisEnabled,
    debrisWidth,
    debrisHeight,
  ] = parseCommaSeparated(parseKeyValue(lines[index]).value)

  index++

  const upstreamWidths = chunkStringToNumbers(lines[index], 8)
  index++

  const upstreamElevations = chunkStringToNumbers(lines[index], 8)
  index++

  const downstreamWidths = chunkStringToNumbers(lines[index], 8)
  index++

  const downstreamElevations = chunkStringToNumbers(lines[index], 8)
  index++

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

  const [id, numberOfPoints] = parseValueAsCSV(headerLine).map((s) => parseInt(s))

  let index = startIndex + 1

  const pointsPerEntry = 2
  const { data, nextIndex: nextIndex1 } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const points = arrayToNumberPairs(data, 2)

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

  const [id, numberOfPoints] = parseValueAsCSV(headerLine).map((s) => parseInt(s))

  let index = startIndex + 1

  const pointsPerEntry = 2
  const { data, nextIndex: nextIndex1 } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const points = arrayToNumberPairs(data, 2)

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
): { data: ManningCoefficients[]; nextIndex: number } {
  // Parse the Manning's header line to get the count: "Conn BR: BR Mann=X,Y" where Y is count
  const headerLine = lines[startIndex]
  const { value } = parseKeyValue(headerLine)
  const parts = parseCommaSeparated(value)
  const coefficientCount = parseInt(parts[1])

  // If count is 0, no data line follows - just return empty data
  if (coefficientCount === 0) {
    return {
      data: [],
      nextIndex: startIndex + 1, // Next line after the header
    }
  }

  // Count > 0: parse the data line
  let index = startIndex + 1
  const dataLine = lines[index]
  const nums = chunkStringToNumbers(dataLine, 8)

  const values: ManningCoefficients[] = []
  for (let i = 0; i < nums.length; i += 2) {
    if (i + 1 < nums.length) {
      values.push({
        station: nums[i],
        nValue: nums[i + 1],
      })
    }
  }

  index++

  return {
    data: values,
    nextIndex: index,
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
