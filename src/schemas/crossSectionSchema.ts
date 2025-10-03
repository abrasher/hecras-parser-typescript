import { parseMultilineArray } from "../parsers/utils"
import {
  schema,
  fields,
  multiField,
  tupleArrayField,
  stringField,
  numberField,
  numberPart,
  stringPart,
  opt,
  type Infer,
  countedArrayLengthPart,
  booleanPart,
  countedFixedWidthArray,
  contextual,
} from "../schema"
import { formatChunkedLines } from "../schema/serializationUtils"

export const crossSectionSchema = schema([
  multiField(
    "Type RM Length L Ch R =",
    fields({
      type: numberPart({ integer: true, padded: true }),
      riverMile: stringPart({ trim: true, width: 8 }),
      lengthLeft: numberPart(),
      lengthChannel: numberPart(),
      lengthRight: numberPart(),
    }),
  ),
  // TODO ADD BEGIN DESCRIPTION: parsing and serialization
  tupleArrayField("XS GIS Cut Line=", "gisCutLine", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    optional: true,
    pad: false,
    formatter: "coordinate",
  }),
  stringField("lastEditedTime", "Node Last Edited Time=", { optional: true, trim: true }),
  tupleArrayField("#Sta/Elev=", "stationElevation", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    formatter: "station",
    pad: true,
  }),
  multiField(
    "#Mann=",
    fields({
      numberOfMannings: countedArrayLengthPart("mannings", { padded: true }),
      horizontalManning: booleanPart({ mode: "-1,0" }),
      horizontalK: booleanPart({ mode: "-1,0" }),
    }),
  ),
  countedFixedWidthArray("mannings", {
    maxWidth: 72,
    width: 8,
    tuple: 3 as const,
    formatter: "station",
  }),
  multiField(
    "#XS Ineff=",
    fields({
      numberOfFlowAreas: countedArrayLengthPart("ineffectiveFlowAreas", { padded: true }),
      multipleBlocks: booleanPart({ mode: "-1,0", format: "listDirected" }),
    }),
  ),
  countedFixedWidthArray("ineffectiveFlowAreas", {
    maxWidth: 72,
    width: 8,
    tuple: 3 as const,
    formatter: "station",
  }),
  contextual(
    "permanentIneffective",
    (lines, index, context) => {
      if (lines[index] !== "Permanent Ineff=") {
        return null
      }

      if (context.ineffectiveFlowAreas === undefined) {
        context.ineffectiveFlowAreas = []
      }

      if (Array.isArray(context.ineffectiveFlowAreas)) {
        const numAreas = context.ineffectiveFlowAreas.length
        const { data, nextIndex } = parseMultilineArray({
          lines,
          width: 8,
          maxWidth: 80,
          numOfEntries: numAreas,
          currentIndex: index + 1,
        })
        const booleans = data.map((seg) => seg === "       T")
        return { value: booleans, nextIndex }
      } else {
        throw new Error("ineffectiveFlowAreas is not an array")
      }
    },
    (values) => {
      if (values === undefined) {
        return []
      }
      return [
        "Permanent Ineff=",
        ...formatChunkedLines(values, {
          width: 8,
          perLine: 10,
          formatter: (flag) => (flag ? "T" : "F"),
          padDirection: "start",
        }),
      ]
    },
  ),

  multiField(
    "Bank Sta=",
    fields({
      leftBankStation: opt(numberPart()),
      rightBankStation: opt(numberPart()),
    }),
  ),

  multiField(
    "XS Rating Curve=",
    fields({
      ratingCurveType: countedArrayLengthPart("ratingCurve", { padded: true }),
      checkHeadwaters: booleanPart({ mode: "-1,0" }),
    }),
  ),
  countedFixedWidthArray("ratingCurve", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    formatter: "station",
  }),
  /**
   * TODO handle parsing of this stuff below
      Vertical n Elevations= 2 
            1       2
      Vertical n for Station=0
            1       2
      Vertical n for Station=2
            3       4
      Vertical n Flow=0
   */

  multiField(
    "XS HTab Starting El and Incr=",
    fields({
      htabStartingElevation: opt(numberPart()),
      htabIncrement: opt(numberPart()),
      htabCount: opt(numberPart({ integer: true, padded: true })),
    }),
  ),
  multiField(
    "XS HTab Horizontal Distribution=",
    fields({
      horizontalHTabLeftBank: numberPart({ integer: true, padded: true }),
      horizontalHTabChannel: numberPart({ integer: true, padded: true }),
      horizontalHTabRightBank: numberPart({ integer: true, padded: true }),
    }),
  ),
  numberField("skewAngle", "Skew Angle=", { optional: true, padded: true }),
  multiField(
    "Exp/Cntr=",
    fields({
      expansionCoefficient: numberPart(),
      contractionCoefficient: numberPart(),
    }),
  ),
])

export type CrossSectionSchema = Infer<typeof crossSectionSchema>
