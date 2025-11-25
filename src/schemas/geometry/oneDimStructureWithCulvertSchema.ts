import { chunk } from "es-toolkit"

import {
  type Infer,
  type Part,
  numberPart,
  schema,
  fields,
  multiField,
  contextual,
  numberField,
  booleanPart,
  stringPart,
  textBlockField,
  stringField,
  blankLine,
  repeat,
  startsWith,
  tupleArrayField,
  tupleField,
  countedArrayLengthPart,
  countedFixedWidthArray,
} from "../../schema"
import { formatFixedWidth, formatHECRASStationNumber } from "../../schema/serializationUtils"
import type { NTuple } from "../../schema/parsingUtils"
import {
  parseCommaSeparated,
  parseMaybeFloat,
  parseMultilineArray,
} from "../../schema/parsingUtils"

const typePart = numberPart({ integer: true, pad: true })

const WIDTH_FIELD_WIDTH = 8
const MAX_VALUES_PER_LINE = 80 / WIDTH_FIELD_WIDTH

/**
 * Schema for a single culvert barrel within a bridge culvert
 *
 * Format:
 * BC Culvert Barrel=<index>,<name>,<numberOfCoordinates>
 * <coordinate data in 16-char fixed-width format, 2 coordinates per line>
 */
const culvertBarrelSchema = schema([
  multiField(
    "BC Culvert Barrel=",
    fields({
      index: numberPart({ integer: true }),
      name: stringPart({ trim: true }),
      numberOfCoordinates: countedArrayLengthPart("coordinates"),
    }),
  ),
  countedFixedWidthArray("coordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    formatter: "coordinate",
  }),
])

export type CulvertBarrelSchema = Infer<typeof culvertBarrelSchema>

/**
 * Schema for multiple barrel culvert within a bridge/culvert structure
 *
 * Format:
 * Multiple Barrel Culv=<shape>,<rise>,<span>,<length>,<nValue>,<entranceLoss>,<exitLoss>,<chart>,<scale>,<upstreamInvert>,<downstreamInvert>,<numberOfBarrels>,<name>,<flag>,<additionalParam>
 * <barrel station data>
 * BC Culvert Barrel=... (repeated for each barrel)
 * Culvert Bottom n=<nBottom> (optional)
 */
const multipleBarrelCulvertSchema = schema([
  multiField(
    "Multiple Barrel Culv=",
    fields({
      shape: numberPart({ integer: true }),
      rise: numberPart(),
      span: numberPart(),
      length: numberPart(),
      nValue: numberPart(),
      entranceLoss: numberPart(),
      exitLoss: numberPart(),
      chart: numberPart({ integer: true }),
      scale: numberPart({ integer: true }),
      upstreamInvert: numberPart(),
      downstreamInvert: numberPart(),
      // numberOfBarrels has a leading space but no trailing space in HEC-RAS format
      numberOfBarrels: {
        parse: (segment: string) => {
          const trimmed = segment.trim()
          const value = parseInt(trimmed, 10)
          if (Number.isNaN(value)) {
            throw new Error(`Invalid numberOfBarrels: ${segment}`)
          }
          return value
        },
        serialize: (value: number) => ` ${value}`,
      } as Part<number>,
      name: stringPart({ trim: true, width: 12 }),
      flag: booleanPart({ mode: "-1,0", pad: true }),
      additionalParam: numberPart({ nullOnBlank: true }),
    }),
  ),
  contextual(
    "barrelStations",
    (lines, startIndex, context) => {
      const line = lines[startIndex]
      if (!line || line.trim() === "") {
        return null
      }

      // Check if this line looks like it contains station data (numeric values)
      const trimmed = line.trim()
      if (trimmed.startsWith("BC Culvert Barrel=") || trimmed.startsWith("Culvert Bottom")) {
        return null
      }

      // Number of entries is 2 * numberOfBarrels (upstream and downstream station for each barrel)
      const numberOfBarrels = context.numberOfBarrels ?? 2
      const numOfEntries = numberOfBarrels * 2

      // Parse the station values (typically 2 * numberOfBarrels values)
      const { data, nextIndex } = parseMultilineArray({
        lines,
        currentIndex: startIndex,
        width: WIDTH_FIELD_WIDTH,
        maxWidth: 80,
        numOfEntries,
      })

      const stations = data
        .filter((value) => value !== "")
        .map((value) => {
          const parsed = parseFloat(value)
          if (Number.isNaN(parsed)) {
            throw new Error(`Error parsing barrel station: ${value}`)
          }
          return parsed
        })

      return {
        value: stations,
        nextIndex,
      }
    },
    (stations) => {
      if (!stations || stations.length === 0) {
        return []
      }

      const lines: string[] = []
      for (let i = 0; i < stations.length; i += MAX_VALUES_PER_LINE) {
        const slice = stations.slice(i, i + MAX_VALUES_PER_LINE)
        const formatted = slice
          .map((value) => formatFixedWidth(formatHECRASStationNumber(value), WIDTH_FIELD_WIDTH))
          .join("")
        lines.push(formatted)
      }
      return lines
    },
  ),
  repeat("barrels", startsWith("BC Culvert Barrel="), culvertBarrelSchema),
  numberField("nBottom", "Culvert Bottom n=", { optional: true }),
  numberField("culvertBottomDepth", "Culvert Bottom Depth=", { optional: true }),
  numberField("culvertDepthBlocked", "Culvert Depth Blocked=", { optional: true }),
])

