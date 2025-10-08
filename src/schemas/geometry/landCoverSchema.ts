import {
  tupleArrayField,
  contextual,
  repeat,
  schema,
  startsWith,
  stringField,
  type Infer,
} from "../../schema"

const landCoverRegionSchema = schema([
  stringField("name", "LCMann Region Name="),
  contextual(
    "table",
    (lines, startIndex, _ctx) => {
      const label = "LCMann Region Table="
      const header = lines[startIndex]
      if (!header || !header.startsWith(label)) {
        throw new Error("Expected LCMann Region Table header")
      }

      const countSegment = header.slice(label.length).trim()
      const count = parseInt(countSegment, 10)
      if (Number.isNaN(count)) {
        throw new Error(`Invalid count for ${label}: ${countSegment}`)
      }

      const rows: Array<[string, number]> = []
      let cursor = startIndex + 1

      for (let i = 0; i < count; i++) {
        const rowLine = lines[cursor]
        if (rowLine === undefined) {
          throw new Error(`Expected ${count} land cover rows for ${label} but only found ${i}`)
        }

        const [nameRaw, valueRaw] = rowLine.split(",")
        if (nameRaw === undefined || valueRaw === undefined) {
          throw new Error(`Invalid land cover row: ${rowLine}`)
        }

        const name = nameRaw.trim()
        const value = parseFloat(valueRaw.trim())
        if (Number.isNaN(value)) {
          throw new Error(`Invalid numeric land cover value in row: ${rowLine}`)
        }

        rows.push([name, value])
        cursor++
      }

      return { value: rows, nextIndex: cursor }
    },
    (value, _ctx) => {
      if (!value) {
        return []
      }
      const label = "LCMann Region Table="
      const linesOut: string[] = [`${label}${value.length}`]
      for (const [name, numericValue] of value) {
        linesOut.push(`${name},${numericValue}`)
      }
      return linesOut
    },
  ),
  tupleArrayField("LCMann Region Polygon=", "polygon", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
    formatter: "coordinate",
  }),
])

export const landCoverSchema = schema([
  stringField("lastEdited", "LCMann Time="),
  stringField("lastEditedRegion", "LCMann Region Time=", { optional: true }),
  contextual(
    "table",
    (lines, startIndex, _ctx) => {
      const label = "LCMann Table="
      const header = lines[startIndex]
      if (!header || !header.startsWith(label)) {
        throw new Error("Expected LCMann Table header")
      }

      const countSegment = header.slice(label.length).trim()
      const count = parseInt(countSegment, 10)
      if (Number.isNaN(count)) {
        throw new Error(`Invalid count for ${label}: ${countSegment}`)
      }

      const rows: Array<[string, number]> = []
      let cursor = startIndex + 1

      for (let i = 0; i < count; i++) {
        const rowLine = lines[cursor]
        if (rowLine === undefined) {
          throw new Error(`Expected ${count} land cover rows for ${label} but only found ${i}`)
        }

        const [nameRaw, valueRaw] = rowLine.split(",")
        if (nameRaw === undefined || valueRaw === undefined) {
          throw new Error(`Invalid land cover row: ${rowLine}`)
        }

        const name = nameRaw.trim()
        const value = parseFloat(valueRaw.trim())
        if (Number.isNaN(value)) {
          throw new Error(`Invalid numeric land cover value in row: ${rowLine}`)
        }

        rows.push([name, value])
        cursor++
      }

      return { value: rows, nextIndex: cursor }
    },
    (value, _ctx) => {
      if (value === undefined) {
        return []
      }
      const label = "LCMann Table="
      const linesOut: string[] = [`${label}${value.length}`]
      for (const [name, numericValue] of value) {
        linesOut.push(`${name},${numericValue}`)
      }
      return linesOut
    },
  ),
  repeat("regions", startsWith("LCMann Region Name="), landCoverRegionSchema),
])

export type LandCoverSchema = Infer<typeof landCoverSchema>
