import { chunk } from "es-toolkit"
import {
  schema,
  fields,
  multiField,
  contextual,
  stringPart,
  numberPart,
  type Infer,
  type Part,
} from "../schema"
import { formatStationPairs, coordinatePairToString } from "../serializers/utils"
import type { CulvertBarrelProperties } from "../models/geometry/culvert"
import type { UpstreamDownstreamPair, Coordinate } from "../models/geometry/common"

const spacedIntegerPart = (options: { trailingComma?: boolean } = {}): Part<number> => {
  const { trailingComma = false } = options
  return {
    parse(segment: string) {
      const numeric = parseInt(segment.trim(), 10)
      if (Number.isNaN(numeric)) {
        throw new Error(`Invalid integer segment: ${segment}`)
      }
      return numeric
    },
    serialize(value: number | null | undefined) {
      if (value === undefined || value === null) {
        return trailingComma ? "," : ""
      }
      const base = ` ${value} `
      return trailingComma ? `${base},` : base
    },
  }
}

export const culvertSchema = schema([
  multiField(
    "Connection Culv=",
    fields({
      shape: numberPart({ integer: true }),
      rise: numberPart(),
      span: numberPart(),
      length: numberPart(),
      nTop: numberPart(),
      entranceLoss: numberPart(),
      exitLoss: numberPart(),
      chart: numberPart({ integer: true }),
      scale: numberPart({ integer: true }),
      upstreamInvert: numberPart(),
      downstreamInvert: numberPart(),
      numberOfBarrels: spacedIntegerPart(),
      culvertGroupName: stringPart({ trim: true, width: 12 }),
      unknownFlag: spacedIntegerPart({ trailingComma: true }),
    }),
  ),
  contextual("barrelStations", parseCulvertBarrelStations, serializeCulvertBarrelStations),
  contextual("barrels", parseCulvertBarrels, serializeCulvertBarrels),
  contextual(
    "nBottom",
    parseOptionalInlineNumber("Conn Culv Bottom n="),
    serializeSimpleNumber("Conn Culv Bottom n="),
  ),
  contextual(
    "nBottomDepth",
    parseOptionalInlineNumber("Conn Culv Bottom Depth="),
    serializeSimpleNumber("Conn Culv Bottom Depth="),
  ),
  contextual(
    "depthBlocked",
    parseOptionalInlineNumber("Conn Culv Depth Blocked="),
    serializeSimpleNumber("Conn Culv Depth Blocked="),
  ),
])

export type CulvertSchema = Infer<typeof culvertSchema>

function parseCulvertBarrelStations(
  lines: string[],
  startIndex: number,
  context: Record<string, unknown>,
) {
  const numberOfBarrels = Number(context.numberOfBarrels ?? 0)
  if (!Number.isFinite(numberOfBarrels) || numberOfBarrels <= 0) {
    return {
      value: [] as UpstreamDownstreamPair[],
      nextIndex: startIndex,
    }
  }

  const totalSegments = numberOfBarrels * 2
  const { segments, nextIndex } = readFixedWidthSegments(lines, startIndex, 8, 80, totalSegments)

  const pairs: UpstreamDownstreamPair[] = []
  for (let i = 0; i < segments.length; i += 2) {
    const upstream = parseMaybeFloat(segments[i])
    const downstream = parseMaybeFloat(segments[i + 1])
    pairs.push({ upstreamStation: upstream, downstreamStation: downstream })
  }

  return {
    value: pairs,
    nextIndex,
  }
}

function serializeCulvertBarrelStations(
  value: UpstreamDownstreamPair[] | undefined,
  _context: Record<string, unknown>,
): string[] {
  if (!value || value.length === 0) {
    return []
  }
  return formatStationPairs(value)
}

