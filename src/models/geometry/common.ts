/**
 * Common types used throughout HEC-RAS geometry files.
 *
 * @remarks
 * These types represent fundamental geometric and hydraulic data structures
 * that appear across multiple sections of HEC-RAS geometry files.
 *
 * @packageDocumentation
 */

/**
 * A coordinate pair representing a point in 2D space.
 *
 * @remarks
 * Used for geographic coordinates, polygon vertices, and other spatial data.
 * In HEC-RAS files, coordinates are typically stored as 16-character fixed-width values.
 *
 * @example
 * ```typescript
 * const point: Coordinate = [123456.789, 987654.321]
 * const [x, y] = point
 * ```
 */
export type Coordinate = [x: number, y: number]

/**
 * A point on a cross section defined by station (distance along the section) and elevation.
 *
 * @remarks
 * Station values increase from left to right when looking downstream.
 * Elevations are typically in feet or meters depending on the model units.
 *
 * @example
 * ```typescript
 * const point: StationElevationPoint = { station: 100.0, elevation: 525.5 }
 * ```
 */
export interface StationElevationPoint {
  /** Distance along the cross section from the left bank (when looking downstream) */
  station: number
  /** Vertical elevation at this station */
  elevation: number
}

/**
 * Manning's roughness coefficient segment for a cross section.
 *
 * @remarks
 * Defines the roughness (n-value) that applies from this station to the next segment.
 * Manning's n values typically range from 0.01 (smooth concrete) to 0.15+ (heavy brush).
 *
 * @example
 * ```typescript
 * const segment: ManningSegment = {
 *   station: 0,
 *   nValue: 0.035,  // Typical for natural channels
 *   unknownParameter: 0
 * }
 * ```
 */
export interface ManningSegment {
  /** Station where this roughness segment begins */
  station: number
  /** Manning's n roughness coefficient */
  nValue: number
  /** Additional parameter stored in HEC-RAS (purpose may vary by context) */
  unknownParameter: number
}

/**
 * A point on a storage area's elevation-volume curve.
 *
 * @remarks
 * Storage areas use these curves to define how volume (or area) changes with water surface elevation.
 * The curve is typically monotonically increasing.
 *
 * @example
 * ```typescript
 * const point: VolumeElevationPoint = {
 *   elevation: 100.0,
 *   volume: 50000  // acre-feet or cubic meters depending on units
 * }
 * ```
 */
export interface VolumeElevationPoint {
  /** Water surface elevation */
  elevation: number
  /** Storage volume (or area) at this elevation */
  volume: number
}

/**
 * Upstream and downstream station pair for ineffective flow areas or blocked obstructions.
 *
 * @remarks
 * Defines a range along a cross section. Null values indicate the parameter is not set.
 *
 * @example
 * ```typescript
 * const range: UpstreamDownstreamPair = {
 *   upstreamStation: 50,
 *   downstreamStation: 150
 * }
 * ```
 */
export interface UpstreamDownstreamPair {
  /** Starting station of the range (null if not defined) */
  upstreamStation: number | null
  /** Ending station of the range (null if not defined) */
  downstreamStation: number | null
}

/**
 * Tuple representing upstream station, downstream station, and elevation.
 *
 * @remarks
 * Used for features that span a station range at a specific elevation,
 * such as ineffective flow areas that activate above a certain water level.
 *
 * @example
 * ```typescript
 * const value: UpstreamDownstreamValue = [50, 150, 525.0]
 * const [upStn, downStn, elev] = value
 * ```
 */
export type UpstreamDownstreamValue = [
  upstreamStn: number,
  downstreamStn: number,
  elevation: number,
]

/**
 * A station-elevation pair as a tuple.
 *
 * @remarks
 * Compact representation of a point on a cross section.
 * Equivalent to {@link StationElevationPoint} but as an array.
 *
 * @example
 * ```typescript
 * const point: StationElevation = [100.0, 525.5]
 * const [station, elevation] = point
 * ```
 */
export type StationElevation = [station: number, elevation: number]

/**
 * A 2D coordinate as a tuple (alias for {@link Coordinate}).
 *
 * @remarks
 * Used interchangeably with Coordinate throughout the codebase.
 *
 * @example
 * ```typescript
 * const point: XY = [123456.789, 987654.321]
 * ```
 */
export type XY = [x: number, y: number]
