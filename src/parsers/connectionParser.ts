import { parseKeyValue, parseCoordinates, parseStaElev } from "../utils"
import type { Connection } from "../models/connection"

export function parseConnectionData(
  lines: string[],
  currentIndex: number,
  conn: Connection,
  isNewSection: (line: string) => boolean
): number {
  let index = currentIndex
  let line = lines[index]
  
  while (line !== null && !isNewSection(line) && index < lines.length) {
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
      while (
        pointsCollected < numPoints &&
        index < lines.length
      ) {
        const connLine = lines[index]
        if (
          !connLine ||
          isNewSection(connLine) ||
          /^[A-Za-z#]/.test(connLine.trimStart())
        )
          break
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
    
    else {
      index++
    }
    line = lines[index]
  }
  
  return index
}
