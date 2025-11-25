import { describe, expect, it } from "vitest"
import {
  parseSectionWithSchema,
  parseWithSchema,
  serializeWithSchema,
} from "../../../src/schema"
import {
  oneDimStructureWithCulvertSchema,
  type OneDimStructureWithCulvertSchema,
} from "../../../src/schemas/geometry/oneDimStructureWithCulvertSchema"

describe("oneDimStructureWithCulvertSchema", () => {
  describe("multipleBarrelCulvert", () => {
    const multipleBarrelCulvertLines = [
      "Type RM Length L Ch R = 2 ,2630    ,,,",
      "BEGIN DESCRIPTION:",
      "Culvert at Bradley Ave",
      "END DESCRIPTION:",
      "Node Last Edited Time=May-28-2024 10:56:01",
      "Bridge Culvert--1,0,-1,-1, 0 ",
      "Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee",
      "4,49,1.4,0, 27, 27, , , 0.98, 0, 0,0,,",
      "       0  21.991  75.529 138.571 221.263 221.354 252.171 334.375  421.73  451.51",
      "  464.31  464.31  464.61  466.43  466.73  466.73  467.12  467.12  467.42  469.24",
      "  469.54  469.54  469.54  480.03 544.061 739.278 746.898",
      " 267.141 266.895 265.873 264.702 264.062 264.061 264.069 263.774  264.15  264.18",
      "  264.25  264.38  264.38  264.38  264.38  264.38  264.38  264.38  264.38  264.38",
      "  264.38  264.38  264.25   264.2 264.227 265.391 265.513",
      "                                                                                ",
      "                                                                                ",
      "                                                        ",
      "       0  35.991  89.529 152.571 235.263 235.354 266.171 348.375  435.73  465.51",
      "  478.31  478.31  478.61  480.43  480.73  480.73  481.12  481.12  481.42  483.24",
      "  483.54  483.54  483.54  494.03 558.061 753.278 760.898",
      " 267.141 266.895 265.873 264.702 264.062 264.061 264.069 263.774  264.15  264.18",
      "  264.25  264.38  264.38  264.38  264.38  264.38  264.38  264.38  264.38  264.38",
      "  264.38  264.38  264.25   264.2 264.227 265.391 265.513",
      "                                                                                ",
      "                                                                                ",
      "                                                        ",
      "BR Coef=-1 , 0 , 0 ,, 0 ,,,0.8,0,1.2,0,",
      "WSPro=,,,, 1 ,,,, 0 ,,,, 0 ,,,,-1 ,-1 ,-1 , 0 , 0 , 0 , 0 , 0 ",
      "Multiple Barrel Culv=2,1.88,2.42,49.54,0.017,0.5,1,58,1,261.2,261.1, 2,Culvert #1  , 0 ,3.79",
      "  465.39  479.57  468.29  482.47",
      "BC Culvert Barrel=1,Barrel #01,0",
      "BC Culvert Barrel=2,Barrel #02,0",
      "Culvert Bottom n=0.035",
      "BC Design=,, 0 ,, 0 ,,,,,,",
      "BC Use User HTab Curves=0",
      "BC User HTab FreeFlow(D)= 0 ",
      "",
    ]

    it("parses multiple barrel culvert section", () => {
      const result = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        multipleBarrelCulvertLines,
        0,
      )

      expect(result.value.type).toBe(2)
      expect(result.value.riverMile).toBe("2630")
      expect(result.value.description).toBe("Culvert at Bradley Ave")
      expect(result.value.lastEditedTime).toBe("May-28-2024 10:56:01")

      // Check multiple barrel culvert data
      expect(result.value.multipleBarrelCulverts).toHaveLength(1)
      const culvert = result.value.multipleBarrelCulverts![0]
      expect(culvert.shape).toBe(2)
      expect(culvert.rise).toBe(1.88)
      expect(culvert.span).toBe(2.42)
      expect(culvert.length).toBe(49.54)
      expect(culvert.nValue).toBe(0.017)
      expect(culvert.entranceLoss).toBe(0.5)
      expect(culvert.exitLoss).toBe(1)
      expect(culvert.chart).toBe(58)
      expect(culvert.scale).toBe(1)
      expect(culvert.upstreamInvert).toBe(261.2)
      expect(culvert.downstreamInvert).toBe(261.1)
      expect(culvert.numberOfBarrels).toBe(2)
      expect(culvert.name).toBe("Culvert #1")
      expect(culvert.flag).toBe(false)
      expect(culvert.additionalParam).toBe(3.79)

      // Check barrel stations (2 barrels * 2 stations each = 4 values)
      expect(culvert.barrelStations).toHaveLength(4)
      expect(culvert.barrelStations).toEqual([465.39, 479.57, 468.29, 482.47])

      // Check barrels
      expect(culvert.barrels).toHaveLength(2)
      expect(culvert.barrels![0].index).toBe(1)
      expect(culvert.barrels![0].name).toBe("Barrel #01")
      expect(culvert.barrels![0].coordinates).toEqual([])
      expect(culvert.barrels![1].index).toBe(2)
      expect(culvert.barrels![1].name).toBe("Barrel #02")

      // Check optional fields
      expect(culvert.nBottom).toBe(0.035)
    })

    it("serializes multiple barrel culvert with correct spacing", () => {
      const parsed = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        multipleBarrelCulvertLines,
        0,
      )
      const serialized = serializeWithSchema(oneDimStructureWithCulvertSchema, parsed.value)

      // Check that the Multiple Barrel Culv line has correct spacing
      const culvertLine = serialized.find((line) => line.startsWith("Multiple Barrel Culv="))
      expect(culvertLine).toBeDefined()
      // The numberOfBarrels field should have a leading space but no trailing space: ", 2,"
      expect(culvertLine).toContain(", 2,Culvert #1")
      expect(culvertLine).not.toContain(", 2 ,")
    })

    it("round-trips multiple barrel culvert data", () => {
      const parsed = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        multipleBarrelCulvertLines,
        0,
      )
      const serialized = serializeWithSchema(oneDimStructureWithCulvertSchema, parsed.value)
      const reparsed = parseSectionWithSchema(oneDimStructureWithCulvertSchema, serialized, 0)

      expect(reparsed.value.multipleBarrelCulverts).toEqual(parsed.value.multipleBarrelCulverts)
    })
  })

  describe("culvert with barrel coordinates", () => {
    const culvertWithCoordinatesLines = [
      "Type RM Length L Ch R = 2 ,2593    ,,,",
      "Node Last Edited Time=May-28-2024 10:56:01",
      "Bridge Culvert--1,0,-1,-1, 0 ",
      "Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee",
      "4,49,1.4,0, 2, 2, , , 0.98, 0, 0,0,,",
      "       0  21.991",
      " 267.141 266.895",
      "                ",
      "       0  35.991",
      " 267.141 266.895",
      "                ",
      "BR Coef=-1 , 0 , 0 ,, 0 ,,,0.8,0,1.2,0,",
      "WSPro=,,,, 1 ,,,, 0 ,,,, 0 ,,,,-1 ,-1 ,-1 , 0 , 0 , 0 , 0 , 0 ",
      "Culvert=2,0.55,8,19.82,0.017,0.5,1,10,1,255.14,745.53,255.14,719.8,Culvert #1  , 0 ,0.1",
      "  745.53   719.8",
      "BC Culvert Barrel=1,# Barrel 1,3",
      "     479510.7351   4751951.36931    479511.05824   4751949.53252",
      "    479514.16922   4751931.84908",
      "Culvert Bottom n=0.035",
      "BC Design=,, 0 ,, 0 ,,,,,,",
      "BC Use User HTab Curves=0",
      "BC User HTab FreeFlow(D)= 0 ",
      "",
    ]

    it("parses culvert barrel with coordinates", () => {
      const result = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        culvertWithCoordinatesLines,
        0,
      )

      expect(result.value.culverts).toHaveLength(1)
      const culvert = result.value.culverts![0]

      expect(culvert.barrels).toHaveLength(1)
      const barrel = culvert.barrels![0]
      expect(barrel.index).toBe(1)
      expect(barrel.name).toBe("# Barrel 1")
      expect(barrel.coordinates).toHaveLength(3)
      expect(barrel.coordinates).toEqual([
        [479510.7351, 4751951.36931],
        [479511.05824, 4751949.53252],
        [479514.16922, 4751931.84908],
      ])
    })

    it("serializes culvert barrel coordinates with correct formatting", () => {
      const parsed = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        culvertWithCoordinatesLines,
        0,
      )
      const serialized = serializeWithSchema(oneDimStructureWithCulvertSchema, parsed.value)

      // Find the barrel line and coordinate lines
      const barrelLineIndex = serialized.findIndex((line) =>
        line.startsWith("BC Culvert Barrel=1"),
      )
      expect(barrelLineIndex).toBeGreaterThan(-1)

      // Check that coordinates follow immediately after barrel line
      const coordLine1 = serialized[barrelLineIndex + 1]
      const coordLine2 = serialized[barrelLineIndex + 2]

      // Coordinates should be in 16-char fixed-width format
      expect(coordLine1).toMatch(/^\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+$/)
      expect(coordLine2).toMatch(/^\s+[\d.]+\s+[\d.]+$/)
    })

    it("round-trips culvert barrel coordinates", () => {
      const parsed = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        culvertWithCoordinatesLines,
        0,
      )
      const serialized = serializeWithSchema(oneDimStructureWithCulvertSchema, parsed.value)
      const reparsed = parseSectionWithSchema(oneDimStructureWithCulvertSchema, serialized, 0)

      expect(reparsed.value.culverts?.[0]?.barrels?.[0]?.coordinates).toEqual(
        parsed.value.culverts?.[0]?.barrels?.[0]?.coordinates,
      )
    })
  })

  describe("regular culvert vs multiple barrel culvert", () => {
    it("distinguishes between Culvert= and Multiple Barrel Culv=", () => {
      const regularCulvertLines = [
        "Type RM Length L Ch R = 2 ,2593    ,,,",
        "Node Last Edited Time=May-28-2024 10:56:01",
        "Bridge Culvert--1,0,-1,-1, 0 ",
        "Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee",
        "4,49,1.4,0, 2, 2, , , 0.98, 0, 0,0,,",
        "       0  21.991",
        " 267.141 266.895",
        "                ",
        "       0  35.991",
        " 267.141 266.895",
        "                ",
        "BR Coef=-1 , 0 , 0 ,, 0 ,,,0.8,0,1.2,0,",
        "WSPro=,,,, 1 ,,,, 0 ,,,, 0 ,,,,-1 ,-1 ,-1 , 0 , 0 , 0 , 0 , 0 ",
        "Culvert=2,1.4,4,15,0.017,0.5,1,10,1,261.01,325.6,261.01,323.8,Culvert #1  , 0 ,4.1",
        "     123.45      234.56",
        "BC Culvert Barrel=1,Barrel #01,0",
        "BC Design=,, 0 ,, 0 ,,,,,,",
        "BC Use User HTab Curves=0",
        "BC User HTab FreeFlow(D)= 0 ",
        "",
      ]

      const result = parseSectionWithSchema(
        oneDimStructureWithCulvertSchema,
        regularCulvertLines,
        0,
      )

      // Should have culverts array populated, not multipleBarrelCulverts
      expect(result.value.culverts).toHaveLength(1)
      expect(result.value.multipleBarrelCulverts).toEqual([])

      const culvert = result.value.culverts![0]
      expect(culvert.upstreamObvert).toBe(261.01)
      expect(culvert.downstreamObvert).toBe(323.8)
    })
  })
})
