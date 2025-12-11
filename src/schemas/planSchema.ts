import {
  booleanField,
  durationField,
  fields,
  multiField,
  numberField,
  numberPart,
  schema,
  stringField,
  stringPart,
  textBlockField,
  tupleField,
} from "../schema"

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
  tupleField("unetTimeSlicing", "UNET Time Slicing=", [
    numberPart(),
    numberPart(),
    numberPart({ pad: true }),
  ]),
  numberField("unetD1Cores", "UNET D1 Cores=", { integer: true, pad: true }),
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
  numberField("unetD2BCVolumeCheck", "UNET D2 BCVolumeCheck=", { integer: true }),
  numberField("unetD2Latitude", "UNET D2 Latitude=", { nullOnBlank: true }),
  stringField("unetD2Name", "UNET D2 Name=", { length: 16, trim: true }),

  // Second UNET D2 area (repeating fields)
  numberField("unetD2Theta2", "UNET D2 Theta=", { pad: true }),
  numberField("unetD2ThetaWarmup2", "UNET D2 Theta Warmup=", { pad: true }),
  numberField("unetD2ZTol2", "UNET D2 Z Tol=", { pad: true }),
  numberField("unetD2VolumeTol2", "UNET D2 Volume Tol=", { pad: true }),
  numberField("unetD2MaxIterations2", "UNET D2 Max Iterations=", { integer: true, pad: true }),
  numberField("unetD2Equation2", "UNET D2 Equation=", { integer: true, pad: true }),
  numberField("unetD2TotalICTime2", "UNET D2 TotalICTime=", {}),
  numberField("unetD2RampUpFraction2", "UNET D2 RampUpFraction=", {}),
  numberField("unetD2TimeSlices2", "UNET D2 TimeSlices=", { integer: true, pad: true }),
  numberField("unetD2EddyViscosity2", "UNET D2 Eddy Viscosity=", { nullOnBlank: true }),
  numberField("unetD2BCVolumeCheck2", "UNET D2 BCVolumeCheck=", { integer: true }),
  numberField("unetD2Latitude2", "UNET D2 Latitude=", { nullOnBlank: true }),

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
])
