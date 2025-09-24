import { describe, expect, it } from "vitest"
import {
  countedFixedWidthTuples,
  contextual,
  fields,
  multiField,
  numberPart,
  opt,
  parseSectionWithSchema,
  parseWithSchema,
  repeat,
  schema,
  section,
  serializeWithSchema,
  startsWith,
  stringPart,
  booleanPart,
} from "../../src/schema"

const detailSchema = schema([
  multiField(
    "Detail=",
    fields({
      note: opt(stringPart({ trim: true })),
    }),
  ),
  contextual(
    "detailFlag",
    (_ctx, lines, startIndex) => {
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
    (_ctx, value) => {
      if (value === undefined) {
        return []
      }
      return [`Detail Flag=${value ? "T" : "F"}`]
    },
  ),
])

const entrySchema = schema([
  multiField(
    "Entry=",
    fields({
      name: stringPart({ trim: true }),
    }),
  ),
  multiField(
    "Entry Number=",
    fields({
      value: numberPart({ integer: true }),
    }),
  ),
  multiField(
    "Entry Flag=",
    fields({
      enabled: booleanPart({ mode: "TF" }),
    }),
  ),
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
  multiField(
    "Item Optional=",
    fields({
      maybe: opt(stringPart({ trim: true })),
    }),
  ),
  countedFixedWidthTuples("Values=", "values", {
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
      values: [
        [1, 2],
        [3, 4],
      ],
      entries: [
        { name: "Alpha", value: 1, enabled: true },
      ],
      detail: {
        note: undefined,
        detailFlag: false,
      },
    }

    const lines = serializeWithSchema(testSchema, roundTrip)

    expect(lines).toEqual([
      "Item=Sample,3,",
      "Values=2",
      "   1.0   2.0",
      "   3.0   4.0",
      "Entry=Alpha",
      "Entry Number=1",
      "Entry Flag=T",
      "Detail Flag=F",
    ])
  })

  it("parses detail section independently", () => {
    const detailResult = parseSectionWithSchema(detailSchema, sampleLines, 10)
    expect(detailResult.value).toMatchObject({
      note: "Provided",
      detailFlag: true,
    })
    expect(detailResult.nextIndex).toBe(sampleLines.length)
  })
})
