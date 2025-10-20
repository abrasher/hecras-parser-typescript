import { schema, type Infer, contextual } from "../../../schema"
import { splitIntoTuples } from "../../../schema/parsingUtils"
import { formatHECRASCoordinateNumber } from "../../../schema/serializationUtils"

export interface GateOpeningSchema {
  id: number
  name: string
  coordinateCount: number
  coordinates?: number[][]
}

function chunkString(str: string, width: number): string[] {
  const length = str.length
  const chunks = new Array(Math.ceil(length / width))

  for (let i = 0, j = 0; i < length; i += width, j++) {
    chunks[j] = str.slice(i, i + width)
  }

  return chunks
}

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

      const parts = dataLine.split(",")

      const name = parts[0].trim()
      const width = parseFloat(parts[1])
      const height = parseFloat(parts[2])
      const invert = parseFloat(parts[3])
      const gateCoefficient = parts[4].trim() === "" ? null : parseFloat(parts[4])
      const expT = parseFloat(parts[5])
      const expO = parseFloat(parts[6])
      const expH = parseFloat(parts[7])
      const type = parseInt(parts[8].trim(), 10)
      const weirCoefficient = parseFloat(parts[9])
      const isOgee = parseInt(parts[10].trim(), 10)
      const spillHeight = parts[11].trim() === "" ? null : parseFloat(parts[11])
      const designHead = parts[12].trim() === "" ? null : parseFloat(parts[12])
      const numberOfOpenings = parseInt(parts[13].trim(), 10)
      const param15 = parseFloat(parts[14])
      const param16 = parseFloat(parts[15])
      const param17 = parseInt(parts[16].trim(), 10)
      const param18 = parts[17].trim() === "" ? null : parseFloat(parts[17])
      const param19 = parts[18].trim() === "" ? null : parseFloat(parts[18])
      const param20 = parseFloat(parts[19])
      const param21 = parseFloat(parts[20])
      const param22 = parseFloat(parts[21])
      const param23 = parseInt(parts[22].trim(), 10)

      const stationsLine = lines[startIndex + 2]
      if (!stationsLine) {
        throw new Error("Missing gate stations line")
      }

      const stationParts = stationsLine.trim().split(/\s+/)
      const openingStations = stationParts.map((s) => parseFloat(s))

      let cursor = startIndex + 3
      const openings: GateOpeningSchema[] = []

      while (cursor < lines.length && lines[cursor]?.startsWith("Conn Gate Opening=")) {
        const openingLine = lines[cursor]
        const header = openingLine.replace(/^Conn Gate Opening=/, "")
        const openingParts = header.split(",")
        const id = parseInt(openingParts[0], 10)
        const openingName = openingParts[1].trim()
        const coordinateCount = parseInt(openingParts[2], 10)

        let coordinates: number[][] | undefined

        if (coordinateCount > 0) {
          cursor++
          const coordLine = lines[cursor]
          if (!coordLine) {
            throw new Error(`Missing coordinates for gate opening ${id}`)
          }
          const chunks = chunkString(coordLine, 16)
          const coordNumbers = chunks.map((c) => parseFloat(c.trim()))
          coordinates = splitIntoTuples(coordNumbers, 2)
        }

        openings.push({ id, name: openingName, coordinateCount, coordinates })
        cursor++
      }

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
          openings,
        },
        nextIndex: cursor,
      }
    },
    (value, _ctx) => {
      if (!value) {
        return []
      }

      const formatNumber = (n: number) => n.toString()
      const formatBlankableNumber = (n: number | null) => (n === null ? "" : n.toString())
      const formatPaddedNumber = (n: number) => ` ${n} `

      const dataLine = [
        value.name.padEnd(12),
        formatNumber(value.width),
        formatNumber(value.height),
        formatNumber(value.invert),
        formatBlankableNumber(value.gateCoefficient),
        formatNumber(value.expT),
        formatNumber(value.expO),
        formatNumber(value.expH),
        formatPaddedNumber(value.type),
        formatNumber(value.weirCoefficient),
        formatPaddedNumber(value.isOgee),
        formatBlankableNumber(value.spillHeight),
        formatBlankableNumber(value.designHead),
        formatPaddedNumber(value.numberOfOpenings),
        formatNumber(value.param15),
        formatNumber(value.param16),
        formatPaddedNumber(value.param17),
        formatBlankableNumber(value.param18),
        formatBlankableNumber(value.param19),
        formatNumber(value.param20),
        formatNumber(value.param21),
        formatNumber(value.param22),
        formatPaddedNumber(value.param23),
      ].join(",")

      const stationsLine = value.openingStations.map((s) => s.toString().padStart(8)).join("")

      const lines = [
        "Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings",
        dataLine,
        stationsLine,
      ]

      for (const opening of value.openings) {
        const headerLine = `Conn Gate Opening=${opening.id},${opening.name},${opening.coordinateCount}`
        lines.push(headerLine)
        if (opening.coordinates && opening.coordinates.length > 0) {
          const flatCoords = opening.coordinates.flat()
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
      }

      return lines
    },
  ),
])

export type GateSchemaType = Infer<typeof gateSchema>
