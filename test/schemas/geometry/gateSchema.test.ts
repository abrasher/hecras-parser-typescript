import { describe, expect, it } from "vitest"
import { parseWithSchema, schema, serializeWithSchema } from "../../../src/schema"
import { userCurveSetContextual } from "../../../src/schemas/geometry/gate/userCurveSetSchema"

const lineString = `Connection Gate User Curve Set=Curve Set#1
Connection Gate User Curve Set Headwater=3
       1       2       3
Connection Gate User Curve Set Gate Opening=2
     100     102
Connection Gate User Curve Set Flows
     200     300
     201     301
     202     302
Connection Gate User Curve Set=Curve Set#2
Connection Gate User Curve Set Headwater=2
       1       2
Connection Gate User Curve Set Gate Opening=2
     100     102
Connection Gate User Curve Set Flows
     200     300
     201     301`

const expectedCurveSet = [
  {
    name: "Curve Set#1",
    headwaters: [1, 2, 3],
    curves: [
      { openingHeight: 100, flows: [200, 201, 202] },
      { openingHeight: 102, flows: [300, 301, 302] },
    ],
  },
  {
    name: "Curve Set#2",
    headwaters: [1, 2],
    curves: [
      { openingHeight: 100, flows: [200, 201] },
      { openingHeight: 102, flows: [300, 301] },
    ],
  },
]

const curveSchema = schema([userCurveSetContextual])

describe("gateSchema", () => {
  it("parses Gate geometry correctly", () => {
    const result = parseWithSchema(curveSchema, lineString.split("\n"), 0)

    console.log("Parsed result:", JSON.stringify(result.value, null, 2))
    expect(result.value.userDefinedGateCurves).toMatchObject(expectedCurveSet)
  })
  it("serializes Gate geometry correctly", () => {
    const result = parseWithSchema(curveSchema, lineString.split("\n"), 0)
    const serialized = serializeWithSchema(curveSchema, result.value)
    expect(serialized.join("\n")).toEqual(lineString)
  })
})
