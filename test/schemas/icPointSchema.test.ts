import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { icPointSchema, type ICPointSchema } from "../../src/schemas/icPointSchema"

describe("icPointSchema", () => {
  const sampleLines = ["IC Point Name=TestPoint", "IC Point Position=491202.53125,4753367.5"]

  it("parses IC Point data into tuple form", () => {
    const result = parseWithSchema(icPointSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toEqual({
      name: "TestPoint",
      x: 491202.53125,
      y: 4753367.5,
    })
  })

  it("serializes IC Point data with padded name and formatted coordinates", () => {
    const icPoint: ICPointSchema = {
      name: "TestPoint",
      x: 491202.53125,
      y: 4753367.5,
    }

    const lines = serializeWithSchema(icPointSchema, icPoint)
    const expectedName = `IC Point Name=${"TestPoint".padEnd(32, " ")}`

    expect(lines).toEqual([expectedName, "IC Point Position=491202.53125,4753367.5"])
  })
})
