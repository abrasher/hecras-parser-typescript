import type {
  BankStations,
  BridgeCoefficients,
  BridgeConfiguration,
  BridgeCrossSection,
  BridgePier,
  DeckParameters,
  DeckStationing,
  IneffectiveFlowArea,
  PressureWeirData,
} from "../models/geometry/bridge"
import { contextual, schema, type Infer } from "../schema"
import {
  serializeBridgeConfiguration,
  serializeBridgeCrossSection,
  serializeBridgeCoefficients,
  serializeBridgePier,
  serializeDeckParameters,
  serializeIneffectiveFlowArea,
  serializePressureWeirData,
} from "../serializers/geometry/bridgeSerializer"
import { formatMaybeNullorUndefined } from "../serializers/atomic"

const BRIDGE_CONFIGURATION_LABEL = "Conn BR: Bridge="
const PRESSURE_WEIR_LABEL = "Conn BR: Pressure-Weir="
const DECK_HEADER_LABEL =
  "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee"
const BRIDGE_SECTION_LABEL = "Conn BR: BR SE="
const BRIDGE_BANK_LABEL = "Conn BR: BR Bank Stations="
const BRIDGE_MANN_LABEL = "Conn BR: BR Mann="
const EXTERNAL_SECTION_LABEL = "Conn BR: XS SE="
const EXTERNAL_BANK_LABEL = "Conn BR: XS Bank Stations="
const EXTERNAL_MANN_LABEL = "Conn BR: XS Mann="
const BRIDGE_COEFFICIENTS_LABEL = "Conn BR: BR Coef="
const BRIDGE_SKEW_LABEL = "Conn BR: BR Skew="
const PIER_HEADER_LABEL = "Conn BR: Pier Skew, UpSta & Num, DnSta & Num="
const UPSTREAM_INEFFICIENT_LABEL = "Conn BR: USXS Ineff="
const DOWNSTREAM_INEFFICIENT_LABEL = "Conn BR: DSXS Ineff="

const FIXED_WIDTH = 8
const MAX_WIDTH = 80

type ContextualParserResult<T> = { value: T; nextIndex: number } | null

type Context = Record<string, unknown>

export const bridgeSchema = schema([
  contextual("bridge", parseBridgeConfiguration, (value, _ctx) =>
    value ? serializeBridgeConfiguration(value) : [],
  ),
  contextual("pressureWeir", parsePressureWeir, (value, _ctx) =>
    value ? serializePressureWeirData(value) : [],
  ),
  contextual("deckParameters", parseDeckParametersBlock, (value, _ctx) =>
    value ? serializeDeckParameters(value) : [],
  ),
  contextual(
    "insideUpstreamCrossSection",
    createCrossSectionParser("BR"),
    (value, _ctx) => (value ? serializeBridgeCrossSection(value, "BR") : []),
  ),
  contextual(
    "insideDownstreamCrossSection",
    createCrossSectionParser("BR"),
    (value, _ctx) => (value ? serializeBridgeCrossSection(value, "BR") : []),
  ),
  contextual("piers", parseBridgePiers, (value, _ctx) =>
    value && value.length > 0 ? value.flatMap((pier) => serializeBridgePier(pier)) : [],
  ),
  contextual("bridgeCoefficients", parseBridgeCoefficients, (value, _ctx) =>
    value ? serializeBridgeCoefficients(value) : [],
  ),
  contextual("bridgeSkew", parseBridgeSkew, (value, _ctx) =>
    value !== undefined ? [`${BRIDGE_SKEW_LABEL}${formatMaybeNullorUndefined(value)}`] : [],
  ),
  contextual(
    "externalUpstreamCrossSection",
    createCrossSectionParser("XS"),
    (value, _ctx) => (value ? serializeBridgeCrossSection(value, "XS") : []),
  ),
  contextual(
    "externalDownstreamCrossSection",
    createCrossSectionParser("XS"),
    (value, _ctx) => (value ? serializeBridgeCrossSection(value, "XS") : []),
  ),
  contextual(
    "upstreamIneffectiveFlowArea",
    createIneffectiveFlowAreaParser("USXS"),
    (value, _ctx) => (value ? serializeIneffectiveFlowArea(value, "USXS") : []),
  ),
  contextual(
    "downstreamIneffectiveFlowArea",
    createIneffectiveFlowAreaParser("DSXS"),
    (value, _ctx) => (value ? serializeIneffectiveFlowArea(value, "DSXS") : []),
  ),
])

