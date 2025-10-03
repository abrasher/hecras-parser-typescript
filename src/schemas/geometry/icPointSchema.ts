import { fields, multiField, numberPart, schema, stringField, type Infer } from "../../schema"

export const icPointSchema = schema([
  stringField("name", "IC Point Name=", { length: 32 }),
  multiField(
    "IC Point Position=",
    fields({
      x: numberPart(),
      y: numberPart(),
    }),
  ),
])

export type ICPointSchema = Infer<typeof icPointSchema>
