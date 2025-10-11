import { schema, tupleArrayField, stringField, numberField, type Infer } from "../../schema"

/**
 * Schema for parsing BreakLine geometry definitions from HEC-RAS format
 *
 * Format:
 * BreakLine Name=<name>
 * BreakLine CellSize Min=<cellSizeMin>
 * BreakLine CellSize Max=<cellSizeMax|blank>
 * BreakLine Near Repeats=<nearRepeats>
 * BreakLine Protection Radius=<protectionRadius>
 * BreakLine Polyline= <numberOfPoints>
 * <coordinate data in 16-char fixed-width format, 2 coordinates per line>
 */
export const breakLineSchema = schema([
  stringField("name", "BreakLine Name=", { trim: true }),
  numberField("cellSizeMin", "BreakLine CellSize Min=", { nullOnBlank: true }),
  numberField("cellSizeMax", "BreakLine CellSize Max=", { nullOnBlank: true }),
  numberField("nearRepeats", "BreakLine Near Repeats="),
  numberField("protectionRadius", "BreakLine Protection Radius="),
  tupleArrayField("BreakLine Polyline=", "polylinePoints", {
    width: 16,
    maxWidth: 64, // 4 numbers per line * 16 chars = 64 chars max
    tuple: 2 as const, // [x, y] coordinate pairs
    pad: true,
    formatter: "coordinate",
  }),
])

export type BreakLineSchema = Infer<typeof breakLineSchema>
