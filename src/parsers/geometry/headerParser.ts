import type { ViewingRectangle } from "../../models/geometry/geometryHeaders"
import { parseKeyValue } from "../atomic"

export interface HeaderData {
  geomTitle: string
  programVersion: string
  viewingRectangle: ViewingRectangle
  description: string
}

export interface HeaderParseResult {
  data: HeaderData
  nextIndex: number
}

export function parseHeader(lines: string[], startIndex: number): HeaderParseResult {
  const data: HeaderData = {} as HeaderData
  let index = startIndex

  while (index < lines.length) {
    const line = lines[index]

    // Skip empty lines
    if (!line || line.trim() === "") {
      index++
      continue
    }

    // Check for header fields
    if (line.startsWith("Geom Title=")) {
      data.geomTitle = parseKeyValue(line).value
      index++
    } else if (line.startsWith("Program Version=")) {
      const kv = parseKeyValue(line)
      data.programVersion = kv.value
      index++
    } else if (line.startsWith("Viewing Rectangle=")) {
      data.viewingRectangle = parseViewingRectangle(line)
      index++
    } else if (line.startsWith("BEGIN GEOM DESCRIPTION:")) {
      const descResult = parseDescription(lines, index)
      data.description = descResult.description
      index = descResult.nextIndex
    } else {
      // Stop parsing at first non-header line
      break
    }
  }

  return { data, nextIndex: index }
}

function parseViewingRectangle(line: string): ViewingRectangle {
  const valueStr = line.substring(line.indexOf("=") + 1).trim()
  const values = valueStr.split(",").map((v) => parseFloat(v.trim()))

  return {
    left: values[0],
    right: values[1],
    top: values[2],
    bottom: values[3],
  }
}

function parseDescription(
  lines: string[],
  startIndex: number,
): { description: string; nextIndex: number } {
  let index = startIndex + 1 // Skip "BEGIN GEOM DESCRIPTION:" line
  const descriptionLines: string[] = []

  while (index < lines.length) {
    const line = lines[index]

    if (line.startsWith("END GEOM DESCRIPTION:")) {
      index++ // Skip "END GEOM DESCRIPTION:" line
      break
    }

    descriptionLines.push(line)
    index++
  }

  return {
    description: descriptionLines.join("\n"),
    nextIndex: index,
  }
}
