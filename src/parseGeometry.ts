// Top-level geometry parser entry point (Tier 4)

import type { HECRASGeometry } from "./models/geometry/geometryHeaders"
import { parseHeader } from "./parsers/geometry/headerParser"
import { parseStorageAreaData } from "./parsers/geometry/storageAreaParser"
import { parseConnectionData } from "./parsers/geometry/connectionParser"
import { parseBoundaryConditionData } from "./parsers/geometry/boundaryConditionParser"
import { parseBreakLine } from "./parsers/geometry/breakLineParser"
import { parseJunctionData } from "./parsers/geometry/junctionParser"
import { parseICPointsSection } from "./parsers/geometry/icPointParser"
import { parseLandCoverData } from "./parsers/geometry/landCoverParser"
import type { LandCover } from "./models/geometry/landCover"
import { parseRiverReachData } from "./parsers/geometry/riverReachParser"

/**
 * Parse a complete HEC-RAS geometry file (.g01, .g02, etc.)
 * @param content The raw file content as a string
 * @returns Parsed HECRASGeometry object
 * @throws Error if parsing fails
 */
export function parseGeometry(content: string): HECRASGeometry {
  const lines = content.split(/\r\n|\r|\n/)
  const geometry = {
    geomTitle: "",
    programVersion: "",
    viewingRectangle: { left: 0, right: 0, top: 0, bottom: 0 },
    storageAreas: [],
    connections: [],
    boundaryConditions: [],
    riverReaches: [],
    breakLines: [],
    junctions: [],
    landCover: {
      lastEdited: "",
      lastEditedRegion: "",
      table: [],
      regions: [],
    },
  } as HECRASGeometry

  let index = 0

  try {
    // Parse header (title, version, viewing rectangle, description)
    const headerResult = parseHeader(lines, index)
    geometry.geomTitle = headerResult.data.geomTitle
    geometry.programVersion = headerResult.data.programVersion
    geometry.viewingRectangle = headerResult.data.viewingRectangle
    if (headerResult.data.description) {
      geometry.description = headerResult.data.description
    }
    index = headerResult.nextIndex

    // Parse main content sections
    while (index < lines.length) {
      const line = lines[index]

      // Skip empty lines
      if (!line || line.trim() === "") {
        index++
        continue
      }

      // Parse storage areas
      if (line.startsWith("Storage Area=")) {
        const result = parseStorageAreaData(line, lines, index)
        geometry.storageAreas.push(result.data)
        index = result.nextIndex
      }
      // Parse connections
      else if (line.startsWith("Connection=")) {
        const result = parseConnectionData(line, lines, index)
        geometry.connections.push(result.data)
        index = result.nextIndex
      }
      // Parse boundary conditions
      else if (line.startsWith("BC Line Name=")) {
        const result = parseBoundaryConditionData(line, lines, index)
        geometry.boundaryConditions.push(result.data)
        index = index + result.linesConsumed
      }
      // Parse river reaches - not implemented yet
      else if (line.startsWith("River Reach=")) {
        const result = parseRiverReachData(lines, index)
        geometry.riverReaches.push(result.data)
        index = index + result.linesConsumed
      }
      // Parse break lines
      else if (line.startsWith("BreakLine Name=")) {
        const result = parseBreakLine(lines, index)
        geometry.breakLines.push(result.data)
        index = index + result.linesConsumed
      }
      // Parse junctions
      else if (line.startsWith("Junct Name=")) {
        const result = parseJunctionData(line, lines, index)
        geometry.junctions.push(result.data)
        index = result.nextIndex
      } else if (line.startsWith("IC Point Name=")) {
        const { data, nextIndex } = parseICPointsSection(lines, index)
        geometry.icPoints = data
        index = nextIndex
      }
      // Parse global settings (appear at end of file)
      else if (line.startsWith("LCMann Time=")) {
        const { data, nextIndex } = parseLandCoverData(lines, index)
        geometry.landCover = data
        index = nextIndex
      } else if (line.startsWith("Chan Stop Cuts=")) {
        geometry.chanStopCuts = parseInt(line.split("=")[1])
        index++
      } else if (line.startsWith("Use User Specified Reach Order=")) {
        geometry.useUserSpecifiedReachOrder = parseInt(line.split("=")[1])
        index++
      } else if (line.startsWith("GIS Ratio Cuts To Invert=")) {
        geometry.gisRatioCutsToInvert = parseInt(line.split("=")[1])
        index++
      } else if (line.startsWith("GIS Limit At Bridges=")) {
        geometry.gisLimitAtBridges = parseInt(line.split("=")[1])
        index++
      } else if (line.startsWith("Composite Channel Slope=")) {
        geometry.compositeChannelSlope = parseInt(line.split("=")[1])
        index++
      }
      // Skip unrecognized sections for now
      else {
        index++
      }
    }

    return geometry
  } catch (error) {
    throw new Error(
      `Failed to parse geometry file at line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
