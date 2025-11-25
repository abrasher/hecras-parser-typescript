import {
  schema,
  fields,
  multiField,
  repeat,
  stringField,
  stringPart,
  numberPart,
  startsWith,
  type Infer,
  booleanPart,
  blankLine,
} from "../../schema"

/**
 * Schema for parsing Junction geometry definitions from HEC-RAS format
 *
 * Format:
 * Junct Name=<name>
 * Junct Desc=<description>,<steadyFlowComputationMode>,<addWeight>,<addFriction>,<unsteadyComputationMode>
 * Junct X Y & Text X Y=<px>,<py>,<tx>,<ty>
 * Up River,Reach=<river>,<reach> (repeated 0+ times)
 * Dn River,Reach=<river>,<reach>
 * Junc L&A=<length>,<angle> (repeated 0+ times)
 *
 * Where boolean modes are encoded as:
 * - steadyFlowComputationMode: -1 = momentum computation, 0 = energy computation
 * - addWeight: -1 = true, 0 = false
 * - addFriction: -1 = true, 0 = false
 * - unsteadyComputationMode: -1 = energy balance method, 0 = force equal water surface elevations
 */

// Sub-schemas for repeated items

export const junctionSchema = schema([
  stringField("name", "Junct Name=", { width: 16 }),

  multiField(
    "Junct Desc=",
    fields({
      description: stringPart({}),
      // -1 means in momentum computation mode
      // 0 meanns energy computation mode
      steadyFlowComputationMode: booleanPart({ mode: "-1,0" }),
      addWeight: booleanPart({ mode: "-1,0" }),
      addFriction: booleanPart({ mode: "-1,0" }),
      // -1 = Energy balance method
      // 0 = Force equal water surface elevations
      unsteadyComputationMode: booleanPart({ mode: "-1,0" }),
    }),
  ),

  multiField(
    "Junct X Y & Text X Y=",
    fields({
      positionX: numberPart(),
      positionY: numberPart(),
      textPositionX: numberPart(),
      textPositionY: numberPart(),
    } as const),
  ),

  repeat(
    "upstreamConnections",
    startsWith("Up River,Reach="),
    schema([
      multiField(
        "Up River,Reach=",
        fields({
          river: stringPart({ trim: true, width: 16 }),
          reach: stringPart({ trim: true }),
        }),
      ),
    ]),
  ),

  multiField(
    "Dn River,Reach=",
    fields({
      downstreamRiver: stringPart({ trim: true, width: 16 }),
      downstreamReach: stringPart({ trim: true }),
    }),
  ),

  repeat(
    "lengthAndAngles",
    startsWith("Junc L&A="),
    schema([
      multiField(
        "Junc L&A=",
        fields({
          length: numberPart({ nullOnBlank: true }),
          angle: numberPart({ nullOnBlank: true }),
        }),
      ),
    ]),
  ),
  blankLine(),
])

export type JunctionSchema = Infer<typeof junctionSchema>
