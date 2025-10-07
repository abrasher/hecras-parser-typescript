import {
  blankLine,
  blankLines,
  booleanField,
  numberField,
  numberPart,
  repeat,
  schema,
  section,
  startsWith,
  stringField,
  textBlockField,
  tupleField,
  type Infer,
} from "../schema"
import { boundaryConditionSchema } from "./geometry/boundaryConditionSchema"
import { breakLineSchema } from "./geometry/breakLineSchema"
import { connectionSchema } from "./geometry/connectionSchema"
import { icPointSchema } from "./geometry/icPointSchema"
import { junctionSchema } from "./geometry/junctionSchema"
import { landCoverSchema } from "./geometry/landCoverSchema"
import { riverReachSchema } from "./geometry/riverReachSchema"
import { storageAreaSchema } from "./geometry/storageAreaSchema"

export const geometrySchema = schema([
  stringField("geomTitle", "Geom Title=", { trim: true }),
  stringField("programVersion", "Program Version=", { trim: true }),
  tupleField("viewingRectangle", "Viewing Rectangle=", [
    numberPart({ pad: true }),
    numberPart({ pad: true }),
    numberPart({ pad: true }),
    numberPart({ pad: true }),
  ]),
  blankLine(),
  textBlockField("description", "GEOM DESCRIPTION", { optional: true }),

  repeat("rivers", startsWith("River Reach="), riverReachSchema),
  repeat("junctions", startsWith("Junct Name="), junctionSchema),
  repeat("storageAreas", startsWith("Storage Area="), storageAreaSchema),
  repeat("breakLines", startsWith("BreakLine Name="), breakLineSchema),

  repeat("connections", startsWith("Connection="), connectionSchema),

  repeat("boundaryConditions", startsWith("BC Line Name="), boundaryConditionSchema),
  repeat("icPoints", startsWith("IC Point Name="), icPointSchema),
  section("landCover", startsWith("LCMann Time="), landCoverSchema),
  booleanField("channelStopCuts", "Chan Stop Cuts=", { mode: "-1,0", pad: true }),
  blankLines(3),
  booleanField("useUserSpecifiedReachOrder", "Use User Specified Reach Order=", {
    mode: "-1,0",
  }),
  booleanField("gisRatioCutsToInvert", "GIS Ratio Cuts To Invert=", { mode: "-1,0" }),
  booleanField("gisLimitAtBridges", "GIS Limit At Bridges=", { mode: "-1,0" }),
  numberField("compositeChannelSlope", "Composite Channel Slope=", { integer: true }),
  blankLine(),
])

export type GeometrySchema = Infer<typeof geometrySchema>
