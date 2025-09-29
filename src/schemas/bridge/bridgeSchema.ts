import { chunk } from "es-toolkit"
import {
  parseCommaSeparated,
  parseKeyValue,
  parseMaybeFloat,
  parseMultilineArray,
  splitIntoTuples,
} from "../../parsers/utils"
import type { Infer } from "../../schema"
import { schema, contextual, numberField, repeat, startsWith } from "../../schema"
import {
  formatFixedWidth,
  formatHECRASStationNumber,
  formatStationElevationPairs,
} from "../../schema/serializationUtils"
import { pierSchema } from "./pierSchema"

const DECK_HEADER =
  "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee"
const FIXED_WIDTH = 8
const MAX_WIDTH = 80
const VALUES_PER_LINE = MAX_WIDTH / FIXED_WIDTH

const bridgeConfigField = contextual(
  "bridge",
  (lines, startIndex) => {
    const line = lines[startIndex]
    if (!line || !line.startsWith("Conn BR: Bridge=")) {
      return undefined
    }

    const { value } = parseKeyValue(line)
    const parts = parseCommaSeparated(value)
    while (parts.length < 7) {
      parts.push("")
    }

    const bridge = {
      momentumEquationAddFriction: parseInt(parts[0] ?? "0", 10) || 0,
      momentumEquationAddWeight: parseInt(parts[1] ?? "0", 10) || 0,
      pressureFlowCriteria: parseInt(parts[2] ?? "0", 10) || 0,
      classBDefaults: parseInt(parts[3] ?? "0", 10) || 0,
      param5: parseInt(parts[4] ?? "0", 10) || 0,
      contractionCoefficient: parseMaybeFloat(parts[5]),
      expansionCoefficient: parseMaybeFloat(parts[6]),
    }

    return { value: bridge, nextIndex: startIndex + 1 }
  },
  (bridge) => {
    if (!bridge) {
      return []
    }

    const values = [
      bridge.momentumEquationAddFriction,
      bridge.momentumEquationAddWeight,
      bridge.pressureFlowCriteria,
      bridge.classBDefaults,
      ` ${bridge.param5} `,
      bridge.contractionCoefficient ?? "",
      bridge.expansionCoefficient ?? "",
    ]

    return [`Conn BR: Bridge=${values.join(",")}`]
  },
)

const pressureWeirField = contextual(
  "pressureWeir",
  (lines, startIndex) => {
    const line = lines[startIndex]
    if (!line || !line.startsWith("Conn BR: Pressure-Weir=")) {
      return undefined
    }

    const { value } = parseKeyValue(line)
    const parts = parseCommaSeparated(value)
    while (parts.length < 5) {
      parts.push("")
    }

    const pressureWeir = {
      value1: parseMaybeFloat(parts[0]),
      value2: parseMaybeFloat(parts[1]),
      value3: parseMaybeFloat(parts[2]),
      value4: parseMaybeFloat(parts[3]),
      value5: parseMaybeFloat(parts[4]),
    }

    return { value: pressureWeir, nextIndex: startIndex + 1 }
  },
  (pressureWeir) => {
    if (!pressureWeir) {
      return []
    }

    const values = [
      pressureWeir.value1 ?? "",
      pressureWeir.value2 ?? "",
      pressureWeir.value3 ?? "",
      pressureWeir.value4 ?? "",
      pressureWeir.value5 ?? "",
    ]

    return [`Conn BR: Pressure-Weir=${values.join(",")}`]
  },
)

function parseFixedWidthBlock(
  lines: string[],
  startIndex: number,
  count: number,
  { allowNull }: { allowNull?: boolean } = {},
): { values: (number | null)[]; nextIndex: number } {
  if (count === 0) {
    return { values: [], nextIndex: startIndex }
  }

  const { data, nextIndex } = parseMultilineArray({
    lines,
    width: FIXED_WIDTH,
    maxWidth: MAX_WIDTH,
    numOfEntries: count,
    currentIndex: startIndex,
  })

  const values = data.map((segment) => {
    if (segment === undefined || segment.trim() === "") {
      if (allowNull) {
        return null
      }
      throw new Error("Expected deck value but found blank segment")
    }

    const numeric = parseFloat(segment)
    if (Number.isNaN(numeric)) {
      if (allowNull) {
        return null
      }
      throw new Error(`Invalid deck value: ${segment}`)
    }
    return numeric
  })

  return { values, nextIndex }
}

