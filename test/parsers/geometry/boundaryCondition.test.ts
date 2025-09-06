import { describe, expect, it } from "vitest"
import { parseBoundaryConditionData } from "../../../src/parsers/geometry/boundaryConditionParser"
import type { BoundaryCondition } from "../../../src/models/geometry/boundaryCondition"

describe("Boundary Condition Unit Tests", () => {
  const lines = lineString.split("\n")

  it("input data should be correct", () => {
    expect(lines.length).toBe(27)
  })

  describe("First Boundary Condition (S166)", () => {
    let bcData: ReturnType<typeof parseBoundaryConditionData>

    it("should parse basic boundary condition properties", () => {
      bcData = parseBoundaryConditionData(lines[0], lines, 0)

      expect(bcData.data.name).toBe("S166")
      expect(bcData.data.storageArea).toBe("2D_Grid")
      expect(bcData.data.arcCoordinates.length).toBe(2)
    })

    it("should parse coordinate positions", () => {
      expect(bcData.data.startPosition).toEqual([485748.087453498, 4751198.7455208])
      expect(bcData.data.middlePosition).toEqual([485779.453690181, 4751203.15089112])
      expect(bcData.data.endPosition).toEqual([485810.819926863, 4751207.55626144])
    })

    it("should parse arc coordinates", () => {
      expect(bcData.data.arcCoordinates).toHaveLength(2)
      expect(bcData.data.arcCoordinates[0]).toEqual([485748.087453498, 4751198.7455208])
      expect(bcData.data.arcCoordinates[1]).toEqual([485810.819926863, 4751207.55626144])
    })

    it("should parse text position", () => {
      expect(bcData.data.textPosition).toEqual({
        x: "1.79769313486232E+308",
        y: "1.79769313486232E+308",
      })
    })

    it("should return correct number of lines consumed", () => {
      expect(bcData.linesConsumed).toBe(8)
    })
  })

  describe("Second Boundary Condition (633_2)", () => {
    let bcData: ReturnType<typeof parseBoundaryConditionData>

    it("should parse second boundary condition", () => {
      bcData = parseBoundaryConditionData(lines[8], lines, 8)

      expect(bcData.data.name).toBe("633_2")
      expect(bcData.data.storageArea).toBe("2D_Grid")
      expect(bcData.data.arcCoordinates.length).toBe(3)
    })

    it("should parse arc coordinates with 3 points", () => {
      expect(bcData.data.arcCoordinates).toHaveLength(3)
      expect(bcData.data.arcCoordinates[0]).toEqual([484415.211449923, 4750224.91492707])
      expect(bcData.data.arcCoordinates[1]).toEqual([484394.944244852, 4750221.64055968])
      expect(bcData.data.arcCoordinates[2]).toEqual([484364.337900046, 4750216.17530629])
    })

    it("should return correct number of lines consumed", () => {
      expect(bcData.linesConsumed).toBe(9)
    })
  })

  describe("Third Boundary Condition (S199)", () => {
    let bcData: ReturnType<typeof parseBoundaryConditionData>

    it("should parse third boundary condition", () => {
      bcData = parseBoundaryConditionData(lines[17], lines, 17)

      expect(bcData.data.name).toBe("S199")
      expect(bcData.data.storageArea).toBe("2D_Grid")
      expect(bcData.data.arcCoordinates.length).toBe(6)
    })

    it("should parse arc coordinates with 6 points", () => {
      expect(bcData.data.arcCoordinates).toHaveLength(6)
      expect(bcData.data.arcCoordinates[0]).toEqual([484682.664690301, 4750565.69624726])
      expect(bcData.data.arcCoordinates[1]).toEqual([484712.235315286, 4750556.09722015])
      expect(bcData.data.arcCoordinates[2]).toEqual([484748.250469295, 4750560.65178075])
      expect(bcData.data.arcCoordinates[3]).toEqual([484755.92919377, 4750589.0621334])
      expect(bcData.data.arcCoordinates[4]).toEqual([484734.231120695, 4750621.72216582])
      expect(bcData.data.arcCoordinates[5]).toEqual([484718.06292799, 4750633.17418926])
    })

    it("should return correct number of lines consumed", () => {
      expect(bcData.linesConsumed).toBe(10)
    })
  })

  describe("Complete Object Validation", () => {
    it("should equal the test boundary condition objects", () => {
      const bc1 = parseBoundaryConditionData(lines[0], lines, 0)
      const bc2 = parseBoundaryConditionData(lines[8], lines, 8)
      const bc3 = parseBoundaryConditionData(lines[17], lines, 17)

      expect(bc1.data).toEqual(testBoundaryConditions[0])
      expect(bc2.data).toEqual(testBoundaryConditions[1])
      expect(bc3.data).toEqual(testBoundaryConditions[2])
    })
  })
})

