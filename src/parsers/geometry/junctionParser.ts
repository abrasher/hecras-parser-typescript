import { parseCommaSeparated } from "../utils"
import { parseKeyValue } from "../utils"
import type {
  JunctionProperties,
  RiverReachConnection,
  LengthAreaPair,
} from "../../models/geometry/junction"

export function parseJunctionData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: JunctionProperties; nextIndex: number } {
  if (!line.startsWith("Junct Name="))
    throw new Error(`junctionParser was given a line it can't parse: ${line}`)

  const junctionName = parseKeyValue(line).value.trim()
  let index = currentIndex + 1

  // Parse Junct Desc
  if (!lines[index]?.startsWith("Junct Desc=")) {
    throw new Error(`Expected Junct Desc line at index ${index}, got: ${lines[index]}`)
  }
  const description = parseKeyValue(lines[index]).value
  index++

  // Parse Junct X Y & Text X Y
  if (!lines[index]?.startsWith("Junct X Y & Text X Y=")) {
    throw new Error(`Expected Junct X Y & Text X Y line at index ${index}, got: ${lines[index]}`)
  }
  const coordinatesParts = parseCommaSeparated(parseKeyValue(lines[index]).value)
  const coordinates = {
    position: [parseFloat(coordinatesParts[0]), parseFloat(coordinatesParts[1])] as [
      number,
      number,
    ],
    textPosition: [parseFloat(coordinatesParts[2]), parseFloat(coordinatesParts[3])] as [
      number,
      number,
    ],
  }
  index++

  // Parse upstream connections
  const upstreamConnections: RiverReachConnection[] = []
  while (lines[index]?.startsWith("Up River,Reach=")) {
    const connectionParts = parseCommaSeparated(parseKeyValue(lines[index]).value)
    upstreamConnections.push({
      river: connectionParts[0].trim(),
      reach: connectionParts[1].trim(),
    })
    index++
  }

  // Parse downstream connection
  if (!lines[index]?.startsWith("Dn River,Reach=")) {
    throw new Error(`Expected Dn River,Reach line at index ${index}, got: ${lines[index]}`)
  }
  const downstreamParts = parseCommaSeparated(parseKeyValue(lines[index]).value)
  const downstreamConnection: RiverReachConnection = {
    river: downstreamParts[0].trim(),
    reach: downstreamParts[1].trim(),
  }
  index++

  // Parse length and area pairs
  const lengthAndAreas: LengthAreaPair[] = []
  while (lines[index]?.startsWith("Junc L&A=")) {
    const laParts = parseCommaSeparated(parseKeyValue(lines[index]).value)
    lengthAndAreas.push({
      length: parseFloat(laParts[0]),
      area: parseFloat(laParts[1]),
    })
    index++
  }

  const junctionData: JunctionProperties = {
    name: junctionName,
    description,
    coordinates,
    upstreamConnections,
    downstreamConnection,
    lengthAndAreas,
  }

  return { data: junctionData, nextIndex: index }
}
