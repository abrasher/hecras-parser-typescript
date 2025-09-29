import { chunk, flatten } from "es-toolkit"
import type { NTuple } from "../../parsers/utils"
import {
  parseCommaSeparated,
  parseKeyValue,
  parseMaybeFloat,
  parseMultilineArray,
  splitIntoTuples,
} from "../../parsers/utils"
import type { Infer } from "../../schema"
import {
  numberPart,
  schema,
  fields,
  multiField,
  contextual,
  numberField,
  repeat,
  startsWith,
  booleanPart,
  tupleField,
} from "../../schema"
import { formatStationElevationPairs, formatFixedWidth } from "../../schema/serializationUtils"
import { pierSchema } from "./pierSchema"

const deckField = contextual(
  "deck",
  (lines: string[], startIndex: number) => {
    if (!lines[startIndex].startsWith("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn")) {
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
    lines.push(
      "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee",
    )

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
            .map((value) => (value === null ? "        " : formatFixedWidth(value.toString(), 8)))
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

const xsField = <Key extends string>(field: Key, prefix: "BR" | "XS") =>
  contextual(
    field,
    (lines: string[], startIndex: number) => {
      const parts = parseCommaSeparated(parseKeyValue(lines[startIndex]).value)
      const id = parseInt(parts[0])
      const numberOfPoints = parseInt(parts[1])

      let index = startIndex + 1

      const numbersPerCoordinate = 2
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: numberOfPoints * numbersPerCoordinate,
        currentIndex: index,
      })

      const numbers = data.map((value) => parseFloat(value))
      const stationElevation = splitIntoTuples(numbers, 2)

      index = nextIndex

      const [_, leftBank, rightBank] = parseCommaSeparated(parseKeyValue(lines[index]).value).map(
        (s) => parseFloat(s),
      )
      index++

      const manningPoints = parseInt(parseCommaSeparated(parseKeyValue(lines[index]).value)[1])

      index++

      const mannings = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: manningPoints * 2,
        currentIndex: index,
      })

      const manningCoefficients = splitIntoTuples(
        mannings.data.map((x) => parseFloat(x)),
        2,
      )

      const value = {
        id,
        leftBank,
        rightBank,
        stationElevation,
        manningCoefficients,
      }

      return {
        value,
        nextIndex: mannings.nextIndex,
      }
    },
    (xs) => {
      if (!xs) {
        return []
      }

      const lines: string[] = []
      const stationElevation = flatten(xs.stationElevation ?? [])

      lines.push(`Conn BR: ${prefix} SE=${xs.id},${stationElevation.length / 2}`)
      lines.push(...formatStationElevationPairs(stationElevation))

      lines.push(`Conn BR: ${prefix} Bank Stations=${xs.id},${xs.leftBank},${xs.rightBank}`)

      const manningPairs = flatten(xs.manningCoefficients ?? [])
      lines.push(`Conn BR: ${prefix} Mann=${xs.id},${xs.manningCoefficients.length}`)
      lines.push(...formatStationElevationPairs(manningPairs))

      return lines
    },
  )

export const bridgeSchema = schema([
  multiField(
    "Conn BR: Bridge=",
    fields({
      momentumEquationAddFriction: booleanPart({ mode: "-1,0" }),
      momentumEquationAddWeight: booleanPart({ mode: "-1,0" }),
      pressureFlowCriteria: booleanPart({ mode: "-1,0" }),
      classBDefaults: booleanPart({ mode: "-1,0" }),
      param5: booleanPart({ mode: "-1,0", format: "listDirected" }),
      contractionCoefficient: numberPart(),
      expansionCoefficient: numberPart(),
    }),
  ),
  multiField(
    "Conn BR: Pressure-Weir=",
    fields({
      weirValue1: numberPart(),
      weirValue2: numberPart({ nullOnBlank: true }),
      weirValue3: numberPart(),
      weirValue4: numberPart({ nullOnBlank: true }),
      weirValue5: numberPart(),
    }),
  ),
  deckField,
  xsField("upstreamInside" as const, "BR"),
  xsField("downstreamInside" as const, "BR"),
  repeat("piers", startsWith("Conn BR: Pier Skew, UpSta & Num, DnSta & Num="), pierSchema),
  multiField(
    "Conn BR: BR Coef=",
    fields({
      bridgeCoefficient1: booleanPart({ mode: "-1,0", format: "listDirected" }),
      bridgeCoefficient2: booleanPart({ mode: "-1,0", format: "listDirected" }),
      bridgeCoefficient3: booleanPart({ mode: "-1,0", format: "listDirected" }),
      bridgeCoefficient4: numberPart({ nullOnBlank: true }),
      bridgeCoefficient5: numberPart({ nullOnBlank: true }),
      bridgeCoefficient6: numberPart({ nullOnBlank: true }),
      bridgeCoefficient7: booleanPart({ mode: "-1,0", format: "trimmed" }),
      bridgeCoefficient8: numberPart({ nullOnBlank: true }),
      bridgeCoefficient9: booleanPart({ mode: "-1,0", format: "trimmed" }),
      bridgeCoefficient10: numberPart({ nullOnBlank: true }),
    }),
  ),
  numberField("skew", "Conn BR: BR Skew="),
  xsField("upstreamExternal" as const, "XS"),
  xsField("downstreamExternal" as const, "XS"),
  tupleField("upstreamIneffectiveFlowArea", "Conn BR: USXS Ineff=", [
    numberPart(),
    numberPart(),
    numberPart(),
    numberPart(),
  ]),
  tupleField("downstreamIneffectiveFlowArea", "Conn BR: DSXS Ineff=", [
    numberPart(),
    numberPart(),
    numberPart(),
    numberPart(),
  ]),
])

export type BridgeSchema = Infer<typeof bridgeSchema>
