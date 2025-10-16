import { schema, type Infer, contextual, repeat, startsWith } from "../../schema"
import {
  splitIntoTuples,
  parseMultilineArray,
  parseCommaSeparated,
  parseMaybeFloat,
} from "../../schema/parsingUtils"
import { formatHECRASCoordinateNumber, formatNullableNumber } from "../../schema/serializationUtils"

export interface GateOpeningSchema {
  id: number
  name: string
  coordinateCount: number
  coordinates?: number[][]
}

/**
 * Sub-schema for individual gate openings
 * Format:
 * Conn Gate Opening=<id>,<name>,<coordinateCount>
 * <coordinates in 16-char fixed-width format, 4 values (2 XY pairs) per line>
 */
const gateOpeningSchema = schema([
  contextual(
    "opening",
    (lines, startIndex, _ctx) => {
      const line = lines[startIndex]
      if (!line || !line.startsWith("Conn Gate Opening=")) {
        return null
      }

      const header = line.replace(/^Conn Gate Opening=/, "")
      const openingParts = parseCommaSeparated(header)
      const id = parseInt(openingParts[0], 10)
      const name = openingParts[1]
      const coordinateCount = parseInt(openingParts[2], 10)

      let coordinates: number[][] | undefined
      let nextIndex = startIndex + 1

      if (coordinateCount > 0) {
        const { data: coordStrings, nextIndex: afterCoords } = parseMultilineArray({
          lines,
          width: 16,
          maxWidth: 64,
          numOfEntries: coordinateCount * 2,
          currentIndex: startIndex + 1,
        })
        const coordNumbers = coordStrings.map((s) => parseFloat(s))
        coordinates = splitIntoTuples(coordNumbers, 2)
        nextIndex = afterCoords
      }

      return {
        value: { id, name, coordinateCount, coordinates },
        nextIndex,
      }
    },
    (value, _ctx) => {
      if (!value) {
        return []
      }

      const lines: string[] = []
      const headerLine = `Conn Gate Opening=${value.id},${value.name},${value.coordinateCount}`
      lines.push(headerLine)

      if (value.coordinates && value.coordinates.length > 0) {
        const flatCoords = value.coordinates.flat()
        let coordLine = ""
        for (let i = 0; i < flatCoords.length; i++) {
          const formatted = formatHECRASCoordinateNumber(flatCoords[i])
          coordLine += formatted.padStart(16)
          if ((i + 1) % 4 === 0 && i + 1 < flatCoords.length) {
            lines.push(coordLine)
            coordLine = ""
          }
        }
        if (coordLine) {
          lines.push(coordLine)
        }
      }

      return lines
    },
  ),
])

/**
 * Schema for gate structures in 2D connections
 *
 * Format:
 * Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings
 * <name>,<width>,<height>,<invert>,<gateCoef>,<expT>,<expO>,<expH>,<type>,<weirCoef>,<isOgee>,<spillHt>,<designHead>,<nOpenings>,<15>,<16>,<17>,<18>,<19>,<20>,<21>,<22>,<23>
 * <opening stations in 8-char fixed-width format>
 * Conn Gate Opening=<id>,<name>,<coordinateCount>
 * <coordinates in 16-char fixed-width format, 4 values (2 XY pairs) per line>
 */
export const gateSchema = schema([
  contextual(
    "gate",
    (lines, startIndex, _ctx) => {
      if (
        !lines[startIndex] ||
        !lines[startIndex].startsWith(
          "Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings",
        )
      ) {
        return null
      }

      const dataLine = lines[startIndex + 1]
      if (!dataLine) {
        throw new Error("Missing gate data line")
      }

      const parts = parseCommaSeparated(dataLine)

      const name = parts[0]
      const width = parseFloat(parts[1])
      const height = parseFloat(parts[2])
      const invert = parseFloat(parts[3])
      const gateCoefficient = parseMaybeFloat(parts[4])
      const expT = parseFloat(parts[5])
      const expO = parseFloat(parts[6])
      const expH = parseFloat(parts[7])
      const type = parseInt(parts[8], 10)
      const weirCoefficient = parseFloat(parts[9])
      const isOgee = parseInt(parts[10], 10)
      const spillHeight = parseMaybeFloat(parts[11])
      const designHead = parseMaybeFloat(parts[12])
      const numberOfOpenings = parseInt(parts[13], 10)
      const param15 = parseFloat(parts[14])
      const param16 = parseFloat(parts[15])
      const param17 = parseInt(parts[16], 10)
      const param18 = parseMaybeFloat(parts[17])
      const param19 = parseMaybeFloat(parts[18])
      const param20 = parseFloat(parts[19])
      const param21 = parseFloat(parts[20])
      const param22 = parseFloat(parts[21])
      const param23 = parseInt(parts[22], 10)

      const stationsLine = lines[startIndex + 2]
      if (!stationsLine) {
        throw new Error("Missing gate stations line")
      }

      const stationParts = stationsLine.trim().split(/\s+/)
      const openingStations = stationParts.map((s) => parseFloat(s))

      return {
        value: {
          name,
          width,
          height,
          invert,
          gateCoefficient,
          expT,
          expO,
          expH,
          type,
          weirCoefficient,
          isOgee,
          spillHeight,
          designHead,
          numberOfOpenings,
          param15,
          param16,
          param17,
          param18,
          param19,
          param20,
          param21,
          param22,
          param23,
          openingStations,
        },
        nextIndex: startIndex + 3,
      }
    },
    (value, _ctx) => {
      if (!value) {
        return []
      }

      const formatPaddedNumber = (n: number) => ` ${n} `

      const dataLine = [
        value.name.padEnd(12),
        value.width.toString(),
        value.height.toString(),
        value.invert.toString(),
        formatNullableNumber(value.gateCoefficient),
        value.expT.toString(),
        value.expO.toString(),
        value.expH.toString(),
        formatPaddedNumber(value.type),
        value.weirCoefficient.toString(),
        formatPaddedNumber(value.isOgee),
        formatNullableNumber(value.spillHeight),
        formatNullableNumber(value.designHead),
        formatPaddedNumber(value.numberOfOpenings),
        value.param15.toString(),
        value.param16.toString(),
        formatPaddedNumber(value.param17),
        formatNullableNumber(value.param18),
        formatNullableNumber(value.param19),
        value.param20.toString(),
        value.param21.toString(),
        value.param22.toString(),
        formatPaddedNumber(value.param23),
      ].join(",")

      const stationsLine = value.openingStations.map((s) => s.toString().padStart(8)).join("")

      return [
        "Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings",
        dataLine,
        stationsLine,
      ]
    },
  ),
  repeat("openings", startsWith("Conn Gate Opening="), gateOpeningSchema),
])

export type GateSchemaType = Infer<typeof gateSchema>
