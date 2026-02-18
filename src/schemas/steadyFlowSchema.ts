import {
  blankLine,
  contextual,
  fields,
  multiField,
  numberField,
  numberPart,
  repeat,
  schema,
  startsWith,
  stringField,
  stringPart,
} from "../schema"

const riverFlowBlockSchema = schema([
  multiField(
    "River Rch & RM=",
    fields({
      river: stringPart({ trim: false }),
      reach: stringPart({ trim: false }),
      riverStation: stringPart({ trim: false }),
    }),
  ),
  contextual(
    "profileFlowsLine",
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (line === undefined) {
        throw new Error("Missing profile flow values line after River Rch & RM block")
      }
      return { value: line, nextIndex: startIndex + 1 }
    },
    (value) => {
      if (value === undefined) {
        return []
      }
      return [value]
    },
  ),
])

const boundaryBlockSchema = schema([
  multiField(
    "Boundary for River Rch & Prof#=",
    fields({
      river: stringPart({ trim: false }),
      reach: stringPart({ trim: false }),
      profileNumber: numberPart({ integer: true, pad: true }),
    }),
  ),
  numberField("upType", "Up Type=", { integer: true, pad: true }),
  numberField("upSlope", "Up Slope=", { optional: true }),
  numberField("dnType", "Dn Type=", { integer: true, pad: true }),
  numberField("dnSlope", "Dn Slope=", { optional: true }),
])

const storageAreaElevationSchema = schema([
  multiField(
    "Storage Area Elev=",
    fields({
      storageArea: stringPart({ trim: false }),
      profileCount: numberPart({ integer: true, pad: true }),
    }),
  ),
  contextual(
    "profileElevationsLine",
    (lines, startIndex) => {
      const line = lines[startIndex]
      if (line === undefined) {
        throw new Error("Missing profile elevations line after Storage Area Elev block")
      }
      return { value: line, nextIndex: startIndex + 1 }
    },
    (value) => {
      if (value === undefined) {
        return []
      }
      return [value]
    },
  ),
])

export const steadyFlowSchema = schema([
  stringField("flowTitle", "Flow Title=", { trim: false }),
  stringField("programVersion", "Program Version=", { trim: false }),
  numberField("numberOfProfiles", "Number of Profiles=", { integer: true, pad: true }),
  stringField("profileNames", "Profile Names=", { trim: false }),

  repeat("riverFlows", startsWith("River Rch & RM="), riverFlowBlockSchema),
  repeat("boundaries", startsWith("Boundary for River Rch & Prof#="), boundaryBlockSchema),

  repeat(
    "observedWaterSurfaces",
    startsWith("Observed WS="),
    schema([stringField("line", "Observed WS=", { trim: false })]),
  ),

  stringField("dssImportStartDate", "DSS Import StartDate=", { trim: false }),
  stringField("dssImportStartTime", "DSS Import StartTime=", { trim: false }),
  stringField("dssImportEndDate", "DSS Import EndDate=", { trim: false }),
  stringField("dssImportEndTime", "DSS Import EndTime=", { trim: false }),
  numberField("dssImportGetInterval", "DSS Import GetInterval=", { integer: true, pad: true }),
  stringField("dssImportInterval", "DSS Import Interval=", { trim: false }),
  numberField("dssImportGetPeak", "DSS Import GetPeak=", { integer: true, pad: true }),
  numberField("dssImportFillOption", "DSS Import FillOption=", { integer: true, pad: true }),

  repeat("storageAreaElevations", startsWith("Storage Area Elev="), storageAreaElevationSchema),

  blankLine(),
])
