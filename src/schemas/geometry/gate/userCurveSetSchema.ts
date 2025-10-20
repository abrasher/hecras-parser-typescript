import { contextual } from "../../../schema"
import {
  parseKeyValue,
  parseMaybeFloat,
  parseMultilineArray,
} from "../../../schema/parsingUtils"
import {
  formatChunkedLines,
  formatHECRASStationNumber,
} from "../../../schema/serializationUtils"

export const userCurveSetContextual = contextual(
  "userDefinedGateCurves",
  (lines, startIndex) => {
    if (!lines[startIndex]?.startsWith("Connection Gate User Curve Set=")) {
      return null
    }
    let cursor = startIndex

    const curveName = parseKeyValue(lines[cursor]).value

    cursor++

    const headwaterEntries = Number(parseKeyValue(lines[cursor]).value)

    cursor++
    const headwatersRes = parseMultilineArray({
      lines,
      width: 8,
      maxWidth: 80,
      currentIndex: cursor,
      numOfEntries: headwaterEntries,
    })

    const headwaters = headwatersRes.data.map(parseMaybeFloat)
    cursor = headwatersRes.nextIndex

    const openingEntries = Number(parseKeyValue(lines[cursor]).value)
    cursor++

    const openingsRes = parseMultilineArray({
      lines,
      width: 8,
      maxWidth: 80,
      currentIndex: cursor,
      numOfEntries: openingEntries,
    })

    // add extra 1 to skip the header line
    cursor = openingsRes.nextIndex + 1
    const openings = openingsRes.data.map(parseMaybeFloat)
    const flowsRes = parseMultilineArray({
      lines,
      width: 8,
      maxWidth: 8 * openingEntries,
      currentIndex: cursor,
      numOfEntries: openingEntries * headwaters.length,
    })
    cursor += flowsRes.nextIndex
    const flows = flowsRes.data.map(parseMaybeFloat)

    // Transform flows and openings into structured format
    const numOpenings = openings.length
    const structuredData = openings.map((openingHeight, index) => {
      const openingFlows: (number | null)[] = []
      for (let i = index; i < flows.length; i += numOpenings) {
        openingFlows.push(flows[i])
      }
      return { openingHeight, flows: openingFlows }
    })
    return {
      nextIndex: cursor,
      value: {
        name: curveName,
        headwaters,
        curves: structuredData,
      },
    }
  },
  (val) => {
    if (!val) {
      return []
    }
    const lines: string[] = []
    lines.push(`Connection Gate User Curve Set=${val.name}`)
    lines.push(`Connection Gate User Curve Set Headwater=${val.headwaters.length}`)
    lines.push(
      ...formatChunkedLines(val.headwaters, {
        width: 8,
        perLine: 10,
        formatter: formatHECRASStationNumber,
      }),
    )
    lines.push(`Connection Gate User Curve Set Gate Opening=${val.curves.length}`)

    // Serialize opening heights
    const openingHeights = val.curves.map(c => c.openingHeight)
    lines.push(
      ...formatChunkedLines(openingHeights, {
        width: 8,
        perLine: 10,
        formatter: formatHECRASStationNumber,
      }),
    )

    // Add flows header
    lines.push(`Connection Gate User Curve Set Flows`)

    // Transpose flows: stored by opening, output by headwater
    // Each row represents a headwater, each column represents an opening
    for (let hwIndex = 0; hwIndex < val.headwaters.length; hwIndex++) {
      const rowFlows = val.curves.map(curve => curve.flows[hwIndex])
      lines.push(
        ...formatChunkedLines(rowFlows, {
          width: 8,
          perLine: 10,
          formatter: formatHECRASStationNumber,
        }),
      )
    }

    return lines
  },
)
