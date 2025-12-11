import { numberField, schema, stringField } from "../../schema"

export const unetD2AreaSchema = schema([
  stringField("name", "UNET D2 Name=", { trim: false }),
  numberField("theta", "UNET D2 Theta=", { pad: true }),
  numberField("thetaWarmup", "UNET D2 Theta Warmup=", { pad: true }),
  numberField("zTol", "UNET D2 Z Tol=", { pad: true }),
  numberField("volumeTol", "UNET D2 Volume Tol=", { pad: true }),
  numberField("maxIterations", "UNET D2 Max Iterations=", { integer: true, pad: true }),
  numberField("equation", "UNET D2 Equation=", { integer: true, pad: true }),
  numberField("totalICTime", "UNET D2 TotalICTime=", { nullOnBlank: true }),
  numberField("rampUpFraction", "UNET D2 RampUpFraction=", {}),
  numberField("timeSlices", "UNET D2 TimeSlices=", { integer: true, pad: true }),
  numberField("eddyViscosity", "UNET D2 Eddy Viscosity=", { nullOnBlank: true }),
  numberField("transverseEddyViscosity", "UNET D2 Transverse Eddy Viscosity=", {
    nullOnBlank: true,
    optional: true,
  }),
  numberField("smagorinskyMixing", "UNET D2 Smagorinsky Mixing=", {
    nullOnBlank: true,
    optional: true,
  }),
  numberField("bcVolumeCheck", "UNET D2 BCVolumeCheck=", { integer: true }),
  numberField("latitude", "UNET D2 Latitude=", { nullOnBlank: true }),
  numberField("cores", "UNET D2 Cores=", { integer: true, optional: true }),
  stringField("solverType", "UNET D2 SolverType=", { trim: true, optional: true }),
])
