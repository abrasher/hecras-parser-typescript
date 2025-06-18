import { parseKeyValue, parseCoordinates, parseStaElev } from "../utils"
import type { Connection } from "../models/connection"
import { ConnectionType, StructureType } from "../models/connection"
import type { CulvertData, CulvertBarrel } from "../models/common"
import { chunkStringToNumbers, numbersToCoordinates } from "../core"

function isConnectionNewSection(line: string): boolean {
  const keywords = [
    "River Reach=",
    "Type RM Length L Ch R =",
    "Storage Area=",
    "Connection=",
    "LCMann Time=",
    "Geom Raster=",
  ]
  return keywords.some((kw) => line.startsWith(kw))
}

export function parseConnectionData(
  lines: string[],
  currentIndex: number,
  conn: Connection,
  isNewSection: (line: string) => boolean,
): number {
  let index = currentIndex
  let line = lines[index]

  while (index < lines.length) {
    line = lines[index]

    // Stop if we hit a new section
    if (line && isConnectionNewSection(line)) {
      break
    }

    // Skip empty or null lines but continue parsing
    if (!line || line.trim() === "") {
      index++
      continue
    }

    // Basic info and metadata
    if (line.startsWith("Connection Desc=")) {
      conn.description = parseKeyValue(line)?.value || null
      index++
    } else if (line.startsWith("Connection Centerline Profile=")) {
      conn.centerlineProfile = parseInt(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Connection Last Edited Time=")) {
      conn.lastEditedTime = parseKeyValue(line)?.value || null
      index++
    } else if (line.startsWith("Conn CellSize Min=")) {
      conn.cellSizeMin = parseInt(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Near Repeats=")) {
      conn.nearRepeats = parseInt(parseKeyValue(line)?.value || "0")
      index++
    }

    // Connection line coordinates
    else if (line.startsWith("Connection Line=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (pointsCollected < numPoints && index < lines.length) {
        const connLine = lines[index]
        if (!connLine || isNewSection(connLine) || /^[A-Za-z#]/.test(connLine.trimStart())) break
        const newCoords = parseCoordinates(connLine)
        conn.line.push(...newCoords)
        pointsCollected += newCoords.length
        index++
        if (pointsCollected >= numPoints) break
      }
    }

    // Storage area connections
    else if (line.startsWith("Connection Up SA=")) {
      conn.upSA = parseKeyValue(line)?.value?.trim() || null
      index++
    } else if (line.startsWith("Connection Dn SA=")) {
      conn.dnSA = parseKeyValue(line)?.value?.trim() || null
      index++
    }

    // Routing settings
    else if (line.startsWith("Conn Routing Type=")) {
      conn.routingType = parseInt(parseKeyValue(line)?.value?.trim() || "0")

      // Detect bridge connections by routing type (32 = bridge, 1 = culvert)
      if (conn.routingType === 32) {
        conn.connectionType = ConnectionType.SA_2D
        conn.structureType = StructureType.WEIR // Bridges are typically just weirs
      }

      index++
    } else if (line.startsWith("Conn Use RC Family=")) {
      const value = parseKeyValue(line)?.value?.trim().toLowerCase()
      conn.useRCFamily = value === "true"
      index++
    } else if (line.startsWith("Conn OverFlow Method 2D=")) {
      const value = parseKeyValue(line)?.value?.trim().toLowerCase()
      conn.overflowMethod2D = value === "true"
      index++
    }

    // Basic weir properties
    else if (line.startsWith("Conn Weir WD=")) {
      conn.weirWidth = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Weir Coef=")) {
      conn.weirCoefficient = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Weir Is Ogee=")) {
      conn.weirIsOgee = parseInt(parseKeyValue(line)?.value?.trim() || "0")
      index++
    } else if (line.startsWith("Conn Simple Spill Pos Coef=")) {
      conn.simpleSpillPosCoef = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Simple Spill Neg Coef=")) {
      conn.simpleSpillNegCoef = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Weir SE=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (pointsCollected < numPoints && index < lines.length) {
        const seLine = lines[index]
        if (!seLine || isNewSection(seLine) || /^[A-Za-z#]/.test(seLine.trimStart())) break
        const newPoints = parseStaElev(seLine)
        conn.weirStationElevation.push(...newPoints)
        pointsCollected += newPoints.length
        index++
        if (pointsCollected >= numPoints) break
      }
    }

    // Advanced weir properties
    else if (line.startsWith("Conn Weir Design EG=")) {
      conn.weirDesignEG = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn Weir Design HT=")) {
      conn.weirDesignHT = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    } else if (line.startsWith("Conn HTab HWMax=")) {
      conn.hTabHWMax = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    }

    // Culvert data parsing
    else if (line.startsWith("Connection Culv=")) {
      const culvertData = parseCulvertData(line, lines, index)
      if (culvertData.data) {
        conn.culvertData = culvertData.data
        // Set connection and structure types for culverts
        conn.connectionType = ConnectionType.SA_2D
        conn.structureType = StructureType.WEIR_AND_CULVERTS
      }
      index = culvertData.nextIndex
    } else if (line.startsWith("Conn Culvert Barrel=")) {
      const barrelData = parseCulvertBarrel(line, lines, index)
      if (barrelData.barrel) {
        conn.culvertBarrels.push(barrelData.barrel)
      }
      index = barrelData.nextIndex
    } else if (line.startsWith("Conn Culv Bottom n=")) {
      conn.culvertBottomN = parseFloat(parseKeyValue(line)?.value || "0")
      index++
    }

    // Outlet rating curve parsing
    else if (line.startsWith("Conn Outlet Rating Curve=")) {
      const ratingValue = parseKeyValue(line)?.value || ""
      const parts = ratingValue.split(",")
      conn.outletRatingCurve = {
        flag: parseInt(parts[0]?.trim() || "0"),
        isActive: parts[1]?.trim().toLowerCase() === "true",
        value1: parts[2]?.trim() || "",
        value2: parts[3]?.trim() || "",
      }
      index++
    } else {
      index++
    }
  }

  // Update barrel count to match actual number of barrels parsed
  if (conn.culvertData && conn.culvertBarrels.length > 0) {
    conn.culvertData.barrelCount = conn.culvertBarrels.length
  }

  return index
}

/**
 * Parses culvert data from a "Connection Culv=" line
 * Format: Connection Culv=barrelCount,width,height,length,roughness,entranceLoss,shape,inlet,outlet,upstreamInvert,downstreamInvert,ratingFlag,description,unknownFlag,
 * Next line contains additional coordinates
 */
function parseCulvertData(
  line: string,
  lines: string[],
  currentIndex: number,
): { data: CulvertData | null; nextIndex: number } {
  const keyValue = parseKeyValue(line)
  if (!keyValue?.value) {
    return { data: null, nextIndex: currentIndex + 1 }
  }

  const parts = keyValue.value.split(",")
  if (parts.length < 14) {
    return { data: null, nextIndex: currentIndex + 1 }
  }

  let index = currentIndex + 1

  // Parse coordinates from the next line if it exists and contains numeric data
  let coordinates: number[] = []
  if (index < lines.length) {
    const nextLine = lines[index]?.trim()
    if (nextLine && /^\s*[\d.-]+/.test(nextLine)) {
      // This line contains coordinate data
      const coordParts = nextLine.split(/\s+/).filter((part) => part.trim())
      coordinates = coordParts.map((part) => parseFloat(part)).filter((num) => !isNaN(num))
      index++
    }
  }

  const culvertData: CulvertData = {
    barrelCount: parseInt(parts[0]?.trim() || "0"),
    diameter: parseFloat(parts[1]?.trim() || "0"),
    height: parseFloat(parts[2]?.trim() || "0"),
    length: parseFloat(parts[3]?.trim() || "0"),
    roughness: parseFloat(parts[4]?.trim() || "0"),
    entranceLoss: parseFloat(parts[5]?.trim() || "0"),
    exitLoss: parseFloat(parts[6]?.trim() || "0"),
    shape: parseInt(parts[7]?.trim() || "0"),
    inlet: parseInt(parts[8]?.trim() || "0"),
    upstreamInvert: parseFloat(parts[9]?.trim() || "0"),
    downstreamInvert: parseFloat(parts[10]?.trim() || "0"),
    ratingFlag: parseInt(parts[11]?.trim() || "0"),
    description: parts[12]?.trim() || "",
    unknownFlag: parseInt(parts[13]?.trim() || "0"),
    coordinates,
  }

  return { data: culvertData, nextIndex: index }
}

/**
 * Parses culvert barrel data from a "Conn Culvert Barrel=" line
 * Format: Conn Culvert Barrel=id,description,pointCount
 * Followed by coordinate pairs
 */
function parseCulvertBarrel(
  line: string,
  lines: string[],
  currentIndex: number,
): { barrel: CulvertBarrel | null; nextIndex: number } {
  const keyValue = parseKeyValue(line)
  if (!keyValue?.value) {
    return { barrel: null, nextIndex: currentIndex + 1 }
  }

  const parts = keyValue.value.split(",")
  if (parts.length < 3) {
    return { barrel: null, nextIndex: currentIndex + 1 }
  }

  const id = parseInt(parts[0]?.trim() || "0")
  const description = parts[1]?.trim() || ""
  const pointCount = parseInt(parts[2]?.trim() || "0")

  let index = currentIndex + 1
  const coordinates: { x: number; y: number }[] = []

  // Parse coordinate pairs from the next line(s)
  let pointsCollected = 0
  while (pointsCollected < pointCount && index < lines.length) {
    const coordLine = lines[index]?.trim()
    if (!coordLine || /^[A-Za-z#]/.test(coordLine)) {
      break
    }

    // Use custom parsing for barrel coordinates due to run-together formatting
    const newCoords = numbersToCoordinates(chunkStringToNumbers(coordLine, 16))
    coordinates.push(...newCoords)
    pointsCollected += newCoords.length
    index++

    if (pointsCollected >= pointCount) break
  }

  const barrel: CulvertBarrel = {
    id,
    description,
    pointCount,
    coordinates,
  }

  return { barrel, nextIndex: index }
}
