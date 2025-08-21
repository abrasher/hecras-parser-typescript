import { parseLineToCoordinates } from "../lineParsers"
import type { StorageArea } from "../../models/geometry/storageArea"
import { parseKeyValue } from "../atomic"
import { parseMaybeFloat } from "../../serializers/atomic"

/**
 * Parses storage area data starting from a "Storage Area=" line
 */
export function parseStorageAreaData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: StorageArea; nextIndex: number } {
  if (!line.startsWith("Storage Area=")) throw new Error(`storageAreaParser was given a line it can't parse: ${line}`)

  const { value } = parseKeyValue(line)

  // Storage Area=id,,, - extract the id from the comma-separated value
  const parts = value.split(",")
  const id = parts[0].trim()
  const centroidX = parseMaybeFloat(parts[1])
  const centroidY = parseMaybeFloat(parts[2])

  const storageAreaData = {
    id,
    centroidX,
    centroidY,
    surfaceLine: [],
    mannings: null,
    type: 0,
    area: null,
    minElevation: null,
    volumeElevationData: [],
    is2D: 0,
    pointGenerationData: null,
    points2D: [],
    pointsPerimeterTime: null,
    cellVolumeFilterTolerance: null,
    cellMinimumAreaFraction: null,
    faceProfileFilterTolerance: null,
    faceAreaElevationProfileFilterTolerance: null,
    faceAreaElevationConveyanceRatio: null,
    faceMinLengthRatio: null,
    faceAreaLaminarDepth: null,
    multipleFaceMannN: null,
    compositeLC: null,
    locked: null,
  } as StorageArea

  let index = currentIndex + 1

  const validKeys = [
    "Storage Area Surface Line",
    "Storage Area Type",
    "Storage Area Area",
    "Storage Area Min Elev",
    "Storage Area Is2D",
    "Storage Area Point Generation Data",
    "Storage Area 2D Points",
    "Storage Area 2D PointsPerimeterTime",
    "Storage Area Mannings",
    "2D Cell Volume Filter Tolerance",
    "2D Cell Minimum Area Fraction",
    "2D Face Profile Filter Tolerance",
    "2D Face Area Elevation Profile Filter Tolerance",
    "2D Face Area Elevation Conveyance Ratio",
    "2D Face Min Length Ratio",
    "2D Face Area Laminar Depth",
    "2D Multiple Face Mann n",
    "2D Composite LC",
    "2D Locked",
  ]

  const isValidLine = (line: string) => {
    return validKeys.some((key) => line?.startsWith(key))
  }

  // Parse all storage area properties
  while (index < lines.length && isValidLine(lines[index])) {
    const currentLine = lines[index]

    if (currentLine.startsWith("Storage Area Surface Line=")) {
      const { value: surfaceLineCount } = parseKeyValue(currentLine)
      const numberOfPoints = parseInt(surfaceLineCount.trim())

      // Surface line coordinates follow on subsequent lines
      const coordinateLines = numberOfPoints // 1 coordinate pair per line
      index++

      for (let i = 0; i < coordinateLines && index < lines.length; i++) {
        const coordLine = lines[index]
        const coordinates = parseLineToCoordinates(coordLine)
        storageAreaData.surfaceLine.push(...coordinates)
        index++
      }
      continue
    }

    if (currentLine.startsWith("Storage Area Type=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.type = parseInt(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Area=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.area = value.trim() ? parseFloat(value.trim()) : null
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Min Elev=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.minElevation = value.trim() ? parseFloat(value.trim()) : null
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Is2D=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.is2D = parseInt(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Point Generation Data=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.pointGenerationData = value.trim() || null
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area 2D Points=")) {
      const { value: pointCount } = parseKeyValue(currentLine)
      const numberOfPoints = parseInt(pointCount.trim())

      // 2D points follow on subsequent lines
      const coordinateLines = Math.ceil(numberOfPoints / 2) // 2 coordinates per line
      index++

      for (let i = 0; i < coordinateLines && index < lines.length; i++) {
        const coordLine = lines[index]
        const coordinates = parseLineToCoordinates(coordLine)
        storageAreaData.points2D.push(...coordinates)
        index++
      }
      continue
    }

    if (currentLine.startsWith("Storage Area 2D PointsPerimeterTime=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.pointsPerimeterTime = value.trim() || null
      index++
      continue
    }

    if (currentLine.startsWith("Storage Area Mannings=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.mannings = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Cell Volume Filter Tolerance=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.cellVolumeFilterTolerance = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Cell Minimum Area Fraction=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.cellMinimumAreaFraction = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Face Profile Filter Tolerance=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.faceProfileFilterTolerance = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Face Area Elevation Profile Filter Tolerance=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.faceAreaElevationProfileFilterTolerance = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Face Area Elevation Conveyance Ratio=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.faceAreaElevationConveyanceRatio = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Face Min Length Ratio=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.faceMinLengthRatio = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Face Area Laminar Depth=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.faceAreaLaminarDepth = parseFloat(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Multiple Face Mann n=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.multipleFaceMannN = parseInt(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Composite LC=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.compositeLC = parseInt(value.trim())
      index++
      continue
    }

    if (currentLine.startsWith("2D Locked=")) {
      const { value } = parseKeyValue(currentLine)
      storageAreaData.locked = parseInt(value.trim())
      index++
      continue
    }

    // If we reach here, we didn't match any known key
    break
  }

  return { data: storageAreaData, nextIndex: index }
}
