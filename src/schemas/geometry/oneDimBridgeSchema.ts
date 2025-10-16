import { chunk } from "es-toolkit"

import {
  type Infer,
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

const skewPart = (() => {
  const base = stringPart({ trim: true })
  return {
    ...base,
    serialize(value: string | undefined) {
      if (value === undefined || value === null || value === "") {
        return "  "
      }
      return base.serialize(value)
    },
  }
})()

const debrisPart = numberPart({ nullOnBlank: true })

function readWidthElevationPairs(
  lines: string[],
  startIndex: number,
  count: number,
): { pairs: { width: number; elevation: number }[]; nextIndex: number } {
  if (count === 0) {
    return { pairs: [], nextIndex: startIndex }
  }

  const { data: widthData, nextIndex: widthsNextIndex } = parseMultilineArray({
    lines,
    currentIndex: startIndex,
    width: WIDTH_FIELD_WIDTH,
    maxWidth: 80,
    numOfEntries: count,
  })

  const widths = widthData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing pier width: ${value}`)
      }
      return parsed
    })

  if (widths.length !== count) {
    throw new Error(`Expected ${count} pier widths but parsed ${widths.length}`)
  }

  const { data: elevationData, nextIndex } = parseMultilineArray({
    lines,
    currentIndex: widthsNextIndex,
    width: WIDTH_FIELD_WIDTH,
    maxWidth: 80,
    numOfEntries: count,
  })

  const elevations = elevationData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing pier elevation: ${value}`)
      }
      return parsed
    })

  if (elevations.length !== count) {
    throw new Error(`Expected ${count} pier elevations but parsed ${elevations.length}`)
  }

  const pairs = widths.map((width, idx) => ({ width, elevation: elevations[idx] }))

  return { pairs, nextIndex }
}

function formatFixedWidthSeries(values: number[]): string[] {
  const lines: string[] = []
  for (let i = 0; i < values.length; i += MAX_VALUES_PER_LINE) {
    const slice = values.slice(i, i + MAX_VALUES_PER_LINE)
    const formatted = slice
      .map((value) => formatFixedWidth(formatHECRASStationNumber(value), WIDTH_FIELD_WIDTH))
      .join("")
    lines.push(formatted)
  }
  return lines
}

const pierSchema = schema([
  multiField(
    "Pier Skew, UpSta & Num, DnSta & Num=",
    fields({
      skew: skewPart,
      centerlineStationUpstream: numberPart(),
      upstreamPointCount: numberPart({ integer: true, pad: true }),
      centerlineStationDownstream: numberPart(),
      downstreamPointCount: numberPart({ integer: true, pad: true }),
      unusedUpstream: numberPart({ integer: true, pad: true }),
      unusedDownstream: numberPart({ integer: true, pad: true }),
      applyFloatingDebris: numberPart({ integer: true, pad: true }),
      debrisWidth: debrisPart,
      debrisHeight: debrisPart,
    }),
  ),
  contextual(
    "upstream",
    (lines, startIndex, context) => {
      const count = (context.upstreamPointCount as number) ?? 0
      const { pairs, nextIndex } = readWidthElevationPairs(lines, startIndex, count)

      return {
        value: pairs,
        nextIndex,
      }
    },
    (pairs) => {
      if (!pairs || pairs.length === 0) {
        return []
      }

      const widths = pairs.map((pair) => pair.width)
      const elevations = pairs.map((pair) => pair.elevation)

      return [...formatFixedWidthSeries(widths), ...formatFixedWidthSeries(elevations)]
    },
  ),
  contextual(
    "downstream",
    (lines, startIndex, context) => {
      const count = (context.downstreamPointCount as number) ?? 0
      const { pairs, nextIndex } = readWidthElevationPairs(lines, startIndex, count)

      return {
        value: pairs,
        nextIndex,
      }
    },
    (pairs) => {
      if (!pairs || pairs.length === 0) {
        return []
      }

      const widths = pairs.map((pair) => pair.width)
      const elevations = pairs.map((pair) => pair.elevation)

      return [...formatFixedWidthSeries(widths), ...formatFixedWidthSeries(elevations)]
    },
  ),
])

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

export const oneDimBridgeSchema = schema([
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
  stringField("nodeName", "Node Name=", { optional: true, trim: true }),
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
  repeat("piers", startsWith("Pier Skew, UpSta & Num, DnSta & Num="), pierSchema),
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
  numberField("bcHTabHWMax", "BC HTab HWMax=", { optional: true }),
  blankLine(),
])

export type OneDimBridgeSchema = Infer<typeof oneDimBridgeSchema>
