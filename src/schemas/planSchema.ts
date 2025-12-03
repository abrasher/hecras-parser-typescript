import { contextual, fields, multiField, schema, stringField, stringPart } from "../schema"

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
  contextual(
    "remainingLines",
    (lines, startIndex) => ({
      value: lines.slice(startIndex),
      nextIndex: lines.length,
    }),
    (value) => (Array.isArray(value) ? value : []),
  ),
])
