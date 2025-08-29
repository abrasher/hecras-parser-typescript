import type { LandCover, LandCoverRegion, LandCoverTable } from "../../models/geometry/landCover"
import { parseKeyValue } from "../atomic"
import { arrayToNumberPairs, parseMultilineArray, parseMultilineCSV } from "../multiLineParsers"

export function parseLandCoverData(
  lines: string[],
  currentIndex: number,
): { data: LandCover; nextIndex: number } {
  let index = currentIndex
  const lastEdited = parseKeyValue(lines[index]).value
  index++

  const lastEditedRegion = parseKeyValue(lines[index]).value
  index++

  // Parse the table
  const parseTable = (): LandCoverTable => {
    const { value: linesCount } = parseKeyValue(lines[index])
    const numberOfLines = parseInt(linesCount.trim())
    index++

    const { data, nextIndex: nIndex } = parseMultilineCSV({
      lines,
      currentIndex: index,
      numberOfLines,
    })
    index = nIndex

    return data.map((row) => [row[0], parseFloat(row[1])]) as LandCoverTable
  }

  const table = parseTable()

  const regions: LandCoverRegion[] = []

  while (lines[index]?.startsWith("LCMann Region Name=")) {
    const name = parseKeyValue(lines[index]).value
    index++

    const table = parseTable()

    const { value: polygonPoint } = parseKeyValue(lines[index])
    const polygonLines = parseInt(polygonPoint.trim())
    index++

    const pointsPerEntry = 2
    const { data: polygonData, nextIndex } = parseMultilineArray({
      width: 16,
      maxWidth: 64,
      numOfEntries: polygonLines * pointsPerEntry,
      currentIndex: index,
      lines,
    })
    index = nextIndex

    const polygon = arrayToNumberPairs(polygonData, 2)

    regions.push({
      name,
      table,
      polygon,
    })
  }

  return {
    data: {
      lastEdited,
      lastEditedRegion,
      table,
      regions,
    },
    nextIndex: index,
  }
}
