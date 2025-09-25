import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { icPointSchema, type ICPointSchema } from "../../src/schemas/icPointSchema"
import type { ICPoint } from "../../src/models/geometry/icPoint"

describe("icPointSchema", () => {
  const sampleLines = [
    "IC Point Name=TestPoint",
    "IC Point Position=491202.53125,4753367.5",
  ]

  it("parses IC Point data into tuple form", () => {
    const result = parseWithSchema(icPointSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toEqual({
      name: "TestPoint",
      coordinate: [491202.53125, 4753367.5],
    })
  })

  it("serializes IC Point data with padded name and formatted coordinates", () => {
    const icPoint: ICPointSchema = {
      name: "TestPoint",
      coordinate: [491202.53125, 4753367.5],
    }

    const lines = serializeWithSchema(icPointSchema, icPoint)
    const expectedName = `IC Point Name=${"TestPoint".padEnd(32, " ")}`

    expect(lines).toEqual([
      expectedName,
      "IC Point Position=491202.53125,4753367.5",
    ])
  })

  it("remains assignable to existing ICPoint model", () => {
    const schemaData: ICPointSchema = {
      name: "Corner",
      coordinate: [100.0, 200.5],
    }

    const modelData: ICPoint = schemaData

    expect(modelData.coordinate).toEqual([100.0, 200.5])
  })
})
