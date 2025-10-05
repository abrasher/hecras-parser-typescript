import {
  schema,
  fields,
  multiField,
  tupleArrayField,
  stringField,
  numberField,
  stringPart,
  numberPart,
  contextual,
  type Infer,
  booleanField,
  blankLine,
} from "../../schema"
import { splitIntoTuples, parseKeyValue, parseMultilineArray } from "../../schema/parsingUtils"
import { formatHECRASCoordinateNumber } from "../../schema/serializationUtils"

/**
 * Schema for parsing Storage Area geometry definitions from HEC-RAS format
 *
 * Format:
 * Storage Area=<id>,<centroidX>,<centroidY>
 * Storage Area Surface Line= <numberOfPoints>
 * <coordinate data in 16-char fixed-width format, 1 coordinate per line>
 * Storage Area Type= <type>
 * Storage Area Area=<area|blank>
 * Storage Area Min Elev=<minElevation|blank>
 * Storage Area Is2D=<is2D>
 * Storage Area Point Generation Data=<pointGenerationData>
 * Storage Area 2D Points= <numberOfPoints>
 * <coordinate data in 16-char fixed-width format, 2 coordinates per line>
 * Storage Area 2D PointsPerimeterTime=<pointsPerimeterTime>
 * Storage Area Mannings=<mannings>
 * 2D Cell Volume Filter Tolerance=<tolerance>
 * 2D Cell Minimum Area Fraction=<fraction>
 * 2D Face Profile Filter Tolerance=<tolerance>
 * 2D Face Area Elevation Profile Filter Tolerance=<tolerance>
 * 2D Face Area Elevation Conveyance Ratio=<ratio>
 * 2D Face Min Length Ratio=<ratio>
 * 2D Face Area Laminar Depth=<depth>
 * 2D Multiple Face Mann n=<value>
 * 2D Composite LC=<value>
 * 2D Locked=<locked>
 */
export const storageAreaSchema = schema([
  // Storage Area=id,centroidX,centroidY
  multiField(
    "Storage Area=",
    fields({
      id: stringPart({ trim: true, width: 16 }),
      centroidX: numberPart({ nullOnBlank: true }),
      centroidY: numberPart({ nullOnBlank: true }),
    }),
  ),

  // Surface line coordinates - custom parsing for coordinate pairs
  contextual(
    "surfaceLine",
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (!line || !line.startsWith("Storage Area Surface Line=")) {
        return null
      }

      const count = parseInt(parseKeyValue(line).value)

      const totalNumbers = count * 3 // Each coordinate is [x, y]
      const { data, nextIndex } = parseMultilineArray({
        lines,
        width: 16,
        maxWidth: 48, // Each line can have up to 3 16-char segments (x, y, padding)
        numOfEntries: totalNumbers,
        currentIndex: startIndex + 1,
      })

      // Convert to numbers and split into coordinate pairs
      const numbers = data.map((str) => parseFloat(str)).filter((num) => !isNaN(num))
      const coordinates = splitIntoTuples(numbers, 2)

      return {
        value: coordinates,
        nextIndex,
      }
    },
    (value) => {
      if (!value || !Array.isArray(value)) {
        return []
      }

      const coordinates = value
      const lines: string[] = []

      // Header line
      lines.push(`Storage Area Surface Line= ${coordinates.length} `)

      // Format coordinate lines - each coordinate pair gets its own line, padded to 48 chars
      for (const coord of coordinates) {
        const x = formatHECRASCoordinateNumber(coord[0]).padStart(16)
        const y = formatHECRASCoordinateNumber(coord[1]).padStart(16)
        const line = (x + y).padEnd(48, " ")
        lines.push(line)
      }

      return lines
    },
  ),

  // Storage Area Type
  numberField("type", "Storage Area Type=", { integer: true, pad: true }),

  // Storage Area Area (optional) stored as string for now as sometimes blank and somes a single space which we can't handle
  stringField("area", "Storage Area Area=", { trim: false }),

  // Storage Area Min Elevation (optional)
  numberField("minElevation", "Storage Area Min Elev=", { nullOnBlank: true }),

  // Volume-Elevation data
  tupleArrayField("Storage Area Vol Elev=", "volumeElevation", {
    width: 8,
    maxWidth: 80,
    tuple: 2 as const,
    formatter: "station",
    optional: true,
  }),

  // Is2D flag
  booleanField("is2D", "Storage Area Is2D=", { mode: "-1,0" }),

  // Point Generation Data (optional)
  stringField("pointGenerationData", "Storage Area Point Generation Data=", {
    trim: true,
  }),

  // 2D Points (2 coordinate pairs per line, width 16, max 64)
  tupleArrayField("Storage Area 2D Points=", "points2D", {
    width: 16,
    maxWidth: 64, // 4 numbers per line * 16 chars = 64 chars max
    tuple: 2 as const, // [x, y] coordinate pairs
    formatter: "coordinate",
    pad: true,
  }),

  // 2D Points Perimeter Time (optional)
  stringField("pointsPerimeterTime", "Storage Area 2D PointsPerimeterTime=", {
    nullOnBlank: true,
    trim: true,
  }),

  // Manning's n value (optional)
  numberField("mannings", "Storage Area Mannings=", { nullOnBlank: true }),

  // 2D specific parameters (all optional)
  numberField("cellVolumeFilterTolerance", "2D Cell Volume Filter Tolerance=", {
    nullOnBlank: true,
  }),

  numberField("cellMinimumAreaFraction", "2D Cell Minimum Area Fraction=", {
    nullOnBlank: true,
  }),

  numberField("faceProfileFilterTolerance", "2D Face Profile Filter Tolerance=", {
    nullOnBlank: true,
  }),

  numberField(
    "faceAreaElevationProfileFilterTolerance",
    "2D Face Area Elevation Profile Filter Tolerance=",
    {
      nullOnBlank: true,
    },
  ),

  numberField("faceAreaElevationConveyanceRatio", "2D Face Area Elevation Conveyance Ratio=", {
    nullOnBlank: true,
  }),

  numberField("faceMinLengthRatio", "2D Face Min Length Ratio=", {
    nullOnBlank: true,
  }),

  numberField("faceAreaLaminarDepth", "2D Face Area Laminar Depth=", {
    nullOnBlank: true,
  }),

  numberField("multipleFaceMannN", "2D Multiple Face Mann n=", {
    integer: true,
    nullOnBlank: true,
  }),

  numberField("compositeLC", "2D Composite LC=", {
    integer: true,
    nullOnBlank: true,
  }),

  numberField("locked", "2D Locked=", {
    integer: true,
    nullOnBlank: true,
    optional: true,
  }),
  blankLine(),
])

export type StorageAreaSchema = Infer<typeof storageAreaSchema>
