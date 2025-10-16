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
  stringField,
  blankLine,
  textBlockField,
  contextual,
} from "../../schema"
import { parseCommaSeparated, parseMaybeFloat, parseMaybeInt } from "../../schema/parsingUtils"
import { formatBoolean, formatCommaSeparated } from "../../schema/serializationUtils"

const typePart = numberPart({ integer: true, pad: true })

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
          weirWidth: parseMaybeInt(parts[1]) ?? 0,
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