export type BridgeSchema = Infer<typeof bridgeSchema>

function parseBridgeConfiguration(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<BridgeConfiguration> {
  const line = lines[startIndex]
  if (!line?.startsWith(BRIDGE_CONFIGURATION_LABEL)) {
    return null
  }

  const parts = splitCommaSeparated(line.slice(BRIDGE_CONFIGURATION_LABEL.length))
  if (parts.length < 7) {
    throw new Error("Bridge configuration line must include seven comma-separated values")
  }

  const configuration: BridgeConfiguration = {
    momentumEquationAddFriction: parseRequiredInt(parts[0], "momentumEquationAddFriction"),
    momentumEquationAddWeight: parseRequiredInt(parts[1], "momentumEquationAddWeight"),
    pressureFlowCriteria: parseRequiredInt(parts[2], "pressureFlowCriteria"),
    classBDefaults: parseRequiredInt(parts[3], "classBDefaults"),
    param5: parseRequiredInt(parts[4], "param5"),
    contractionCoefficient: parseOptionalFloat(parts[5]),
    expansionCoefficient: parseOptionalFloat(parts[6]),
  }

  return {
    value: configuration,
    nextIndex: startIndex + 1,
  }
}

function parsePressureWeir(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<PressureWeirData | undefined> {
  const line = lines[startIndex]
  if (!line?.startsWith(PRESSURE_WEIR_LABEL)) {
    return null
  }

  const parts = splitCommaSeparated(line.slice(PRESSURE_WEIR_LABEL.length))
  if (parts.length < 5) {
    throw new Error("Pressure weir line must include five comma-separated values")
  }

  const pressureWeir: PressureWeirData = {
    value1: parseOptionalFloat(parts[0]),
    value2: parseOptionalFloat(parts[1]),
    value3: parseOptionalFloat(parts[2]),
    value4: parseOptionalFloat(parts[3]),
    value5: parseOptionalFloat(parts[4]),
  }

  return {
    value: pressureWeir,
    nextIndex: startIndex + 1,
  }
}

function parseDeckParametersBlock(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<DeckParameters> {
  const headerLine = lines[startIndex]
  if (headerLine !== DECK_HEADER_LABEL) {
    return null
  }

  const paramsLine = lines[startIndex + 1]
  if (paramsLine === undefined) {
    throw new Error("Deck parameters block missing parameter values line")
  }

  const parts = splitCommaSeparated(paramsLine)
  if (parts.length < 14) {
    throw new Error("Deck parameters line must include fourteen comma-separated values")
  }

  const deck: DeckParameters = {
    deckDistance: parseRequiredFloat(parts[0], "deckDistance"),
    width: parseRequiredFloat(parts[1], "width"),
    weirCoefficient: parseRequiredFloat(parts[2], "weirCoefficient"),
    skew: parseRequiredFloat(parts[3], "skew"),
    numberOfUpstreamStations: parseRequiredInt(parts[4], "numberOfUpstreamStations"),
    numberOfDownstreamStations: parseRequiredInt(parts[5], "numberOfDownstreamStations"),
    minLowCoordinate: parseOptionalFloat(parts[6]),
    maxHighCoordinate: parseOptionalFloat(parts[7]),
    maxSubmerge: parseRequiredFloat(parts[8], "maxSubmerge"),
    isOgee: parseRequiredInt(parts[9], "isOgee"),
    upstreamEmbankmentSideSlope: parseOptionalFloat(parts[10]),
    downstreamEmbankmentSideSlope: parseOptionalFloat(parts[11]),
    spillwayApproachHeight: parseOptionalFloat(parts[12]),
    spillwayDesignHead: parseOptionalFloat(parts[13]),
    upstream: [],
    downstream: [],
  }

  let index = startIndex + 2
  const upstreamSection = parseDeckStationingSection(lines, index, deck.numberOfUpstreamStations)
  deck.upstream = upstreamSection.stationing
  index = upstreamSection.nextIndex

  const downstreamSection = parseDeckStationingSection(
    lines,
    index,
    deck.numberOfDownstreamStations,
  )
  deck.downstream = downstreamSection.stationing

  return {
    value: deck,
    nextIndex: downstreamSection.nextIndex,
  }
}

function parseDeckStationingSection(
  lines: string[],
  startIndex: number,
  count: number,
): { stationing: DeckStationing[]; nextIndex: number } {
  const stationsResult = readFixedWidthSegments(lines, startIndex, count)
  const stations = stationsResult.segments.map((value, idx) =>
    parseRequiredFloat(value, `deckStation-${idx}`),
  )

  const highChordResult = readFixedWidthSegments(lines, stationsResult.nextIndex, count)
  const highChords = highChordResult.segments.map((value, idx) =>
    parseRequiredFloat(value, `deckHighChord-${idx}`),
  )

  const lowChordResult = readFixedWidthSegments(lines, highChordResult.nextIndex, count)
  const lowChords = lowChordResult.segments.map((value) => parseOptionalFloat(value))

  const stationing: DeckStationing[] = []
  for (let i = 0; i < count; i++) {
    stationing.push({
      station: stations[i]!,
      highChord: highChords[i]!,
      lowChord: lowChords[i] ?? null,
    })
  }

  return {
    stationing,
    nextIndex: lowChordResult.nextIndex,
  }
}

function createCrossSectionParser(prefix: "BR" | "XS") {
  const sectionLabel = prefix === "BR" ? BRIDGE_SECTION_LABEL : EXTERNAL_SECTION_LABEL
  const bankLabel = prefix === "BR" ? BRIDGE_BANK_LABEL : EXTERNAL_BANK_LABEL
  const mannLabel = prefix === "BR" ? BRIDGE_MANN_LABEL : EXTERNAL_MANN_LABEL

  return (
    lines: string[],
    startIndex: number,
    _context: Context,
  ): ContextualParserResult<BridgeCrossSection> => {
    const headerLine = lines[startIndex]
    if (!headerLine?.startsWith(sectionLabel)) {
      return null
    }

    const headerParts = splitCommaSeparated(headerLine.slice(sectionLabel.length))
    if (headerParts.length < 2) {
      throw new Error(`Cross section header for ${prefix} must include id and point count`)
    }

    const id = parseRequiredInt(headerParts[0], `${prefix} cross section id`)
    const pointCount = parseRequiredInt(headerParts[1], `${prefix} cross section point count`)

    const pointData = readFixedWidthSegments(lines, startIndex + 1, pointCount * 2)
    const numbers = pointData.segments.map((value, idx) =>
      parseRequiredFloat(value, `${prefix} cross section point ${idx}`),
    )

    const points: [number, number][] = []
    for (let i = 0; i < numbers.length; i += 2) {
      points.push([numbers[i]!, numbers[i + 1]!])
    }

    const bankLine = lines[pointData.nextIndex]
    if (!bankLine?.startsWith(bankLabel)) {
      throw new Error(`Missing bank station line for ${prefix} cross section`)
    }
    const bankParts = splitCommaSeparated(bankLine.slice(bankLabel.length))
    if (bankParts.length < 3) {
      throw new Error(`Bank stations line for ${prefix} cross section requires three values`)
    }

    const bankStations: BankStations = {
      sectionId: parseRequiredInt(bankParts[0], `${prefix} bank section id`),
      leftBank: parseOptionalFloat(bankParts[1]) ?? NaN,
      rightBank: parseOptionalFloat(bankParts[2]) ?? NaN,
    }

    const mannHeader = lines[pointData.nextIndex + 1]
    if (!mannHeader?.startsWith(mannLabel)) {
      throw new Error(`Missing Manning coefficients line for ${prefix} cross section`)
    }

    const mannParts = splitCommaSeparated(mannHeader.slice(mannLabel.length))
    if (mannParts.length < 2) {
      throw new Error(`Manning header for ${prefix} cross section requires id and count`)
    }
    const manningCount = parseRequiredInt(mannParts[1], `${prefix} Manning count`)

    const mannData = readFixedWidthSegments(lines, pointData.nextIndex + 2, manningCount * 2)
    const manningNumbers = mannData.segments.map((value, idx) =>
      parseRequiredFloat(value, `${prefix} Manning ${idx}`),
    )

    const manningCoefficients: [number, number][] = []
    for (let i = 0; i < manningNumbers.length; i += 2) {
      manningCoefficients.push([manningNumbers[i]!, manningNumbers[i + 1]!])
    }

    return {
      value: {
        id,
        points,
        bankStations,
        manningCoefficients,
      },
      nextIndex: mannData.nextIndex,
    }
  }
}

function parseBridgePiers(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<BridgePier[] | undefined> {
  let index = startIndex
  const piers: BridgePier[] = []

  while (true) {
    const line = lines[index]
    if (!line?.startsWith(PIER_HEADER_LABEL)) {
      break
    }

    const { pier, nextIndex } = parseSinglePier(lines, index)
    piers.push(pier)
    index = nextIndex
  }

  if (piers.length === 0) {
    return { value: [], nextIndex: startIndex }
  }

  return { value: piers, nextIndex: index }
}

function parseSinglePier(lines: string[], startIndex: number): { pier: BridgePier; nextIndex: number } {
  const header = lines[startIndex]
  if (!header?.startsWith(PIER_HEADER_LABEL)) {
    throw new Error("Pier block must start with the pier header line")
  }

  const parts = splitCommaSeparated(header.slice(PIER_HEADER_LABEL.length))
  if (parts.length < 10) {
    throw new Error("Pier header must include ten comma-separated values")
  }

  const skew = parts[0]
  const upstreamCenter = parseRequiredFloat(parts[1], "pier upstream centerline")
  const upstreamCount = parseRequiredInt(parts[2], "pier upstream point count")
  const downstreamCenter = parseRequiredFloat(parts[3], "pier downstream centerline")
  const downstreamCount = parseRequiredInt(parts[4], "pier downstream point count")
  const debrisFlag = parseRequiredInt(parts[7], "pier debris flag")
  const debrisWidth = parseOptionalFloat(parts[8])
  const debrisHeight = parseOptionalFloat(parts[9])

  const upstreamWidths = readFixedWidthSegments(lines, startIndex + 1, upstreamCount)
  const upstreamWidthValues = upstreamWidths.segments.map((value, idx) =>
    parseRequiredFloat(value, `pier upstream width ${idx}`),
  )

  const upstreamElevations = readFixedWidthSegments(lines, upstreamWidths.nextIndex, upstreamCount)
  const upstreamElevationValues = upstreamElevations.segments.map((value, idx) =>
    parseRequiredFloat(value, `pier upstream elevation ${idx}`),
  )

  const downstreamWidths = readFixedWidthSegments(lines, upstreamElevations.nextIndex, downstreamCount)
  const downstreamWidthValues = downstreamWidths.segments.map((value, idx) =>
    parseRequiredFloat(value, `pier downstream width ${idx}`),
  )

  const downstreamElevations = readFixedWidthSegments(lines, downstreamWidths.nextIndex, downstreamCount)
  const downstreamElevationValues = downstreamElevations.segments.map((value, idx) =>
    parseRequiredFloat(value, `pier downstream elevation ${idx}`),
  )

  const upstreamPairs = upstreamWidthValues.map((width, idx) => ({
    width,
    elevation: upstreamElevationValues[idx]!,
  }))

  const downstreamPairs = downstreamWidthValues.map((width, idx) => ({
    width,
    elevation: downstreamElevationValues[idx]!,
  }))

  return {
    pier: {
      skew: skew === "" ? "" : skew,
      centerlineStationUpstream: upstreamCenter,
      centerlineStationDownstream: downstreamCenter,
      upstream: upstreamPairs,
      downstream: downstreamPairs,
      applyFloatingDebris: debrisFlag,
      debrisWidth: debrisWidth ?? null,
      debrisHeight: debrisHeight ?? null,
    },
    nextIndex: downstreamElevations.nextIndex,
  }
}

function parseBridgeCoefficients(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<BridgeCoefficients | undefined> {
  const line = lines[startIndex]
  if (!line?.startsWith(BRIDGE_COEFFICIENTS_LABEL)) {
    return null
  }

  const parts = splitCommaSeparated(line.slice(BRIDGE_COEFFICIENTS_LABEL.length))
  if (parts.length < 10) {
    throw new Error("Bridge coefficients line must include ten comma-separated values")
  }

  const coefficients: BridgeCoefficients = {
    coef1: parseRequiredInt(parts[0], "coef1"),
    coef2: parseRequiredInt(parts[1], "coef2"),
    coef3: parseRequiredInt(parts[2], "coef3"),
    coef4: parseOptionalInt(parts[3]),
    coef5: parseOptionalInt(parts[4]),
    coef6: null,
    coef7: parseRequiredFloat(parts[5], "coef7"),
    coef8: parseRequiredInt(parts[6], "coef8"),
    coef9: parseOptionalFloat(parts[7]),
    coef10: parseRequiredInt(parts[8], "coef10"),
    coef11: parseOptionalInt(parts[9]),
  }

  return {
    value: coefficients,
    nextIndex: startIndex + 1,
  }
}

function parseBridgeSkew(
  lines: string[],
  startIndex: number,
  _context: Context,
): ContextualParserResult<number | null | undefined> {
  const line = lines[startIndex]
  if (!line?.startsWith(BRIDGE_SKEW_LABEL)) {
    return null
  }

  const raw = line.slice(BRIDGE_SKEW_LABEL.length).trim()
  if (raw === "") {
    return { value: null, nextIndex: startIndex + 1 }
  }

  const skew = parseInt(raw, 10)
  if (Number.isNaN(skew)) {
    throw new Error(`Invalid numeric value for bridge skew: ${raw}`)
  }

  return {
    value: skew,
    nextIndex: startIndex + 1,
  }
}

function createIneffectiveFlowAreaParser(prefix: "USXS" | "DSXS") {
  const label = prefix === "USXS" ? UPSTREAM_INEFFICIENT_LABEL : DOWNSTREAM_INEFFICIENT_LABEL
  return (
    lines: string[],
    startIndex: number,
    _context: Context,
  ): ContextualParserResult<IneffectiveFlowArea | undefined> => {
    const line = lines[startIndex]
    if (!line?.startsWith(label)) {
      return null
    }

    const parts = splitCommaSeparated(line.slice(label.length))
    if (parts.length < 4) {
      throw new Error(`Ineffective flow area line for ${prefix} requires four values`)
    }

    return {
      value: {
        leftStation: parseRequiredFloat(parts[0], `${prefix} leftStation`),
        leftElevation: parseRequiredFloat(parts[1], `${prefix} leftElevation`),
        rightStation: parseRequiredFloat(parts[2], `${prefix} rightStation`),
        rightElevation: parseRequiredFloat(parts[3], `${prefix} rightElevation`),
      },
      nextIndex: startIndex + 1,
    }
  }
}

function readFixedWidthSegments(
  lines: string[],
  startIndex: number,
  count: number,
): { segments: string[]; nextIndex: number } {
  const segments: string[] = []
  let index = startIndex

  while (segments.length < count) {
    const line = lines[index]
    if (line === undefined) {
      throw new Error("Unexpected end of input while reading fixed-width segments")
    }

    const limit = Math.min(line.length, MAX_WIDTH)
    for (let offset = 0; offset < limit && segments.length < count; offset += FIXED_WIDTH) {
      const slice = line.slice(offset, offset + FIXED_WIDTH)
      segments.push(slice.trim())
    }

    index += 1
  }

  if (segments.length < count) {
    throw new Error(`Expected ${count} segments but parsed ${segments.length}`)
  }

  return { segments, nextIndex: index }
}

function splitCommaSeparated(value: string): string[] {
  return value.split(",").map((segment) => segment.trim())
}

function parseRequiredInt(value: string, label: string): number {
  const trimmed = value.trim()
  if (trimmed === "") {
    throw new Error(`Missing integer value for ${label}`)
  }
  const parsed = parseInt(trimmed, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer value for ${label}: ${value}`)
  }
  return parsed
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === "") {
    return null
  }
  const parsed = parseInt(trimmed, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid optional integer value: ${value}`)
  }
  return parsed
}

function parseRequiredFloat(value: string, label: string): number {
  const trimmed = value.trim()
  if (trimmed === "") {
    throw new Error(`Missing numeric value for ${label}`)
  }
  const parsed = Number.parseFloat(trimmed)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${label}: ${value}`)
  }
  return parsed
}

function parseOptionalFloat(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === "") {
    return null
  }
  const parsed = Number.parseFloat(trimmed)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid optional numeric value: ${value}`)
  }
  return parsed
}
