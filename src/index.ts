/**
 * hecras-parser - TypeScript library for parsing and serializing HEC-RAS files
 *
 * @packageDocumentation
 *
 * @remarks
 * This library provides functions to parse and serialize HEC-RAS geometry (.gXX) and plan (.pXX) files.
 * It uses a schema-first architecture that ensures round-trip fidelity: parsing a file and serializing
 * it back produces identical output, preserving formatting, spacing, and blank values exactly.
 *
 * @example
 * ```typescript
 * import { parseGeometry, serializeGeometry } from 'hecras-parser'
 * import { readFileSync, writeFileSync } from 'fs'
 *
 * // Read and parse a geometry file
 * const content = readFileSync('model.g01', 'utf-8')
 * const geometry = parseGeometry(content)
 *
 * // Access parsed data
 * console.log(geometry.title)
 * console.log(geometry.storageAreas?.length)
 *
 * // Serialize back to string (with Windows line endings for HEC-RAS compatibility)
 * const output = serializeGeometry(geometry, { lineEndings: '\r\n' })
 * writeFileSync('model-modified.g01', output)
 * ```
 */

// Data models
export type * from "./models/geometry/common"
export type * from "./models/plan/plan"
export type * from "./models/unsteadyFlow"

// Schema exports (for advanced users extending the library)
export { parseWithSchema, serializeWithSchema } from "./schema/driver"
export { planSchema } from "./schemas/planSchema"
export { geometrySchema } from "./schemas/geometrySchema"
export type { Infer } from "./schema/core"

// Types
import { parseWithSchema, serializeWithSchema } from "./schema/driver"
import { planSchema } from "./schemas/planSchema"
import { geometrySchema } from "./schemas/geometrySchema"
import type { Infer } from "./schema/core"

/**
 * Parsed HEC-RAS plan file data structure.
 *
 * @remarks
 * Contains simulation settings, solver configuration, time windows, and other plan parameters.
 * The exact shape is inferred from the plan schema.
 *
 * @see {@link parsePlan} to parse a plan file into this type
 * @see {@link serializePlan} to serialize this type back to a string
 */
export type Plan = Infer<typeof planSchema>

/**
 * Parsed HEC-RAS geometry file data structure.
 *
 * @remarks
 * Contains rivers, reaches, cross sections, storage areas, junctions, boundary conditions,
 * and other geometric elements. The exact shape is inferred from the geometry schema.
 *
 * @see {@link parseGeometry} to parse a geometry file into this type
 * @see {@link serializeGeometry} to serialize this type back to a string
 */
export type Geometry = Infer<typeof geometrySchema>

/**
 * Line ending style for serialized output.
 *
 * @remarks
 * HEC-RAS typically expects Windows-style line endings (`\r\n`).
 * Unix-style (`\n`) is supported but may cause issues with some HEC-RAS versions.
 */
export type LineEndings = "\r\n" | "\n"

/**
 * Options for serializing HEC-RAS data back to string format.
 */
export interface SerializeOptions {
  /**
   * Line ending style for the output.
   *
   * @defaultValue `"\r\n"` (Windows line endings)
   *
   * @remarks
   * HEC-RAS is a Windows application and expects Windows-style line endings (`\r\n`).
   * Using Unix-style line endings (`\n`) may cause compatibility issues.
   */
  lineEndings?: LineEndings
}

const DEFAULT_LINE_ENDINGS: LineEndings = "\r\n"

// ============================================================================
// Plan Files (.pXX)
// ============================================================================

/**
 * Parses a HEC-RAS plan file (.pXX) into a structured object.
 *
 * @param content - The raw text content of the plan file
 * @returns The parsed plan data structure
 *
 * @remarks
 * Plan files contain simulation settings such as:
 * - Simulation time windows (start/end dates and times)
 * - Computation time step configuration
 * - Solver settings (UNET, 2D settings)
 * - Flow tolerances and iteration limits
 * - Output options
 *
 * The parser normalizes line endings internally, so both Windows (`\r\n`)
 * and Unix (`\n`) line endings are accepted.
 *
 * @example
 * ```typescript
 * import { parsePlan } from 'hecras-parser'
 * import { readFileSync } from 'fs'
 *
 * const content = readFileSync('simulation.p01', 'utf-8')
 * const plan = parsePlan(content)
 *
 * // Access simulation time window
 * console.log(plan.simulationTimeWindow?.startDate) // e.g., "01JAN2020"
 * console.log(plan.simulationTimeWindow?.startTime) // e.g., "0000"
 *
 * // Access solver settings
 * console.log(plan.unetSettings?.theta)
 * console.log(plan.unetSettings?.maxIter)
 * ```
 *
 * @example
 * ```typescript
 * // Round-trip: parse and serialize back
 * import { parsePlan, serializePlan } from 'hecras-parser'
 *
 * const original = readFileSync('model.p01', 'utf-8')
 * const plan = parsePlan(original)
 * const serialized = serializePlan(plan)
 *
 * // serialized will match original (with \r\n line endings)
 * ```
 */
export function parsePlan(content: string): Plan {
  const normalized = content.replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")
  const { value } = parseWithSchema(planSchema, lines, 0)
  return value
}

