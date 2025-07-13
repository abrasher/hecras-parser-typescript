import type { HECRASGeometry } from "../../models/geometry/geometryHeaders"
import { formatKeyValue } from "../atomic"

/**
 * Serialize geometry header to array of lines
 * @param geometry HEC-RAS geometry object
 * @returns Array of formatted header lines
 */
export function serializeGeometryHeader(geometry: HECRASGeometry): string[] {
  const lines: string[] = []

  // Basic header fields
  lines.push(formatKeyValue("Geom Title", geometry.geomTitle))
  lines.push(formatKeyValue("Program Version", geometry.programVersion))

  // Format viewing rectangle - space separated with commas
  const rect = geometry.viewingRectangle
  const rectValues = [rect.left, rect.right, rect.top, rect.bottom]
  const formattedRect = rectValues
    .map((val) => {
      // Format numbers - remove unnecessary decimals for whole numbers
      return val % 1 === 0 ? val.toString() : val.toString()
    })
    .join(" , ")
  lines.push(`Viewing Rectangle= ${formattedRect} `)

  // Add description block if present
  if (geometry.description !== undefined && geometry.description !== null) {
    lines.push("") // Empty line before description
    lines.push("BEGIN GEOM DESCRIPTION:")

    if (geometry.description.trim() === "") {
      lines.push("") // Empty description gets empty line
    } else {
      // Split multiline descriptions
      const descLines = geometry.description.split("\n")
      lines.push(...descLines)
    }

    lines.push("END GEOM DESCRIPTION:")
  }

  return lines
}

/**
 * Serialize geometry header to string
 * @param geometry HEC-RAS geometry object
 * @returns Formatted header string with newlines
 */
export function serializeGeometryHeaderString(geometry: HECRASGeometry): string {
  return serializeGeometryHeader(geometry).join("\n")
}