export type MultipleBarrelCulvertSchema = Infer<typeof multipleBarrelCulvertSchema>

/**
 * Schema for culvert within a bridge/culvert structure
 *
 * Format:
 * Culvert=<shape>,<rise>,<span>,<length>,<nValue>,<entranceLoss>,<exitLoss>,<chart>,<scale>,<upstreamInvert>,<downstreamInvert>,<upstreamObvert>,<downstreamObvert>,<name>,<flag>,<additionalParam>
 * <barrel station data>
 * BC Culvert Barrel=... (repeated for each barrel)
 * Culvert Bottom n=<nBottom> (optional)
 */
const culvertSchema = schema([
  multiField(
    "Culvert=",
    fields({
      shape: numberPart({ integer: true }),
      rise: numberPart(),
      span: numberPart(),
      length: numberPart(),
      nValue: numberPart(),
      entranceLoss: numberPart(),
      exitLoss: numberPart(),
      chart: numberPart({ integer: true }),
      scale: numberPart({ integer: true }),
      upstreamInvert: numberPart(),
      downstreamInvert: numberPart(),
      upstreamObvert: numberPart(),
      downstreamObvert: numberPart(),
      name: stringPart({ trim: true, width: 12 }),
      flag: booleanPart({ mode: "-1,0", pad: true }),
      additionalParam: numberPart({ nullOnBlank: true }),
    }),
  ),
  contextual(
    "barrelStations",
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (!line || line.trim() === "") {
        return null
      }

      // Check if this line looks like it contains station data (numeric values)
      const trimmed = line.trim()
      if (trimmed.startsWith("BC Culvert Barrel=") || trimmed.startsWith("Culvert Bottom")) {
        return null
      }

      // Parse the station values
      const { data, nextIndex } = parseMultilineArray({
        lines,
        currentIndex: startIndex,
        width: WIDTH_FIELD_WIDTH,
        maxWidth: 80,
        numOfEntries: 2, // Typically 2 values for upstream/downstream stations
      })

      const stations = data
        .filter((value) => value !== "")
        .map((value) => {
          const parsed = parseFloat(value)
          if (Number.isNaN(parsed)) {
            throw new Error(`Error parsing barrel station: ${value}`)
          }
          return parsed
        })

      return {
        value: stations,
        nextIndex,
      }
    },
    (stations) => {
      if (!stations || stations.length === 0) {
        return []
      }

      const lines: string[] = []
      for (let i = 0; i < stations.length; i += MAX_VALUES_PER_LINE) {
        const slice = stations.slice(i, i + MAX_VALUES_PER_LINE)
        const formatted = slice
          .map((value) => formatFixedWidth(formatHECRASStationNumber(value), WIDTH_FIELD_WIDTH))
          .join("")
        lines.push(formatted)
      }
      return lines
    },
  ),
  repeat("barrels", startsWith("BC Culvert Barrel="), culvertBarrelSchema),
  numberField("nBottom", "Culvert Bottom n=", { optional: true }),

  numberField("culvertBottomDepth", "Culvert Bottom Depth=", { optional: true }),
  numberField("culvertDepthBlocked", "Culvert Depth Blocked=", { optional: true }),
])

export type CulvertSchema = Infer<typeof culvertSchema>

