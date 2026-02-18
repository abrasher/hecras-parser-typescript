import {
  blankLine,
  countedArrayLengthPart,
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
  tupleArrayField,
  type Infer,
} from "../schema"

/**
 * Schema for parsing HEC-RAS project files (.prj)
 *
 * Format overview:
 *   Proj Title=<title>
 *   [Current Plan=<id>]
 *   [Current Geom=<id>]
 *   [Current HD=<id>]
 *   [Current QuasiSteady=<id>]
 *   Default Exp/Contr=<expansion>,<contraction>
 *   English Units | SI Units
 *   [<file references: Geom File=, Flow File=, Unsteady File=, Plan File=, etc.>]
 *   Y Axis Title=<title>
 *   X Axis Title(PF)=<title>
 *   X Axis Title(XS)=<title>
 *   [DSS Caption Additional Text=<text>]
 *   BEGIN DESCRIPTION:
 *   <description lines>
 *   END DESCRIPTION:
 *   DSS Start Date=<date>
 *   DSS Start Time=<time>
 *   DSS End Date=<date>
 *   DSS End Time=<time>
 *   [DSS File=<filename>]  (0 or more)
 *   DSS Export Filename=<filename>
 *   DSS Export Rating Curves= <count>
 *   [<rating curve location lines>]  (count lines)
 *   DSS Export Rating Curve Sorted= <0|1>
 *   DSS Export Volume Flow Curves= <0|1>
 *   DXF Filename=<filename>
 *   DXF OffsetX= <n>
 *   DXF OffsetY= <n>
 *   DXF ScaleX= <n>
 *   DXF ScaleY= <n>
 *   [Specific Locations Profile Table=<name>, <count>]
 *   [<location lines>]  (count lines)
 *   [GIS Export Reach=<reach>]  (0 or more)
 *   [GIS Export SA=<sa>]  (0 or more)
 *   [GIS Export Profiles= <count>]
 *   [<profile data lines>]  (count lines)
 */
