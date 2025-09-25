import type { LandCoverTable } from "../models/geometry/landCover"
import { tupleArrayField, contextual, repeat, schema, startsWith, stringField, type Infer } from "../schema"

function parseLandCoverTable(
  lines: string[],
  startIndex: number,
  label: string,
): { table: LandCoverTable; nextIndex: number } | null {
  const header = lines[startIndex]
  if (!header || !header.startsWith(label)) {
    return null
  }

  const countSegment = header.slice(label.length).trim()
  const count = parseInt(countSegment, 10)
  if (Number.isNaN(count)) {
    throw new Error(`Invalid count for ${label}: ${countSegment}`)
  }

  const rows: LandCoverTable = []
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

  return { table: rows, nextIndex: cursor }
}

function serializeLandCoverTable(label: string, table: LandCoverTable): string[] {
  const lines: string[] = []
  lines.push(`${label}${table.length}`)
  for (const [name, value] of table) {
    lines.push(`${name},${value}`)
  }
  return lines
}

const landCoverRegionSchema = schema([
  stringField("name", "LCMann Region Name="),
  contextual(
    "table",
    (ctx, lines, startIndex) => {
      const result = parseLandCoverTable(lines, startIndex, "LCMann Region Table=")
      if (!result) {
        throw new Error("Expected LCMann Region Table header")
      }
      return { value: result.table, nextIndex: result.nextIndex }
    },
    (_ctx, value) => {
      if (!value) {
        return []
      }
      return serializeLandCoverTable("LCMann Region Table=", value)
    },
  ),
  tupleArrayField("LCMann Region Polygon=", "polygon", {
    width: 16,
    maxWidth: 64,
    tuple: 2 as const,
  }),
])

export const landCoverSchema = schema([
  stringField("lastEdited", "LCMann Time="),
  stringField("lastEditedRegion", "LCMann Region Time="),
  contextual(
    "table",
    (ctx, lines, startIndex) => {
      const result = parseLandCoverTable(lines, startIndex, "LCMann Table=")
      if (!result) {
        throw new Error("Expected LCMann Table header")
      }
      return { value: result.table, nextIndex: result.nextIndex }
    },
    (_ctx, value) => {
      if (!value) {
        return []
      }
      return serializeLandCoverTable("LCMann Table=", value)
    },
  ),
  repeat("regions", startsWith("LCMann Region Name="), landCoverRegionSchema),
])

export type LandCoverSchema = Infer<typeof landCoverSchema>
