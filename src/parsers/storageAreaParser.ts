import { parseKeyValue, parseCoordinates, parseVolumeElevation } from "../utils"
import type { StorageArea } from "../models/storageArea"

export function parseStorageAreaData(
  lines: string[],
  currentIndex: number,
  sa: StorageArea,
  isNewSection: (line: string) => boolean,
): number {
  let index = currentIndex
  let line = lines[index]

  while (line !== null && !isNewSection(line) && index < lines.length) {
    if (line.startsWith("Storage Area Surface Line=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (pointsCollected < numPoints && index < lines.length) {
        const surfLine = lines[index]
        if (
          !surfLine ||
          isNewSection(surfLine) ||
          /^[A-Za-z#]/.test(surfLine.trimStart())
        )
          break
        const newCoords = parseCoordinates(surfLine)
        sa.surfaceLine.push(...newCoords)
        pointsCollected += newCoords.length
        index++
        if (pointsCollected >= numPoints) break
      }
    } else if (line.startsWith("Storage Area Vol Elev=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (pointsCollected < numPoints && index < lines.length) {
        const volElevLine = lines[index]
        if (
          !volElevLine ||
          isNewSection(volElevLine) ||
          /^[A-Za-z#]/.test(volElevLine.trimStart())
        )
          break
        const newPoints = parseVolumeElevation(volElevLine)
        sa.volumeElevationData.push(...newPoints)
        pointsCollected += newPoints.length
        index++
        if (pointsCollected >= numPoints) break
      }
    } else if (line.startsWith("Storage Area Mannings=")) {
      sa.mannings = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else {
      index++
    }
    line = lines[index]
  }

  return index
}
