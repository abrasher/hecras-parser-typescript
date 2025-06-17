// Standardized parsing primitives for HECRAS format quirks
import type {
  Coordinate,
  StationElevationPoint,
  VolumeElevationPoint,
  ManningSegment,
} from "../models/common"

export interface ParseOptions {
  strict?: boolean // Whether to fail on malformed data or attempt recovery
  preserveSpacing?: boolean // Whether to preserve original spacing in output
  maxErrors?: number // Maximum number of errors before giving up
}

export interface PrimitiveParseResult<T> {
  data: T
  errors: string[]
  warnings: string[]
  recovered: boolean // Whether data recovery was used
}

export class HECRASPrimitives {
  /**
   * Parse fixed-width values that HECRAS uses
   * These are typically powers of 2 (16, 32, etc.) and must maintain exact width
   */
  static parseFixedWidth(
    input: string,
    expectedWidth?: number,
  ): PrimitiveParseResult<string> {
    const errors: string[] = []
    const warnings: string[] = []

    if (expectedWidth && input.length !== expectedWidth) {
      warnings.push(
        `Fixed-width field expected ${expectedWidth} characters, got ${input.length}`,
      )
    }

    // HECRAS fixed-width fields are often padded with spaces
    const trimmed = input.trim()

    return {
      data: trimmed,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse key-value pairs with HECRAS-specific rules
   * Handles variations in spacing, colons, and nested keys
   */
  static parseKeyValue(
    line: string,
    options: ParseOptions = {},
  ): PrimitiveParseResult<{ key: string; value: string } | null> {
    const errors: string[] = []
    const warnings: string[] = []

    // Remove leading spaces but preserve structure
    const trimmedLine = line.trimStart()

    // Handle different separators: =, :, and combinations
    const separatorMatch = trimmedLine.match(/^([^=:]+)([=:])(.*)$/)

    if (!separatorMatch) {
      if (!options.strict) {
        // Try to recover by looking for space-separated key-value
        const spaceMatch = trimmedLine.match(/^(\S+)\s+(.+)$/)
        if (spaceMatch) {
          warnings.push("Recovered key-value pair using space separator")
          return {
            data: { key: spaceMatch[1].trim(), value: spaceMatch[2].trim() },
            errors,
            warnings,
            recovered: true,
          }
        }
      }

      return {
        data: null,
        errors: ["Invalid key-value format"],
        warnings,
        recovered: false,
      }
    }

    const key = separatorMatch[1].trim()
    const separator = separatorMatch[2]
    const value = separatorMatch[3].trim()

    // Handle nested keys (e.g., "Conn BR: XS SE")
    if (key.includes(":")) {
      // This is a nested key, keep the colon structure
    }

    return {
      data: { key, value },
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse coordinate data from HECRAS format
   * Handles both fixed-width coordinate blocks and space-separated coordinates
   */
  static parseMultilineCoordinates(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<Coordinate[]> {
    const errors: string[] = []
    const warnings: string[] = []
    const coordinates: Coordinate[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Try fixed-width parsing first (16 characters per number)
      const fixedWidthResult = this.parseFixedWidthCoordinates(line)
      if (fixedWidthResult.data.length > 0) {
        coordinates.push(...fixedWidthResult.data)
        warnings.push(...fixedWidthResult.warnings)
        continue
      }

      // Fall back to space-separated parsing
      const spaceResult = this.parseSpaceSeparatedCoordinates(line)
      if (spaceResult.data.length > 0) {
        coordinates.push(...spaceResult.data)
        warnings.push(...spaceResult.warnings)
        if (spaceResult.recovered) {
          warnings.push(
            `Line ${i + 1}: Used space-separated coordinate parsing`,
          )
        }
        continue
      }

      if (!options.strict) {
        warnings.push(`Line ${i + 1}: Could not parse coordinates, skipping`)
      } else {
        errors.push(`Line ${i + 1}: Invalid coordinate format`)
      }
    }

    return {
      data: coordinates,
      errors,
      warnings,
      recovered: warnings.some((w) => w.includes("Used space-separated")),
    }
  }

  /**
   * Parse fixed-width coordinates (16 characters per number)
   */
  private static parseFixedWidthCoordinates(
    line: string,
  ): PrimitiveParseResult<Coordinate[]> {
    const coordinates: Coordinate[] = []
    const errors: string[] = []
    const warnings: string[] = []

    // Remove all spaces and chunk into 16-character segments
    const numbers: number[] = []

    for (let i = 0; i < line.length; i += 16) {
      const chunk = line.substring(i, i + 16).trim()
      if (chunk) {
        const num = parseFloat(chunk)
        if (!isNaN(num)) {
          numbers.push(num)
        } else if (chunk.length > 0) {
          warnings.push(`Could not parse number: "${chunk}"`)
        }
      }
    }

    // Pair up numbers as x,y coordinates
    for (let i = 0; i < numbers.length; i += 2) {
      if (i + 1 < numbers.length) {
        coordinates.push({ x: numbers[i], y: numbers[i + 1] })
      } else {
        warnings.push("Unpaired coordinate value found")
      }
    }

    return { data: coordinates, errors, warnings, recovered: false }
  }

  /**
   * Parse space-separated coordinates
   */
  private static parseSpaceSeparatedCoordinates(
    line: string,
  ): PrimitiveParseResult<Coordinate[]> {
    const coordinates: Coordinate[] = []
    const errors: string[] = []
    const warnings: string[] = []

    const numbers = line
      .trim()
      .split(/\s+/)
      .map(parseFloat)
      .filter((n) => !isNaN(n))

    // Pair up numbers as x,y coordinates
    for (let i = 0; i < numbers.length; i += 2) {
      if (i + 1 < numbers.length) {
        coordinates.push({ x: numbers[i], y: numbers[i + 1] })
      } else {
        warnings.push("Unpaired coordinate value found")
      }
    }

    return {
      data: coordinates,
      errors,
      warnings,
      recovered: coordinates.length > 0,
    }
  }

  /**
   * Parse station-elevation data
   */
  static parseStationElevation(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<StationElevationPoint[]> {
    const errors: string[] = []
    const warnings: string[] = []
    const points: StationElevationPoint[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const numbers = line
        .trim()
        .split(/\s+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n))

      // Parse pairs of station-elevation values
      for (let i = 0; i < numbers.length; i += 2) {
        if (i + 1 < numbers.length) {
          points.push({
            station: numbers[i],
            elevation: numbers[i + 1],
          })
        } else {
          warnings.push("Unpaired station-elevation value found")
        }
      }
    }

    return {
      data: points,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse volume-elevation data
   */
  static parseVolumeElevation(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<VolumeElevationPoint[]> {
    const errors: string[] = []
    const warnings: string[] = []
    const points: VolumeElevationPoint[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const numbers = line
        .trim()
        .split(/\s+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n))

      // Parse pairs of elevation-volume values
      for (let i = 0; i < numbers.length; i += 2) {
        if (i + 1 < numbers.length) {
          points.push({
            elevation: numbers[i],
            volume: numbers[i + 1],
          })
        } else {
          warnings.push("Unpaired elevation-volume value found")
        }
      }
    }

    return {
      data: points,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse Manning's roughness segments
   */
  static parseManningSegments(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<ManningSegment[]> {
    const errors: string[] = []
    const warnings: string[] = []
    const segments: ManningSegment[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const numbers = line
        .trim()
        .split(/\s+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n))

      // Manning segments are typically: dummy(0), station, n-value
      for (let i = 0; i < numbers.length; i += 3) {
        if (i + 2 < numbers.length) {
          segments.push({
            station: numbers[i + 1], // Skip dummy value
            nValue: numbers[i + 2],
            unknownParameter: 0, // Add required field from ManningSegment
          })
        } else {
          warnings.push("Incomplete Manning segment found")
        }
      }
    }

    return {
      data: segments,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse Manning data - alias for parseManningSegments
   */
  static parseManningData(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<ManningSegment[]> {
    return this.parseManningSegments(lines, options)
  }

  /**
   * Parse comma-separated values with HECRAS-specific handling
   */
  static parseCommaSeparated(
    value: string,
    options: ParseOptions = {},
  ): PrimitiveParseResult<string[]> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!value.trim()) {
      return {
        data: [],
        errors,
        warnings,
        recovered: false,
      }
    }

    // Split by comma and handle spacing
    const parts = value.split(",").map((part) => {
      const trimmed = part.trim()

      // Handle HECRAS fixed-width fields that might have internal spacing
      if (trimmed.length === 0) {
        return "" // Empty field
      }

      return trimmed
    })

    return {
      data: parts,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse table-like data with irregular spacing
   * Handles the complex table formats HECRAS uses
   */
  static parseTableData(
    lines: string[],
    options: ParseOptions = {},
  ): PrimitiveParseResult<number[][]> {
    const errors: string[] = []
    const warnings: string[] = []
    const rows: number[][] = []

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      if (!line.trim()) continue

      // Parse numbers from the line, handling irregular spacing
      const numbers = line
        .trim()
        .split(/\s+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n))

      if (numbers.length > 0) {
        rows.push(numbers)
      } else {
        warnings.push(`Line ${lineIndex + 1}: No valid numbers found`)
      }
    }

    return {
      data: rows,
      errors,
      warnings,
      recovered: false,
    }
  }

  /**
   * Parse culvert data with specific HECRAS format
   */
  static parseCulvertData(line: string): PrimitiveParseResult<any> {
    const errors: string[] = []
    const warnings: string[] = []

    const commaResult = this.parseCommaSeparated(line)
    const parts = commaResult.data

    if (parts.length < 11) {
      errors.push(
        `Culvert data requires at least 11 parts, got ${parts.length}`,
      )
      return {
        data: null,
        errors,
        warnings,
        recovered: false,
      }
    }

    try {
      const culvertData = {
        barrelCount: parseInt(parts[0]) || 1,
        diameter: parseFloat(parts[1]) || 0,
        height: parseFloat(parts[2]) || 0,
        length: parseFloat(parts[3]) || 0,
        roughness: parseFloat(parts[4]) || 0,
        entranceLoss: parseFloat(parts[5]) || 0,
        exitLoss: parseFloat(parts[6]) || 0,
        shape: parseInt(parts[7]) || 1,
        material: parseInt(parts[8]) || 1,
        upstreamInvert: parseFloat(parts[9]) || 0,
        downstreamInvert: parseFloat(parts[10]) || 0,
        description: parts[12]?.trim() || "",
      }

      return {
        data: culvertData,
        errors,
        warnings,
        recovered: false,
      }
    } catch (error) {
      errors.push(
        `Failed to parse culvert data: ${error instanceof Error ? error.message : String(error)}`,
      )
      return {
        data: null,
        errors,
        warnings,
        recovered: false,
      }
    }
  }

  /**
   * Utility to determine if a line is likely to contain numeric data
   */
  static isNumericDataLine(line: string): boolean {
    const trimmed = line.trim()
    if (!trimmed) return false

    // Check if line contains mostly numbers, spaces, and basic punctuation
    const numericPattern = /^[\d\s\.\-\+,eE]+$/
    return numericPattern.test(trimmed)
  }

  /**
   * Utility to determine if a line is likely a section header
   */
  static isSectionHeader(line: string, knownHeaders: string[] = []): boolean {
    const trimmed = line.trim()

    // Check against known headers
    if (
      knownHeaders.some((header) =>
        trimmed.toLowerCase().includes(header.toLowerCase()),
      )
    ) {
      return true
    }

    // Check for typical HECRAS section patterns
    const sectionPatterns = [
      /^[A-Za-z][A-Za-z\s]+=/, // Key=Value patterns
      /^[A-Za-z][A-Za-z\s]+:/, // Key: patterns
      /^BEGIN\s+/, // BEGIN blocks
      /^END\s+/, // END blocks
    ]

    return sectionPatterns.some((pattern) => pattern.test(trimmed))
  }
}