const lineString = `BC Line Name=S166                            
BC Line Storage Area=2D_Grid         
BC Line Start Position= 485748.087453498 , 4751198.7455208 
BC Line Middle Position= 485779.453690181 , 4751203.15089112 
BC Line End Position= 485810.819926863 , 4751207.55626144 
BC Line Arc= 2 
485748.087453498 4751198.7455208485810.8199268634751207.55626144
BC Line Text Position= 1.79769313486232E+308 , 1.79769313486232E+308 
BC Line Name=633_2                           
BC Line Storage Area=2D_Grid         
BC Line Start Position= 484415.211449923 , 4750224.91492707 
BC Line Middle Position= 484389.746233154 , 4750220.71237138 
BC Line End Position= 484364.337900046 , 4750216.17530629 
BC Line Arc= 3 
484415.2114499234750224.91492707484394.9442448524750221.64055968
484364.3379000464750216.17530629
BC Line Text Position= 1.79769313486232E+308 , 1.79769313486232E+308 
BC Line Name=S199                            
BC Line Storage Area=2D_Grid         
BC Line Start Position= 484682.664690301 , 4750565.69624726 
BC Line Middle Position= 484750.998190567 , 4750570.81801742 
BC Line End Position= 484718.06292799 , 4750633.17418926 
BC Line Arc= 6 
484682.6646903014750565.69624726484712.2353152864750556.09722015
484748.2504692954750560.65178075 484755.92919377 4750589.0621334
484734.2311206954750621.72216582 484718.062927994750633.17418926
BC Line Text Position= 1.79769313486232E+308 , 1.79769313486232E+308 `

const testBoundaryConditions: BoundaryCondition[] = [
  {
    name: "S166",
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
  },
  {
    name: "633_2",
    storageArea: "2D_Grid",
    startPosition: [484415.211449923, 4750224.91492707],
    middlePosition: [484389.746233154, 4750220.71237138],
    endPosition: [484364.337900046, 4750216.17530629],
    arcCoordinates: [
      [484415.211449923, 4750224.91492707],
      [484394.944244852, 4750221.64055968],
      [484364.337900046, 4750216.17530629],
    ],
    textPosition: {
      x: "1.79769313486232E+308",
      y: "1.79769313486232E+308",
    },
  },
  {
    name: "S199",
    storageArea: "2D_Grid",
    startPosition: [484682.664690301, 4750565.69624726],
    middlePosition: [484750.998190567, 4750570.81801742],
    endPosition: [484718.06292799, 4750633.17418926],
    arcCoordinates: [
      [484682.664690301, 4750565.69624726],
      [484712.235315286, 4750556.09722015],
      [484748.250469295, 4750560.65178075],
      [484755.92919377, 4750589.0621334],
      [484734.231120695, 4750621.72216582],
      [484718.06292799, 4750633.17418926],
    ],
    textPosition: {
      x: "1.79769313486232E+308",
      y: "1.79769313486232E+308",
    },
  },
]
