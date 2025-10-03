import { describe, expect, it } from "vitest"
import { parseWithSchema, schema, serializeWithSchema, textBlockField } from "../../src/schema"

describe("textBlockField", () => {
  const blockSchema = schema([
    textBlockField("description", "TEST DESCRIPTION"),
  ])

  it("parses block content into a newline-delimited string", () => {
    const lines = [
      "BEGIN TEST DESCRIPTION:",
      "First line",
      "Second line",
      "END TEST DESCRIPTION:",
    ]

    const { value, nextIndex } = parseWithSchema(blockSchema, lines, 0)

    expect(nextIndex).toBe(lines.length)
    expect(value).toEqual({ description: "First line\nSecond line" })
  })

  it("parses empty block content as an empty string", () => {
    const lines = ["BEGIN TEST DESCRIPTION:", "END TEST DESCRIPTION:"]

    const { value, nextIndex } = parseWithSchema(blockSchema, lines, 0)

    expect(nextIndex).toBe(lines.length)
    expect(value).toEqual({ description: "" })
  })

  it("skips optional block when not present", () => {
    const optionalSchema = schema([
      textBlockField("notes", "TEST NOTES", { optional: true }),
    ])

    const lines: string[] = []
    const { value, nextIndex } = parseWithSchema(optionalSchema, lines, 0)

    expect(nextIndex).toBe(0)
    expect(value).toEqual({})
  })

  it("serializes block content with begin and end markers", () => {
    const result = serializeWithSchema(blockSchema, {
      description: "First line\nSecond line",
    })

    expect(result).toEqual([
      "BEGIN TEST DESCRIPTION:",
      "First line",
      "Second line",
      "END TEST DESCRIPTION:",
    ])
  })

  it("omits optional block when value is undefined", () => {
    const optionalSchema = schema([
      textBlockField("notes", "TEST NOTES", { optional: true }),
    ])

    const result = serializeWithSchema(optionalSchema, {})

    expect(result).toEqual([])
  })
})
