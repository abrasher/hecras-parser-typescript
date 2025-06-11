import { parseKeyValue } from "../utils"
import type { HECRASGeometry, ViewingRectangle } from "../models/geometry"

export function parseHeader(
  lines: string[],
  currentIndex: number,
  geometry: HECRASGeometry
): number {
  let index = currentIndex
  let line = lines[index]
  
  while (line !== null && index < lines.length) {
    if (line.startsWith("Geom Title=")) {
      geometry["Geom Title"] = parseKeyValue(line)?.value || null
    } else if (line.startsWith("Program Version=")) {
      geometry["Program Version"] = parseKeyValue(line)?.value || null
    } else if (line.startsWith("Viewing Rectangle=")) {
      const values = parseKeyValue(line)?.value.split(",").map(parseFloat)
      if (values && values.length === 4) {
        geometry["Viewing Rectangle"] = {
          left: values[0],
          right: values[1],
          top: values[2],
          bottom: values[3],
        }
      }
    } else if (line.startsWith("River Reach=") ||
               line.startsWith("Storage Area=") ||
               line.startsWith("Connection=")) {
      break // End of header
    }
    index++
    line = lines[index]
  }
  
  return index
}
