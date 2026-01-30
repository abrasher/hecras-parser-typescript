import {
  schema,
  fields,
  multiField,
  numberField,
  countedArrayLengthPart,
  countedFixedWidthArray,
  numberPart,
  stringPart,
  booleanPart,
  type Infer,
  type Part,
  stringField,
  blankLine,
  textBlockField,
  contextual,
  repeat,
  startsWith,
} from "../../schema"
import { parseCommaSeparated, parseMaybeFloat, parseMaybeInt } from "../../schema/parsingUtils"
import { formatBoolean, formatCommaSeparated } from "../../schema/serializationUtils"

const typePart = numberPart({ integer: true, pad: true })

// Custom part for integers with space padding: " 3 " or " 15 "
const spacePaddedIntPart = (): Part<number> => ({
  parse: (segment) => {
    const trimmed = segment.trim()
    return trimmed === "" ? 0 : parseInt(trimmed, 10)
  },
  serialize: (value) => ` ${value} `,
})

// Gate opening schema - each gate has multiple openings
const gateOpeningSchema = schema([
  multiField(
    "IW Gate Opening=",
    fields({
      openingNumber: numberPart({ integer: true }),
      openingName: stringPart({ trim: true }),
      openingValue: numberPart(),
    }),
  ),
])

// Gate schema - uses multiField for the data line
const gateSchema = schema([
  // Header line (implicit - recognized by repeat's startsWith)
  contextual(
    "gateHeader",
    (lines, startIndex) => {
      const headerLine = lines[startIndex]
      if (!headerLine?.startsWith("IW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings")) {
        return null
      }
      return {
        value: null,
        nextIndex: startIndex + 1,
      }
    },
    () => ["IW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings"],
  ),

  // Gate data line with comma-separated fields
  multiField(
    "",
    fields({
      gateName: stringPart({ trim: true, width: 12 }),
      width: numberPart(),
      height: numberPart(),
      invert: numberPart(),
      gateCoefficient: numberPart(),
      expT: numberPart(),
      expO: numberPart(),
      expH: numberPart(),
      type: spacePaddedIntPart(),
      weirCoefficient: numberPart(),
      isOgee: spacePaddedIntPart(),
      spillHeight: numberPart({ nullOnBlank: true }),
      designHead: numberPart({ nullOnBlank: true }),
      numberOfOpenings: spacePaddedIntPart(),
      param14: numberPart(),
      param15: numberPart(),
      param16: spacePaddedIntPart(),
      param17: numberPart(),
      param18: numberPart({ nullOnBlank: true }),
      param19: numberPart(),
      param20: numberPart(),
      param21: numberPart(),
      param22: spacePaddedIntPart(),
    }),
  ),

  // Station positions (count determined by numberOfOpenings)
  contextual(
    "stations",
    (lines, startIndex) => {
      const stationLine = lines[startIndex]
      if (!stationLine || stationLine.trim() === "") {
        return null
      }

      const stations: number[] = []
      const stationParts = stationLine.trim().split(/\s+/)
      for (const part of stationParts) {
        const val = parseMaybeFloat(part)
        if (val !== null) stations.push(val)
      }

      return {
        value: stations,
        nextIndex: startIndex + 1,
      }
    },
    (stations) => {
      if (!stations || stations.length === 0) return []
      return [stations.map(s => s.toString().padStart(8)).join("")]
    },
  ),

  repeat("openings", startsWith("IW Gate Opening="), gateOpeningSchema),
])

export const inlineWeirSchema = schema([
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
  numberField("pilotFlow", "IW Pilot Flow=", { integer: true }),
  multiField(
    "#Inline Weir SE=",
    fields({
      stageElevationCount: countedArrayLengthPart("stageElevationPairs", { pad: true }),
    }),
  ),
  countedFixedWidthArray("stageElevationPairs", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    pad: true,
    formatter: "station",
  }),
  contextual(
    "weirParameters",
    (lines, startIndex) => {
      const headerLine = lines[startIndex]
      if (!headerLine?.startsWith("IW Dist,WD,Coef,Skew,MaxSub,Min_El,Is_Ogee,SpillHt,DesHd")) {
        return null
      }

      const dataLine = lines[startIndex + 1]
      if (!dataLine) {
        throw new Error(`Expected data line after IW Dist header at line ${startIndex + 1}`)
      }

      const parts = parseCommaSeparated(dataLine)

      return {
        value: {
          distance: parseMaybeInt(parts[0]) ?? 0,
          weirWidth: parseMaybeFloat(parts[1]) ?? 0,
          weirCoefficient: parseMaybeFloat(parts[2]) ?? 0,
          skew: parseMaybeInt(parts[3]) ?? 0,
          maxSubmergence: parseMaybeFloat(parts[4]) ?? 0,
          minimumElevation: parseMaybeFloat(parts[5]),
          isOgee: parts[6]?.trim() === "-1",
          spillHeight: parseMaybeFloat(parts[7]),
          designHead: parseMaybeFloat(parts[8]),
          additionalParam1: parseMaybeInt(parts[9]) ?? 0,
          additionalParam2: parseMaybeInt(parts[10]) ?? 0,
          additionalParam3: parseMaybeInt(parts[11]),
        },
        nextIndex: startIndex + 2,
      }
    },
    (value) => {
      if (!value) return []

      const parts = [
        value.distance.toString(),
        value.weirWidth.toString(),
        value.weirCoefficient.toString(),
        value.skew.toString(),
        value.maxSubmergence.toString(),
        value.minimumElevation?.toString() ?? "",
        formatBoolean(value.isOgee, "10", true),
        value.spillHeight?.toString() ?? "",
        value.designHead?.toString() ?? "",
        value.additionalParam1.toString(),
        value.additionalParam2.toString(),
        value.additionalParam3?.toString() ?? "",
      ]

      return [
        "IW Dist,WD,Coef,Skew,MaxSub,Min_El,Is_Ogee,SpillHt,DesHd",
        formatCommaSeparated(parts),
      ]
    },
  ),
  repeat("gates", startsWith("IW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings"), gateSchema),
  numberField("flapGateCount", "Inline Weir Flap Gates=", { integer: true, pad: true }),
  multiField(
    "IW Outlet Rating Curve=",
    fields({
      iwUnknown1: numberPart({ integer: true, pad: true }),
      iwUnknown2: booleanPart({ mode: "trueFalse" }),
      iwUnknown3: stringPart({ trim: true }),
      iwUnknown4: stringPart({ trim: true }),
    }),
  ),
  blankLine(),
])

export type InlineWeirSchema = Infer<typeof inlineWeirSchema>
