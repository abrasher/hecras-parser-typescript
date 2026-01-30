import { numberField, schema, stringField } from "../../schema"

export const psAreaSchema = schema([
  stringField("name", "PS Name=", { trim: true }),
  numberField("theta", "PS Theta=", { pad: true }),
  numberField("wsTol", "PS WS Tol=", { pad: true }),
  numberField("volumeTol", "PS Volume Tol=", { pad: true }),
  numberField("maxIterations", "PS Max Iterations=", { integer: true, pad: true }),
  numberField("equation", "PS Equation=", { integer: true, pad: true }),
  numberField("advanceTimeStep", "PS Advance Time Step=", { integer: true, optional: true }),
  numberField("targetCourant", "PS Target Courant=", { optional: true }),
  numberField("timeSlices", "PS Time Slices=", { integer: true, pad: true }),
  numberField("iterateWith2D", "PS Iterate With 2D=", { integer: true, optional: true }),
  numberField("projectInitialWSEFromDS", "PS Project Initial WSE from DS=", {
    integer: true,
    optional: true,
  }),
  numberField("rampUpInitialWSEFromUS", "PS Ramp Up Initial WSE from US=", {
    integer: true,
    optional: true,
  }),
  numberField("cores", "PS Cores=", { integer: true, optional: true }),
])
