import type { Coordinate } from "./common"

/**
 * BreakLine geometry for 2D mesh generation in HEC-RAS
 * BreakLines are used to force mesh edges along important features like channels, levees, etc.
 */
export interface BreakLine {
  /** BreakLine identifier/name (e.g., "BL-42") */
  name: string

  /** Minimum cell size along the BreakLine */
  cellSizeMin: number

  /** Maximum cell size along the BreakLine (optional) */
  cellSizeMax: number | null

  /** Near repeats tolerance (typically 0) */
  nearRepeats: number

  /** Protection radius for mesh generation */
  protectionRadius: number

  /** Array of coordinate points defining the BreakLine polyline */
  polylinePoints: Coordinate[]
}