/**
 * Serializes a plan data structure back to HEC-RAS plan file format.
 *
 * @param plan - The plan data structure to serialize
 * @param options - Serialization options (line endings, etc.)
 * @returns The serialized plan file content as a string
 *
 * @remarks
 * The serializer preserves the exact formatting expected by HEC-RAS, including:
 * - Field widths and padding
 * - Blank values where appropriate
 * - Section ordering
 *
 * @example
 * ```typescript
 * import { parsePlan, serializePlan } from 'hecras-parser'
 *
 * const plan = parsePlan(originalContent)
 *
 * // Modify settings
 * if (plan.unetSettings) {
 *   plan.unetSettings.maxIter = 40
 * }
 *
 * // Serialize with Windows line endings (default)
 * const output = serializePlan(plan)
 * writeFileSync('modified.p01', output)
 *
 * // Or with Unix line endings
 * const unixOutput = serializePlan(plan, { lineEndings: '\n' })
 * ```
 */
export function serializePlan(plan: Plan, options?: SerializeOptions): string {
  const lineEndings = options?.lineEndings ?? DEFAULT_LINE_ENDINGS
  const lines = serializeWithSchema(planSchema, plan)
  return lines.join(lineEndings)
}

// ============================================================================
// Geometry Files (.gXX)
// ============================================================================

/**
 * Parses a HEC-RAS geometry file (.gXX) into a structured object.
 *
 * @param content - The raw text content of the geometry file
 * @returns The parsed geometry data structure
 *
 * @remarks
 * Geometry files contain the physical model definition including:
 * - Rivers and reaches with cross sections
 * - Storage areas with elevation-volume curves
 * - 2D flow areas
 * - Junctions connecting rivers
 * - Boundary conditions
 * - Land cover and Manning's roughness
 * - Hydraulic structures (bridges, weirs, culverts)
 *
 * The parser normalizes line endings internally, so both Windows (`\r\n`)
 * and Unix (`\n`) line endings are accepted.
 *
 * @example
 * ```typescript
 * import { parseGeometry } from 'hecras-parser'
 * import { readFileSync } from 'fs'
 *
 * const content = readFileSync('model.g01', 'utf-8')
 * const geometry = parseGeometry(content)
 *
 * // Access geometry title
 * console.log(geometry.title)
 *
 * // Iterate over storage areas
 * for (const sa of geometry.storageAreas ?? []) {
 *   console.log(sa.name, sa.is2D)
 * }
 *
 * // Access river reaches
 * for (const river of geometry.rivers ?? []) {
 *   console.log(river.name)
 *   for (const reach of river.reaches ?? []) {
 *     console.log(`  ${reach.name}: ${reach.stations?.length} stations`)
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Extract cross section data
 * import { parseGeometry } from 'hecras-parser'
 *
 * const geometry = parseGeometry(content)
 *
 * const river = geometry.rivers?.[0]
 * const reach = river?.reaches?.[0]
 * const crossSection = reach?.stations?.[0]
 *
 * if (crossSection?.type === 1) { // Cross section type
 *   console.log('Station/Elevation pairs:', crossSection.stationElevation)
 *   console.log('Manning values:', crossSection.manning)
 * }
 * ```
 */
export function parseGeometry(content: string): Geometry {
  const normalized = content.replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")
  const { value } = parseWithSchema(geometrySchema, lines, 0)
  return value
}

/**
 * Serializes a geometry data structure back to HEC-RAS geometry file format.
 *
 * @param geometry - The geometry data structure to serialize
 * @param options - Serialization options (line endings, etc.)
 * @returns The serialized geometry file content as a string
 *
 * @remarks
 * The serializer preserves exact formatting for round-trip fidelity:
 * - Coordinate numbers are formatted to 16-character fixed width
 * - Station/elevation values use 8-character fixed width
 * - Blank values are preserved where they appeared in the original
 * - Section ordering matches HEC-RAS expectations
 *
 * @example
 * ```typescript
 * import { parseGeometry, serializeGeometry } from 'hecras-parser'
 *
 * const geometry = parseGeometry(originalContent)
 *
 * // Modify a storage area
 * const sa = geometry.storageAreas?.find(s => s.name === 'Reservoir')
 * if (sa) {
 *   sa.is2D = true
 * }
 *
 * // Serialize back
 * const output = serializeGeometry(geometry)
 * writeFileSync('modified.g01', output)
 * ```
 *
 * @example
 * ```typescript
 * // Verify round-trip fidelity
 * import { parseGeometry, serializeGeometry } from 'hecras-parser'
 *
 * const original = readFileSync('model.g01', 'utf-8')
 * const geometry = parseGeometry(original)
 * const serialized = serializeGeometry(geometry)
 *
 * // For fully-supported sections, serialized matches original
 * // (with \r\n line endings)
 * ```
 */
export function serializeGeometry(geometry: Geometry, options?: SerializeOptions): string {
  const lineEndings = options?.lineEndings ?? DEFAULT_LINE_ENDINGS
  const lines = serializeWithSchema(geometrySchema, geometry)
  return lines.join(lineEndings)
}
