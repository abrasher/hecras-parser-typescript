/**
 * Parses culvert data from a "Connection Culv=" line
 * Correct Format: Connection Culv=shape,rise,span,length,nTop,entranceLoss,exitLoss,chart,scale,upstreamInvert,downstreamInvert,numberOfBarrels,culvertGroupName,unknownFlag,
 * Next line contains pairs of US and DS stations
 *
 */

import { parseLineStationPairs, parseLineToCoordinates } from "../core/primitives"
import type { Coordinate } from "../models/common"
import type { CulvertGroupProperties } from "../models/culvert"
import { parseCommaSeparated, parseKeyValue } from "../utils"

export function parseCulvertData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertGroupProperties[]; nextIndex: number } {
  const culvertGroups = [] as CulvertGroupProperties[]

  let index = currentIndex

  while (lines[index].startsWith("Connection Culv=")) {
    const { data, nextIndex } = parseCulvertGroup(line, lines, currentIndex)
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

  const numberOfStationLines = Math.ceil(culvertData.numberOfBarrels / 5)
  let index = currentIndex + 1
  const endIndex = index + numberOfStationLines
  console.log(`Start index: ${index}, end index: ${endIndex}`)

  for (; index < endIndex; index++) {
    const nextLine = lines[index]
    console.log(`Next line ${nextLine}`)
    const stations = parseLineStationPairs(nextLine)
    culvertData.barrelStations.push(...stations)
  }

  const validKeys = ["Conn Culvert Barrel", "Conn Culv Bottom n"]

  const isValidLine = (line: string) => {
    return validKeys.some((key) => line.startsWith(key))
  }

  console.log(`currentLine: ${lines[index]}`)
  while (isValidLine(lines[index])) {
    const currentLine = lines[index]
    console.log(`Parsing line ${index}`)
    if (currentLine.startsWith("Conn Culvert Barrel")) {
      const { data, nextIndex } = parseCulvertBarrel(line, lines, index)
      culvertData.barrels.push(data)
      index = nextIndex
    } else if (currentLine.startsWith("Conn Culv Bottom n")) {
      culvertData.nBottom = parseFloat(parseKeyValue(line).value)
      index++
    } else if (currentLine.startsWith("Conn Culv Bottom Depth")) {
      culvertData.nBottom = parseFloat(parseKeyValue(line).value)
      index++
    } else if (currentLine.startsWith("Conn Culv Depth Blocked")) {
      culvertData.nBottom = parseFloat(parseKeyValue(line).value)
      index++
    } else {
      break
    }
    console.log(`Next line ${lines[index]}`)
    console.log(`Next Index ${index}`)
  }

  return { data: culvertData, nextIndex: index }
}

function parseCulvertBarrel(line: string, lines: string[], currentIndex: number) {
  const { value } = parseKeyValue(line)

  // Conn Culvert Barrel=index,name,numberOfCoordinates
  const parts = parseCommaSeparated(value)

  const barrelData = {
    index: parseInt(parts[0]),
    name: parts[1],
    coordinates: [] as Coordinate[],
  }

  const pairCount = parseInt(parts[2])

  if (pairCount === 0) return { data: barrelData, nextIndex: currentIndex }

  const lineCount = Math.ceil(pairCount / 2)

  let index = currentIndex + 1
  const endIndex = index + lineCount

  for (; index < endIndex; index++) {
    const nextLine = lines[index]
    console.log(`parseCulvertBarrel: Parsing index ${index}`)
    console.log(`parseCulvertBarrel: Parsing line ${nextLine}`)
    const stations = parseLineToCoordinates(nextLine)
    barrelData.coordinates.push(...stations)
  }

  return {
    data: barrelData,
    nextIndex: index,
  }
}

/**
 * parseCulvertData will return multiple culverts
 * parseCulvertGroup will return 1 culvert group with multiple barrels
 * parseBarrel will return 1 barrel
 */
