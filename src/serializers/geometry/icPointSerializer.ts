import type { ICPoint } from "../../models/geometry/icPoint"
import { formatFixedWidth } from "../atomic"
import { formatHECRASCoordinateNumber } from "../utils"

export function serializeICPoints(points: ICPoint[] | undefined): string[] {
  const lines: string[] = []
  points?.forEach((point) => {
    lines.push(`IC Point Name=${formatFixedWidth(point.name, 32, " ", "end")}`)
    lines.push(
      `IC Point Position=${formatHECRASCoordinateNumber(point.coordinate[0])},${formatHECRASCoordinateNumber(point.coordinate[1])}`,
    )
  })
  return lines
}
