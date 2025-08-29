import { chunk } from "es-toolkit"
import type { LandCover } from "../../models/geometry/landCover"
import { formatFixedWidth } from "../atomic"

export function serializeLandCover(lc: LandCover): string[] {
  const lines = []

  lines.push(`LCMann Time=${lc.lastEdited}`)
  lines.push(`LCMann Region Time=${lc.lastEditedRegion}`)

  lines.push(`LCMann Table=${lc.table.length}`)
  lc.table.forEach((row) => {
    lines.push(row.join(","))
  })

  lc.regions.forEach((region) => {
    lines.push(`LCMann Region Name=${region.name}`)
    lines.push(`LCMann Region Table=${region.table.length}`)
    region.table.forEach((row) => {
      lines.push(row.join(","))
    })
    lines.push(`LCMann Region Polygon=${region.polygon.length}`)

    const regionStrings = chunk(
      region.polygon.map(([x, y]) => `${formatFixedWidth(x, 16)}${formatFixedWidth(y, 16)}`),
      2,
    ).map((pair) => pair.join(""))
    lines.push(...regionStrings)
  })

  return lines
}

/**
 * array is [x: number, y: number][]
 * i need to format into
 * fixedWidthX1fixedWidthY1fixedWidthX2fixedWidthY2\nfixedWidthX3fixedWidthY3fixedWidthX4fixedWidthY4\n
 */
