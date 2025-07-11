import { describe, expect, it } from "vitest"
import type { HECRASGeometry } from "../../src/models/geometry/geometryHeaders"
import {
  serializeGeometryHeader,
  serializeGeometryHeaderString,
} from "../../src/serializers/geometry/geometryHeaderSerializer"

describe("GeometryHeaderSerializer", () => {
  describe("Dingman.g01 Header", () => {
    const testGeometryHeader: HECRASGeometry = {
      geomTitle: "Mitigation 02",
      programVersion: "6.60",
      viewingRectangle: {
        left: 482887.562984754,
        right: 486224.503180069,
        top: 4752418.05198486,
        bottom: 4749535.47,
      },
      description: "Upsize Culvert 43 and 44 from 0.9 to 1.5m",
      storageAreas: [],
      connections: [],
      boundaryConditions: [],
    }

    const expectedDingmanOutput = [
      "Geom Title=Mitigation 02",
      "Program Version=6.60",
      "Viewing Rectangle= 482887.562984754 , 486224.503180069 , 4752418.05198486 , 4749535.47 ",
      "",
      "BEGIN GEOM DESCRIPTION:",
      "Upsize Culvert 43 and 44 from 0.9 to 1.5m",
      "END GEOM DESCRIPTION:",
    ]

    it("should serialize Dingman header to array", () => {
      const result = serializeGeometryHeader(testGeometryHeader)
      expect(result).toEqual(expectedDingmanOutput)
    })

    it("should serialize Dingman header to string", () => {
      const result = serializeGeometryHeaderString(testGeometryHeader)
      expect(result).toBe(expectedDingmanOutput.join("\n"))
    })
  })

  describe("Muncie.g01 Header", () => {
    const testGeometryHeaderMuncie: HECRASGeometry = {
      geomTitle: "Muncie Base Geometry - 9 SAs",
      programVersion: "5.00",
      viewingRectangle: {
        left: 404112.085287251,
        right: 413818.78591839,
        top: 1806670.07015604,
        bottom: 1799678.66049907,
      },
      storageAreas: [],
      connections: [],
      boundaryConditions: [],
    }

    const expectedMuncieOutput = [
      "Geom Title=Muncie Base Geometry - 9 SAs",
      "Program Version=5.00",
      "Viewing Rectangle= 404112.085287251 , 413818.78591839 , 1806670.07015604 , 1799678.66049907 ",
    ]

    it("should serialize Muncie header to array", () => {
      const result = serializeGeometryHeader(testGeometryHeaderMuncie)
      expect(result).toEqual(expectedMuncieOutput)
    })

    it("should serialize Muncie header to string", () => {
      const result = serializeGeometryHeaderString(testGeometryHeaderMuncie)
      expect(result).toBe(expectedMuncieOutput.join("\n"))
    })
  })

  describe("Header without description", () => {
    const testGeometryHeaderNoDesc: HECRASGeometry = {
      geomTitle: "Simple Project",
      programVersion: "6.00",
      viewingRectangle: {
        left: 100.0,
        right: 200.0,
        top: 300.0,
        bottom: 150.0,
      },
      storageAreas: [],
      connections: [],
      boundaryConditions: [],
    }

    const expectedNoDescOutput = [
      "Geom Title=Simple Project",
      "Program Version=6.00",
      "Viewing Rectangle= 100 , 200 , 300 , 150 ",
    ]

    it("should serialize header without description to array", () => {
      const result = serializeGeometryHeader(testGeometryHeaderNoDesc)
      expect(result).toEqual(expectedNoDescOutput)
    })

    it("should serialize header without description to string", () => {
      const result = serializeGeometryHeaderString(testGeometryHeaderNoDesc)
      expect(result).toBe(expectedNoDescOutput.join("\n"))
    })
  })

  describe("Header with multiline description", () => {
    const testGeometryHeaderMultiline: HECRASGeometry = {
      geomTitle: "Complex Project",
      programVersion: "6.60",
      viewingRectangle: {
        left: 1000.0,
        right: 2000.0,
        top: 3000.0,
        bottom: 1500.0,
      },
      description: "This is a complex project\nwith multiple lines\nof description text",
      storageAreas: [],
      connections: [],
      boundaryConditions: [],
    }

    const expectedMultilineOutput = [
      "Geom Title=Complex Project",
      "Program Version=6.60",
      "Viewing Rectangle= 1000 , 2000 , 3000 , 1500 ",
      "",
      "BEGIN GEOM DESCRIPTION:",
      "This is a complex project",
      "with multiple lines",
      "of description text",
      "END GEOM DESCRIPTION:",
    ]

    it("should serialize header with multiline description to array", () => {
      const result = serializeGeometryHeader(testGeometryHeaderMultiline)
      expect(result).toEqual(expectedMultilineOutput)
    })

    it("should serialize header with multiline description to string", () => {
      const result = serializeGeometryHeaderString(testGeometryHeaderMultiline)
      expect(result).toBe(expectedMultilineOutput.join("\n"))
    })
  })

  describe("Edge cases", () => {
    const testGeometryHeaderEdge: HECRASGeometry = {
      geomTitle: "",
      programVersion: "6.60",
      viewingRectangle: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      description: "",
      storageAreas: [],
      connections: [],
      boundaryConditions: [],
    }

    const expectedEdgeOutput = [
      "Geom Title=",
      "Program Version=6.60",
      "Viewing Rectangle= 0 , 0 , 0 , 0 ",
      "",
      "BEGIN GEOM DESCRIPTION:",
      "",
      "END GEOM DESCRIPTION:",
    ]

    it("should handle empty values", () => {
      const result = serializeGeometryHeader(testGeometryHeaderEdge)
      expect(result).toEqual(expectedEdgeOutput)
    })
  })
})
