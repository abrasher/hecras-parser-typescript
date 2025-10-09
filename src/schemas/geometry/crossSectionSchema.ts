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
  textBlockField,
  blankLine,
} from "../../schema"
import { parseMultilineArray } from "../../schema/parsingUtils"
import { formatChunkedLines } from "../../schema/serializationUtils"

export const crossSectionSchema = schema([
  multiField(
    "Type RM Length L Ch R =",
    fields({
      type: numberPart({ integer: true, pad: true }),
      riverMile: stringPart({ trim: true, width: 8 }),
      lengthLeft: numberPart({ nullOnBlank: true }),
      lengthChannel: numberPart({ nullOnBlank: true }),
      lengthRight: numberPart({ nullOnBlank: true }),
    }),
  ),
  textBlockField("description", "DESCRIPTION", { optional: true }),
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
      numberOfMannings: countedArrayLengthPart("mannings", { pad: true }),
      horizontalManning: booleanPart({ mode: "-1,0", pad: true }),
      horizontalK: booleanPart({ mode: "-1,0", pad: true }),
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
      numberOfFlowAreas: countedArrayLengthPart("ineffectiveFlowAreas", { pad: true }),
      ineffectiveFlowMultipleBlocks: booleanPart({ mode: "-1,0", pad: true }),
    }),
    { optional: true },
  ),
  countedFixedWidthArray("ineffectiveFlowAreas", {
    maxWidth: 72,
    width: 8,
    tuple: 3 as const,
    formatter: "station",
    optional: true,
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
        const booleans = data.map((seg) => seg === "T")
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
    "#Block Obstruct=",
    fields({
      numberOfBlocks: countedArrayLengthPart("obstructions", { pad: true }),
      multipleObstructions: booleanPart({ mode: "-1,0", pad: true }),
    }),
    { optional: true },
  ),
  countedFixedWidthArray("obstructions", {
    maxWidth: 72,
    width: 8,
    tuple: 3 as const,
    formatter: "station",
    optional: true,
  }),
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
      ratingCurveType: countedArrayLengthPart("ratingCurve", { pad: true }),
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
      htabCount: opt(numberPart({ integer: true, pad: true })),
    }),
    { optional: true },
  ),
  multiField(
    "XS HTab Horizontal Distribution=",
    fields({
      horizontalHTabLeftBank: numberPart({ integer: true, pad: true }),
      horizontalHTabChannel: numberPart({ integer: true, pad: true }),
      horizontalHTabRightBank: numberPart({ integer: true, pad: true }),
    }),
    { optional: true },
  ),
  numberField("sedimentElevation", "Sediment Elevation=", { optional: true }),
  numberField("skewAngle", "Skew Angle=", { optional: true, pad: true }),
  multiField(
    "Exp/Cntr=",
    fields({
      expansionCoefficient: numberPart(),
      contractionCoefficient: numberPart(),
    }),
  ),
  blankLine(),
])

export type CrossSectionSchema = Infer<typeof crossSectionSchema>
