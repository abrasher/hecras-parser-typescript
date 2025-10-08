import {
  blankLine,
  blankLineIfNotEmpty,
  blankLines,
  booleanField,
  booleanPart,
  fields,
  multiField,
  numberField,
  numberPart,
  repeat,
  schema,
  section,
  startsWith,
  stringField,
  stringPart,
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
import { streamNodeSchema } from "./geometry/streamNodeSchema"

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

  repeat("streamNodes", startsWith("Stream Node="), streamNodeSchema),

  section("landCover", startsWith("LCMann Time="), landCoverSchema),
  booleanField("channelStopCuts", "Chan Stop Cuts=", { mode: "-1,0", pad: true }),
  blankLines(3),
  multiField(
    "Geom Raster=",
    fields({
      geomRasterPath: stringPart({ trim: true }),
      geomRasterEnabled: booleanPart({ mode: "trueFalse" }),
      geomRasterType: stringPart({ trim: true }),
      // cellSize is just a guess, need to confirm
      geomRasterCellSize: numberPart({ nullOnBlank: true }),
      geomRasterClipToGeometry: booleanPart({ mode: "-1,0", pad: true }),
    }),
    { optional: true },
  ),
  booleanField("useUserSpecifiedReachOrder", "Use User Specified Reach Order=", {
    mode: "-1,0",
    optional: true,
  }),
  multiField(
    "User Specified Reach Order=",
    fields({
      userSpecifiedReachOrderRiver: stringPart({ trim: true, width: 16 }),
      userSpecifiedReachOrderReach: stringPart({ trim: true, width: 16 }),
    }),
    { optional: true },
  ),
  stringField("gisUnits", "GIS Units=", { optional: true, trim: true }),
  stringField("gisDtmType", "GIS DTM Type=", { optional: true, trim: true }),
  stringField("gisDtmPath", "GIS DTM=", { optional: true, trim: true }),
  stringField("gisStreamLayer", "GIS Stream Layer=", { optional: true, trim: true }),
  stringField("gisCrossSectionLayer", "GIS Cross Section Layer=", {
    optional: true,
    trim: true,
  }),
  stringField("gisMapProjection", "GIS Map Projection=", { optional: true, trim: true }),
  stringField("gisProjectionZone", "GIS Projection Zone=", { optional: true, trim: true }),
  stringField("gisDatum", "GIS Datum=", { optional: true, trim: true }),
  stringField("gisVerticalDatum", "GIS Vertical Datum=", { optional: true, trim: true }),
  tupleField(
    "gisDataExtents",
    "GIS Data Extents=",
    [numberPart(), numberPart(), numberPart(), numberPart()],
    { optional: true },
  ),
  blankLineIfNotEmpty("gisDataExtents"),
  booleanField("gisRatioCutsToInvert", "GIS Ratio Cuts To Invert=", {
    mode: "-1,0",
    optional: true,
  }),
  booleanField("gisLimitAtBridges", "GIS Limit At Bridges=", {
    mode: "-1,0",
    optional: true,
  }),
  numberField("compositeChannelSlope", "Composite Channel Slope=", {
    integer: true,
    optional: true,
  }),
  blankLine(),
])

export type GeometrySchema = Infer<typeof geometrySchema>
