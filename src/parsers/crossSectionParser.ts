import { 
  parseKeyValue, 
  parseCoordinates, 
  parseStaElev, 
  parseCommaSeparated, 
  parseLineToNumbers 
} from "../utils"
import type { CrossSection } from "../models/crossSection"
import { IneffectiveFlowArea } from "../models/ineffectiveFlowArea"

export function parseCrossSectionData(
  lines: string[],
  currentIndex: number,
  xs: CrossSection,
  isNewSection: (line: string) => boolean
): number {
  let index = currentIndex
  let line = lines[index]
  
  while (line !== null && !isNewSection(line) && index < lines.length) {
    if (line.startsWith("XS GIS Cut Line=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (
        pointsCollected < numPoints &&
        index < lines.length
      ) {
        const gisLine = lines[index]
        if (!gisLine || isNewSection(gisLine)) break
        const newCoords = parseCoordinates(gisLine)
        xs.gisCutLine.push(...newCoords)
        pointsCollected += newCoords.length
        index++
        if (pointsCollected >= numPoints) break
      }
    } else if (line.startsWith("Node Last Edited Time=")) {
      xs.lastEditedTime = parseKeyValue(line)?.value || null
      index++
    } else if (line.startsWith("#Sta/Elev=")) {
      const numPoints = parseInt(parseKeyValue(line)?.value || "0")
      index++
      let pointsCollected = 0
      while (
        pointsCollected < numPoints &&
        index < lines.length
      ) {
        const staElevLine = lines[index]
        if (
          !staElevLine ||
          isNewSection(staElevLine) ||
          /^[A-Za-z#]/.test(staElevLine.trimStart())
        )
          break
        const newPoints = parseStaElev(staElevLine)
        xs.staElevData.push(...newPoints)
        pointsCollected += newPoints.length
        index++
        if (pointsCollected >= numPoints) break
      }
    } else if (line.startsWith("#Mann=")) {
      const parts = parseCommaSeparated(parseKeyValue(line)?.value || "")
      const numSegments = parseInt(parts[0] || "0")
      index++
      for (
        let k = 0;
        k < numSegments && index < lines.length;
      ) {
        const manningLine = lines[index]
        if (
          !manningLine ||
          isNewSection(manningLine) ||
          /^[A-Za-z#]/.test(manningLine.trimStart())
        )
          break
        const values = parseLineToNumbers(manningLine)
        for (let j = 0; j < values.length; j += 3) {
          if (j + 2 < values.length) {
            xs.manningSegments.push({
              station: values[j],
              nValue: values[j + 1],
              unknownParameter: values[j + 2],
            })
            k++
          }
        }
        index++
      }
    } else if (line.startsWith("Bank Sta=")) {
      const [left, right] = (parseKeyValue(line)?.value || "")
        .split(",")
        .map(parseFloat)
      xs.bankStations = {
        left: isNaN(left) ? null : left,
        right: isNaN(right) ? null : right,
      }
      index++
    } else if (line.startsWith("Exp/Cntr=")) {
      const [exp, cntr] = (parseKeyValue(line)?.value || "")
        .split(",")
        .map(parseFloat)
      xs.expansionCoefficient = exp
      xs.contractionCoefficient = cntr
      index++
    } else if (line.startsWith("#XS Ineff=")) {
      const parts = parseKeyValue(line)!.value.split(",")
      const numIneff = parseInt(parts[0])
      index++
      for (
        let k = 0;
        k < numIneff && index < lines.length;
        k++
      ) {
        const ineffLine = lines[index]
        if (
          !ineffLine ||
          isNewSection(ineffLine) ||
          /^[A-Za-z#]/.test(ineffLine.trimStart())
        )
          break
        const ineff = IneffectiveFlowArea.fromString(ineffLine)
        if (ineff) xs.ineffectiveFlowAreas.push(ineff)
        index++
      }
    } else if (line.startsWith("Permanent Ineff=")) {
      const isPermanent =
        (parseKeyValue(line)?.value || "F").toUpperCase() === "T"
      if (xs.ineffectiveFlowAreas.length > 0) {
        xs.ineffectiveFlowAreas[
          xs.ineffectiveFlowAreas.length - 1
        ].isPermanent = isPermanent
      }
      index++
    } else {
      index++
    }
    line = lines[index]
  }
  
  return index
}
