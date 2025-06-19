import type { Position } from "geojson"
import type { Coordinate, ManningSegment, StationElevationPoint, VolumeElevationPoint } from "./models/common"
import proj4 from "proj4"

export function coordinatesToGeoJSONPoints(coordinates: Coordinate[]): Position[] {
  const fromProj = `PROJCS["NAD_1983_StatePlane_Indiana_East_FIPS_1301_Feet",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",328083.3333333333],PARAMETER["False_Northing",820208.3333333333],PARAMETER["Central_Meridian",-85.66666666666667],PARAMETER["Scale_Factor",0.9999666666666667],PARAMETER["Latitude_Of_Origin",37.5],UNIT["Foot_US",0.3048006096012192]]`

  return coordinates.map((coord) => proj4(fromProj, "EPSG:4326", [coord.x, coord.y]))
}

// utils.ts
export function parseCoordinates(line: string): Coordinate[] {
  const coords: Coordinate[] = []

  const numbers: number[] = []

  // Chunk by 16 characters, trim each chunk, and parse as float
  for (let i = 0; i < line.length; i += 16) {
    const chunk = line.substring(i, i + 16).trim()
    if (chunk) {
      const num = parseFloat(chunk)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }
  }

  // Pair up numbers as x,y coordinates
  for (let i = 0; i < numbers.length; i += 2) {
    if (i + 1 < numbers.length) {
      coords.push({ x: numbers[i], y: numbers[i + 1] })
    }
  }

  return coords
}

export function parseStaElev(line: string): StationElevationPoint[] {
  const parts = line.trim().split(/\s+/).map(parseFloat)
  const staElevs: StationElevationPoint[] = []
  for (let i = 0; i < parts.length; i += 2) {
    if (!isNaN(parts[i]) && !isNaN(parts[i + 1])) {
      staElevs.push({ station: parts[i], elevation: parts[i + 1] })
    }
  }
  return staElevs
}

export function parseVolumeElevation(line: string): VolumeElevationPoint[] {
  const parts = line.trim().split(/\s+/).map(parseFloat)
  const volElevs: VolumeElevationPoint[] = []
  for (let i = 0; i < parts.length; i += 2) {
    if (!isNaN(parts[i]) && !isNaN(parts[i + 1])) {
      // HEC-RAS often lists Elev, Volume - ensure correct order if needed
      volElevs.push({ elevation: parts[i], volume: parts[i + 1] })
    }
  }
  return volElevs
}

export function parseLineToNumbers(line: string): number[] {
  return line
    .trim()
    .split(/\s+/)
    .map(parseFloat)
    .filter((n) => !isNaN(n))
}

export function parseCommaSeparated(line: string): string[] {
  return line.split(",").map((s) => s.trim())
}

export function parseKeyValue(line: string, separator: string = "="): { key: string; value: string } {
  const parts = line.split(separator)
  if (parts.length >= 2) {
    return {
      key: parts[0].trim(),
      value: parts.slice(1).join(separator).trim(),
    }
  }
  throw new Error(`Error parsing line ${line}`)
}

// utils.ts (or a new formatter.ts)

// ... (existing utils)

export function formatNumber(value: number | null | undefined, precision: number, defaultIfNull: string = ""): string {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultIfNull
  }
  return value.toFixed(precision)
}

export function formatCoordinatesToString(
  coords: Coordinate[],
  itemsPerLine: number = 2,
  coordPrecision: number = 2,
): string[] {
  const lines: string[] = []
  let currentLine = ""
  for (let i = 0; i < coords.length; i++) {
    const coord = coords[i]
    const xStr = formatNumber(coord.x, coordPrecision).padStart(coordPrecision === 2 ? 17 : 18, " ") // Adjust padding
    const yStr = formatNumber(coord.y, coordPrecision).padStart(coordPrecision === 2 ? 17 : 18, " ")
    currentLine += xStr + yStr
    if ((i + 1) % itemsPerLine === 0 || i === coords.length - 1) {
      lines.push(currentLine.trimEnd())
      currentLine = ""
    }
  }
  return lines
}

export function formatStaElevToString(
  points: StationElevationPoint[],
  itemsPerLine: number = 5,
  precision: number = 2,
): string[] {
  const lines: string[] = []
  let currentLine = ""
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    // HEC-RAS often uses ~8 characters for station and ~7 for elevation, adjust as needed
    const staStr = formatNumber(point.station, precision).padStart(8, " ")
    const elevStr = formatNumber(point.elevation, precision).padStart(7, " ")
    currentLine += staStr + elevStr
    if ((i + 1) % itemsPerLine === 0 || i === points.length - 1) {
      lines.push(currentLine.trimEnd())
      currentLine = ""
    }
  }
  return lines
}

export function formatVolumeElevationToString(
  points: VolumeElevationPoint[],
  itemsPerLine: number = 5,
  precision: number = 2,
): string[] {
  const lines: string[] = []
  let currentLine = ""
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const elevStr = formatNumber(point.elevation, precision).padStart(8, " ")
    const volStr = formatNumber(point.volume, precision).padStart(7, " ") // Adjust padding as needed
    currentLine += elevStr + volStr
    if ((i + 1) % itemsPerLine === 0 || i === points.length - 1) {
      lines.push(currentLine.trimEnd())
      currentLine = ""
    }
  }
  return lines
}

export function formatManningSegmentsToString(segments: ManningSegment[], precision: number = 2): string[] {
  const lines: string[] = []
  let currentLine = ""
  const itemsPerLine = 3 // Each segment is 3 values (dummy, station, nVal) in one "logical" segment
  let countInLine = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    // HEC-RAS format: 0 station nVal (0 is a dummy value)
    const dummyStr = "       0" // 7 spaces + 0
    const staStr = formatNumber(seg.station, precision).padStart(8, " ")
    const nValStr = formatNumber(seg.nValue, precision === 2 ? 3 : precision + 1).padStart(precision === 2 ? 8 : 9, " ") // .07 needs 3 for nVal

    currentLine += `${dummyStr}${staStr}${nValStr}`
    countInLine++

    if (countInLine === itemsPerLine || i === segments.length - 1) {
      lines.push(currentLine.trimEnd())
      currentLine = ""
      countInLine = 0
    }
  }
  if (currentLine.trim() !== "") {
    // Catch any remaining part
    lines.push(currentLine.trimEnd())
  }
  return lines
}
