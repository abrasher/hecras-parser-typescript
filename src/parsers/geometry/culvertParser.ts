import {
  splitIntoTuples,
  parseCommaSeparated,
  parseKeyValue,
  parseMaybeFloat,
  parseMultilineArray,
} from "../utils"
import type { CulvertGroupProperties } from "../../models/geometry/culvert"

/**
 * Parses culvert data starting from a "Connection Culv=" line
 * It will return 1 or more culvert groups
 */
export function parseCulvertData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertGroupProperties[]; nextIndex: number } {
  if (!line.startsWith("Connection Culv="))
    throw new Error(`culvertParser was given a line it can't parse: ${line}`)

  const culvertGroups = [] as CulvertGroupProperties[]

  let index = currentIndex

  // Keep trying to parse culvert groups until there are no more
  while (lines[index]?.startsWith("Connection Culv=")) {
    const { data, nextIndex } = parseCulvertGroup(lines[index], lines, index)
    culvertGroups.push(data)
    index = nextIndex
  }
  return {
    data: culvertGroups,
    nextIndex: index,
  }
}

export function parseCulvertGroup(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertGroupProperties; nextIndex: number } {
  const { value } = parseKeyValue(line)

  // Connection Culv=shape,rise,span,length,nTop,entranceLoss,exitLoss,chart,scale,upstreamInvert,downstreamInvert,numberOfBarrels,culvertGroupName,unknownFlag,
  const parts = parseCommaSeparated(value)

  const culvertData = {
    shape: parseInt(parts[0]),
    rise: parseFloat(parts[1]),
    span: parseFloat(parts[2]),
    length: parseFloat(parts[3]),
    nTop: parseFloat(parts[4]),
    entranceLoss: parseFloat(parts[5]),
    exitLoss: parseFloat(parts[6]),
    chart: parseInt(parts[7]),
    scale: parseInt(parts[8]),
    upstreamInvert: parseFloat(parts[9]),
    downstreamInvert: parseFloat(parts[10]),
    numberOfBarrels: parseInt(parts[11]),
    culvertGroupName: parts[12].trim(),
    unknownFlag: parseInt(parts[13]),
    barrelStations: [],
    barrels: [],
  } as CulvertGroupProperties

  // Barrel stations are defined on the next lines
  // The line is max width of 80, each number being 8 characters. You can fit 5 pairs per line
  // [5 pair per line = (80 chars / 8 char per num ) / 2 num per pair]
  let index = currentIndex + 1
  const { data: stationData, nextIndex: stationsNextIndex } = parseMultilineArray({
    width: 8,
    maxWidth: 80,
    numOfEntries: culvertData.numberOfBarrels * 2,
    currentIndex: index,
    lines,
  })
  const stationValues = stationData.map((value) => parseMaybeFloat(value))
  const stationPairs = splitIntoTuples(stationValues, 2).map(
    ([upstreamStation, downstreamStation]) => ({
      upstreamStation,
      downstreamStation,
    }),
  )
  culvertData.barrelStations.push(...stationPairs)
  index = stationsNextIndex

  const validKeys = [
    "Conn Culvert Barrel",
    "Conn Culv Bottom n",
    "Conn Culv Bottom Depth",
    "Conn Culv Depth Blocked",
  ]

  const isValidLine = (line: string) => {
    return validKeys.some((key) => line?.startsWith(key))
  }

  // The next lines in a culvert group are not garunteed to be there or to be in a fixed order
  // Therefore we keep parsing until we don't recognize a valid key
  while (isValidLine(lines[index])) {
    const currentLine = lines[index]
    if (currentLine.startsWith("Conn Culvert Barrel")) {
      const { data, nextIndex } = parseCulvertBarrel(currentLine, lines, index)
      culvertData.barrels.push(data)
      index = nextIndex
    } else if (currentLine.startsWith("Conn Culv Bottom n")) {
      culvertData.nBottom = parseFloat(parseKeyValue(currentLine).value)
      index++
    } else if (currentLine.startsWith("Conn Culv Bottom Depth")) {
      culvertData.nBottomDepth = parseFloat(parseKeyValue(currentLine).value)
      index++
    } else if (currentLine.startsWith("Conn Culv Depth Blocked")) {
      culvertData.depthBlocked = parseFloat(parseKeyValue(currentLine).value)
      index++
    } else {
      break
    }
  }

  return { data: culvertData, nextIndex: index }
}

function parseCulvertBarrel(line: string, lines: string[], currentIndex: number) {
  let index = currentIndex
  const { value } = parseKeyValue(line)

  // Conn Culvert Barrel=index,name,numberOfCoordinates
  const parts = parseCommaSeparated(value)

  const barrelData = {
    index: parseInt(parts[0]),
    name: parts[1],
    coordinates: [] as [number, number][],
  }

  // HECRAS tells you how many points a barrel has
  const numberOfPoints = parseInt(parts[2])
  index++

  // Barrel coordinates are 64 characters wide, 16 characters a number, 2 pairs a line
  // This means we can fit 2 coordinates per line, so number of lines is coordinates / 2
  const pointsPerEntry = 2
  const { data, nextIndex: nextIndex1 } = parseMultilineArray({
    width: 16,
    maxWidth: 64,
    numOfEntries: numberOfPoints * pointsPerEntry,
    currentIndex: index,
    lines,
  })

  const dataAsFloats = data.map((v) => parseFloat(v))
  const dataAsPairs = splitIntoTuples(dataAsFloats, 2)

  barrelData.coordinates = dataAsPairs

  return {
    data: barrelData,
    nextIndex: nextIndex1,
  }
}

/**
 * parseCulvertData will return multiple culverts
 * parseCulvertGroup will return 1 culvert group with multiple barrels
 * parseBarrel will return 1 barrel
 */
