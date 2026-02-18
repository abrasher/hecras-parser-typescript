import {
  contextual,
  fields,
  multiField,
  repeat,
  schema,
  startsWith,
  stringField,
  stringPart,
} from "../schema"

const initialFlowLocationSchema = schema([
  multiField(
    "Initial Flow Loc=",
    fields({
      river: stringPart({ trim: false }),
      reach: stringPart({ trim: false }),
      station: stringPart({ trim: false }),
      flow: stringPart({ trim: false }),
    }),
  ),
])

const initialStorageElevationSchema = schema([
  multiField(
    "Initial Storage Elev=",
    fields({
      name: stringPart({ trim: false }),
      elevation: stringPart({ trim: false }),
    }),
  ),
])

const initialRRRElevationSchema = schema([
  multiField(
    "Initial RRR Elev=",
    fields({
      river: stringPart({ trim: false }),
      reach: stringPart({ trim: false }),
      station: stringPart({ trim: false }),
      elevation: stringPart({ trim: false }),
    }),
  ),
])

export const unsteadyFlowSchema = schema([
  stringField("flowTitle", "Flow Title=", { trim: false, optional: true }),
  stringField("programVersion", "Program Version=", { trim: false, optional: true }),
  stringField("useRestart", "Use Restart=", { trim: false, optional: true }),
  stringField("restartFilename", "Restart Filename=", { trim: false, optional: true }),

  repeat("initialFlowLocations", startsWith("Initial Flow Loc="), initialFlowLocationSchema),
  repeat(
    "initialStorageElevations",
    startsWith("Initial Storage Elev="),
    initialStorageElevationSchema,
  ),
  repeat("initialRRRElevations", startsWith("Initial RRR Elev="), initialRRRElevationSchema),

  contextual(
    "passthroughLines",
    (lines, startIndex) => ({
      value: lines.slice(startIndex),
      nextIndex: lines.length,
    }),
    (value) => {
      if (!Array.isArray(value)) {
        return []
      }
      return value.map((line) => String(line))
    },
  ),
])
