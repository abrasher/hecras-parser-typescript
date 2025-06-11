import { parseKeyValue } from "../utils"
import type { HECRASGeometry } from "../models/geometry"

export function parseGisInfo(
  lines: string[],
  currentIndex: number,
  geometry: HECRASGeometry
): number {
  let index = currentIndex
  let line = lines[index]
  
  while (line !== null && index < lines.length) {
    const kv = parseKeyValue(line)
    if (kv) {
      switch (kv.key) {
        case "Geom Raster":
          geometry.gisInfo.rasterPath = kv.value.split(",")[0]
          break
        case "GIS Units":
          geometry.gisInfo.units = kv.value
          break
        case "GIS DTM Type":
          geometry.gisInfo.dtmType = kv.value
          break
        case "GIS DTM":
          geometry.gisInfo.dtmPath = kv.value
          break
        case "GIS Stream Layer":
          geometry.gisInfo.streamLayer = kv.value
          break
        case "GIS Cross Section Layer":
          geometry.gisInfo.xsCutLineLayer = kv.value
          break
        case "GIS Map Projection":
          geometry.gisInfo.projection = kv.value
          break
        case "GIS Datum":
          geometry.gisInfo.datum = kv.value
          break
        default:
          if (kv.key.startsWith("GIS")) {
            geometry.gisInfo[kv.key] = kv.value
          }
          break
      }
    }
    index++
    line = lines[index]
    if (
      line === null ||
      line.trim() === "" ||
      (!kv?.key.startsWith("GIS") && !kv?.key.startsWith("Geom Raster"))
    ) {
      break
    }
  }
  
  return index
}