const deckField = contextual(
  "deck",
  (lines: string[], startIndex: number) => {
    if (!lines[startIndex].startsWith("Deck Dist Width WeirC Skew NumUp NumDn")) {
      return null
    }
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
      upstream: [] as NTuple<number | null, 3>[],
      downstream: [] as NTuple<number | null, 3>[],
    }
    // increment index so we can get to the arrays
    index++

    // this section is a bit tricky, it has 6 consecutive array blocks
    // we get a block and then move the index forward
    // the blocks are as upstreamStations, upstreamHighChords, upstreamLowChords, downstreamStations, downstreamHighChords, downstreamLowChords

    const getBlock = (numOfEntries: number) => {
      const block = parseMultilineArray({
        width: 8,
        maxWidth: 80,
        numOfEntries,
        currentIndex: index,
        lines,
      })
      index = block.nextIndex
      return block.data.map((val) => parseMaybeFloat(val))
    }

    const nUs = deckParams.numberOfUpstreamStations
    const nDs = deckParams.numberOfDownstreamStations
    const [stnUS, hiUS, loUS] = [getBlock(nUs), getBlock(nUs), getBlock(nUs)]

    deckParams.upstream = stnUS.map((_, i) => [stnUS[i], hiUS[i], loUS[i]])

    const [stnDS, hiDS, loDS] = [getBlock(nDs), getBlock(nDs), getBlock(nDs)]

    deckParams.downstream = stnDS.map((_, i) => [stnDS[i], hiDS[i], loDS[i]])

    return { value: deckParams, nextIndex: index }
  },
  (deck) => {
    if (!deck) {
      return []
    }
    const lines: string[] = []
    lines.push("Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee")

    const params = [
      Number.isNaN(deck.deckDistance) ? "" : deck.deckDistance,
      deck.width,
      deck.weirCoefficient,
      deck.skew,
      ` ${deck.numberOfUpstreamStations}`, // Add space like in test data
      ` ${deck.numberOfDownstreamStations}`, // Add space like in test data
      ` ${deck.minLowCoordinate ?? ""}`, // null becomes empty string with space
      ` ${deck.maxHighCoordinate ?? ""}`, // null becomes empty string with space
      ` ${deck.maxSubmerge}`, // Add space like in test data
      ` ${deck.isOgee}`, // Add space like in test data
      ` ${deck.upstreamEmbankmentSideSlope ?? 0}`, // Use 0 instead of empty string
      `${deck.downstreamEmbankmentSideSlope ?? 0}`, // Use 0 instead of empty string
      `${deck.spillwayApproachHeight ?? ""}`,
      `${deck.spillwayDesignHead ?? ""}`,
    ]
    lines.push(params.join(","))

    const pushTuples = (set: NTuple<number | null, 3>[]) => {
      const format = (values: (number | null)[]): string[] => {
        const lines: string[] = []

        chunk(values, 10).forEach((valueGroup) => {
          const formattedLine = valueGroup
            .map((value) =>
              value === null ? "        " : formatFixedWidth(formatHECRASStationNumber(value), 8),
            )
            .join("")
          lines.push(formattedLine)
        })
        return lines
      }

      lines.push(...format(set.map((x) => x[0])))
      lines.push(...format(set.map((x) => x[1])))
      lines.push(...format(set.map((x) => x[2])))
    }

    pushTuples(deck.upstream)
    pushTuples(deck.downstream)

    return lines
  },
)

