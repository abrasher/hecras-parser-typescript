import {
  blankLine,
  booleanField,
  contextual,
  fields,
  multiField,
  numberPart,
  parseSectionWithSchema,
  schema,
  serializeWithSchema,
  stringField,
  stringPart,
  tupleArrayField,
  tupleField,
  type Infer,
} from "../../schema"
import { crossSectionSchema } from "./crossSectionSchema"
import { inlineWeirSchema } from "./inlineWeirSchema"
import { lateralWeirSchema } from "./lateralWeirSchema"
import { oneDimBridgeSchema } from "./oneDimBridgeSchema"
import { oneDimStructureWithCulvertSchema } from "./oneDimStructureWithCulvertSchema"

const typeLinePattern = /Type RM Length L Ch R =\s*(\d+)/

const schemaByType = {
  1: crossSectionSchema,
  2: oneDimStructureWithCulvertSchema,
  3: oneDimBridgeSchema,
  5: inlineWeirSchema,
  6: lateralWeirSchema,
} as const

type SupportedRiverStationType = keyof typeof schemaByType

type RiverStationEntryData = Infer<(typeof schemaByType)[SupportedRiverStationType]>

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
  stringField("downstreamStorageArea", "Reach Downstream Storage Area=", {
    optional: true,
    trim: true,
  }),
  stringField("upstreamStorageArea", "Reach Upstream Storage Area=", {
    optional: true,
    trim: true,
  }),
  blankLine(),
  contextual(
    "riverStationEntries",
    (lines, startIndex) => {
      let cursor = startIndex
      const entries: RiverStationEntryData[] = []

      while (cursor < lines.length) {
        const line = lines[cursor]
        if (!line?.startsWith("Type RM Length L Ch R =")) {
          break
        }

        const match = line.match(typeLinePattern)
        if (!match) {
          break
        }

        const typeValue = Number(match[1]) as SupportedRiverStationType
        const entrySchema = schemaByType[typeValue]

        if (!entrySchema) {
          break
        }

        const { value, nextIndex } = parseSectionWithSchema(entrySchema, lines, cursor)
        entries.push(value)
        cursor = nextIndex
      }

      if (entries.length === 0) {
        return null
      }

      return { value: entries, nextIndex: cursor }
    },
    (entries) => {
      if (!entries || entries.length === 0) {
        return []
      }

      return entries.flatMap((entry) => {
        const entrySchema = schemaByType[entry.type as SupportedRiverStationType]
        if (!entrySchema) {
          throw new Error(`Unsupported river station entry type: ${entry.type}`)
        }
        return serializeWithSchema(entrySchema, entry)
      })
    },
  ),
])

export type RiverReachSchema = Infer<typeof riverReachSchema>
export type RiverStationEntry = RiverStationEntryData
