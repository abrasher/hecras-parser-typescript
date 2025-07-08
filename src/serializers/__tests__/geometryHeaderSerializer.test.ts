import { describe, it, expect } from "vitest"
import { serializeGeometryHeader, serializeGeometryHeaderString } from "../geometry/geometryHeaderSerializer"
import type { HECRASGeometry } from "../../models/geometry/geometryHeaders"

describe("GeometryHeaderSerializer", () => {
  describe("GIVEN geometry with title and version", () => {
    it("WHEN serialized THEN formats header section", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Test Geometry",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 1000.0,
          top: 1000.0,
          bottom: 0.0,
        },
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=Test Geometry")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,1000,1000,0")
    })
  })

  describe("GIVEN geometry with viewing rectangle", () => {
    it("WHEN serialized THEN formats viewing rectangle", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "River Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 123.45,
          right: 678.9,
          top: 456.78,
          bottom: 234.56,
        },
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=River Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=123.45,678.9,456.78,234.56")
    })
  })

  describe("GIVEN geometry with description", () => {
    it("WHEN serialized THEN formats description block", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Complex Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 100.0,
          top: 100.0,
          bottom: 0.0,
        },
        description: "This is a test geometry\nwith multiple lines\nof description",
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=Complex Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,100,100,0")
      expect(result[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(result[4]).toBe("This is a test geometry")
      expect(result[5]).toBe("with multiple lines")
      expect(result[6]).toBe("of description")
      expect(result[7]).toBe("END GEOM DESCRIPTION:")
    })
  })

  describe("GIVEN geometry with single line description", () => {
    it("WHEN serialized THEN formats single line description", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Simple Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 50.0,
          top: 50.0,
          bottom: 0.0,
        },
        description: "Single line description",
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=Simple Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,50,50,0")
      expect(result[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(result[4]).toBe("Single line description")
      expect(result[5]).toBe("END GEOM DESCRIPTION:")
    })
  })

  describe("GIVEN geometry with empty description", () => {
    it("WHEN serialized THEN formats empty description block", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Empty Description Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 10.0,
          top: 10.0,
          bottom: 0.0,
        },
        description: "",
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=Empty Description Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,10,10,0")
      expect(result[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(result[4]).toBe("")
      expect(result[5]).toBe("END GEOM DESCRIPTION:")
    })
  })

  describe("GIVEN geometry with undefined description", () => {
    it("WHEN serialized THEN omits description block", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "No Description Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 20.0,
          top: 20.0,
          bottom: 0.0,
        },
        // description is undefined
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result).toHaveLength(3)
      expect(result[0]).toBe("Geom Title=No Description Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,20,20,0")
    })
  })

  describe("GIVEN geometry with special characters in title", () => {
    it("WHEN serialized THEN preserves special characters", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "River Model - Version 2.0 (Updated)",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 1.0,
          top: 1.0,
          bottom: 0.0,
        },
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=River Model - Version 2.0 (Updated)")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=0,1,1,0")
    })
  })

  describe("GIVEN geometry with negative coordinates", () => {
    it("WHEN serialized THEN handles negative coordinates", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Negative Coordinates Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: -100.0,
          right: 100.0,
          top: 50.0,
          bottom: -50.0,
        },
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeader(geometry)

      expect(result[0]).toBe("Geom Title=Negative Coordinates Model")
      expect(result[1]).toBe("Program Version=6.5.1")
      expect(result[2]).toBe("Viewing Rectangle=-100,100,50,-50")
    })
  })

  describe("GIVEN a complete geometry header", () => {
    it("WHEN serialized THEN produces valid header string", () => {
      const geometry: HECRASGeometry = {
        geomTitle: "Complete Test Model",
        programVersion: "6.5.1",
        viewingRectangle: {
          left: 0.0,
          right: 1000.0,
          top: 500.0,
          bottom: 0.0,
        },
        description: "This is a complete test model\nwith all header components",
        storageAreas: [],
        connections: [],
        boundaryConditions: [],
      }

      const result = serializeGeometryHeaderString(geometry)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Geom Title=Complete Test Model")
      expect(lines[1]).toBe("Program Version=6.5.1")
      expect(lines[2]).toBe("Viewing Rectangle=0,1000,500,0")
      expect(lines[3]).toBe("BEGIN GEOM DESCRIPTION:")
      expect(lines[4]).toBe("This is a complete test model")
      expect(lines[5]).toBe("with all header components")
      expect(lines[6]).toBe("END GEOM DESCRIPTION:")
    })
  })
})
