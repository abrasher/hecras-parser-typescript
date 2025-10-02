import {
  schema,
  fields,
  multiField,
  numberField,
  stringPart,
  numberPart,
  contextual,
  repeat,
  startsWith,
  type Infer,
  booleanPart,
} from "../schema"
import { parseMultilineArray, splitIntoTuples } from "../parsers/utils"
import type { Coordinate } from "../models/geometry/common"
import {
  formatHECRASStationNumber,
  formatChunkedLines,
  formatFixedWidth,
} from "../schema/serializationUtils"

/**
 * Schema for a single culvert barrel within a culvert group
 *
 * Format:
 * Conn Culvert Barrel=<index>,<name>,<numberOfCoordinates>
 * <coordinate data in 16-char fixed-width format, 2 coordinates per line>
 */
export const culvertBarrelSchema = schema([
  // Conn Culvert Barrel=index,name,numberOfCoordinates
  multiField(
    "Conn Culvert Barrel=",
    fields({
      index: numberPart({ integer: true }),
      name: stringPart({ trim: true }),
      numberOfCoordinates: numberPart({ integer: true }),
    }),
  ),

  // Barrel coordinates - contextual because count depends on numberOfCoordinates
  contextual(
    "coordinates",
    (lines, startIndex, context) => {
      const numberOfCoordinates = (context.numberOfCoordinates as number) ?? 0

      if (numberOfCoordinates === 0) {
        return {
          value: [] as Coordinate[],
          nextIndex: startIndex,
        }
      }

      // Barrel coordinates are 64 characters wide, 16 characters a number, 2 pairs a line
      // This means we can fit 2 coordinates per line
      const pointsPerEntry = 2
      const { data, nextIndex } = parseMultilineArray({
        width: 16,
        maxWidth: 64,
        numOfEntries: numberOfCoordinates * pointsPerEntry,
        currentIndex: startIndex,
        lines,
      })

      const dataAsFloats = data.map((v) => parseFloat(v))
      const coordinates = splitIntoTuples(dataAsFloats, 2) as Coordinate[]

      return {
        value: coordinates,
        nextIndex,
      }
    },
    (value) => {
      if (!value || !Array.isArray(value)) {
        return []
      }

      return formatChunkedLines(value.flat(), {
        width: 16,
        perLine: 4,
        formatter: (coord) => formatFixedWidth(coord, 16, { padDirection: "start" }),
      })
    },
  ),
])

export type CulvertBarrelSchema = Infer<typeof culvertBarrelSchema>

/**
 * Schema for a culvert group within a connection
 *
 * Format:
 * Connection Culv=<shape>,<rise>,<span>,<length>,<nTop>,<entranceLoss>,<exitLoss>,<chart>,<scale>,<upstreamInvert>,<downstreamInvert>,<numberOfBarrels>,<culvertGroupName>,<unknownFlag>,
 * <barrel station data in 8-char fixed-width format>
 * Conn Culvert Barrel=... (repeated for each barrel)
 * Conn Culv Bottom n=<nBottom> (optional)
 * Conn Culv Bottom Depth=<nBottomDepth> (optional)
 * Conn Culv Depth Blocked=<depthBlocked> (optional)
 */
export const culvertSchema = schema([
  // Main header line with all culvert group properties
  multiField(
    "Connection Culv=",
    fields({
      shape: numberPart({ integer: true }),
      rise: numberPart(),
      span: numberPart(),
      length: numberPart(),
      nTop: numberPart(),
      entranceLoss: numberPart(),
      exitLoss: numberPart(),
      chart: numberPart({ integer: true }),
      scale: numberPart({ integer: true }),
      upstreamInvert: numberPart(),
      downstreamInvert: numberPart(),
      numberOfBarrels: numberPart({ integer: true, padded: true }),
      culvertGroupName: stringPart({ trim: true, width: 12 }),
      unknownFlag: booleanPart({ mode: "-1,0", format: "listDirected" }),
      unknownParameter: numberPart({ nullOnBlank: true }),
    }),
  ),

  // Barrel stations - contextual because count depends on numberOfBarrels
  contextual(
    "barrelStations",
    (lines, startIndex, context) => {
      const numberOfBarrels = (context.numberOfBarrels as number) ?? 0

      if (numberOfBarrels === 0) {
        return {
          value: [],
          nextIndex: startIndex,
        }
      }

      // Barrel stations are defined on lines after the header
      // The line is max width of 80, each number being 8 characters. You can fit 5 pairs per line
      const { data: stationData, nextIndex } = parseMultilineArray({
        width: 8,
        maxWidth: 80,
        numOfEntries: numberOfBarrels * 2,
        currentIndex: startIndex,
        lines,
      })

      const stationValues = stationData.map((value) => parseFloat(value))
      const stationPairs = splitIntoTuples(stationValues, 2)

      return {
        value: stationPairs,
        nextIndex,
      }
    },
    (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return []
      }

      return formatChunkedLines(value.flat(), {
        width: 8,
        perLine: 5,
        formatter: (num) => formatHECRASStationNumber(num),
      })
    },
  ),

  // Culvert barrels (0 or more)
  repeat("barrels", startsWith("Conn Culvert Barrel="), culvertBarrelSchema),

  // Optional fields
  numberField("nBottom", "Conn Culv Bottom n=", { optional: true }),
  numberField("nBottomDepth", "Conn Culv Bottom Depth=", { optional: true }),
  numberField("depthBlocked", "Conn Culv Depth Blocked=", { optional: true }),
])

export type CulvertSchema = Infer<typeof culvertSchema>
