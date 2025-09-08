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
  unparsedLines?: UnparsedLine[]
}

export interface Boundary {
  location: string[]
  frictionSlope?: number[]
  interval?: string
  flowHydrograph?: number[]
  flowHydrographQMult?: number
  flowHydrographSlope?: number
  flowHydrographQMin?: number
  lateralInflowHydrograph?: number[]
  uniformLateralInflowHydrograph?: number[]
  stageHydrographTWCheck?: number
  dssFile?: string
  dssPath?: string
  useDSS?: boolean
  useFixedStartTime?: boolean
  fixedStartDateTime?: string
  isCriticalBoundary?: boolean
  criticalBoundaryFlow?: string
  gates: Gate[]
  unparsedLines?: UnparsedLine[]
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
  nonNewtonian: Record<string, string>
  lava?: Record<string, string>
  unparsedLines?: UnparsedLine[]
  globalFlowHydrograph?: number[]
}
