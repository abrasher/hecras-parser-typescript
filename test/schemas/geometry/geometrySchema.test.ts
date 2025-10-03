import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { geometrySchema, type GeometrySchema } from "../../src/schemas/geometrySchema"
import type { HECRASGeometry } from "../../../src/models/geometry/geometryHeaders"

describe("geometrySchema", () => {
  const sampleLines = [
    "Geom Title=Example Geometry",
    "Program Version=5.0.7",
    "Viewing Rectangle= 100 , 200 , 300.5 , 50 ",
    "",
    "BEGIN GEOM DESCRIPTION:",
    "First line",
    "Second line",
    "END GEOM DESCRIPTION:",
  ]

  it("parses geometry header with description block", () => {
    const result = parseWithSchema(geometrySchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toEqual({
      geomTitle: "Example Geometry",
      programVersion: "5.0.7",
      viewingRectangle: {
        left: 100,
        right: 200,
        top: 300.5,
        bottom: 50,
      },
      description: "First line\nSecond line",
    })
  })

  it("serializes geometry header and description", () => {
    const header: GeometrySchema = {
      geomTitle: "Example Geometry",
      programVersion: "5.0.7",
      viewingRectangle: { left: 100, right: 200, top: 300.5, bottom: 50 },
      description: "First line\nSecond line",
    }

    const lines = serializeWithSchema(geometrySchema, header)

    expect(lines).toEqual(sampleLines)
  })

  it("handles headers without description", () => {
    const minimalLines = [
      "Geom Title=Example Geometry",
      "Program Version=5.0.7",
      "Viewing Rectangle= 100 , 200 , 300 , 50 ",
      "",
    ]

    const result = parseWithSchema(geometrySchema, minimalLines, 0)

    expect(result.value).toEqual({
      geomTitle: "Example Geometry",
      programVersion: "5.0.7",
      viewingRectangle: { left: 100, right: 200, top: 300, bottom: 50 },
    })

    const serialized = serializeWithSchema(geometrySchema, result.value)
    expect(serialized).toEqual([
      "Geom Title=Example Geometry",
      "Program Version=5.0.7",
      "Viewing Rectangle= 100 , 200 , 300 , 50 ",
      "",
    ])
  })

  it("is compatible with HECRASGeometry subset", () => {
    const schemaData: GeometrySchema = {
      geomTitle: "Example",
      programVersion: "5.0.7",
      viewingRectangle: { left: 1, right: 2, top: 3, bottom: 4 },
      description: "Desc",
    }

    const geometryHeader: Pick<
      HECRASGeometry,
      "geomTitle" | "programVersion" | "viewingRectangle" | "description"
    > = schemaData

    expect(geometryHeader.geomTitle).toBe("Example")
    expect(geometryHeader.viewingRectangle.left).toBe(1)
  })
})
