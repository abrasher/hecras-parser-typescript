import type { BoundaryCondition, TextPosition } from "../models/geometry/boundaryCondition"
import { contextual, numberPart, schema, stringField, tupleArrayField, tupleField, type Infer } from "../schema"

const coordinateParts = [numberPart(), numberPart()] as const
const textPositionLabel = "BC Line Text Position="

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
  contextual(
    "textPosition",
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (!line || !line.startsWith(textPositionLabel)) {
        return null
      }

      const raw = line.slice(textPositionLabel.length)
      const segments = raw.split(",")
      if (segments.length < 2) {
        throw new Error("Text position line must contain two comma-separated values")
      }

      const x = segments[0].trim()
      const y = segments[1].trim()
      return {
        value: { x, y } satisfies TextPosition,
        nextIndex: startIndex + 1,
      }
    },
    (value) => {
      if (!value) {
        return []
      }

      return [`${textPositionLabel} ${value.x} , ${value.y} `]
    },
  ),
])

export type BoundaryConditionSchema = Infer<typeof boundaryConditionSchema>

// Ensure compatibility with the legacy BoundaryCondition interface
export type BoundaryConditionSchemaCheck = BoundaryConditionSchema extends BoundaryCondition
  ? true
  : never
