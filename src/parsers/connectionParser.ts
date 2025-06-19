import { parseKeyValue, parseCoordinates, parseStaElev } from "../utils"
import type { Connection } from "../models/connection"
import { ConnectionType, StructureType } from "../models/connection"
import type { CulvertData, CulvertBarrel } from "../models/common"
import { parseCulvertGroup } from "./culvertParser"

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

function culvertKeywords = [
  "Conn Culv Bottom n"
]

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
      const culvertData = parseCulvertGroup(line, lines, index)

      index = culvertData.nextData
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

// for future reference
// eslint-disable-next-line unused-imports/no-unused-vars
const CULVERT_SHAPE = {
  CIRCLE: 1,
  BOX: 2,
  PIPE_ARCH: 3,
  ARCH: 4,
  SEMI_CIRCLE: 5,
  LOW_ARCH: 6,
  HIGH_ARCH: 7,
  CONSPAN_ARCH: 8,
}

