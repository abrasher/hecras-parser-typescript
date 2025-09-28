import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import {
  boundaryConditionSchema,
  type BoundaryConditionSchema,
} from "../../src/schemas/boundaryConditionSchema"
import type { BoundaryCondition } from "../../src/models/geometry/boundaryCondition"

const sampleLines = [
  "BC Line Name=BC1                             ",
  "BC Line Storage Area=2D_Grid         ",
  "BC Line Start Position= 485748.087453498 , 4751198.7455208 ",
  "BC Line Middle Position= 485779.453690181 , 4751203.15089112 ",
  "BC Line End Position= 485810.819926863 , 4751207.55626144 ",
  "BC Line Arc= 2 ",
  "485748.087453498 4751198.7455208485810.8199268634751207.55626144",
  "BC Line Text Position= 1.79769313486232E+308 , 1.79769313486232E+308 ",
] as const

const sampleBoundaryCondition: BoundaryCondition = {
  name: "BC1",
  storageArea: "2D_Grid",
  startPosition: [485748.087453498, 4751198.7455208],
  middlePosition: [485779.453690181, 4751203.15089112],
  endPosition: [485810.819926863, 4751207.55626144],
  arcCoordinates: [
    [485748.087453498, 4751198.7455208],
    [485810.819926863, 4751207.55626144],
  ],
  textPosition: {
    x: "1.79769313486232E+308",
    y: "1.79769313486232E+308",
  },
}

describe("boundaryConditionSchema", () => {
  it("parses boundary condition lines", () => {
    const result = parseWithSchema(boundaryConditionSchema, [...sampleLines], 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toEqual(sampleBoundaryCondition)
  })

  it("serializes boundary condition data", () => {
    const lines = serializeWithSchema(boundaryConditionSchema, sampleBoundaryCondition)

    expect(lines).toEqual(sampleLines)
  })

  it("is compatible with BoundaryCondition type", () => {
    const schemaValue: BoundaryConditionSchema = sampleBoundaryCondition
    const modelValue: BoundaryCondition = schemaValue

    expect(modelValue.name).toBe("BC1")
    expect(schemaValue.arcCoordinates[0][0]).toBeCloseTo(485748.087453498)
  })
})
