import {
  blankLine,
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
import { crossSectionSchema } from "./geometry/crossSectionSchema"
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
  repeat("connections", startsWith("Connection="), connectionSchema),

  repeat("boundaryConditions", startsWith("BC Line Name="), boundaryConditionSchema),
  repeat("breakLines", startsWith("BreakLine Name="), breakLineSchema),
  repeat("icPoints", startsWith("IC Point Name="), icPointSchema),
  repeat("crossSections", startsWith("Type RM Length L Ch R ="), crossSectionSchema),
  section("landCover", startsWith("LCMann Time="), landCoverSchema),
])

export type GeometrySchema = Infer<typeof geometrySchema>