export const projectSchema = schema([
  stringField("projTitle", "Proj Title=", { trim: true }),

  // Optional current active file references — any subset may appear, in any order
  stringField("currentPlan", "Current Plan=", { trim: true, optional: true }),
  stringField("currentGeom", "Current Geom=", { trim: true, optional: true }),
  stringField("currentHD", "Current HD=", { trim: true, optional: true }),
  stringField("currentQuasiSteady", "Current QuasiSteady=", { trim: true, optional: true }),

  // Default expansion/contraction coefficients
  multiField(
    "Default Exp/Contr=",
    fields({
      defaultExpansion: numberPart(),
      defaultContraction: numberPart(),
    }),
  ),

  // Units flag line ("English Units" or "SI Units") — no = sign, read as full line
  stringField("units", "", { trim: true }),

  // File references by type — HEC-RAS groups same types together
  repeat("geometries", startsWith("Geom File="), schema([stringField("file", "Geom File=", { trim: true })])),
  repeat("steadyFlows", startsWith("Flow File="), schema([stringField("file", "Flow File=", { trim: true })])),
  repeat(
    "unsteadyFlows",
    startsWith("Unsteady File="),
    schema([stringField("file", "Unsteady File=", { trim: true })]),
  ),
  repeat(
    "quasiSteadyFlows",
    startsWith("QuasiSteady File="),
    schema([stringField("file", "QuasiSteady File=", { trim: true })]),
  ),
  repeat(
    "sedimentFiles",
    startsWith("Sediment File="),
    schema([stringField("file", "Sediment File=", { trim: true })]),
  ),
  repeat(
    "waterQualityFiles",
    startsWith("Water Quality File="),
    schema([stringField("file", "Water Quality File=", { trim: true })]),
  ),
  repeat("plans", startsWith("Plan File="), schema([stringField("file", "Plan File=", { trim: true })])),
  // HD File= appears after Plan File= in some projects (e.g. hick85.prj)
  repeat("hdFiles", startsWith("HD File="), schema([stringField("file", "HD File=", { trim: true })])),

  stringField("yAxisTitle", "Y Axis Title=", { trim: true }),
  stringField("xAxisTitlePF", "X Axis Title(PF)=", { trim: true }),
  stringField("xAxisTitleXS", "X Axis Title(XS)=", { trim: true }),

  // Optional additional text for DSS captions (appears before description block)
  stringField("dssCaptionAdditionalText", "DSS Caption Additional Text=", {
    trim: true,
    optional: true,
  }),

  // Description text block
  textBlockField("description", "DESCRIPTION"),

  // DSS simulation date/time range (values may be blank)
  stringField("dssStartDate", "DSS Start Date=", { trim: true }),
  stringField("dssStartTime", "DSS Start Time=", { trim: true }),
  stringField("dssEndDate", "DSS End Date=", { trim: true }),
  stringField("dssEndTime", "DSS End Time=", { trim: true }),

  // DSS file references (optional, may repeat)
  repeat("dssFiles", startsWith("DSS File="), schema([stringField("file", "DSS File=", { trim: true })])),

  stringField("dssExportFilename", "DSS Export Filename=", { trim: true }),

  // DSS Export Rating Curves: count on header line, followed by that many location data lines.
  // countedArrayLengthPart derives the serialized count from locationLines.length automatically.
  section(
    "dssRatingCurves",
    startsWith("DSS Export Rating Curves="),
    schema([
      multiField(
        "DSS Export Rating Curves=",
        fields({ count: countedArrayLengthPart("locationLines", { pad: true }) }),
      ),
      repeat(
        "locationLines",
        (line) => line !== undefined && !line.startsWith("DSS Export Rating Curve Sorted="),
        schema([stringField("location", "", { trim: false })]),
      ),
    ]),
  ),

  numberField("dssExportRatingCurveSorted", "DSS Export Rating Curve Sorted=", {
    integer: true,
    pad: true,
  }),
  numberField("dssExportVolumeFlowCurves", "DSS Export Volume Flow Curves=", {
    integer: true,
    pad: true,
  }),

  stringField("dxfFilename", "DXF Filename=", { trim: true }),
  numberField("dxfOffsetX", "DXF OffsetX=", { pad: true }),
  numberField("dxfOffsetY", "DXF OffsetY=", { pad: true }),
  numberField("dxfScaleX", "DXF ScaleX=", { pad: true }),
  numberField("dxfScaleY", "DXF ScaleY=", { pad: true }),

  // Specific Locations Profile Table: fixed-width name + count on header, followed by count data lines.
  // The name and count are comma-separated on the header line.
  section(
    "specificLocations",
    startsWith("Specific Locations Profile Table="),
    schema([
      multiField(
        "Specific Locations Profile Table=",
        fields({
          name: stringPart({ trim: false }),
          count: countedArrayLengthPart("dataLines", { pad: true }),
        }),
      ),
      repeat(
        "dataLines",
        (line) => line !== undefined && line !== "" && !line.startsWith("GIS Export"),
        schema([stringField("location", "", { trim: false })]),
      ),
    ]),
  ),

  // GIS Export Reach entries (repeated, optional — values include trailing spaces)
  repeat(
    "gisExportReaches",
    startsWith("GIS Export Reach="),
    schema([stringField("reach", "GIS Export Reach=", { trim: false })]),
  ),

  // GIS Export SA entries (repeated, optional — values include trailing spaces)
  repeat(
    "gisExportSAs",
    startsWith("GIS Export SA="),
    schema([stringField("sa", "GIS Export SA=", { trim: false })]),
  ),

  // GIS Export Profiles: count on header line followed by that many 8-char profile number lines
  tupleArrayField("GIS Export Profiles=", "gisExportProfiles", {
    width: 8,
    maxWidth: 80,
    tuple: 1,
    pad: true,
    optional: true,
  }),

  // Trailing newline from CRLF line endings
  blankLine(),
])

export type ProjectSchema = Infer<typeof projectSchema>
