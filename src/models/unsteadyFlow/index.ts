// Unsteady Flow (U-file) model interfaces extracted from BaldEagleDamBrk.u02
// Reference-only types describing parsed shapes; no implementation here.

export interface UnsteadyFlowDocument {
  // Header
  flowTitle: string
  programVersion: string
  useRestart: boolean // NEEDS REVIEW: source uses 0/(-1) or True/False variants

  // Boundary locations and associated simple settings encountered at top-level
  boundaryLocations: string[][] // value parsed as CSV columns (padded); 8 columns typical
  frictionSlopes: [number | null, number | null][] // from "Friction Slope=0.0003,0"

  // Inflow hydrograph section (Upstream Inflow)
  inflow?: {
    intervalSeconds?: number // e.g., Interval=1HOUR
    flowHydrograph?: number[] // values following "Flow Hydrograph=<count>"
    stageHydrographTWCheck?: boolean // NEEDS REVIEW: uses 0/-1 flag
    flowHydrographQMult?: number | null
    flowHydrographSlope?: number | null
    dssPath?: string
    useDSS?: boolean // NEEDS REVIEW: file uses True/False strings
    useFixedStartTime?: boolean // NEEDS REVIEW: file uses True/False strings
    fixedStartDateTime?: [string, string] | null // e.g., "," (date,time)
    isCriticalBoundary?: boolean // NEEDS REVIEW: file uses True/False strings
    criticalBoundaryFlow?: number | null
  }

  // Gate control time series (e.g., at Sayers Dam)
  gates?: Array<{
    boundaryLocation: string[] // CSV columns for the gate boundary location line
    gateName: string
    gateDSSPath?: string
    gateUseDSS?: boolean // NEEDS REVIEW: file uses True/False strings
    gateTimeIntervalSeconds?: number // e.g., Gate Time Interval=1HOUR
    gateUseFixedStartTime?: boolean // NEEDS REVIEW: file uses True/False strings
    gateFixedStartDateTime?: [string, string] | null
    gateOpenings?: number[] // values following "Gate Openings=<count>"
  }>

  // Meteorological boundary condition configuration (global)
  meteorology?: {
    precipitationMode?: string
    windMode?: string
    airDensityMode?: string
    metBC?: Array<{
      // Raw two-step KV form from lines like:
      // Met BC=Air Density|Constant Value=1.225
      // First parse: key "Met BC"; value "Air Density|Constant Value=1.225"
      // Second parse (NEEDS REVIEW for splitting on '|'):
      path: string // e.g., "Air Density|Constant Value"
      value: string // e.g., "1.225"
    }>
  }

  // Non-Newtonian and related rheology settings (global)
  rheology?: {
    nonNewtonianMethod?: number | null
    nonNewtonianConstantVolConc?: number | null
    nonNewtonianYieldMethod?: number | null
    nonNewtonianYieldCoef?: [number | null, number | null] | null
    userYeild?: number | null // Note: spelling as in source
    nonNewtonianSedVisc?: number | null
    nonNewtonianObrianB?: number | null
    userViscosity?: number | null
    userViscosityRatio?: number | null
    herschelBulkleyCoef?: [number | null, number | null] | null
    clasticMethod?: number | null
    voellmyPhi?: number | null
    nonNewtonianHinderedFV?: number | null
    nonNewtonianFVK?: number | null
    nonNewtonianDs?: number | null
    nonNewtonianMaxCv?: number | null
    nonNewtonianBulkingMethod?: number | null
    nonNewtonianHighCTransport?: number | null
  }
}
