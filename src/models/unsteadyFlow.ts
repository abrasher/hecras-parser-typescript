import type { DateTime } from "./common"

export interface InitialFlowLocation {
  river: string
  reach: string
  station: number
  flow: number
}

export interface InitialStorageElevation {
  /**
   * Name of SA, IC Point or 2D Area
   */
  name: string
  elevation: number
  fixedDuringWarmup: boolean
}

export interface InitialRRRElevation {
  river: string
  reach: string
  station: number
  elevation: number
}

export interface UnparsedLine {
  index: number
  content: string
}

export interface Gate {
  name: string
  dssPath?: string
  useDSS?: boolean
  timeInterval?: string
  useFixedStartTime?: boolean
  fixedStartDateTime?: string
  openings: number[]
}

export interface BoundaryCondition {
  /**
   * Fixed Length of 16
   */
  river: string
  /**
   * Fixed Length of 16
   */
  reach: string
  station: number
  /**
   * Fixed Length of 8
   */
  param1: string
  /**
   * Fixed Length of 16
   */
  param2: string
  /**
   * Fixed Length of 16
   */
  param3: string
  /**
   * Fixed Length of 16
   */
  param4: string
  /**
   * Fixed Length of 32
   */
  param5: string
  /**
   * Fixed Length of 32
   */
  param6: string
  frictionSlope?: number[]
  interval?: number
  flowHydrograph?: number[]
  flowHydrographQMult?: number
  flowHydrographSlope?: number
  flowHydrographQMin?: number
  lateralInflowHydrograph?: number[]
  uniformLateralInflowHydrograph?: number[]
  stageHydrographTWCheck?: boolean
  dssFile?: string
  dssPath?: string
  useDSS?: boolean
  useFixedStartTime?: boolean
  fixedStartDateTime?: DateTime
  isCriticalBoundary?: boolean
  criticalBoundaryFlow?: string
  gates?: Gate[]
}

export interface UnsteadyFlow {
  flowTitle?: string
  programVersion?: string
  useRestart?: boolean
  restartFile?: string
  initialFlowLocations: InitialFlowLocation[]
  initialStorageElevations: InitialStorageElevation[]
  initialRRRElevations: InitialRRRElevation[]
  boundaries: BoundaryCondition[]
  metBC: string[]

  lava?: Record<string, string>
  unparsedLines?: UnparsedLine[]
  globalFlowHydrograph?: number[]
  // nonNewtonian: {
  //   method: number
  //   submethod: string
  // }
}
