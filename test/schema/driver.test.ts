import { describe, expect, it } from "vitest"
import {
  booleanField,
  tupleArrayField,
  tupleField,
  contextual,
  fields,
  multiField,
  numberField,
  numberPart,
  opt,
  parseSectionWithSchema,
  parseWithSchema,
  repeat,
  schema,
  section,
  serializeWithSchema,
  startsWith,
  stringField,
  stringPart,
} from "../../src/schema"

const detailSchema = schema([
  stringField("note", "Detail=", { optional: true, trim: true }),
  contextual(
    "detailFlag",
    (lines, startIndex, _ctx) => {
      const line = lines[startIndex]
      if (!line || !line.startsWith("Detail Flag=")) {
        return null
      }
      const value = line.slice("Detail Flag=".length).trim()
      return {
        value: value === "T",
        nextIndex: startIndex + 1,
      }
    },
    (value, _ctx) => {
      if (value === undefined) {
        return []
      }
      return [`Detail Flag=${value ? "T" : "F"}`]
    },
  ),
])

const entrySchema = schema([
  stringField("name", "Entry=", { trim: true }),
  numberField("value", "Entry Number=", { integer: true }),
  booleanField("enabled", "Entry Flag=", { mode: "TF" }),
])

const testSchema = schema([
  multiField(
    "Item=",
    fields({
      name: stringPart({ trim: true }),
      count: numberPart({ integer: true }),
      optionalNote: opt(stringPart({ trim: true })),
    }),
  ),
  tupleField(
    "coordinate",
    "Coordinate=",
    [numberPart({ pad: true }), numberPart({ pad: true })] as const,
  ),
  stringField("maybe", "Item Optional=", { optional: true, trim: true }),
  tupleArrayField("Values=", "values", {
    width: 6,
    maxWidth: 12,
    tuple: 2 as const,
  }),
  repeat("entries", startsWith("Entry="), entrySchema),
  section("detail", startsWith("Detail="), detailSchema),
])

describe("schema driver", () => {
  const sampleLines = [
    "Item=Sample,3,Note",
    "Coordinate= 1 , 2 ",
    "Values=2",
    "   1.0   2.0",
    "   3.0   4.0",
    "Entry=Alpha",
    "Entry Number=1",
    "Entry Flag=T",
    "Entry=Beta",
    "Entry Number=2",
    "Entry Flag=F",
    "Detail=Provided",
    "Detail Flag=T",
  ]

  it("parses schema with repeats, sections, and counted tuples", () => {
    const result = parseWithSchema(testSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toMatchObject({
      name: "Sample",
      count: 3,
      optionalNote: "Note",
      coordinate: [1, 2],
      values: [
        [1, 2],
        [3, 4],
      ],
      entries: [
        { name: "Alpha", value: 1, enabled: true },
        { name: "Beta", value: 2, enabled: false },
      ],
      detail: {
        note: "Provided",
        detailFlag: true,
      },
    })
  })

  it("serializes schema while respecting optional fields", () => {
    const roundTrip = {
      name: "Sample",
      count: 3,
      optionalNote: undefined,
      coordinate: [1, 2] as [number, number],
      values: [[1, 2] as [number, number], [3, 4] as [number, number]],
      entries: [{ name: "Alpha", value: 1, enabled: true }],
      detail: {
        note: undefined,
        detailFlag: false,
      },
    }

    const lines = serializeWithSchema(testSchema, roundTrip)

    expect(lines).toEqual([
      "Item=Sample,3,",
      "Coordinate= 1 , 2 ",
      "Values=2",
      "     1     2",
      "     3     4",
      "Entry=Alpha",
      "Entry Number=1",
      "Entry Flag=T",
      "Detail Flag=F",
    ])
  })

  it("parses detail section independently", () => {
    const detailResult = parseSectionWithSchema(detailSchema, sampleLines, 11)
    expect(detailResult.value).toMatchObject({
      note: "Provided",
      detailFlag: true,
    })
    expect(detailResult.nextIndex).toBe(sampleLines.length)
  })

  it("respects fixed lengths for single-field helpers", () => {
    const lengthSchema = schema([
      stringField("title", "Title=", { length: 10 }),
      numberField("count", "Count=", { integer: true, length: 3 }),
      booleanField("enabled", "Enabled=", { mode: "TF", length: 1 }),
    ])

    const lines = serializeWithSchema(lengthSchema, {
      title: "Hi",
      count: 5,
      enabled: true,
    })

    expect(lines).toEqual(["Title=Hi        ", "Count=  5", "Enabled=T"])

    const parsed = parseWithSchema(lengthSchema, lines, 0)
    expect(parsed.value).toMatchObject({ title: "Hi", count: 5, enabled: true })
  })

  it("serializes numeric boolean modes using list-directed padding when requested", () => {
    const paddedSchema = schema([
      booleanField("legacy", "Legacy=", { mode: "-1,0", pad: true }),
      booleanField("binary", "Binary=", { mode: "10", pad: true }),
    ])

    expect(serializeWithSchema(paddedSchema, { legacy: true, binary: true })).toEqual([
      "Legacy=-1 ",
      "Binary= 1 ",
    ])

    expect(serializeWithSchema(paddedSchema, { legacy: false, binary: false })).toEqual([
      "Legacy= 0 ",
      "Binary= 0 ",
    ])

    const parsed = parseWithSchema(
      paddedSchema,
      ["Legacy= 0", "Binary= 1"],
      0,
    )

    expect(parsed.value).toMatchObject({ legacy: false, binary: true })
  })

  it("pads tuple array counts when configured", () => {
    const paddedTupleSchema = schema([
      tupleArrayField("Polyline=", "polyline", {
        width: 4,
        maxWidth: 8,
        tuple: 2 as const,
        pad: true,
      }),
    ])

    const lines = serializeWithSchema(paddedTupleSchema, {
      polyline: [[1, 2] as [number, number]],
    })

    expect(lines[0]).toBe("Polyline= 1 ")
    expect(lines).toHaveLength(2)
  })

  it("serializes large tuple arrays without overflowing the stack", () => {
    const largeSchema = schema([
      tupleArrayField("Large=", "values", {
        width: 16,
        maxWidth: 64,
        tuple: 2 as const,
        formatter: "coordinate",
      }),
    ])

    const tupleCount = 150_000
    const values = Array.from({ length: tupleCount }, (_, index) => [
      index * 0.5,
      index * 0.5 + 1,
    ]) as Array<[number, number]>

    const lines = serializeWithSchema(largeSchema, { values })

    expect(lines).toHaveLength(1 + Math.ceil(tupleCount / 2))
    expect(lines[0]).toBe(`Large=${tupleCount}`)
  })

  it("annotates parse errors with last parsed line context", () => {
    const numericSchema = schema([
      numberField("value", "Value=", { integer: true }),
    ])

    expect(() => parseWithSchema(numericSchema, ["Value=abc"], 0)).toThrowError(
      /\[ParseContext\] Last parsed line index: 0, content: "Value=abc"/,
    )
  })
})
