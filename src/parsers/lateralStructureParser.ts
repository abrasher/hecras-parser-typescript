import { parseKeyValue, parseStaElev } from "../utils"
import type { LateralStructure } from "../models/lateralStructure"

export function parseLateralStructureData(
  lines: string[],
  currentIndex: number,
  ls: LateralStructure,
  isNewSection: (line: string) => boolean
): number {
  let index = currentIndex
  let line = lines[index]
  
  while (line !== null && !isNewSection(line) && index < lines.length) {
    if (line.startsWith("Lateral Weir WD=")) {
      ls.weirWidth = parseFloat(parseKeyValue(line)?.value || "0")
    } else if (line.startsWith("Lateral Weir Coef=")) {
      ls.weirCoefficient = parseFloat(parseKeyValue(line)?.value || "0")
    } else if (line.startsWith("Lateral Weir SE=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (
        pointsCollected < numPoints &&
        index < lines.length
      ) {
        const seLine = lines[index]
        if (
          !seLine ||
          isNewSection(seLine) ||
          /^[A-Za-z#]/.test(seLine.trimStart())
        )
          break
        const newPoints = parseStaElev(seLine)
        ls.stationElevationData.push(...newPoints)
        pointsCollected += newPoints.length
        index++
        if (pointsCollected >= numPoints) break
      }
    } else if (line.startsWith("Lateral Weir HW RS Station=")) {
      const parts = parseKeyValue(line)?.value.split(",")
      if (parts && parts[0]) ls.associatedRiverStation = parts[0].trim()
    }
    
    index++
    line = lines[index]
  }
  
  return index
}
