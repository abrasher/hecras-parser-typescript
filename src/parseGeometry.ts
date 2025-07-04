// Top-level geometry parser entry point (Tier 4)

import type { HECRASGeometry } from "./models/geometry/geometryHeaders"
import { parseHeader } from "./parsers/geometry/headerParser"

/**
 * Parse a complete HEC-RAS geometry file (.g01, .g02, etc.)
 * @param content The raw file content as a string
 * @returns Parsed HECRASGeometry object
 * @throws Error if parsing fails
 */
export function parseGeometry(content: string): HECRASGeometry {
  const lines = content.split(/\r\n|\r|\n/)
  const geometry = {} as HECRASGeometry

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

    // // Parse main content sections
    // while (index < lines.length) {
    //   const line = lines[index]

    //   // Skip empty lines
    //   if (!line || line.trim() === "") {
    //     index++
    //     continue
    //   }

    //   // Parse storage areas
    //   if (line.startsWith("Storage Area=")) {
    //     const result = parseStorageArea(line, lines, index)
    //     geometry.storageAreas.push(result.data)
    //     index = result.nextIndex
    //   }
    //   // Parse connections
    //   else if (line.startsWith("Connection=")) {
    //     const result = parseConnection(line, lines, index)
    //     geometry.connections.push(result.data)
    //     index = result.nextIndex
    //   }
    //   // Parse GIS information
    //   else if (line.startsWith("GIS") || line.startsWith("Geom Raster")) {
    //     const result = parseGISInfo(lines, index)
    //     geometry.gisInfo = result.data
    //     index = result.nextIndex
    //   }
    //   // Skip unrecognized sections for now
    //   else {
    //     index++
    //   }
    // }

    return geometry
  } catch (error) {
    throw new Error(
      `Failed to parse geometry file at line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