function parseCulvertBarrels(
  lines: string[],
  startIndex: number,
  _context: Record<string, unknown>,
) {
  const barrels: CulvertBarrelProperties[] = []
  let index = startIndex

  while (true) {
    const line = lines[index]
    if (!line?.startsWith("Conn Culvert Barrel=")) {
      break
    }

    const raw = line.slice("Conn Culvert Barrel=".length)
    const parts = raw.split(",")
    const barrelIndex = parseInt(parts[0]?.trim() ?? "0", 10)
    const name = parts[1]?.trim() ?? ""
    const pointCount = parseInt(parts[2]?.trim() ?? "0", 10)
    index += 1

    const coordinates: Coordinate[] = []
    if (pointCount > 0) {
      const numbersRequired = pointCount * 2
      const { segments, nextIndex } = readFixedWidthSegments(lines, index, 16, 64, numbersRequired)
      const numbers = segments.map((segment) => parseFloatStrict(segment))
      for (let i = 0; i < numbers.length; i += 2) {
        coordinates.push([numbers[i], numbers[i + 1]])
      }
      index = nextIndex
    }

    barrels.push({
      index: barrelIndex,
      name,
      coordinates,
    })
  }

  return {
    value: barrels,
    nextIndex: index,
  }
}

function serializeCulvertBarrels(
  value: CulvertBarrelProperties[] | undefined,
  _context: Record<string, unknown>,
): string[] {
  if (!value || value.length === 0) {
    return []
  }

  const lines: string[] = []
  for (const barrel of value) {
    lines.push(`Conn Culvert Barrel=${barrel.index},${barrel.name},${barrel.coordinates.length}`)
    if (barrel.coordinates.length > 0) {
      for (const pair of toCoordinateLines(barrel.coordinates)) {
        lines.push(pair)
      }
    }
  }

  return lines
}

function parseOptionalInlineNumber(label: string) {
  return (
    lines: string[],
    startIndex: number,
    _context: Record<string, unknown>,
  ): { value: number | undefined; nextIndex: number } | null => {
    const line = lines[startIndex]
    if (!line?.startsWith(label)) {
      return null
    }
    const valueSegment = line.slice(label.length).trim()
    if (valueSegment === "") {
      return {
        value: undefined,
        nextIndex: startIndex + 1,
      }
    }
    const parsed = parseFloat(valueSegment)
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid number for ${label}: ${valueSegment}`)
    }
    return {
      value: parsed,
      nextIndex: startIndex + 1,
    }
  }
}

function serializeSimpleNumber(label: string) {
  return (value: number | undefined, _context: Record<string, unknown>): string[] => {
    if (value === undefined) {
      return []
    }
    return [`${label}${value}`]
  }
}

function readFixedWidthSegments(
  lines: string[],
  startIndex: number,
  width: number,
  maxWidth: number,
  count: number,
) {
  const segments: string[] = []
  const perLine = Math.max(1, Math.floor(maxWidth / width))
  let index = startIndex

  while (segments.length < count) {
    const line = lines[index]
    if (line === undefined) {
      break
    }

    const limit = Math.min(line.length, maxWidth)
    for (let offset = 0; offset < limit && segments.length < count; offset += width) {
      const slice = line.slice(offset, offset + width)
      segments.push(slice.trim())
    }
    index += 1
  }

  if (segments.length < count) {
    throw new Error(`Insufficient data while reading fixed-width segments (expected ${count})`)
  }

  return { segments, nextIndex: index }
}

function parseMaybeFloat(value: string): number | null {
  if (value === "") {
    return null
  }
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid float segment: ${value}`)
  }
  return parsed
}

function parseFloatStrict(value: string): number {
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric segment: ${value}`)
  }
  return parsed
}

function toCoordinateLines(coordinates: Coordinate[]): string[] {
  const lines: string[] = []
  chunk(coordinates, 2).forEach((segment) => {
    const formatted = segment.map((coord) => coordinatePairToString(coord, 16)).join("")
    lines.push(formatted)
  })
  return lines
}
