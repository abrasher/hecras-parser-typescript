import { describe, it, expect } from "vitest"
import { serializeBoundaryCondition, serializeBoundaryConditionString } from "../geometry/boundaryConditionSerializer"
import type { BoundaryCondition } from "../../models/geometry/boundaryCondition"

describe("BoundaryConditionSerializer", () => {
  describe("GIVEN a boundary condition with position data", () => {
    it("WHEN serialized THEN formats position coordinates", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "BC1",
        storageArea: "StorageArea1",
        startPosition: { x: 100.0, y: 200.0 },
        middlePosition: { x: 150.0, y: 250.0 },
        endPosition: { x: 200.0, y: 300.0 },
        arc: 0,
        arcCoordinates: [],
        textPosition: { x: "175", y: "275" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=BC1")
      expect(result[1]).toBe("BC Line Storage Area=StorageArea1")
      expect(result[2]).toBe("BC Line Start Position=100 , 200")
      expect(result[3]).toBe("BC Line Middle Position=150 , 250")
      expect(result[4]).toBe("BC Line End Position=200 , 300")
      expect(result[5]).toBe("BC Line Arc=0")
      expect(result[6]).toBe("BC Line Text Position=175 , 275")
    })
  })

  describe("GIVEN a boundary condition with arc data", () => {
    it("WHEN serialized THEN formats arc coordinates", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "BC2",
        storageArea: "StorageArea2",
        startPosition: { x: 0.0, y: 0.0 },
        middlePosition: { x: 50.0, y: 50.0 },
        endPosition: { x: 100.0, y: 100.0 },
        arc: 3,
        arcCoordinates: [
          { x: 10.0, y: 20.0 },
          { x: 30.0, y: 40.0 },
          { x: 50.0, y: 60.0 },
        ],
        textPosition: { x: "50", y: "50" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=BC2")
      expect(result[1]).toBe("BC Line Storage Area=StorageArea2")
      expect(result[2]).toBe("BC Line Start Position=0 , 0")
      expect(result[3]).toBe("BC Line Middle Position=50 , 50")
      expect(result[4]).toBe("BC Line End Position=100 , 100")
      expect(result[5]).toBe("BC Line Arc=3")
      expect(result[6]).toBe("            10.0            20.0")
      expect(result[7]).toBe("            30.0            40.0")
      expect(result[8]).toBe("            50.0            60.0")
      expect(result[9]).toBe("BC Line Text Position=50 , 50")
    })
  })

  describe("GIVEN a boundary condition with text positioning", () => {
    it("WHEN serialized THEN formats text position", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "TextBC",
        storageArea: "MainStorage",
        startPosition: { x: 0.0, y: 0.0 },
        middlePosition: { x: 25.0, y: 25.0 },
        endPosition: { x: 50.0, y: 50.0 },
        arc: 0,
        arcCoordinates: [],
        textPosition: { x: "25.5", y: "25.5" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=TextBC")
      expect(result[1]).toBe("BC Line Storage Area=MainStorage")
      expect(result[2]).toBe("BC Line Start Position=0 , 0")
      expect(result[3]).toBe("BC Line Middle Position=25 , 25")
      expect(result[4]).toBe("BC Line End Position=50 , 50")
      expect(result[5]).toBe("BC Line Arc=0")
      expect(result[6]).toBe("BC Line Text Position=25.5 , 25.5")
    })
  })

  describe("GIVEN a boundary condition with no arc coordinates", () => {
    it("WHEN serialized THEN omits arc coordinate lines", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "SimpleBC",
        storageArea: "SimpleStorage",
        startPosition: { x: 10.0, y: 10.0 },
        middlePosition: { x: 20.0, y: 20.0 },
        endPosition: { x: 30.0, y: 30.0 },
        arc: 0,
        arcCoordinates: [],
        textPosition: { x: "20", y: "20" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result).toHaveLength(7)
      expect(result[0]).toBe("BC Line Name=SimpleBC")
      expect(result[1]).toBe("BC Line Storage Area=SimpleStorage")
      expect(result[2]).toBe("BC Line Start Position=10 , 10")
      expect(result[3]).toBe("BC Line Middle Position=20 , 20")
      expect(result[4]).toBe("BC Line End Position=30 , 30")
      expect(result[5]).toBe("BC Line Arc=0")
      expect(result[6]).toBe("BC Line Text Position=20 , 20")
    })
  })

  describe("GIVEN a boundary condition with multiple arc coordinates", () => {
    it("WHEN serialized THEN formats all arc coordinates", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "MultiArcBC",
        storageArea: "ComplexStorage",
        startPosition: { x: 0.0, y: 0.0 },
        middlePosition: { x: 100.0, y: 100.0 },
        endPosition: { x: 200.0, y: 200.0 },
        arc: 5,
        arcCoordinates: [
          { x: 20.0, y: 20.0 },
          { x: 40.0, y: 40.0 },
          { x: 60.0, y: 60.0 },
          { x: 80.0, y: 80.0 },
          { x: 100.0, y: 100.0 },
        ],
        textPosition: { x: "100", y: "100" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=MultiArcBC")
      expect(result[1]).toBe("BC Line Storage Area=ComplexStorage")
      expect(result[2]).toBe("BC Line Start Position=0 , 0")
      expect(result[3]).toBe("BC Line Middle Position=100 , 100")
      expect(result[4]).toBe("BC Line End Position=200 , 200")
      expect(result[5]).toBe("BC Line Arc=5")
      expect(result[6]).toBe("            20.0            20.0")
      expect(result[7]).toBe("            40.0            40.0")
      expect(result[8]).toBe("            60.0            60.0")
      expect(result[9]).toBe("            80.0            80.0")
      expect(result[10]).toBe("           100.0           100.0")
      expect(result[11]).toBe("BC Line Text Position=100 , 100")
    })
  })

  describe("GIVEN a boundary condition with decimal coordinates", () => {
    it("WHEN serialized THEN preserves decimal precision", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "DecimalBC",
        storageArea: "PreciseStorage",
        startPosition: { x: 123.456, y: 789.012 },
        middlePosition: { x: 234.567, y: 890.123 },
        endPosition: { x: 345.678, y: 901.234 },
        arc: 1,
        arcCoordinates: [{ x: 111.111, y: 222.222 }],
        textPosition: { x: "234.567", y: "890.123" },
      }

      const result = serializeBoundaryCondition(boundaryCondition)

      expect(result[0]).toBe("BC Line Name=DecimalBC")
      expect(result[1]).toBe("BC Line Storage Area=PreciseStorage")
      expect(result[2]).toBe("BC Line Start Position=123.456 , 789.012")
      expect(result[3]).toBe("BC Line Middle Position=234.567 , 890.123")
      expect(result[4]).toBe("BC Line End Position=345.678 , 901.234")
      expect(result[5]).toBe("BC Line Arc=1")
      expect(result[6]).toBe("         111.111         222.222")
      expect(result[7]).toBe("BC Line Text Position=234.567 , 890.123")
    })
  })

  describe("GIVEN a complete boundary condition", () => {
    it("WHEN serialized THEN produces valid boundary condition string", () => {
      const boundaryCondition: BoundaryCondition = {
        name: "CompleteBoundary",
        storageArea: "MainStorageArea",
        startPosition: { x: 0.0, y: 0.0 },
        middlePosition: { x: 50.0, y: 50.0 },
        endPosition: { x: 100.0, y: 100.0 },
        arc: 2,
        arcCoordinates: [
          { x: 25.0, y: 25.0 },
          { x: 75.0, y: 75.0 },
        ],
        textPosition: { x: "50", y: "50" },
      }

      const result = serializeBoundaryConditionString(boundaryCondition)
      const lines = result.split("\n")

      expect(lines[0]).toBe("BC Line Name=CompleteBoundary")
      expect(lines[1]).toBe("BC Line Storage Area=MainStorageArea")
      expect(lines[2]).toBe("BC Line Start Position=0 , 0")
      expect(lines[3]).toBe("BC Line Middle Position=50 , 50")
      expect(lines[4]).toBe("BC Line End Position=100 , 100")
      expect(lines[5]).toBe("BC Line Arc=2")
      expect(lines[6]).toBe("            25.0            25.0")
      expect(lines[7]).toBe("            75.0            75.0")
      expect(lines[8]).toBe("BC Line Text Position=50 , 50")
    })
  })
})
