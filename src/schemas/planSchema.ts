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

  numberField("kSumByGR", "K Sum by GR=", { integer: true }),
  numberField("stdStepTol", "Std Step Tol="),
  numberField("criticalTol", "Critical Tol="),
  numberField("numOfStdStepTrials", "Num of Std Step Trials=", { integer: true }),
  numberField("maxErrorTol", "Max Error Tol="),
  numberField("flowTolRatio", "Flow Tol Ratio="),
  numberField("splitFlowNTrial", "Split Flow NTrial=", { integer: true }),
  numberField("splitFlowTol", "Split Flow Tol="),
  numberField("splitFlowRatio", "Split Flow Ratio="),
  numberField("logOutputLevel", "Log Output Level=", { integer: true }),
  numberField("frictionSlopeMethod", "Friction Slope Method=", { integer: true }),
  numberField("unsteadyFrictionSlopeMethod", "Unsteady Friction Slope Method=", { integer: true }),
  numberField("unsteadyBridgesFrictionSlopeMethod", "Unsteady Bridges Friction Slope Method=", {
    integer: true,
  }),

  stringField("parabolicCriticalDepth", "", { trim: true, optional: true }), // "Parabolic Critical Depth" if present

  // GlobalFlagsAndEncroachment section
  tupleField("globalVelDist", "Global Vel Dist=", [numberPart(), numberPart(), numberPart()]),
  numberField("globalLogLevel", "Global Log Level=", { integer: true }),
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
])
