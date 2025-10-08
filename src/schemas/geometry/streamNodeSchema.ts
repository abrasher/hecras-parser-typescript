import {
  blankLine,
  fields,
  multiField,
  numberPart,
  schema,
  stringPart,
  type Infer,
} from "../../schema"

/**
 * Schema for Stream Node entries in HEC-RAS geometry files.
 * Stream Nodes represent upstream/downstream endpoints of river reaches.
 *
 * Format:
 * Stream Node=<river>,<reach>,<idx1>,<idx2>,<description>
 *
 * Example:
 * Stream Node=Cumberland River,Cumberland River, 0 , 0 ,Upstream end
 */
export const streamNodeSchema = schema([
  multiField(
    "Stream Node=",
    fields({
      river: stringPart({ width: 16, trim: true }),
      reach: stringPart({ width: 16, trim: true }),
      index1: numberPart({ pad: true }),
      index2: numberPart({ pad: true }),
      description: stringPart({ width: 64, trim: true }),
    }),
  ),
  blankLine(),
])

export type StreamNode = Infer<typeof streamNodeSchema>