function buildDeckStationing(
  stations: number[],
  highChords: number[],
  lowChords: (number | null)[],
): { station: number; highChord: number; lowChord: number | null }[] {
  return stations.map((station, index) => ({
    station,
    highChord: highChords[index],
    lowChord: lowChords[index] ?? null,
  }))
}

function formatDeckValues(values: readonly (number | null)[]): string[] {
  const lines: string[] = []

  chunk(values, VALUES_PER_LINE).forEach((group) => {
    const formatted = group
      .map((value) =>
        value === null
          ? "        "
          : formatFixedWidth(formatHECRASStationNumber(value), FIXED_WIDTH),
      )
      .join("")
    lines.push(formatted)
  })

  return lines
}

function formatDeckSection(
  upstream: readonly { station: number; highChord: number; lowChord: number | null }[],
  downstream: readonly { station: number; highChord: number; lowChord: number | null }[],
): string[] {
  const lines: string[] = []

  lines.push(...formatDeckValues(upstream.map((entry) => entry.station)))
  lines.push(...formatDeckValues(upstream.map((entry) => entry.highChord)))
  lines.push(...formatDeckValues(upstream.map((entry) => entry.lowChord)))

  lines.push(...formatDeckValues(downstream.map((entry) => entry.station)))
  lines.push(...formatDeckValues(downstream.map((entry) => entry.highChord)))
  lines.push(...formatDeckValues(downstream.map((entry) => entry.lowChord)))

  return lines
}

const deckField = contextual(
  "deckParameters",
  (lines, startIndex) => {
    const header = lines[startIndex]
    if (!header || !header.startsWith(DECK_HEADER)) {
      return undefined
    }

    const paramsLine = lines[startIndex + 1] ?? ""
    const parts = parseCommaSeparated(paramsLine)
    while (parts.length < 14) {
      parts.push("")
    }

    const numberOfUpstreamStations = parseInt(parts[4] ?? "0", 10) || 0
    const numberOfDownstreamStations = parseInt(parts[5] ?? "0", 10) || 0

    let index = startIndex + 2

    const upstreamStationsResult = parseFixedWidthBlock(lines, index, numberOfUpstreamStations)
    index = upstreamStationsResult.nextIndex
    const upstreamHighChordsResult = parseFixedWidthBlock(lines, index, numberOfUpstreamStations)
    index = upstreamHighChordsResult.nextIndex
    const upstreamLowChordsResult = parseFixedWidthBlock(lines, index, numberOfUpstreamStations, {
      allowNull: true,
    })
    index = upstreamLowChordsResult.nextIndex

    const downstreamStationsResult = parseFixedWidthBlock(lines, index, numberOfDownstreamStations)
    index = downstreamStationsResult.nextIndex
    const downstreamHighChordsResult = parseFixedWidthBlock(lines, index, numberOfDownstreamStations)
    index = downstreamHighChordsResult.nextIndex
    const downstreamLowChordsResult = parseFixedWidthBlock(lines, index, numberOfDownstreamStations, {
      allowNull: true,
    })
    index = downstreamLowChordsResult.nextIndex

    const deck = {
      deckDistance: parseFloat(parts[0] ?? "0"),
      width: parseFloat(parts[1] ?? "0"),
      weirCoefficient: parseFloat(parts[2] ?? "0"),
      skew: parseFloat(parts[3] ?? "0"),
      numberOfUpstreamStations,
      numberOfDownstreamStations,
      minLowCoordinate: parseMaybeFloat(parts[6]),
      maxHighCoordinate: parseMaybeFloat(parts[7]),
      maxSubmerge: parseFloat(parts[8] ?? "0"),
      isOgee: parseInt(parts[9] ?? "0", 10) || 0,
      upstreamEmbankmentSideSlope: parseMaybeFloat(parts[10]),
      downstreamEmbankmentSideSlope: parseMaybeFloat(parts[11]),
      spillwayApproachHeight: parseMaybeFloat(parts[12]),
      spillwayDesignHead: parseMaybeFloat(parts[13]),
      upstream: buildDeckStationing(
        upstreamStationsResult.values as number[],
        upstreamHighChordsResult.values as number[],
        upstreamLowChordsResult.values,
      ),
      downstream: buildDeckStationing(
        downstreamStationsResult.values as number[],
        downstreamHighChordsResult.values as number[],
        downstreamLowChordsResult.values,
      ),
    }

    return { value: deck, nextIndex: index }
  },
  (deck) => {
    if (!deck) {
      return []
    }

    const params = [
      Number.isNaN(deck.deckDistance) ? "" : deck.deckDistance,
      deck.width,
      deck.weirCoefficient,
      deck.skew,
      ` ${deck.numberOfUpstreamStations}`,
      ` ${deck.numberOfDownstreamStations}`,
      ` ${deck.minLowCoordinate ?? ""}`,
      ` ${deck.maxHighCoordinate ?? ""}`,
      ` ${deck.maxSubmerge}`,
      ` ${deck.isOgee}`,
      ` ${deck.upstreamEmbankmentSideSlope ?? 0}`,
      `${deck.downstreamEmbankmentSideSlope ?? 0}`,
      `${deck.spillwayApproachHeight ?? ""}`,
      `${deck.spillwayDesignHead ?? ""}`,
    ]

    return [DECK_HEADER, params.join(","), ...formatDeckSection(deck.upstream, deck.downstream)]
  },
)

