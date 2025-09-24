/* eslint-disable unused-imports/no-unused-vars */
import { describe, expectTypeOf, it } from "vitest"
import type { Infer, InferPart } from "../../src/schema"
import {
  booleanField,
  booleanPart,
  countedFixedWidthTuples,
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
  countedFixedWidthTuples("Values=", "values", {
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
      alias?: string
      nullableCount?: number | null
      timeout: number
      values: Array<[number, number]>
      items: Array<{ label: string; enabled: boolean }>
      detail?: { description: string; flag?: boolean }
    }

    expectTypeOf<Root>().toMatchTypeOf<ExpectedRoot>()
    expectTypeOf<ExpectedRoot>().toMatchTypeOf<Root>()
    expectTypeOf(rootValue.values[0][0]).toEqualTypeOf<number>()

    const nullableNumberPart = numberPart({ nullOnBlank: true })
    expectTypeOf<InferPart<typeof nullableNumberPart>>().toEqualTypeOf<number | null>()

    const optionalNullableNumber = opt(nullableNumberPart)
    expectTypeOf<InferPart<typeof optionalNullableNumber>>().toEqualTypeOf<
      number | null | undefined
    >()
  })
})
