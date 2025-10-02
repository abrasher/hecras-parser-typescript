import {
  blankLine,
  contextual,
  fields,
  multiField,
  numberPart,
  opt,
  schema,
  stringPart,
  tupleArrayField,
  tupleField,
  type Infer,
  type Part,
} from "../schema"

const riverReachNameFields = fields({
  riverName: stringPart({ trim: true, width: 16 }),
  reachName: stringPart({ trim: true, width: 16 }),
})

const integerPart = numberPart({ integer: true })

const reverseRiverTextBase: Part<number> = {
  parse(segment) {
    return integerPart.parse(segment)
  },
  serialize(value) {
    const serialized = integerPart.serialize(value)
    if (value === 0) {
      return ` ${serialized} `
    }
    return `${serialized} `
  },
}

const reverseRiverTextPart = opt(reverseRiverTextBase)

export const riverReachSchema = schema([
  multiField("River Reach=", riverReachNameFields),
  tupleArrayField("Reach XY=", "coordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    pad: true,
    formatter: "coordinate",
  }),
  contextual(
    "coordinateCount",
    (_lines, index, context) => {
      const coordinates = context.coordinates as Array<[number, number]> | undefined
      const length = coordinates?.length ?? 0
      return { value: length, nextIndex: index }
    },
    (value, context) => {
      const coordinates = context.coordinates as Array<[number, number]> | undefined
      const actual = coordinates?.length ?? 0
      if (value !== undefined && value !== actual) {
        throw new Error(
          `coordinateCount (${value}) does not match coordinates length (${actual})`,
        )
      }
      return []
    },
  ),
  tupleField("textPosition", "Rch Text X Y=", [numberPart(), numberPart()], { optional: true }),
  multiField(
    "Reverse River Text=",
    fields({
      reverseRiverText: reverseRiverTextPart,
    }),
  ),
  blankLine(),
])

export type RiverReachSchema = Infer<typeof riverReachSchema>