const xsField = <Key extends string>(field: Key, prefix: "BR" | "XS") =>
  contextual(
    field,
    (lines, startIndex) => {
      const headerLine = lines[startIndex]
      if (!headerLine || !headerLine.startsWith(`Conn BR: ${prefix} SE=`)) {
        return undefined
      }

      const { value } = parseKeyValue(headerLine)
      const [idSegment, countSegment] = parseCommaSeparated(value)
      const id = parseInt(idSegment ?? "0", 10) || 0
      const numberOfPoints = parseInt(countSegment ?? "0", 10) || 0

      let index = startIndex + 1

      const { data: pointData, nextIndex } = parseMultilineArray({
        lines,
        width: FIXED_WIDTH,
        maxWidth: MAX_WIDTH,
        numOfEntries: numberOfPoints * 2,
        currentIndex: index,
      })

      const points = splitIntoTuples(pointData.map((segment) => parseFloat(segment)), 2)

      index = nextIndex

      const bankLine = lines[index]
      const { value: bankValue } = parseKeyValue(bankLine)
      const [sectionId, leftBank, rightBank] = parseCommaSeparated(bankValue)
      index++

      const manningLine = lines[index]
      const { value: manningValue } = parseKeyValue(manningLine)
      const [, manningCountSegment] = parseCommaSeparated(manningValue)
      const manningCount = parseInt(manningCountSegment ?? "0", 10) || 0
      index++

      const { data: manningData, nextIndex: manningNextIndex } = parseMultilineArray({
        lines,
        width: FIXED_WIDTH,
        maxWidth: MAX_WIDTH,
        numOfEntries: manningCount * 2,
        currentIndex: index,
      })

      const manningPairs = splitIntoTuples(manningData.map((segment) => parseFloat(segment)), 2)

      return {
        value: {
          id,
          points,
          bankStations: {
            sectionId: parseInt(sectionId ?? "0", 10) || 0,
            leftBank: parseFloat(leftBank ?? "0"),
            rightBank: parseFloat(rightBank ?? "0"),
          },
          manningCoefficients: manningPairs,
        },
        nextIndex: manningNextIndex,
      }
    },
    (xs) => {
      if (!xs) {
        return []
      }

      const lines: string[] = []
      const stationElevation = xs.points?.flat() ?? []
      lines.push(`Conn BR: ${prefix} SE=${xs.id},${xs.points?.length ?? 0}`)
      lines.push(...formatStationElevationPairs(stationElevation))
      lines.push(
        `Conn BR: ${prefix} Bank Stations=${xs.bankStations.sectionId},${xs.bankStations.leftBank},${xs.bankStations.rightBank}`,
      )

      const manningFlat = xs.manningCoefficients?.flat() ?? []
      lines.push(`Conn BR: ${prefix} Mann=${xs.id},${xs.manningCoefficients?.length ?? 0}`)
      lines.push(...formatStationElevationPairs(manningFlat))

      return lines
    },
  )

