import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { projectSchema } from "../../src/schemas/projectSchema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readPrj(filename: string): string[] {
  const filePath = resolve(__dirname, "../data/projects", filename)
  const fileContent = readFileSync(filePath, "utf-8")
  return fileContent.replace(/\r\n/g, "\n").split("\n")
}

function roundTrip(filename: string): void {
  const lines = readPrj(filename)
  const { value } = parseWithSchema(projectSchema, lines, 0)
  const serialized = serializeWithSchema(projectSchema, value)
  expect(serialized).toEqual(lines)
}

describe("projectSchema — round-trip", () => {
  it("round trips BaldEagle.prj (1D unsteady with DSS caption)", () => {
    roundTrip("BaldEagle.prj")
  })

  it("round trips BaldEagleDamBrk.prj (rating curves, GIS reach/SA)", () => {
    roundTrip("BaldEagleDamBrk.prj")
  })

  it("round trips BaldEDmbrk.prj (specific locations profile table)", () => {
    roundTrip("BaldEDmbrk.prj")
  })

  it("round trips Baxter.prj (GIS Export Profiles=1 with data line)", () => {
    roundTrip("Baxter.prj")
  })

  it("round trips hick85.prj (Current HD, no DSS File, multi-line description)", () => {
    roundTrip("hick85.prj")
  })

  it("round trips OverbankDeposition.prj (Current Geom + QuasiSteady, SI Units, no DSS File)", () => {
    roundTrip("OverbankDeposition.prj")
  })
})

describe("projectSchema — parsed values", () => {
  it("parses BaldEagle.prj fields correctly", () => {
    const lines = readPrj("BaldEagle.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.projTitle).toBe("Bald Eagle Cr. for the WCDS Project")
    expect(value.currentPlan).toBe("p01")
    expect(value.currentGeom).toBeUndefined()
    expect(value.currentHD).toBeUndefined()
    expect(value.defaultExpansion).toBe(0.3)
    expect(value.defaultContraction).toBe(0.1)
    expect(value.units).toBe("English Units")
    expect(value.geometries).toEqual([{ file: "g01" }])
    expect(value.steadyFlows).toEqual([{ file: "f02" }, { file: "f01" }])
    expect(value.unsteadyFlows).toEqual([{ file: "u02" }])
    expect(value.plans).toEqual([{ file: "p01" }, { file: "p02" }])
    expect(value.hdFiles).toEqual([])
    expect(value.yAxisTitle).toBe("Elevation")
    expect(value.xAxisTitlePF).toBe("Main Channel Distance")
    expect(value.xAxisTitleXS).toBe("Station")
    expect(value.dssCaptionAdditionalText).toBe("Jensen")
    expect(value.description).toBe(
      "Bald Eagle Creek.  This model does not represent actual water surface elevations for Bald Eagle Creek.  This data set is intended to be used only as an example Unsteady Flow data set.",
    )
    expect(value.dssStartDate).toBe("02/18/99")
    expect(value.dssStartTime).toBe("0000")
    expect(value.dssEndDate).toBe("02/21/99")
    expect(value.dssEndTime).toBe("2400")
    expect(value.dssFiles).toEqual([{ file: "dss" }])
    expect(value.dssExportFilename).toBe("")
    expect(value.dssRatingCurves).toEqual({ locationLines: [] })
    expect(value.dssExportRatingCurveSorted).toBe(0)
    expect(value.dssExportVolumeFlowCurves).toBe(0)
    expect(value.dxfFilename).toBe("")
    expect(value.dxfOffsetX).toBe(0)
    expect(value.dxfOffsetY).toBe(0)
    expect(value.dxfScaleX).toBe(1)
    expect(value.dxfScaleY).toBe(10)
    expect(value.specificLocations).toBeUndefined()
    expect(value.gisExportReaches).toEqual([])
    expect(value.gisExportSAs).toEqual([])
    expect(value.gisExportProfiles).toEqual([])
  })

  it("parses BaldEagleDamBrk.prj rating curves and GIS exports", () => {
    const lines = readPrj("BaldEagleDamBrk.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.dssRatingCurves).toEqual({
      locationLines: [{ location: "Bald Eagle Cr.  ,Lock Haven      ,58756     U/S Bridge" }],
    })
    expect(value.gisExportReaches).toEqual([{ reach: "Bald Eagle Cr.  ,Lock Haven      " }])
    expect(value.gisExportSAs).toHaveLength(7)
    expect(value.gisExportSAs[0]).toEqual({ sa: "190             " })
    expect(value.gisExportSAs[6]).toEqual({ sa: "255             " })
    expect(value.gisExportProfiles).toEqual([])
  })

  it("parses BaldEDmbrk.prj specific locations table", () => {
    const lines = readPrj("BaldEDmbrk.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.specificLocations).toEqual({
      name: "Gary's fav locations in Bald Eag     ",
      dataLines: [
        { location: "Bald Eagle      ,Loc Hav         ,137690.8" },
        { location: "Bald Eagle      ,Loc Hav         ,128280.7" },
        { location: "Bald Eagle      ,Loc Hav         ,81849.49" },
        { location: "Bald Eagle      ,Loc Hav         ,81084.18" },
        { location: "Bald Eagle      ,Loc Hav         ,49715.77" },
        { location: "Bald Eagle      ,Loc Hav         ,23872.06" },
        { location: "Bald Eagle      ,Loc Hav         ,1212.855" },
        { location: "Bald Eagle      ,Loc Hav         ,659.942 " },
      ],
    })
    expect(value.gisExportReaches).toEqual([{ reach: "Bald Eagle      ,Loc Hav         " }])
  })

  it("parses Baxter.prj GIS Export Profiles with data line", () => {
    const lines = readPrj("Baxter.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.gisExportProfiles).toEqual([[1]])
    expect(value.gisExportReaches).toEqual([{ reach: "Baxter River    ,Upper Reach     " }])
    expect(value.gisExportSAs).toEqual([{ sa: "Northside       " }, { sa: "Southside       " }])
  })

  it("parses hick85.prj with Current HD, no DSS File, and rich description", () => {
    const lines = readPrj("hick85.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.currentPlan).toBe("p01")
    expect(value.currentHD).toBe("h01")
    expect(value.currentGeom).toBeUndefined()
    expect(value.geometries).toEqual([{ file: "g01" }])
    expect(value.steadyFlows).toEqual([{ file: "f01" }])
    expect(value.plans).toEqual([{ file: "p01" }])
    expect(value.hdFiles).toEqual([{ file: "h01" }])
    expect(value.dssFiles).toEqual([])
    expect(value.description).toContain("HICKAHALA CREEK 1985 SURVEYS")
    expect(value.gisExportProfiles).toBeUndefined()
  })

  it("parses OverbankDeposition.prj with SI units and Current Geom/QuasiSteady", () => {
    const lines = readPrj("OverbankDeposition.prj")
    const { value } = parseWithSchema(projectSchema, lines, 0)

    expect(value.units).toBe("SI Units")
    expect(value.currentGeom).toBe("g01")
    expect(value.currentQuasiSteady).toBe("q01")
    expect(value.currentPlan).toBeUndefined()
    expect(value.geometries).toEqual([{ file: "g01" }])
    expect(value.steadyFlows).toEqual([])
    expect(value.dssFiles).toEqual([])
  })
})
