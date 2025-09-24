/* eslint-disable unused-imports/no-unused-vars */
import { describe, expectTypeOf, it } from "vitest"
import type { Infer, InferPart } from "../../src/schema"
import {
  booleanPart,
  countedFixedWidthTuples,
  fields,
  multiField,
  numberPart,
  opt,
  repeat,
  schema,
  section,
  startsWith,
  stringPart,
} from "../../src/schema"

const detailSchema = schema([
  multiField(
    "Detail Line=",
    fields({
      description: stringPart({ trim: true }),
      flag: opt(booleanPart({ mode: "TF" })),
    }),
  ),
])

const rootSchema = schema([
  multiField(
    "Header=",
    fields({
      name: stringPart({ trim: true }),
      version: numberPart({ integer: true }),
      optionalNote: opt(stringPart({ trim: true })),
    }),
  ),
  countedFixedWidthTuples("Values=", "values", {
    width: 8,
    maxWidth: 16,
    tuple: 2 as const,
  }),
  repeat(
    "items",
    startsWith('Item="'),
    schema([
      multiField(
        "Item=",
        fields({
          label: stringPart({ trim: true }),
        }),
      ),
      multiField(
        "Item Enabled=",
        fields({
          enabled: booleanPart({ mode: "trueFalse" }),
        }),
      ),
    ]),
  ),
  section("detail", startsWith("Detail Line="), detailSchema),
])

type Root = Infer<typeof rootSchema>

declare const rootValue: Root

describe("schema types", () => {
  it("should infer the correct type", () => {
    expectTypeOf(rootValue).toMatchTypeOf<{
      name: string
      version: number
      optionalNote?: string
      values: Array<[number, number]>
      items: Array<{ label: string; enabled: boolean }>
      detail?: { description: string; flag?: boolean }
    }>()
    expectTypeOf(rootValue.values[0][0]).toEqualTypeOf<number>()

    const nullableNumberPart = numberPart({ nullOnBlank: true })
    expectTypeOf<InferPart<typeof nullableNumberPart>>().toEqualTypeOf<number | null>()

    const optionalNullableNumber = opt(nullableNumberPart)
    expectTypeOf<InferPart<typeof optionalNullableNumber>>().toEqualTypeOf<
      number | null | undefined
    >()
  })
})
