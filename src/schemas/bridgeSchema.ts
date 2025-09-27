import { chunk, flatten } from "es-toolkit"
import type { NTuple } from "../parsers/utils"
import {
  parseCommaSeparated,
  parseKeyValue,
  parseMaybeFloat,
  parseMultilineArray,
  splitIntoTuples,
} from "../parsers/utils"
import type { Infer } from "../schema"
import {
  numberPart,
  schema,
  fields,
  multiField,
  contextual,
  numberField,
  stringField,
} from "../schema"
import { formatStationElevationPairs, toFixedWidthString } from "../serializers/utils"

const deckField = contextual(
  "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn",
  (lines: string[], startIndex: number) => {
    let index = startIndex
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

    const getBlock = () => {
      const block = parseMultilineArray({
        width: 8,
        maxWidth: 80,
        numOfEntries: deckParams.numberOfDownstreamStations,
        currentIndex: index,
        lines,
      })
      index = block.nextIndex
      return block.data.map((val) => parseMaybeFloat(val))
    }
    const [stnUS, hiUS, loUS] = [getBlock(), getBlock(), getBlock()]

    deckParams.upstream = stnUS.map((_, i) => [stnUS[i], hiUS[i], loUS[i]])

    const [stnDS, hiDS, loDS] = [getBlock(), getBlock(), getBlock()]

    deckParams.downstream = stnDS.map((_, i) => [stnDS[i], hiDS[i], loDS[i]])

    return { value: deckParams, nextIndex: index }
  },
  (deck) => {
    if (!deck) {
      return []
    }
    const lines: string[] = []

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
            .map((value) => (value === null ? "        " : toFixedWidthString(value.toString(), 8)))
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

const xsField = (field: string, prefix: "BR" | "XS") =>
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

      index++

      const [_, leftStation, rightStation] = parseCommaSeparated(
        parseKeyValue(lines[index]).value,
      ).map((s) => parseFloat(s))
      index++

      const manningPoints = parseInt(parseCommaSeparated(parseKeyValue(lines[index]).value)[1])

      index++

      const mannings = parseMultilineArray({
        lines,
        width: 8,
        maxWidth: 80,
        numOfEntries: manningPoints,
        currentIndex: index,
      })

      const manningsCoefficients = splitIntoTuples(
        mannings.data.map((x) => parseFloat(x)),
        2,
      )

      const value = {
        id,
        leftStation,
        rightStation,
        stationElevation,
        manningsCoefficients,
      }

      return {
        value,
        nextIndex,
      }
    },
    (xs) => {
      if (!xs) {
        return []
      }

      const lines: string[] = []
      const stationElevation = flatten(xs.stationElevation ?? [])

      lines.push(`Conn BR: ${prefix} SE=${xs.id},${stationElevation.length}`)
      lines.push(...formatStationElevationPairs(stationElevation))

      lines.push(`Conn BR: ${prefix} Bank Stations=${xs.id}${xs.leftStation},${xs.rightStation}`)

      const manningPairs = flatten(xs.manningsCoefficients ?? [])
      lines.push(`Conn BR: ${prefix} Mann=${xs.id},${xs.manningsCoefficients.length}`)
      lines.push(...formatStationElevationPairs(manningPairs))

      return lines
    },
  )

const bridgeSchema = schema([
  multiField(
    "Conn BR: Bridge=",
    fields({
      momentumEquationAddFriction: numberPart(),
      momentumEquationAddWeight: numberPart(),
      pressureFlowCriteria: numberPart(),
      classBDefaults: numberPart(),
      param5: numberPart(),
      contractionCoefficient: numberPart(),
      expansionCoefficient: numberPart(),
    }),
  ),
  multiField(
    "Conn BR: Pressure-Weir=",
    fields({
      value1: numberPart(),
      value2: numberPart(),
      value3: numberPart(),
      value4: numberPart(),
      value5: numberPart(),
    }),
  ),
  deckField,
  xsField("upstreamInside", "BR"),
  xsField("downstreamInside", "BR"),
  numberField("skew", "Conn BR: BR Skew="),
  // TODO we are just storing this as a string, but it is a bunch of flags/numbers
  stringField("coef1", "Conn BR: BR Coef="),
])

type BridgeSchema = Infer<typeof bridgeSchema>
