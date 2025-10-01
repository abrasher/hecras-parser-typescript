import {
  schema,
  fields,
  multiField,
  tupleArrayField,
  stringField,
  numberField,
  booleanField,
  contextual,
  section,
  repeat,
  startsWith,
  stringPart,
  numberPart,
  type Infer,
  blankLine,
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
  contextual("outletRatingCurve", parseOutletRatingCurve, serializeOutletRatingCurve),
  section("bridge", startsWith("Conn BR: Bridge="), bridgeSchema),
])

export type ConnectionSchema = Infer<typeof connectionSchema>

function parseOutletRatingCurve(
  lines: string[],
  startIndex: number,
  _context: Record<string, unknown>,
) {
  let index = startIndex
  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1
  }
  const line = lines[index]
  if (!line?.startsWith("Conn Outlet Rating Curve=")) {
    return null
  }

  const raw = line.slice("Conn Outlet Rating Curve=".length)
  const parts = raw.split(",").map((part) => part.trim())

  const curve: OutletRatingCurveSchema = {
    value: parseInt(parts[0] ?? "0", 10),
    flag: (parts[1] ?? "").toLowerCase() === "true",
  }

  curve.param3 = parts[2] ?? ""
  curve.param4 = parts[3] ?? ""

  return {
    value: curve,
    nextIndex: index + 1,
  }
}

function serializeOutletRatingCurve(
  value: OutletRatingCurveSchema | undefined,
  _context: Record<string, unknown>,
): string[] {
  if (!value) {
    return []
  }

  const segments = [
    `${value.value} `,
    value.flag ? "True" : "False",
    value.param3 ?? "",
    value.param4 ?? "",
  ]

  return [`Conn Outlet Rating Curve= ${segments.join(",")}`]
}
