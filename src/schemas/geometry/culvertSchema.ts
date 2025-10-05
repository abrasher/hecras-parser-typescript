import {
  schema,
  fields,
  multiField,
  numberField,
  stringPart,
  numberPart,
  repeat,
  startsWith,
  countedFixedWidthArray,
  countedArrayLengthPart,
  type Infer,
  booleanPart,
} from "../../schema"

/**
 * Schema for a single culvert barrel within a culvert group
 *
 * Format:
 * Conn Culvert Barrel=<index>,<name>,<numberOfCoordinates>
 * <coordinate data in 16-char fixed-width format, 2 coordinates per line>
 *   - numberOfCoordinates is inferred from `coordinates.length`
 */
export const culvertBarrelSchema = schema([
  // Conn Culvert Barrel=index,name,numberOfCoordinates
  multiField(
    "Conn Culvert Barrel=",
    fields({
      index: numberPart({ integer: true }),
      name: stringPart({ trim: true }),
      numberOfCoordinates: countedArrayLengthPart("coordinates"),
    }),
  ),

  countedFixedWidthArray("coordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    formatter: "coordinate",
  }),
])

export type CulvertBarrelSchema = Infer<typeof culvertBarrelSchema>

/**
 * Schema for a culvert group within a connection
 *
 * Format:
 * Connection Culv=<shape>,<rise>,<span>,<length>,<nTop>,<entranceLoss>,<exitLoss>,<chart>,<scale>,<upstreamInvert>,<downstreamInvert>,<numberOfBarrels>,<culvertGroupName>,<unknownFlag>,
 * <barrel station data in 8-char fixed-width format>
 *   - numberOfBarrels is inferred from `barrelStations.length` when serializing
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
      numberOfBarrels: countedArrayLengthPart("barrelStations", { pad: true }),
      culvertGroupName: stringPart({ trim: true, width: 12 }),
      unknownFlag: booleanPart({ mode: "-1,0", pad: true }),
      unknownParameter: numberPart({ nullOnBlank: true }),
    }),
  ),

  countedFixedWidthArray("barrelStations", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    formatter: "station",
  }),

  // Culvert barrels (0 or more)
  repeat("barrels", startsWith("Conn Culvert Barrel="), culvertBarrelSchema),
  // Optional fields
  numberField("nBottom", "Conn Culv Bottom n=", { optional: true }),
  numberField("nBottomDepth", "Conn Culv Bottom Depth=", { optional: true }),
  numberField("depthBlocked", "Conn Culv Depth Blocked=", { optional: true }),
])

export type CulvertSchema = Infer<typeof culvertSchema>
