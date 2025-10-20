import { describe, expect, it, beforeAll } from "vitest"
import { parseHeader } from "../../../src/parsers/geometry/headerParser"

describe("Header Parsing Tests", () => {
  let lines: string[]

  beforeAll(() => {
    const lineString = `Geom Title=Mitigation 02
Program Version=6.60
Viewing Rectangle= 482887.562984754 , 486224.503180069 , 4752418.05198486 , 4749535.47 

BEGIN GEOM DESCRIPTION:
Upsize Culvert 43 and 44 from 0.9 to 1.5m
END GEOM DESCRIPTION:`
    lines = lineString.split("\n")
  })

  it("input data should be correct", () => {
    expect(lines.length).toBe(7)
  })

  it("should parse complete header data correctly", () => {
    const result = parseHeader(lines, 0)

    expect(result.data.geomTitle).toBe("Mitigation 02")
    expect(result.data.programVersion).toBe("6.60")
    expect(result.data.viewingRectangle).toEqual({
      left: 482887.562984754,
      right: 486224.503180069,
      top: 4752418.05198486,
      bottom: 4749535.47,
    })
    expect(result.data.description).toBe("Upsize Culvert 43 and 44 from 0.9 to 1.5m")
    expect(result.nextIndex).toBe(7) // Should reach end of lines
  })

  it("should parse geom title correctly", () => {
    const testLines = ["Geom Title=Test Project Name"]
    const result = parseHeader(testLines, 0)

    expect(result.data.geomTitle).toBe("Test Project Name")
  })

  it("should parse program version correctly", () => {
    const testLines = ["Program Version=6.60"]
    const result = parseHeader(testLines, 0)

    expect(result.data.programVersion).toBe("6.60")
  })

  it("should parse viewing rectangle with proper coordinate mapping", () => {
    const testLines = ["Viewing Rectangle= 100.5 , 200.7 , 300.9 , 400.1 "]
    const result = parseHeader(testLines, 0)

    expect(result.data.viewingRectangle).toEqual({
      left: 100.5,
      right: 200.7,
      top: 300.9,
      bottom: 400.1,
    })
  })

  it("should parse multi-line description", () => {
    const testLines = [
      "BEGIN GEOM DESCRIPTION:",
      "Line 1 of description",
      "Line 2 of description",
      "Line 3 of description",
      "END GEOM DESCRIPTION:",
    ]
    const result = parseHeader(testLines, 0)

    expect(result.data.description).toBe(
      "Line 1 of description\nLine 2 of description\nLine 3 of description",
    )
  })

  it("should handle header without description", () => {
    const testLines = [
      "Geom Title=No Description Project",
      "Program Version=6.60",
      "Viewing Rectangle= 100 , 200 , 300 , 400 ",
    ]
    const result = parseHeader(testLines, 0)

    expect(result.data.geomTitle).toBe("No Description Project")
    expect(result.data.programVersion).toBe("6.60")
    expect(result.data.description).toBeUndefined()
  })

  it("should handle missing optional fields", () => {
    const testLines = ["Geom Title=Minimal Header"]
    const result = parseHeader(testLines, 0)

    expect(result.data.geomTitle).toBe("Minimal Header")
    expect(result.data.programVersion).toBeUndefined()
    expect(result.data.viewingRectangle).toBeUndefined()
    expect(result.data.description).toBeUndefined()
  })

  it("should handle empty description block", () => {
    const testLines = [
      "Geom Title=Empty Description",
      "BEGIN GEOM DESCRIPTION:",
      "END GEOM DESCRIPTION:",
    ]
    const result = parseHeader(testLines, 0)

    expect(result.data.description).toBe("")
  })

  it("should stop parsing at first non-header line", () => {
    const testLines = [
      "Geom Title=Test",
      "Program Version=6.60",
      "Storage Area=First Non-Header",
      "More Content",
    ]
    const result = parseHeader(testLines, 0)

    expect(result.nextIndex).toBe(2) // Should stop at Storage Area line
  })
})
