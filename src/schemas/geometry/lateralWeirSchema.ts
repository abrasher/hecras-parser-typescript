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
  booleanField,
  stringField,
  blankLine,
  startsWith,
  repeat,
} from "../../schema"

const typePart = numberPart({ integer: true, pad: true })

const endStationBasePart = numberPart()

const endStationPart: Part<number> = {
  parse(segment) {
    return endStationBasePart.parse(segment)
  },
  serialize(value) {
    const serialized = endStationBasePart.serialize(value)

    if (serialized === "") {
      return "".padEnd(16, " ")
    }

    if (serialized.length >= 16) {
      return serialized.slice(0, 16)
    }

    return serialized.padEnd(16, " ")
  },
  nullOnBlank: endStationBasePart.nullOnBlank,
}

export const lateralWeirSchema = schema([
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
  stringField("lastEditedTime", "Node Last Edited Time=", { optional: true, trim: true }),
  numberField("position", "Lateral Weir Pos=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir End=",
    fields({
      endRiver: stringPart({ trim: true, width: 16 }),
      endReach: stringPart({ trim: true, width: 16 }),
      endCrossSection: stringPart({ trim: true, width: 8 }),
      endStation: endStationPart,
    }),
  ),
  numberField("distance", "Lateral Weir Distance=", { integer: true }),
  numberField("tailwaterMultipleCrossSections", "Lateral Weir TW Multiple XS=", {
    integer: true,
  }),
  numberField("weirWidth", "Lateral Weir WD="),
  numberField("weirCoefficient", "Lateral Weir Coef="),
  booleanField("wsCriteria", "Lateral Weir WSCriteria=", { mode: "-1,0", pad: true }),
  numberField("flapGateCount", "Lateral Weir Flap Gates=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir Hagers EQN=",
    fields({
      hagersEquation: numberPart({ integer: true, pad: true }),
      hagersCoefficient1: numberPart({ nullOnBlank: true }),
      hagersCoefficient2: numberPart({ nullOnBlank: true }),
      hagersCoefficient3: numberPart({ nullOnBlank: true }),
      hagersCoefficient4: numberPart({ nullOnBlank: true }),
      hagersCoefficient5: numberPart({ nullOnBlank: true }),
    }),
  ),
  multiField(
    "Lateral Weir SS=",
    fields({
      sideSlopeUpstream: numberPart(),
      sideSlopeDownstream: numberPart(),
      sideSlopeAdditional: numberPart({ nullOnBlank: true }),
    }),
  ),
  numberField("lateralWeirType", "Lateral Weir Type=", { integer: true, pad: true }),
  multiField(
    "Lateral Weir Connection Pos and Dist=",
    fields({
      connectionPosition: numberPart({ integer: true, pad: true }),
      connectionDistance: numberPart({ nullOnBlank: true }),
    }),
  ),
  multiField(
    "Lateral Weir SE=",
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
  numberField("centerlineOption", "Lateral Weir Centerline=", { integer: true, pad: true }),

  repeat(
    "headwaterConnections",
    startsWith("Lateral Weir HW RS Station="),
    schema([
      multiField(
        "Lateral Weir HW RS Station=",
        fields({
          station: stringPart(),
          elevation: stringPart(),
        }),
      ),
    ]),
  ),
  repeat(
    "tailwaterConnections",
    startsWith("Lateral Weir TW RS Station="),
    schema([
      multiField(
        "Lateral Weir TW RS Station=",
        fields({
          station: stringPart(),
          elevation: stringPart(),
        }),
      ),
    ]),
  ),

  multiField(
    "LW Div RC=",
    fields({
      ratingCurveId: numberPart({ integer: true, pad: true }),
      useRatingCurve: booleanPart({ mode: "trueFalse" }),
      ratingCurveLabel: stringPart({ trim: true }),
    }),
  ),
  blankLine(),
])

export type LateralWeirSchema = Infer<typeof lateralWeirSchema>
