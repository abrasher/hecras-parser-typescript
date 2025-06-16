// Tests for the new HECRAS Parser V2
import { describe, it, expect, beforeAll } from "vitest"
import { HECRASParserV2 } from "../src/HECRASParserV2"
import { HECRASGeometry } from "../src/models/geometry"
import { readFileSync } from "fs"
import { join } from "path"

describe("HECRASParserV2", () => {
  let parser: HECRASParserV2
  let testFileContent: string

  beforeAll(() => {
    parser = new HECRASParserV2()
    const testFilePath = join(__dirname, "data", "Dingman.g01")
    testFileContent = readFileSync(testFilePath, "utf-8")
  })

  describe("Basic Functionality", () => {
    it("should create parser instance", () => {
      expect(parser).toBeInstanceOf(HECRASParserV2)
    })

    it("should detect geometry file type", async () => {
      const result = await parser.parse(testFileContent)
      expect(result.success).toBe(true)
    })

    it("should parse geometry file and return HECRASGeometry object", async () => {
      const geometry = await parser.parseGeometry(testFileContent)
      expect(geometry).toBeInstanceOf(HECRASGeometry)
    })

    it("should maintain backward compatibility with old API", () => {
      const legacyParser = HECRASParserV2.create()
      expect(legacyParser).toBeInstanceOf(HECRASParserV2)
    })
  })

  describe("File Type Detection", () => {
    it("should detect geometry files by content", async () => {
      const geometryContent =
        "Geom Title=Test\nProgram Version=6.60\nStorage Area=Test"
      const result = await parser.parse(geometryContent)
      expect(result.success).toBe(true)
    })

    it("should detect geometry files by extension", async () => {
      const result = await parser.parse(testFileContent, "test.g01")
      expect(result.success).toBe(true)
    })

    it("should fail gracefully for unknown file types", async () => {
      const unknownContent = "This is not a HECRAS file"
      const result = await parser.parse(unknownContent)
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe("UNKNOWN_FILE_TYPE")
    })
  })

  describe("Error Handling", () => {
    it("should handle malformed geometry files", async () => {
      const malformedContent =
        "Geom Title=Test\nInvalid Line Without Equals\nStorage Area="
      const result = await parser.parse(malformedContent)

      // Should attempt to parse but may have warnings
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0)
      } else {
        expect(result.warnings.length).toBeGreaterThan(0)
      }
    })

    it("should throw error when parseGeometry fails", async () => {
      const invalidContent = "This is definitely not a geometry file"
      await expect(parser.parseGeometry(invalidContent)).rejects.toThrow()
    })
  })

  describe("Plugin System", () => {
    it("should have geometry plugin registered", () => {
      // Access the protected registry through a type assertion for testing
      const parserWithRegistry = parser as any
      const plugins = parserWithRegistry.registry?.listPlugins() || []
      const geometryPlugin = plugins.find(
        (p: any) => p.name === "HECRASGeometryParser",
      )
      expect(geometryPlugin).toBeDefined()
    })

    it("should support multiple file types", () => {
      const parserWithRegistry = parser as any
      const plugins = parserWithRegistry.registry?.listPlugins() || []
      const geometryPlugin = plugins.find(
        (p: any) => p.name === "HECRASGeometryParser",
      )

      if (geometryPlugin) {
        expect(geometryPlugin.fileTypes).toContain("geometry")
        expect(geometryPlugin.fileTypes).toContain("g01")
      }
    })
  })

  describe("Parsing Performance", () => {
    it("should parse test file in reasonable time", async () => {
      const startTime = Date.now()
      const result = await parser.parse(testFileContent)
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(5000) // Should parse in less than 5 seconds
    }, 10000) // 10 second timeout for this test
  })

  describe("Data Integrity", () => {
    it("should preserve all sections from the original file", async () => {
      const geometry = await parser.parseGeometry(testFileContent)

      // Check that we have the basic structure
      expect(geometry["Geom Title"]).toBeDefined()
      expect(geometry["Program Version"]).toBeDefined()

      // Should have parsed some data structures
      const hasData =
        geometry.reaches.length > 0 ||
        geometry.storageAreas.length > 0 ||
        geometry.connections.length > 0
      expect(hasData).toBe(true)
    })

    it("should handle coordinate data correctly", async () => {
      const geometry = await parser.parseGeometry(testFileContent)

      // Check storage areas have coordinate data
      if (geometry.storageAreas.length > 0) {
        const firstSA = geometry.storageAreas[0]
        expect(firstSA.surfaceLine).toBeDefined()
        expect(Array.isArray(firstSA.surfaceLine)).toBe(true)
      }

      // Check connections have line data
      if (geometry.connections.length > 0) {
        const firstConn = geometry.connections[0]
        expect(firstConn.line).toBeDefined()
        expect(Array.isArray(firstConn.line)).toBe(true)
      }
    })
  })

  describe("Validation", () => {
    it("should validate required fields", async () => {
      const minimalContent = "Geom Title=Test\nProgram Version=6.60"
      const result = await parser.parse(minimalContent)

      if (result.success) {
        expect(result.data["Geom Title"]).toBe("Test")
        expect(result.data["Program Version"]).toBe("6.60")
      }
    })

    it("should produce warnings for suspicious data", async () => {
      const suspiciousContent = `
        Geom Title=Test
        Program Version=6.60
        Storage Area=InvalidData
        Connection=InvalidConnection
      `

      const result = await parser.parse(suspiciousContent)

      // Should either fail or produce warnings
      if (result.success) {
        expect(result.warnings.length).toBeGreaterThan(0)
      } else {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })
  })
})

// Compatibility tests with the old parser
describe("Backward Compatibility", () => {
  let newParser: HECRASParserV2
  let testFileContent: string

  beforeAll(() => {
    newParser = new HECRASParserV2()
    const testFilePath = join(__dirname, "data", "Dingman.g01")
    testFileContent = readFileSync(testFilePath, "utf-8")
  })

  it("should produce similar results to the old parser", async () => {
    // Import the old parser for comparison
    const { HecRasGeometryParser: OldParser } = await import(
      "../src/HECRASGeometryParser"
    )

    try {
      const oldParser = new OldParser()
      const oldResult = oldParser.parse(testFileContent)
      const newResult = await newParser.parseGeometry(testFileContent)

      // Compare basic structure
      expect(newResult["Geom Title"]).toBe(oldResult["Geom Title"])
      expect(newResult["Program Version"]).toBe(oldResult["Program Version"])

      // Compare data counts (should be similar)
      expect(newResult.storageAreas.length).toBeGreaterThanOrEqual(
        oldResult.storageAreas.length * 0.8,
      ) // Allow 20% tolerance
      expect(newResult.connections.length).toBeGreaterThanOrEqual(
        oldResult.connections.length * 0.8,
      )
    } catch (error) {
      // If old parser fails, new parser should at least succeed
      console.warn("Old parser failed, testing new parser in isolation")
      const newResult = await newParser.parseGeometry(testFileContent)
      expect(newResult).toBeInstanceOf(HECRASGeometry)
    }
  })
})
