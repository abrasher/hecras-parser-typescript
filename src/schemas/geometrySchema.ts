import type { ViewingRectangle } from "../models/geometry/geometryHeaders"
import { blankLine, contextual, fields, multiField, schema, stringField, type Infer, type Part } from "../schema"

const viewingRectanglePart: Part<ViewingRectangle> = {
  parse(segment) {
    const raw = segment.trim()
    if (raw === "") {
      throw new Error("Viewing Rectangle line cannot be blank")
    }

    const segments = raw.split(",").map((value) => value.trim()).filter((value) => value !== "")
    if (segments.length !== 4) {
      throw new Error(`Viewing Rectangle must contain four comma-separated values: ${segment}`)
    }

    const [leftRaw, rightRaw, topRaw, bottomRaw] = segments
    const left = parseFloat(leftRaw)
    const right = parseFloat(rightRaw)
    const top = parseFloat(topRaw)
    const bottom = parseFloat(bottomRaw)

    if ([left, right, top, bottom].some((value) => Number.isNaN(value))) {
      throw new Error(`Invalid numeric value in Viewing Rectangle: ${segment}`)
    }

    return { left, right, top, bottom }
  },
  serialize(value) {
    if (!value) {
      throw new Error("Viewing Rectangle value is required")
    }

    const { left, right, top, bottom } = value
    const numbers = [left, right, top, bottom]
    if (numbers.some((num) => typeof num !== "number" || Number.isNaN(num))) {
      throw new Error("Viewing Rectangle values must be finite numbers")
    }

    const formatted = numbers.map((num) => (Number.isInteger(num) ? num.toString() : num.toString()))
    return ` ${formatted.join(" , ")} `
  },
}

export const geometrySchema = schema([
  stringField("geomTitle", "Geom Title="),
  stringField("programVersion", "Program Version="),
  multiField(
    "Viewing Rectangle=",
    fields({
      viewingRectangle: viewingRectanglePart,
    } as const),
  ),
  blankLine(),
  contextual(
    "description",
    (_ctx, lines, startIndex) => {
      const startLine = lines[startIndex]
      if (!startLine || !startLine.startsWith("BEGIN GEOM DESCRIPTION:")) {
        return null
      }

      const descriptionLines: string[] = []
      let cursor = startIndex + 1
      while (cursor < lines.length) {
        const line = lines[cursor]
        if (line?.startsWith("END GEOM DESCRIPTION:")) {
          return {
            value: descriptionLines.join("\n"),
            nextIndex: cursor + 1,
          }
        }
        descriptionLines.push(line ?? "")
        cursor++
      }

      throw new Error("Missing END GEOM DESCRIPTION: terminator")
    },
    (_ctx, value) => {
      if (value === undefined) {
        return []
      }

      const lines: string[] = ["BEGIN GEOM DESCRIPTION:"]
      if (value.trim() === "") {
        lines.push("")
      } else {
        lines.push(...value.split("\n"))
      }
      lines.push("END GEOM DESCRIPTION:")
      return lines
    },
  ),
])

export type GeometrySchema = Infer<typeof geometrySchema>
