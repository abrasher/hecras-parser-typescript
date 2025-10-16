// TypeScript interfaces for HEC-RAS Plan file (.pXX) format

/**
 * Simulation date/time information
 */
export interface SimulationTimeWindow {
  /**
   * Format is DDMMMYYYY (e.g., 01JAN2020)
   */
  startDate: string
  /**
   * Format is HHMM (e.g., 1300 for 1:00 PM)
   */
  startTime: string
  /**
   * Format is DDMMMYYYY (e.g., 01JAN2020)
   */
  endDate: string
  /**
   * Format is HHMM (e.g., 1300 for 1:00 PM)
   */
  endTime: string
}

/**
 * Computation time step configuration
 */
export interface ComputationTimeStep {
  useCourant: boolean
  useTimeSeries: boolean
  maxCourant?: number
  minCourant?: number
  countToDouble: number
  maxDoubling: number
  maxHalving: number
  residenceCourant: number
}

/**
 * Flow tolerances and iteration settings
 */
export interface FlowSettings {
  subcriticalFlow: boolean
  kSumByGR: number
  stdStepTol: number
  criticalTol: number
  numStdStepTrials: number
  maxErrorTol: number
  flowTolRatio: number
  splitFlowNTrial: number
  splitFlowTol: number
  splitFlowRatio: number
}

/**
 * UNET solver configuration
 */
export interface UnetSettings {
  theta: number
  thetaWarmup: number
  zTol: number
  zSATol: number
  qTol?: number
  maxIter: number
  maxIterWOImprovement: number
  maxInSteps: number
  dtIC: number
  dtMin: number
  maxCRTS: number
  wfStab: number
  sfStab: number
  wfX: number
  sfX: number
  methodology: string
  dssMLevel: number
  pardiso: boolean
  dzMaxAbort: number
  useExistingIBTables: boolean
  froudeReduction: boolean
  froudeLimit: number
  froudePower: number
  d1Cores: number
  windReference: string
  windDragFormulation: string
}

/**
 * 2D area-specific settings
 */
export interface UnetD2Settings {
  name: string
  coriolis: boolean
  cores: number
  theta: number
  thetaWarmup: number
  zTol: number
  volumeTol: number
  maxIterations: number
  equation: number
  totalICTime?: number
  rampUpFraction: number
  timeSlices: number
  eddyViscosity?: number
  transverseEddyViscosity?: number
  smagorinskyMixing?: number
  bcVolumeCheck: boolean
  latitude?: number
  solverType: string
}

/**
 * D1D2 coupling settings
 */
export interface UnetD1D2Settings {
  maxIter: number
  zTol: number
  qTol: number
  minQTol?: number
}

/**
 * Stage flow hydrograph location
 */
export interface StageFlowHydrograph {
  riverName: string
  reachName: string
  station: number
}

/**
 * Breach progression data point
 */
export interface BreachProgressionPoint {
  time: number
  fraction: number
}

/**
 * Physical breach parameters (simplified method)
 */
export interface PhysicalBreachParams {
  time: number
  multiplier: number
}

/**
 * Breach geometry configuration
 */
export interface BreachGeometry {
  finalBottomWidth: number
  leftSideSlope: number
  rightSideSlope: number
  bottomWidth: number
  topWidth: number
  developableWidth: boolean
  weirCoefficient: number
  finalBottomElevation?: number
  leftSlope: number
  rightSlope: number
}

/**
 * Breach starting conditions
 */
export interface BreachStart {
  triggerByTime: boolean
  triggerElevation: number
  triggerConditions?: string[]
  piping: boolean
  pipingConditions?: string[]
  failureMode: number
}

/**
 * DL Breach (Dam/Levee Breach) settings
 */
export interface DLBreachSettings {
  methods: [number, number]
  soilType: number
  coreSoilType: number
  coverOption: number
  breachDirection: number
}

/**
 * Breach calculator data
 */
export interface BreachCalculatorData {
  reservoirElevation: number
  damHeight: number
  reservoirLength: number
  reservoirWidth: number
  finalBottomElevation: number
  triggerElevation: number
  volume: number
  soilType: number
  vegetationDensity: number
  headcutMigration: number
  plasticityIndex: number
}

/**
 * Dam/Levee breach configuration
 */
export interface BreachLocation {
  riverName: string
  reachName: string
  station: number
  enabled: boolean
  description: string
  method: number
  geometry: BreachGeometry
  start: BreachStart
  progression: BreachProgressionPoint[]
  physicalDowncutting: PhysicalBreachParams[]
  physicalWidening: PhysicalBreachParams[]
  startingNotchDepth?: number
  massWastingOptions: number
  useUserDefinedGrowthRatio: boolean
  userDefinedGrowthRatio: number
  calculatorData?: BreachCalculatorData
  dlBreachSettings: DLBreachSettings
}

/**
 * Calibration settings
 */
export interface CalibrationSettings {
  method: number
  iterations: number
  maxChange: number
  tolerance: number
  maximum: number
  minimum: number
  optimizationMethod: number
  window?: [string, string, string, string]
}

/**
 * Water Quality settings
 */
