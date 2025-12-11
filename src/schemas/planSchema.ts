import {
  booleanField,
  durationField,
  fields,
  multiField,
  numberField,
  numberPart,
  repeat,
  schema,
  startsWith,
  stringField,
  stringPart,
  textBlockField,
  tupleField,
} from "../schema"
import { breachSchema } from "./plan/breachSchema"
import { unetD2AreaSchema } from "./plan/unetD2AreaSchema"

export const planSchema = schema([
  stringField("planTitle", "Plan Title=", { trim: true }),
  stringField("programVersion", "Program Version=", { trim: true }),
  stringField("shortIdentifier", "Short Identifier=", { length: 64, trim: true }),
  multiField(
    "Simulation Date=",
    fields({
      startDate: stringPart({ trim: true }),
      startTime: stringPart({ trim: true }),
      endDate: stringPart({ trim: true }),
      endTime: stringPart({ trim: true }),
    }),
  ),
  stringField("geometryFile", "Geom File=", { trim: true }),
  stringField("flowFile", "Flow File=", { trim: true, optional: true }),

  // FlowRegimeAndDefaults section
  stringField("flowRegime", "", { trim: true }), // "Subcritical Flow", "Supercritical Flow", or "Mixed Flow Regime"

  booleanField("kSumByGR", "K Sum by GR=", { pad: true, mode: "-1,0" }),
  numberField("stdStepTol", "Std Step Tol=", { pad: true }),
  numberField("criticalTol", "Critical Tol=", { pad: true }),
  numberField("numOfStdStepTrials", "Num of Std Step Trials=", { integer: true, pad: true }),
  numberField("maxErrorTol", "Max Error Tol=", { pad: true }),
  numberField("flowTolRatio", "Flow Tol Ratio=", { pad: true }),
  numberField("splitFlowNTrial", "Split Flow NTrial=", { integer: true, pad: true }),
  numberField("splitFlowTol", "Split Flow Tol=", { pad: true }),
  numberField("splitFlowRatio", "Split Flow Ratio=", { pad: true }),
  numberField("logOutputLevel", "Log Output Level=", { integer: true, pad: true }),
  numberField("frictionSlopeMethod", "Friction Slope Method=", { integer: true, pad: true }),
  numberField("unsteadyFrictionSlopeMethod", "Unsteady Friction Slope Method=", {
    integer: true,
    pad: true,
  }),
  numberField("unsteadyBridgesFrictionSlopeMethod", "Unsteady Bridges Friction Slope Method=", {
    integer: true,
    pad: true,
  }),

  stringField("parabolicCriticalDepth", "", { trim: true, optional: true }), // "Parabolic Critical Depth" if present

  // GlobalFlagsAndEncroachment section
  tupleField("globalVelDist", "Global Vel Dist=", [numberPart(), numberPart(), numberPart()]),
  numberField("globalLogLevel", "Global Log Level=", { integer: true, pad: true }),
  booleanField("checkData", "CheckData=", { mode: "trueFalse" }),
  tupleField("encroachParam", "Encroach Param=", [
    numberPart(),
    numberPart(),
    numberPart(),
    numberPart(),
  ]),

  // DescriptionBlock section (optional)
  textBlockField("description", "DESCRIPTION", { optional: true }),

  // IntervalsAndAdaptiveTimeStep section
  durationField("computationInterval", "Computation Interval="),
  durationField("outputInterval", "Output Interval="),
  durationField("instantaneousInterval", "Instantaneous Interval=", { optional: true }),
  durationField("mappingInterval", "Mapping Interval=", { optional: true }),

  // Computation Time Step (optional adaptive time stepping)
  numberField("computationTimeStepUseCourant", "Computation Time Step Use Courant=", {
    integer: true,
    width: 9,
    optional: true,
  }),
  numberField("computationTimeStepUseTimeSeries", "Computation Time Step Use Time Series=", {
    integer: true,
    width: 5,
    optional: true,
  }),
  numberField("computationTimeStepMaxCourant", "Computation Time Step Max Courant=", {
    nullOnBlank: true,
    optional: true,
  }),
  numberField("computationTimeStepMinCourant", "Computation Time Step Min Courant=", {
    nullOnBlank: true,
    optional: true,
  }),
  numberField("computationTimeStepCountToDouble", "Computation Time Step Count To Double=", {
    integer: true,
    optional: true,
  }),
  numberField("computationTimeStepMaxDoubling", "Computation Time Step Max Doubling=", {
    integer: true,
    optional: true,
  }),
  numberField("computationTimeStepMaxHalving", "Computation Time Step Max Halving=", {
    integer: true,
    optional: true,
  }),
  numberField("computationTimeStepResidenceCourant", "Computation Time Step Residence Courant=", {
    integer: true,
    optional: true,
  }),

  // Run flags
  numberField("runHTab", "Run HTab=", { integer: true, pad: true }),
  numberField("runUNet", "Run UNet=", { integer: true, pad: true }),
  numberField("runSediment", "Run Sediment=", { integer: true, pad: true }),
  numberField("runPostProcess", "Run PostProcess=", { integer: true, pad: true }),
  numberField("runWQNet", "Run WQNet=", { integer: true, pad: true }),
  numberField("runRASMapper", "Run RASMapper=", { integer: true, pad: true }),

  // UNET parameters
  numberField("unetTheta", "UNET Theta=", { pad: true }),
  numberField("unetThetaWarmup", "UNET Theta Warmup=", { pad: true }),
  numberField("unetZTol", "UNET ZTol=", { pad: true }),
  numberField("unetZSATol", "UNET ZSATol=", { pad: true }),
  numberField("unetQTol", "UNET QTol=", { pad: true, nullOnBlank: true }),
  numberField("unetMxIter", "UNET MxIter=", { integer: true, pad: true }),
  numberField("unetMaxIterWOImprovement", "UNET Max Iter WO Improvement=", {
    integer: true,
    pad: true,
  }),
  numberField("unetMaxInSteps", "UNET MaxInSteps=", { integer: true, pad: true }),
  numberField("unetDtIC", "UNET DtIC=", { pad: true }),
  numberField("unetDtMin", "UNET DtMin=", { pad: true }),
  numberField("unetMaxCRTS", "UNET MaxCRTS=", { integer: true, pad: true }),
  numberField("unetWFStab", "UNET WFStab=", { integer: true, pad: true }),
  numberField("unetSFStab", "UNET SFStab=", { integer: true, pad: true }),
  numberField("unetWFX", "UNET WFX=", { integer: true, pad: true }),
  numberField("unetSFX", "UNET SFX=", { integer: true, pad: true }),
  stringField("unet1DMethodology", "UNET 1D Methodology=", { trim: true, optional: true }),
  numberField("unetDSSMLevel", "UNET DSS MLevel=", { integer: true, pad: true }),
  numberField("unetPardiso", "UNET Pardiso=", { integer: true }),
  numberField("unetDZMaxAbort", "UNET DZMax Abort=", { pad: true }),
  numberField("unetUseExistingIBTables", "UNET Use Existing IB Tables=", {
    integer: true,
    pad: true,
  }),
  booleanField("unetFroudeReduction", "UNET Froude Reduction=", { mode: "trueFalse" }),
  numberField("unetFroudeLimit", "UNET Froude Limit=", { pad: true }),
  numberField("unetFroudePower", "UNET Froude Power=", { pad: true }),
  tupleField("unetTimeSlicing", "UNET Time Slicing=", [numberPart(), numberPart(), numberPart({ pad: true })], {
    optional: true,
  }),
  numberField("unetD1Cores", "UNET D1 Cores=", { integer: true, pad: true }),
  stringField("unetWindReference", "UNET WindReference=", { trim: true, optional: true }),
  stringField("unetWindDragFormulation", "UNET WindDragFormulation=", { trim: true, optional: true }),

  // UNET D2 Global Settings
  numberField("unetD2Coriolis", "UNET D2 Coriolis=", { integer: true }),
  numberField("unetD2Cores", "UNET D2 Cores=", { integer: true, pad: true }),
  numberField("unetD2Theta", "UNET D2 Theta=", { pad: true }),
  numberField("unetD2ThetaWarmup", "UNET D2 Theta Warmup=", { pad: true }),
  numberField("unetD2ZTol", "UNET D2 Z Tol=", { pad: true }),
  numberField("unetD2VolumeTol", "UNET D2 Volume Tol=", { pad: true }),
  numberField("unetD2MaxIterations", "UNET D2 Max Iterations=", { integer: true, pad: true }),
  numberField("unetD2Equation", "UNET D2 Equation=", { integer: true, pad: true }),
  numberField("unetD2TotalICTime", "UNET D2 TotalICTime=", { nullOnBlank: true }),
  numberField("unetD2RampUpFraction", "UNET D2 RampUpFraction=", {}),
  numberField("unetD2TimeSlices", "UNET D2 TimeSlices=", { integer: true, pad: true }),
  numberField("unetD2EddyViscosity", "UNET D2 Eddy Viscosity=", { nullOnBlank: true }),
  numberField("unetD2TransverseEddyViscosity", "UNET D2 Transverse Eddy Viscosity=", {
    nullOnBlank: true,
    optional: true,
  }),
  numberField("unetD2SmagorinskyMixing", "UNET D2 Smagorinsky Mixing=", { nullOnBlank: true, optional: true }),
  numberField("unetD2BCVolumeCheck", "UNET D2 BCVolumeCheck=", { integer: true }),
  numberField("unetD2Latitude", "UNET D2 Latitude=", { nullOnBlank: true }),
  numberField("unetD2Cores2", "UNET D2 Cores=", { integer: true, optional: true }),
  stringField("unetD2SolverType", "UNET D2 SolverType=", { trim: true, optional: true }),

  // UNET D2 Flow Areas (repeating, area-specific settings)
  repeat("unetD2FlowAreas", startsWith("UNET D2 Name="), unetD2AreaSchema),

  // UNET D1D2 coupling parameters
  numberField("unetD1D2MaxIter", "UNET D1D2 MaxIter=", { integer: true, pad: true }),
  numberField("unetD1D2ZTol", "UNET D1D2 ZTol=", {}),
  numberField("unetD1D2QTol", "UNET D1D2 QTol=", {}),
  numberField("unetD1D2MinQTol", "UNET D1D2 MinQTol=", { nullOnBlank: true }),

  // File and output settings
  stringField("dssFile", "DSS File=", { trim: true }),
  numberField("writeICFile", "Write IC File=", { integer: true, pad: true }),
  numberField("writeICFileAtFixedDateTime", "Write IC File at Fixed DateTime=", { integer: true }),
  multiField("IC Time=", fields({ icTime1: stringPart(), icTime2: stringPart(), icTime3: stringPart() })),
  numberField("writeICFileReoccurance", "Write IC File Reoccurance=", { nullOnBlank: true }),
  numberField("writeICFileAtSimEnd", "Write IC File at Sim End=", { integer: true }),
  booleanField("echoInput", "Echo Input=", { mode: "trueFalse" }),
  booleanField("echoParameters", "Echo Parameters=", { mode: "trueFalse" }),
  booleanField("echoOutput", "Echo Output=", { mode: "trueFalse" }),
  numberField("writeDetailed", "Write Detailed=", { integer: true, pad: true }),
  numberField("hdfWriteWarmup", "HDF Write Warmup=", { integer: true }),
  numberField("hdfWriteTimeSlices", "HDF Write Time Slices=", { integer: true }),
  numberField("hdfFlush", "HDF Flush=", { integer: true }),
  numberField("hdfCellDepths", "HDF Cell Depths=", { integer: true, optional: true }),
  numberField("hdfCellVelocity", "HDF Cell Velocity=", { integer: true, optional: true }),
  numberField("hdfCellNetInflow", "HDF Cell Net Inflow=", { integer: true, optional: true }),
  numberField("hdfEddyViscosity", "HDF Eddy Viscosity=", { integer: true, optional: true }),
  numberField("hdfFaceFlow", "HDF Face Flow=", { integer: true, optional: true }),
  numberField("hdfFaceWSEL", "HDF Face WSEL=", { integer: true, optional: true }),
  numberField("hdfFaceTangentialVelocity", "HDF Face Tangential Velocity=", { integer: true, optional: true }),
  numberField("hdfFaceShearStress", "HDF Face Shear Stress=", { integer: true, optional: true }),
  numberField("hdfFaceNodeVelocities", "HDF Face Node Velocities=", { integer: true }),
  numberField("hdfCompression", "HDF Compression=", { integer: true, pad: true }),
  numberField("hdfChunkSize", "HDF Chunk Size=", { integer: true, pad: true }),
  numberField("hdfSpatialParts", "HDF Spatial Parts=", { integer: true, pad: true }),
  numberField("hdfUseMaxRows", "HDF Use Max Rows=", { integer: true }),
  numberField("hdfFixedRows", "HDF Fixed Rows=", { integer: true, pad: true }),

  // Breach parameters (repeating)
  repeat("breaches", startsWith("Breach Loc="), breachSchema),

  // Calibration parameters
  numberField("calibrationMethod", "Calibration Method=", { integer: true, pad: true }),
  numberField("calibrationIterations", "Calibration Iterations=", { integer: true, pad: true }),
  numberField("calibrationMaxChange", "Calibration Max Change=", {}),
  numberField("calibrationTolerance", "Calibration Tolerance=", {}),
  numberField("calibrationMaximum", "Calibration Maximum=", {}),
  numberField("calibrationMinimum", "Calibration Minimum=", {}),
  numberField("calibrationOptimizationMethod", "Calibration Optimization Method=", { integer: true, pad: true }),
  multiField(
    "Calibration Window=",
    fields({
      calibrationWindow1: stringPart({ trim: true }),
      calibrationWindow2: stringPart({ trim: true }),
      calibrationWindow3: stringPart({ trim: true }),
      calibrationWindow4: stringPart({ trim: true }),
    }),
  ),

  // Water Quality parameters
  stringField("wqADNonConservative", "WQ AD Non Conservative", { trim: true }),
  numberField("wqULTIMATE", "WQ ULTIMATE=", { integer: true }),
  durationField("wqMaxCompStep", "WQ Max Comp Step="),
  durationField("wqOutputInterval", "WQ Output Interval="),
  numberField("wqOutputSelectedIncrements", "WQ Output Selected Increments=", { integer: true, pad: true }),
  numberField("wqOutputFaceFlow", "WQ Output face flow=", { integer: true }),
  numberField("wqOutputFaceVelocity", "WQ Output face velocity=", { integer: true }),
  numberField("wqOutputFaceArea", "WQ Output face area=", { integer: true }),
  numberField("wqOutputFaceDispersion", "WQ Output face dispersion=", { integer: true }),
  numberField("wqOutputCellVolume", "WQ Output cell volume=", { integer: true }),
  numberField("wqOutputCellSurfaceArea", "WQ Output cell surface area=", { integer: true }),
  numberField("wqOutputCellContinuity", "WQ Output cell continuity=", { integer: true }),
  numberField("wqOutputCumulativeCellContinuity", "WQ Output cumulative cell continuity=", { integer: true }),
  numberField("wqOutputFaceConc", "WQ Output face conc=", { integer: true }),
  numberField("wqOutputFaceDconcDx", "WQ Output face dconc_dx=", { integer: true }),
  numberField("wqOutputFaceCourant", "WQ Output face courant=", { integer: true }),
  numberField("wqOutputFacePeclet", "WQ Output face peclet=", { integer: true }),
  numberField("wqOutputFaceAdvMass", "WQ Output face adv mass=", { integer: true }),
  numberField("wqOutputFaceDispMass", "WQ Output face disp mass=", { integer: true }),
  numberField("wqOutputCellMass", "WQ Output cell mass=", { integer: true }),
  numberField("wqOutputCellSourceSinkTemp", "WQ Output cell source sink temp=", { integer: true }),
  numberField("wqOutputNsmPathways", "WQ Output nsm pathways=", { integer: true }),
  numberField("wqOutputNsmDerivedPathways", "WQ Output nsm derived pathways=", { integer: true }),
  numberField("wqOutputMaxMinRange", "WQ Output MaxMinRange=", { integer: true, optional: true }),
  numberField("wqDailyMaxMinMean", "WQ Daily Max Min Mean=", { integer: true, optional: true }),
  numberField("wqDailyRange", "WQ Daily Range=", { integer: true, optional: true }),
  numberField("wqDailyTime", "WQ Daily Time=", { integer: true, optional: true }),

  // WQ Restart and Temperature
  numberField("wqCreateRestart", "WQ Create Restart=", { integer: true }),
  numberField("wqFixedRestart", "WQ Fixed Restart=", { integer: true }),
  numberField("wqRestartSimtime", "WQ Restart Simtime=", { nullOnBlank: true }),
  numberField("wqRestartDate", "WQ Restart Date=", { nullOnBlank: true }),
  numberField("wqRestartHour", "WQ Restart Hour=", { nullOnBlank: true }),
  numberField("wqSystemSummary", "WQ System Summary=", { integer: true }),
  numberField("wqWriteToDSS", "WQ Write To DSS=", { integer: true }),
  numberField("wqUseFixedTemperature", "WQ Use Fixed Temperature=", { integer: true, optional: true }),
  numberField("wqFixedTemperature", "WQ Fixed Temperature=", { nullOnBlank: true, optional: true }),

  // Sediment Sorting and Armoring
  numberField("sortingAndArmoringIterations", "Sorting and Armoring Iterations=", { integer: true, pad: true }),
  numberField("xsUpdateThreshold", "XS Update Threshold=", { pad: true }),
  numberField("bedRoughnessPredictor", "Bed Roughness Predictor=", { integer: true, pad: true }),
  numberField("hydraulicsUpdateThreshold", "Hydraulics Update Threshold=", { pad: true }),
  numberField("energySlopeMethod", "Energy Slope Method=", { integer: true, pad: true }),
  numberField("volumeChangeMethod", "Volume Change Method=", { integer: true, pad: true }),
  numberField("sedimentRetentionMethod", "Sediment Retention Method=", { integer: true, pad: true }),
  numberField("sedimentTSMultiplier", "Sediment TS Multiplier=", { pad: true, optional: true }),
  numberField("warmUpMethod", "Warm Up Method=", { integer: true, pad: true, optional: true }),
  numberField("warmUpDuration", "Warm Up Duration=", { nullOnBlank: true, optional: true }),
  numberField("xsWeightingMethod", "XS Weighting Method=", { integer: true, pad: true }),
  numberField("numberOfUSWeightedCrossSections", "Number of US Weighted Cross Sections=", {
    integer: true,
    pad: true,
  }),
  numberField("numberOfDSWeightedCrossSections", "Number of DS Weighted Cross Sections=", {
    integer: true,
    pad: true,
  }),

  // Sediment Weighting
  numberField("upstreamXSWeight", "Upstream XS Weight=", {}),
  numberField("mainXSWeight", "Main XS Weight=", {}),
  numberField("downstreamXSWeight", "Downstream XS Weight=", {}),
  numberField("numberOfDSXSsWeightedWithUSBoundary", "Number of DS XS's Weighted with US Boundary=", {
    integer: true,
    pad: true,
  }),
  numberField("upstreamBoundaryWeight", "Upstream Boundary Weight=", { pad: true }),
  numberField("weightOfXSsAssociatedWithUSBoundary", "Weight of XSs Associated with US Boundary=", {
    integer: true,
    pad: true,
  }),
  numberField("numberOfUSXSsWeightedWithDSBoundary", "Number of US XS's Weighted with DS Boundary=", {
    integer: true,
    pad: true,
  }),
  numberField("downstreamBoundaryWeight", "Downstream Boundary Weight=", { pad: true }),
  numberField("weightOfXSsAssociatedWithDSBoundary", "Weight of XSs Associated with DS Boundary=", { pad: true }),

  // Sediment Output and File Settings
  numberField("percentileMethod", "Percentile Method=", { integer: true, pad: true }),
  numberField("sedimentOutputLevel", "Sediment Output Level=", { integer: true, pad: true }),
  numberField("massOrVolumeOutput", "Mass or Volume Output=", { integer: true, pad: true }),
  numberField("outputIncrementType", "Output Increment Type=", { integer: true, pad: true }),
  numberField("profileAndTSOutputIncrement", "Profile and TS Output Increment=", { integer: true, pad: true }),
  numberField("xsOutputFlag", "XS Output Flag=", { integer: true, pad: true }),
  numberField("xsOutputIncrement", "XS Output Increment=", { integer: true, pad: true }),
  numberField("readHDF5SedimentHotstart", "Read HDF5 Sediment Hotstart=", {
    integer: true,
    pad: true,
    optional: true,
  }),
  numberField("sedimentHotstartType", "Sediment Hotstart Type=", { integer: true, pad: true, optional: true }),
  stringField("sedimentHotstartFile", "Sediment Hotstart File=", { trim: true, optional: true }),
  stringField("sedimentHotstartDate", "Sediment Hotstart Date=", { trim: true, optional: true }),
  stringField("sedimentHotstartTime", "Sediment Hotstart Time=", { trim: true, optional: true }),
  numberField("writeGradationFile", "Write Gradation File=", { integer: true, pad: true }),
  numberField("readGradationHotstart", "Read Gradation Hotstart=", { integer: true, pad: true }),
  stringField("gradationFileName", "Gradation File Name=", { trim: true }),
  numberField("writeHDF5File", "Write HDF5 File=", { integer: true, pad: true }),
  numberField("writeBinaryOutput", "Write Binary Output=", { integer: true, pad: true, optional: true }),
  numberField("writeDSSSedimentFile", "Write DSS Sediment File=", { integer: true, pad: true }),
  numberField("dssSedimentOutputType", "DSS Sediment Output Type=", { integer: true, pad: true, optional: true }),
  numberField("svCurve", "SV Curve=", { integer: true, pad: true }),
  numberField("specificGageFlag", "Specific Gage Flag=", { integer: true, pad: true }),
  numberField("subcellErosionMethods", "Subcell Erosion Methods=", { integer: true, pad: true, optional: true }),
  numberField("subcellDepositionMethods", "Subcell Deposition Methods=", { integer: true, pad: true, optional: true }),
  numberField("advectionScheme", "Advection Scheme=", { integer: true, pad: true, optional: true }),
  numberField("matrixSolver", "Matrix Solver=", { integer: true, pad: true, optional: true }),
  numberField("implicitWeightingFactor", "Implicit Weighting Factor=", { pad: true, optional: true }),
  numberField("convergenceMaximumAbsolute", "Convergence Maximum Absolute=", { pad: true, optional: true }),
  numberField("convergenceRMSE", "Convergence RMSE=", { pad: true, optional: true }),

  // Extra Computation Commands (repeating, optional)
  repeat(
    "extraComputationCommands",
    startsWith("Extra Computation Commands="),
    schema([stringField("command", "Extra Computation Commands=", { trim: true })]),
  ),
])
