import { parseKeyValue, parseCoordinates } from "../utils"
import type { Reach } from "../models/reach"

export function parseReachData(
  lines: string[],
  currentIndex: number,
  reach: Reach,
  isNewSection: (line: string) => boolean,
): number {
  let index = currentIndex
  let line = lines[index]

  if (line?.startsWith("Reach XY=")) {
    const numPoints = parseInt(parseKeyValue(line)?.value || "0")
    index++
    let pointsCollected = 0
    while (pointsCollected < numPoints && index < lines.length) {
      const coordLine = lines[index]
      if (!coordLine || coordLine.trim() === "" || isNewSection(coordLine))
        break
      const newCoords = parseCoordinates(coordLine)
      reach.centerline.push(...newCoords)
      pointsCollected += newCoords.length
      index++
    }
  }

  line = lines[index]
  if (line?.startsWith("Rch Text X Y=")) {
    const coordsStr = parseKeyValue(line)?.value
    if (coordsStr) {
      const [x, y] = coordsStr.split(",").map(parseFloat)
      if (!isNaN(x) && !isNaN(y)) {
        reach.textPosition = { x, y }
      }
    }
    index++
  }

  return index
}
