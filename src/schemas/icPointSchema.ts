import { formatHECRASCoordinateNumber } from "../serializers/utils"
import { fields, multiField, schema, stringField, type Infer, type Part } from "../schema"

const coordinatePart: Part<[number, number]> = {
  parse(segment) {
    const raw = segment.trim()
    if (raw === "") {
      throw new Error("IC Point Position requires coordinate data")
    }

    const [xRaw, yRaw] = raw.split(",")
    if (xRaw === undefined || yRaw === undefined) {
      throw new Error(`Invalid IC Point Position segment: ${segment}`)
    }

    const x = parseFloat(xRaw.trim())
    const y = parseFloat(yRaw.trim())

    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(`Invalid numeric value in IC Point Position: ${segment}`)
    }

    return [x, y]
  },
  serialize(value) {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error("IC Point coordinate must be a tuple of [x, y]")
    }

    const [x, y] = value
    if (typeof x !== "number" || typeof y !== "number") {
      throw new Error("IC Point coordinate values must be numbers")
    }

    return `${formatHECRASCoordinateNumber(x)},${formatHECRASCoordinateNumber(y)}`
  },
}

export const icPointSchema = schema([
  stringField("name", "IC Point Name=", { length: 32 }),
  multiField(
    "IC Point Position=",
    fields({
      coordinate: coordinatePart,
    } as const),
  ),
])

export type ICPointSchema = Infer<typeof icPointSchema>
