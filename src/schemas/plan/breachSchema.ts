import {
  fields,
  multiField,
  numberField,
  numberPart,
  schema,
  stringPart,
  tupleArrayField,
} from "../../schema"

export const breachSchema = schema([
  multiField(
    "Breach Loc=",
    fields({
      breachLoc1: stringPart({ trim: true, width: 16 }),
      breachLoc2: stringPart({ trim: true, width: 16 }),
      breachLoc3: stringPart({ trim: true, width: 8 }),
      breachLoc4: stringPart({ trim: true }),
      breachLoc5: stringPart({ trim: true, width: 16 }),
    }),
  ),
  numberField("breachMethod", "Breach Method=", { integer: true, pad: true }),
  multiField(
    "Breach Geom=",
    fields({
      breachGeom1: numberPart(),
      breachGeom2: numberPart(),
      breachGeom3: numberPart(),
      breachGeom4: numberPart(),
      breachGeom5: numberPart(),
      breachGeom6: stringPart({ trim: true }),
      breachGeom7: numberPart(),
      breachGeom8: numberPart(),
      breachGeom9: numberPart(),
      breachGeom10: numberPart(),
    }),
  ),
  multiField(
    "Breach Start=",
    fields({
      breachStart1: stringPart({ trim: true }),
      breachStart2: numberPart({ nullOnBlank: true }),
      breachStart3: stringPart({ trim: true }),
      breachStart4: stringPart({ trim: true }),
      breachStart5: stringPart({ trim: true }),
      breachStart6: stringPart({ trim: true }),
      breachStart7: stringPart({ trim: true }),
      breachStart8: numberPart({ nullOnBlank: true }),
    }),
  ),
  tupleArrayField("Breach Progression=", "breachProgression", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    formatter: "station",
    pad: true,
  }),
  tupleArrayField(
    "Simplified Physical Breach Downcutting=",
    "simplifiedPhysicalBreachDowncutting",
    {
      width: 8,
      maxWidth: 80,
      tuple: 2,
      formatter: "station",
      pad: true,
    },
  ),
  tupleArrayField("Simplified Physical Breach Widening=", "simplifiedPhysicalBreachWidening", {
    width: 8,
    maxWidth: 80,
    tuple: 2,
    formatter: "station",
    pad: true,
  }),
  numberField("startingNotchDepth", "Starting Notch Depth=", { pad: true, optional: true }),
  numberField("initialPipingDiameter", "Initial Piping Diameter=", { pad: true, optional: true }),
  numberField("massWastingOptions", "Mass Wasting Options=", { integer: true, pad: true }),
  numberField("massWastingWidth", "Mass Wasting Width=", { pad: true, optional: true }),
  numberField("massWastingDuration", "Mass Wasting Duration=", { pad: true, optional: true }),
  numberField("massWastingFinalBottomElevation", "Mass Wasting Final Bottom Elevation=", {
    pad: true,
    optional: true,
  }),
  numberField("breachUseUserDefinedGrowthRatio", "Breach Use User Defined Growth Ratio=", {
    integer: true,
    optional: true,
  }),
  numberField("breachUserDefinedGrowthRatio", "Breach User Defined Growth Ratio=", {
    optional: true,
  }),

  // DL (Dam & Levee) Breach parameters (optional)
  multiField(
    "DLBreach Methods=",
    fields({
      dlBreachMethod1: numberPart(),
      dlBreachMethod2: numberPart(),
    }),
    { optional: true },
  ),
  numberField("dlBreachSoilType", "DLBreach SoilType=", { integer: true, optional: true }),
  numberField("dlBreachCoreSoilType", "DLBreach Core SoilType=", { integer: true, optional: true }),
  numberField("dlBreachCoverOption", "DLBreach Cover Option=", { integer: true, optional: true }),
  numberField("dlBreachBreachDirection", "DLBreach Breach Direction=", {
    integer: true,
    optional: true,
  }),
])
