/* eslint-disable unused-imports/no-unused-vars */
import { describe, expectTypeOf, it } from "vitest"
import type { Infer, InferPart } from "../../src/schema"
import {
  booleanField,
  tupleArrayField,
  tupleField,
  countedFixedWidthArray,
  countedArrayLengthPart,
  durationField,
  fields,
  multiField,
  numberField,
  numberPart,
  opt,
  repeat,
  schema,
  section,
  startsWith,
  stringField,
  stringPart,
} from "../../src/schema"

const detailSchema = schema([
  stringField("description", "Detail Line=", { trim: true }),
  booleanField("flag", "Detail Flag=", { mode: "TF", optional: true }),
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
  multiField(
    "Optional Block=",
    fields({
      altitude: numberPart({ integer: true }),
      comment: stringPart({ trim: true }),
    }),
    { optional: true },
  ),
  tupleField("coordinate", "Coordinate=", [numberPart(), numberPart()] as const),
  tupleArrayField("Values=", "values", {
    width: 8,
    maxWidth: 16,
    tuple: 2 as const,
  }),
  stringField("alias", "Alias=", { optional: true, trim: true }),
  numberField("nullableCount", "Nullable Count=", { nullOnBlank: true, optional: true }),
  durationField("timeout", "Timeout=", {}),
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
      booleanField("enabled", "Item Enabled=", { mode: "trueFalse" }),
    ]),
  ),
  section("detail", startsWith("Detail Line="), detailSchema),
])

type Root = Infer<typeof rootSchema>

declare const rootValue: Root

describe("schema types", () => {
  it("should infer the correct type", () => {
    type ExpectedRoot = {
      name: string
      version: number
      optionalNote?: string
      altitude?: number
      comment?: string
      coordinate: [number, number]
      alias?: string
      nullableCount?: number | null
      timeout: number
      values: Array<[number, number]>
      items: Array<{ label: string; enabled: boolean }>
      detail?: { description: string; flag?: boolean }
    }

    expectTypeOf<Root>().toMatchTypeOf<ExpectedRoot>()
    expectTypeOf(rootValue.values[0][0]).toEqualTypeOf<number>()

    const nullableNumberPart = numberPart({ nullOnBlank: true })
    expectTypeOf<InferPart<typeof nullableNumberPart>>().toEqualTypeOf<number | null>()

    const optionalNullableNumber = opt(nullableNumberPart)
    expectTypeOf<InferPart<typeof optionalNullableNumber>>().toEqualTypeOf<
      number | null | undefined
    >()

    const stationSchema = schema([
      tupleArrayField("Stations=", "stations", {
        width: 8,
        maxWidth: 80,
        tuple: 2 as const,
        formatter: "station",
      }),
    ])

    type Station = Infer<typeof stationSchema>
    expectTypeOf<Station["stations"][number][number]>().toEqualTypeOf<number | null>()

    const countedSchema = schema([
      multiField(
        "Header=",
        fields({
          count: countedArrayLengthPart("values"),
        }),
      ),
      countedFixedWidthArray("values", {
        width: 8,
        maxWidth: 80,
        tuple: 2 as const,
        formatter: "station",
      }),
    ])

    type Counted = Infer<typeof countedSchema>
    expectTypeOf<Counted["values"][number][number]>().toEqualTypeOf<number | null>()
  })
})
