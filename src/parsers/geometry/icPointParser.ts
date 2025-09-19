import type { ICPoint } from "../../models/geometry/icPoint"
import { parseValueAsCSV } from "../atomic"
import { parseKeyValue } from "../utils"

export function parseICPointsSection(
  lines: string[],
  currentIndex: number,
): { data: ICPoint[]; nextIndex: number } {
  let index = currentIndex
  const icPoints: ICPoint[] = []

  while (lines[index].startsWith("IC Point Name=")) {
    const line = lines[index]
    if (!line.startsWith("IC Point Name=")) {
      throw new Error(`icPointParser was given a line it can't parse: ${line}`)
    }
    const name = parseKeyValue(line).value.trim()
    index++

    const [x, y] = parseValueAsCSV(lines[index]).map(Number)
    index++

    icPoints.push({ name, coordinate: [x, y] })
  }

  return { data: icPoints, nextIndex: index }
}