export const oneDimStructureWithCulvertSchema = schema([
  multiField(
    "Type RM Length L Ch R =",
    fields({
      type: typePart,
      riverMile: stringPart({ trim: true, width: 8 }),
      lengthLeft: numberPart({ nullOnBlank: true }),
      lengthChannel: numberPart({ nullOnBlank: true }),
      lengthRight: numberPart({ nullOnBlank: true }),
    }),
  ),
  textBlockField("description", "DESCRIPTION", { optional: true }),
  stringField("lastEditedTime", "Node Last Edited Time=", { optional: true, trim: true }),

  multiField(
    "Bridge Culvert-",
    fields({
      flag1: booleanPart({ mode: "-1,0" }),
      flag2: booleanPart({ mode: "-1,0" }),
      flag3: booleanPart({ mode: "-1,0" }),
      flag4: booleanPart({ mode: "-1,0" }),
      flag5: booleanPart({ mode: "-1,0", pad: true }),
    }),
  ),
  deckField,
  multiField(
    "BR Coef=",
    fields({
      bridgeCoefficient1: stringPart({ trim: false }),
      bridgeCoefficient2: booleanPart({ mode: "-1,0", pad: true }),
      bridgeCoefficient3: booleanPart({ mode: "-1,0", pad: true }),
      bridgeCoefficient4: numberPart({ nullOnBlank: true }),
      bridgeCoefficient5: booleanPart({ mode: "-1,0", pad: true }),
      bridgeCoefficient6: numberPart({ nullOnBlank: true }),
      bridgeCoefficient7: numberPart({ nullOnBlank: true }),
      bridgeCoefficient8: numberPart({ nullOnBlank: true }),
      bridgeCoefficient9: booleanPart({ mode: "-1,0", pad: false }),
      bridgeCoefficient10: numberPart({ nullOnBlank: true }),
      bridgeCoefficient11: numberPart({ nullOnBlank: true }),
      bridgeCoefficient12: numberPart({ nullOnBlank: true }),
    }),
    { optional: true },
  ),
  multiField(
    "WSPro=",
    fields({
      wsproParam1: numberPart({ nullOnBlank: true }),
      wsproParam2: numberPart({ nullOnBlank: true }),
      wsproParam3: numberPart({ nullOnBlank: true }),
      wsproParam4: numberPart({ nullOnBlank: true }),
      wsproParam5: numberPart({ integer: true, pad: true }),
      wsproParam6: numberPart({ nullOnBlank: true }),
      wsproParam7: numberPart({ nullOnBlank: true }),
      wsproParam8: numberPart({ nullOnBlank: true }),
      wsproParam9: numberPart({ integer: true, pad: true }),
      wsproParam10: numberPart({ nullOnBlank: true }),
      wsproParam11: numberPart({ nullOnBlank: true }),
      wsproParam12: numberPart({ nullOnBlank: true }),
      wsproParam13: numberPart({ integer: true, pad: true }),
      wsproParam14: numberPart({ nullOnBlank: true }),
      wsproParam15: numberPart({ nullOnBlank: true }),
      wsproParam16: numberPart({ nullOnBlank: true }),
      wsproParam17: booleanPart({ mode: "-1,0", pad: true }),
      wsproParam18: booleanPart({ mode: "-1,0", pad: true }),
      wsproParam19: booleanPart({ mode: "-1,0", pad: true }),
      wsproParam20: numberPart({ integer: true, pad: true }),
      wsproParam21: numberPart({ integer: true, pad: true }),
      wsproParam22: numberPart({ integer: true, pad: true }),
      wsproParam23: numberPart({ integer: true, pad: true }),
      wsproParam24: numberPart({ integer: true, pad: true }),
    }),
    { optional: true },
  ),
  repeat("culverts", startsWith("Culvert="), culvertSchema),
  repeat("multipleBarrelCulverts", startsWith("Multiple Barrel Culv="), multipleBarrelCulvertSchema),
  tupleArrayField("BR U #Sta/Elev=", "upstreamInternalStationElevations", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    optional: true,
    formatter: "station",
    pad: true,
  }),
  //BR U #Mann= 7
  tupleArrayField("BR U #Mann=", "upstreamInternalMannings", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    optional: true,
    formatter: "station",
    pad: true,
  }),
  tupleField(
    "upstreamBanks",
    "BR U Banks=",
    [numberPart({ nullOnBlank: true }), numberPart({ nullOnBlank: true })],
    { optional: true },
  ),
  tupleArrayField("BR D #Sta/Elev=", "downstreamInternalStationElevations", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    optional: true,
    formatter: "station",
    pad: true,
  }),
  //BR U #Mann= 7
  tupleArrayField("BR D #Mann=", "downstreamInternalMannings", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    optional: true,
    formatter: "station",
    pad: true,
  }),
  tupleField(
    "downstreamBanks",
    "BR D Banks=",
    [numberPart({ nullOnBlank: true }), numberPart({ nullOnBlank: true })],
    { optional: true },
  ),
  //BR U Banks=215.28,219.21
  //BR D #Sta/Elev=
  //BR D #Mann
  //BR D Banks=

  multiField(
    "BC Design=",
    fields({
      bcDesignParam1: numberPart({ nullOnBlank: true }),
      bcDesignParam2: numberPart({ nullOnBlank: true }),
      bcDesignParam3: numberPart({ integer: true, pad: true }),
      bcDesignParam4: numberPart({ nullOnBlank: true }),
      bcDesignParam5: numberPart({ integer: true, pad: true }),
      bcDesignParam6: numberPart({ nullOnBlank: true }),
      bcDesignParam7: numberPart({ nullOnBlank: true }),
      bcDesignParam8: numberPart({ nullOnBlank: true }),
      bcDesignParam9: numberPart({ nullOnBlank: true }),
      bcDesignParam10: numberPart({ nullOnBlank: true }),
      bcDesignParam11: numberPart({ nullOnBlank: true }),
    }),
    { optional: true },
  ),
  numberField("bcUseUserHTables", "BC Use User HTab Curves=", { integer: true }),
  numberField("bcUserHTabFreeFlow", "BC User HTab FreeFlow(D)=", { integer: true, pad: true }),
  blankLine(),
])

export type OneDimStructureWithCulvertSchema = Infer<typeof oneDimStructureWithCulvertSchema>
