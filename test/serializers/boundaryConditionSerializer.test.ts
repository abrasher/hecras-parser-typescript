import { describe, it, expect } from "vitest"
import { serializeBoundaryCondition } from "../../src/serializers/geometry/boundaryConditionSerializer"
import type { BoundaryCondition } from "../../src/models/geometry/boundaryCondition"

describe("BoundaryConditionSerializer", () => {
  describe("GIVEN a boundary condition with position data", () => {
    it("WHEN serialized THEN formats position coordinates", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "BC1",
        storageArea: "2D_Grid",
        startPosition: { x: 485748.087453498, y: 4751198.7455208 },
        middlePosition: { x: 485779.453690181, y: 4751203.15089112 },
        endPosition: { x: 485810.819926863, y: 4751207.55626144 },
        arc: 2,
        arcCoordinates: [
          {
            x: 485748.087453498,
            y: 4751198.7455208,
          },
          {
            x: 485810.819926863,
            y: 4751207.55626144,
          },
        ],
        textPosition: { x: "1.79769313486232E+308", y: "1.79769313486232E+308" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=BC1                             ")
      expect(result[1]).toBe("BC Line Storage Area=2D_Grid         ")
      expect(result[2]).toBe("BC Line Start Position= 485748.087453498 , 4751198.7455208 ")
      expect(result[3]).toBe("BC Line Middle Position= 485779.453690181 , 4751203.15089112 ")
      expect(result[4]).toBe("BC Line End Position= 485810.819926863 , 4751207.55626144 ")
      expect(result[5]).toBe("BC Line Arc= 2 ") // this might be actually "BC Line Arc= 2 ", check later
      expect(result[6]).toBe("485748.087453498 4751198.7455208485810.8199268634751207.55626144")
      expect(result[7]).toBe(
        "BC Line Text Position= 1.79769313486232E+308 , 1.79769313486232E+308 ",
      )
    })
  })
})
