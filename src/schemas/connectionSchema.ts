import {
  schema,
  fields,
  multiField,
  tupleArrayField,
  stringField,
  numberField,
  booleanField,
  section,
  repeat,
  startsWith,
  stringPart,
  numberPart,
  type Infer,
  blankLine,
  countedArrayLengthPart,
  booleanPart,
  countedFixedWidthArray,
} from "../schema"
import { bridgeSchema } from "./bridge/bridgeSchema"
import { culvertSchema } from "./culvertSchema"

export interface OutletRatingCurveSchema {
  value: number
  flag: boolean
  param3?: string
  param4?: string
}

export const connectionSchema = schema([
  multiField(
    "Connection=",
    fields({
      name: stringPart({ trim: true, width: 16 }),
      centroidX: numberPart({ nullOnBlank: true }),
      centroidY: numberPart({ nullOnBlank: true }),
    }),
  ),
  stringField("description", "Connection Desc=", { optional: true, trim: true }),
  tupleArrayField("Connection Line=", "connectionLine", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
  }),
  tupleArrayField("Connection Centerline Profile=", "centerlineProfile", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    optional: true,
  }),
  stringField("lastEditedTime", "Connection Last Edited Time=", { optional: true, trim: true }),
  numberField("cellSizeMin", "Conn CellSize Min=", { integer: true, optional: true }),
  numberField("cellSizeMax", "Conn CellSize Max=", { integer: true, optional: true }),
  numberField("nearRepeats", "Conn Near Repeats=", { integer: true, optional: true }),
  numberField("protectionRadius", "Conn Protection Radius=", { optional: true }),
  stringField("upstreamStorageArea", "Connection Up SA=", { length: 16, trim: true }),
  stringField("downstreamStorageArea", "Connection Dn SA=", { length: 16, trim: true }),
  numberField("routingType", "Conn Routing Type=", { integer: true, optional: true, padded: true }),
  booleanField("useRCFamily", "Conn Use RC Family=", { mode: "trueFalse", optional: true }),
  booleanField("overflowMethod2D", "Conn OverFlow Method 2D=", {
    mode: "trueFalse",
    optional: true,
  }),
  numberField("weirWD", "Conn Weir WD=", { optional: true }),
  numberField("weirCoefficient", "Conn Weir Coef=", { optional: true }),
  numberField("weirIsOgee", "Conn Weir Is Ogee=", { integer: true, optional: true, padded: true }),
  numberField("weirDesignEG", "Conn Weir Design EG=", { integer: true, optional: true }),
  numberField("weirDesignHT", "Conn Weir Design HT=", { integer: true, optional: true }),
  numberField("simpleSpillPosCoef", "Conn Simple Spill Pos Coef=", { optional: true }),
  numberField("simpleSpillNegCoef", "Conn Simple Spill Neg Coef=", {
    optional: true,
  }),
  tupleArrayField("Conn Weir SE=", "weirSE", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    optional: true,
    pad: true,
  }),
  numberField("hTabHWMax", "Conn HTab HWMax=", { nullOnBlank: true, optional: true }),
  numberField("hTabTWMax", "Conn HTab TWMax=", { optional: true, nullOnBlank: true }),
  blankLine(),
  numberField("hTabMaxFlow", "Conn HTab MaxFlow=", { optional: true }),
  repeat("culvert", startsWith("Connection Culv="), culvertSchema),
  multiField(
    "Conn Outlet Rating Curve=",
    fields({
      numberOfPoints: countedArrayLengthPart("outletRatingCurve", { padded: true }),
      param1: booleanPart({ mode: "trueFalse" }),
      param2: numberPart({ nullOnBlank: true }),
      param3: numberPart({ nullOnBlank: true }),
    }),
  ),
  countedFixedWidthArray("outletRatingCurve", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    formatter: "station",
    optional: true,
  }),
  section("bridge", startsWith("Conn BR: Bridge="), bridgeSchema),
])

export type ConnectionSchema = Infer<typeof connectionSchema>