const bridgeCoefficientsField = contextual(
  "bridgeCoefficients",
  (lines, startIndex) => {
    const line = lines[startIndex]
    if (!line || !line.startsWith("Conn BR: BR Coef=")) {
      return undefined
    }

    const { value } = parseKeyValue(line)
    const parts = parseCommaSeparated(value)
    while (parts.length < 10) {
      parts.push("")
    }

    const coefficients = {
      coef1: parseInt(parts[0] ?? "0", 10) || 0,
      coef2: parseMaybeFloat(parts[1]) ?? 0,
      coef3: parseMaybeFloat(parts[2]) ?? 0,
      coef4: parseMaybeFloat(parts[3]),
      coef5: parseMaybeFloat(parts[4]),
      coef6: null,
      coef7: parseMaybeFloat(parts[5]) ?? 0,
      coef8: parseMaybeFloat(parts[6]) ?? 0,
      coef9: parseMaybeFloat(parts[7]),
      coef10: parseMaybeFloat(parts[8]) ?? 0,
      coef11: parseMaybeFloat(parts[9]),
    }

    return { value: coefficients, nextIndex: startIndex + 1 }
  },
  (coefficients) => {
    if (!coefficients) {
      return []
    }

    const coef1 = coefficients.coef1 === 1 ? " 1 " : "-1 "
    const values = [
      coef1,
      ` ${coefficients.coef2} `,
      ` ${coefficients.coef3} `,
      coefficients.coef4 ?? "",
      coefficients.coef5 ?? "",
      coefficients.coef7,
      coefficients.coef8,
      coefficients.coef9 ?? "",
      coefficients.coef10,
      coefficients.coef11 ?? "",
    ]

    return [`Conn BR: BR Coef=${values.join(",")}`]
  },
)

const ineffectiveFlowField = <Key extends string>(key: Key, label: "USXS" | "DSXS") =>
  contextual(
    key,
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (!line || !line.startsWith(`Conn BR: ${label} Ineff=`)) {
        return undefined
      }

      const { value } = parseKeyValue(line)
      const [leftStation, leftElevation, rightStation, rightElevation] = parseCommaSeparated(value)

      return {
        value: {
          leftStation: parseFloat(leftStation ?? "0"),
          leftElevation: parseFloat(leftElevation ?? "0"),
          rightStation: parseFloat(rightStation ?? "0"),
          rightElevation: parseFloat(rightElevation ?? "0"),
        },
        nextIndex: startIndex + 1,
      }
    },
    (area) => {
      if (!area) {
        return []
      }

      return [
        `Conn BR: ${label} Ineff=${area.leftStation},${area.leftElevation},${area.rightStation},${area.rightElevation}`,
      ]
    },
  )

export const bridgeSchema = schema([
  bridgeConfigField,
  pressureWeirField,
  deckField,
  xsField("insideUpstreamCrossSection" as const, "BR"),
  xsField("insideDownstreamCrossSection" as const, "BR"),
  repeat("piers", startsWith("Conn BR: Pier Skew, UpSta & Num, DnSta & Num="), pierSchema),
  bridgeCoefficientsField,
  numberField("bridgeSkew", "Conn BR: BR Skew="),
  xsField("externalUpstreamCrossSection" as const, "XS"),
  xsField("externalDownstreamCrossSection" as const, "XS"),
  ineffectiveFlowField("upstreamIneffectiveFlowArea" as const, "USXS"),
  ineffectiveFlowField("downstreamIneffectiveFlowArea" as const, "DSXS"),
])

export type BridgeSchema = Infer<typeof bridgeSchema>
