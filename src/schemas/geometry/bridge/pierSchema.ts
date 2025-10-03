import { formatFixedWidth, formatHECRASStationNumber } from "../../../schema/serializationUtils"
import { contextual, fields, multiField, numberPart, schema, stringPart } from "../../../schema"
import { parseMultilineArray } from "../../../schema/parsingUtils"

const WIDTH_FIELD_WIDTH = 8
const MAX_VALUES_PER_LINE = 80 / WIDTH_FIELD_WIDTH

const skewPart = (() => {
  const base = stringPart({ trim: true })
  return {
    ...base,
    serialize(value: string | undefined) {
      if (value === undefined || value === null || value === "") {
        return "  "
      }
      return base.serialize(value)
    },
  }
})()

const debrisPart = numberPart({ nullOnBlank: true })

function readWidthElevationPairs(
  lines: string[],
  startIndex: number,
  count: number,
): { pairs: { width: number; elevation: number }[]; nextIndex: number } {
  if (count === 0) {
    return { pairs: [], nextIndex: startIndex }
  }

  const { data: widthData, nextIndex: widthsNextIndex } = parseMultilineArray({
    lines,
    currentIndex: startIndex,
    width: WIDTH_FIELD_WIDTH,
    maxWidth: 80,
    numOfEntries: count,
  })

  const widths = widthData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing pier width: ${value}`)
      }
      return parsed
    })

  if (widths.length !== count) {
    throw new Error(`Expected ${count} pier widths but parsed ${widths.length}`)
  }

  const { data: elevationData, nextIndex } = parseMultilineArray({
    lines,
    currentIndex: widthsNextIndex,
    width: WIDTH_FIELD_WIDTH,
    maxWidth: 80,
    numOfEntries: count,
  })

  const elevations = elevationData
    .filter((value) => value !== "")
    .map((value) => {
      const parsed = parseFloat(value)
      if (Number.isNaN(parsed)) {
        throw new Error(`Error parsing pier elevation: ${value}`)
      }
      return parsed
    })

  if (elevations.length !== count) {
    throw new Error(`Expected ${count} pier elevations but parsed ${elevations.length}`)
  }

  const pairs = widths.map((width, idx) => ({ width, elevation: elevations[idx] }))

  return { pairs, nextIndex }
}

function formatFixedWidthSeries(values: number[]): string[] {
  const lines: string[] = []
  for (let i = 0; i < values.length; i += MAX_VALUES_PER_LINE) {
    const slice = values.slice(i, i + MAX_VALUES_PER_LINE)
    const formatted = slice
      .map((value) => formatFixedWidth(formatHECRASStationNumber(value), WIDTH_FIELD_WIDTH))
      .join("")
    lines.push(formatted)
  }
  return lines
}

export const pierSchema = schema([
  multiField(
    "Conn BR: Pier Skew, UpSta & Num, DnSta & Num=",
    fields({
      skew: skewPart,
      centerlineStationUpstream: numberPart(),
      upstreamPointCount: numberPart({ integer: true, pad: true }),
      centerlineStationDownstream: numberPart(),
      downstreamPointCount: numberPart({ integer: true, pad: true }),
      unusedUpstream: numberPart({ integer: true, pad: true }),
      unusedDownstream: numberPart({ integer: true, pad: true }),
      applyFloatingDebris: numberPart({ integer: true, pad: true }),
      debrisWidth: debrisPart,
      debrisHeight: debrisPart,
    }),
  ),
  contextual(
    "upstream",
    (lines, startIndex, context) => {
      const count = (context.upstreamPointCount as number) ?? 0
      const { pairs, nextIndex } = readWidthElevationPairs(lines, startIndex, count)

      return {
        value: pairs,
        nextIndex,
      }
    },
    (pairs) => {
      if (!pairs || pairs.length === 0) {
        return []
      }

      const widths = pairs.map((pair) => pair.width)
      const elevations = pairs.map((pair) => pair.elevation)

      return [...formatFixedWidthSeries(widths), ...formatFixedWidthSeries(elevations)]
    },
  ),
  contextual(
    "downstream",
    (lines, startIndex, context) => {
      const count = (context.downstreamPointCount as number) ?? 0
      const { pairs, nextIndex } = readWidthElevationPairs(lines, startIndex, count)

      return {
        value: pairs,
        nextIndex,
      }
    },
    (pairs) => {
      if (!pairs || pairs.length === 0) {
        return []
      }

      const widths = pairs.map((pair) => pair.width)
      const elevations = pairs.map((pair) => pair.elevation)

      return [...formatFixedWidthSeries(widths), ...formatFixedWidthSeries(elevations)]
    },
  ),
])

export type PierSchema = typeof pierSchema
