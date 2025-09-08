export interface InitialFlowLocation {
  river: string
  reach: string
  station: number
  flow: number
}

export interface InitialStorageElevation {
  name: string
  elevation: number
}

export interface InitialRRRElevation {
  river: string
  reach: string
  station: number
  elevation: number
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

export interface Boundary {
  location: {
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
  }
  frictionSlope?: number[]
  interval?: string
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
  fixedStartDateTime?: string
  isCriticalBoundary?: boolean
  criticalBoundaryFlow?: string
  gates: Gate[]
  extra?: string[]
}

export interface UnsteadyFlow {
  flowTitle?: string
  programVersion?: string
  useRestart?: boolean
  restartFile?: string
  initialFlowLocations: InitialFlowLocation[]
  initialStorageElevations: InitialStorageElevation[]
  initialRRRElevations: InitialRRRElevation[]
  boundaries: Boundary[]
  metBC: string[]
  nonNewtonian: {
    method: number
    submethod: string
  }
  lava?: Record<string, string>
  otherLines?: Record<string, string>
  globalFlowHydrograph?: number[]
}