export interface WaterQualitySettings {
  adNonConservative: boolean
  ultimate: boolean
  maxCompStep: string
  outputInterval: string
  outputSelectedIncrements: boolean
  outputFlags: {
    faceFlow: boolean
    faceVelocity: boolean
    faceArea: boolean
    faceDispersion: boolean
    cellVolume: boolean
    cellSurfaceArea: boolean
    cellContinuity: boolean
    cumulativeCellContinuity: boolean
    faceConc: boolean
    faceDconcDx: boolean
    faceCourant: boolean
    facePeclet: boolean
    faceAdvMass: boolean
    faceDispMass: boolean
    cellMass: boolean
    cellSourceSinkTemp: boolean
    nsmPathways: boolean
    nsmDerivedPathways: boolean
  }
  createRestart: boolean
  fixedRestart: boolean
  restartSimtime?: string
  restartDate?: string
  restartHour?: string
  systemSummary: boolean
  writeToDSS: boolean
}

/**
 * HDF output settings
 */
export interface HDFSettings {
  writeWarmup: boolean
  writeTimeSlices: boolean
  flush: boolean
  cellDepths: boolean
  cellVelocity: boolean
  cellNetInflow: boolean
  eddyViscosity: boolean
  faceFlow: boolean
  faceWSEL: boolean
  faceTangentialVelocity: boolean
  faceShearStress: boolean
  faceNodeVelocities: boolean
  compression: number
  chunkSize: number
  spatialParts: number
  useMaxRows: boolean
  fixedRows: number
}

/**
 * Sediment transport settings
 */
export interface SedimentSettings {
  sortingAndArmoringIterations: number
  xsUpdateThreshold: number
  bedRoughnessPredictor: number
  hydraulicsUpdateThreshold: number
  energySlopeMethod: number
  volumeChangeMethod: number
  sedimentRetentionMethod: number
  sedimentTSMultiplier: number
  warmUpMethod: number
  warmUpDuration?: string
  xsWeightingMethod: number
  numberOfUSWeightedCrossSections: number
  numberOfDSWeightedCrossSections: number
  upstreamXSWeight: number
  mainXSWeight: number
  downstreamXSWeight: number
  numberOfDSXSWeightedWithUSBoundary: number
  upstreamBoundaryWeight: number
  weightOfXSsAssociatedWithUSBoundary: number
  numberOfUSXSWeightedWithDSBoundary: number
  downstreamBoundaryWeight: number
  weightOfXSsAssociatedWithDSBoundary: number
  percentileMethod: number
  sedimentOutputLevel: number
  massOrVolumeOutput: number
  outputIncrementType: number
  profileAndTSOutputIncrement: number
  transportOutputIncrement: number
  xsOutputFlag: number
  xsOutputIncrement: number
  readHDF5SedimentHotstart: boolean
  sedimentHotstartType: number
  sedimentHotstartFile?: string
  sedimentHotstartDate?: string
  sedimentHotstartTime?: string
  writeGradationFile: boolean
  readGradationHotstart: boolean
  gradationFileName?: string
  writeHDF5File: boolean
  writeBinaryOutput: boolean
  writeDSSSedimentFile: boolean
  dssSedimentOutputType: number
  svCurve: number
  specificGageFlag: number
  subcellErosionMethods: number
  subcellDepositionMethods: number
  advectionScheme: number
  matrixSolver: number
  implicitWeightingFactor: number
  convergenceMaximumAbsolute: number
  convergenceRMSE: number
  maxSubgridRegions: number
  maxSubgridLengthScale: number
  initialLayerThickness: number
  minLayerThickness: number
  maxLayerThickness: number
  numberOfLayers: number
}

/**
 * Main HEC-RAS Plan configuration
 */
export interface HECRASPlan {
  /**
   * Title of the plan
   * Max 40 characters
   */
  title: string
  version: string
  /**
   * Short identifier
   * Max 64 characters
   */
  shortIdentifier: string
  simulationDate: SimulationTimeWindow
  geomFile: string
  flowFile: string
  dssFile?: string
  description?: string

  // Flow and computation settings
  flowSettings: FlowSettings
  computationTimeStep: ComputationTimeStep

  /**
   * Computation interval in seconds
   */
  computationInterval: number

  /**
   * Output interval in seconds
   */
  outputInterval: number

  /**
   * Instantaneous interval in seconds
   */
  instantaneousInterval: number

  /**
   * Mapping interval in seconds
   */
  mappingInterval: number

  // Run flags
  runFlags: {
    hTab: boolean
    uNet: boolean
    sediment: boolean
    postProcess: boolean
    wqNet: boolean
    rasMapper: boolean
  }

  // Solver settings
  unetSettings: UnetSettings
  unetD2Areas: UnetD2Settings[]
  unetD1D2Settings: UnetD1D2Settings

  // Output settings
  stageFlowHydrographs: StageFlowHydrograph[]
  hdfSettings: HDFSettings

  // Advanced settings
  breachLocations: BreachLocation[]
  calibrationSettings: CalibrationSettings
  waterQualitySettings: WaterQualitySettings
  sedimentSettings: SedimentSettings

  // Output control
  writeICFile: boolean
  writeICFileAtFixedDateTime: boolean
  icTime?: [string, string, string]
  writeICFileReoccurrence?: string
  writeICFileAtSimEnd: boolean
  echoInput: boolean
  echoParameters: boolean
  echoOutput: boolean
  writeDetailed: boolean

  // Global settings
  parabolicCriticalDepth: boolean
  globalVelDist: [number, number, number]
  globalLogLevel: number
  checkData: boolean
  encroachParam: [number, number, number, number]
  logOutputLevel: number
  frictionSlopeMethod: number
  unsteadyFrictionSlopeMethod: number
  unsteadyBridgesFrictionSlopeMethod: number
}
