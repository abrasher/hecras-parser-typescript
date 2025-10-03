import {
  blankLine,
  booleanField,
  fields,
  multiField,
  numberPart,
  schema,
  stringPart,
  tupleArrayField,
  tupleField,
  type Infer,
} from "../../schema"

export const riverReachSchema = schema([
  multiField(
    "River Reach=",
    fields({
      riverName: stringPart({ trim: true, width: 16 }),
      reachName: stringPart({ trim: true, width: 16 }),
    }),
  ),
  tupleArrayField("Reach XY=", "coordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    pad: true,
    formatter: "coordinate",
  }),
  tupleField("textPosition", "Rch Text X Y=", [numberPart(), numberPart()], { optional: true }),
  booleanField("reversedText", "Reverse River Text=", { mode: "-1,0", pad: true }),
  blankLine(),
])

export type RiverReachSchema = Infer<typeof riverReachSchema>
