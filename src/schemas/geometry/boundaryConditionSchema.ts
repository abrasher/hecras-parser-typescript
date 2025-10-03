import { numberPart, schema, stringField, tupleArrayField, tupleField, type Infer } from "../schema"

const coordinateParts = [numberPart({ pad: true }), numberPart({ pad: true })] as const

export const boundaryConditionSchema = schema([
  stringField("name", "BC Line Name=", { length: 32 }),
  stringField("storageArea", "BC Line Storage Area=", { length: 16 }),
  tupleField("startPosition", "BC Line Start Position=", coordinateParts),
  tupleField("middlePosition", "BC Line Middle Position=", coordinateParts),
  tupleField("endPosition", "BC Line End Position=", coordinateParts),
  tupleArrayField("BC Line Arc=", "arcCoordinates", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    pad: true,
    formatter: "coordinate",
  }),
  tupleField("textPosition", "BC Line Text Position=", coordinateParts),
])

export type BoundaryConditionSchema = Infer<typeof boundaryConditionSchema>
