// Top-level geometry parser entry point (Tier 4)

import { HECRASGeometry } from "./models/geometry/geometryHeaders"
import { parseHeader } from "./parsers/headerParser"
import { parseStorageArea } from "./parsers/storageAreaParser"
import { parseGISInfo } from "./parsers/gisParser"

/**
 * Parse a complete HEC-RAS geometry file (.g01, .g02, etc.)
 * @param content The raw file content as a string
 * @returns Parsed HECRASGeometry object
 * @throws Error if parsing fails
 */
export function parseGeometry(content: string): HECRASGeometry {
  const lines = content.split(/\r\n|\r|\n/)
  const geometry = new HECRASGeometry()

  let index = 0

  try {
    // Parse header (title, version, viewing rectangle, description)
    const headerResult = parseHeader(lines, index)
    geometry["Geom Title"] = headerResult.data["Geom Title"]
    geometry["Program Version"] = headerResult.data["Program Version"]
    geometry["Viewing Rectangle"] = headerResult.data["Viewing Rectangle"]
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
        const result = parseStorageArea(line, lines, index)
        geometry.storageAreas.push(result.data)
        index = result.nextIndex
      }
      // Parse connections
      else if (line.startsWith("Connection=")) {
        const result = parseConnection(line, lines, index)
        geometry.connections.push(result.data)
        index = result.nextIndex
      }
      // Parse GIS information
      else if (line.startsWith("GIS") || line.startsWith("Geom Raster")) {
        const result = parseGISInfo(lines, index)
        geometry.gisInfo = result.data
        index = result.nextIndex
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

/**
 * Parse multiple storage areas from consecutive lines
 * @param lines All lines in the file
 * @param startIndex Starting index
 * @returns Array of storage areas and next index
 */
export function parseAllStorageAreas(lines: string[], startIndex: number): { data: StorageArea[]; nextIndex: number } {
  const storageAreas: StorageArea[] = []
  let index = startIndex

  while (index < lines.length && lines[index]?.startsWith("Storage Area=")) {
    const result = parseStorageArea(lines[index], lines, index)
    storageAreas.push(result.data)
    index = result.nextIndex
  }

  return { data: storageAreas, nextIndex: index }
}

/**
 * Parse multiple connections from consecutive lines
 * @param lines All lines in the file
 * @param startIndex Starting index
 * @returns Array of connections and next index
 */
export function parseAllConnections(lines: string[], startIndex: number): { data: Connection[]; nextIndex: number } {
  const connections: Connection[] = []
  let index = startIndex

  while (index < lines.length && lines[index]?.startsWith("Connection=")) {
    const result = parseConnection(lines[index], lines, index)
    connections.push(result.data)
    index = result.nextIndex
  }

  return { data: connections, nextIndex: index }
}
