import { describe, expect, it } from "vitest"
import { formatFixedWidth } from "../../src/serializers/atomic"
import { parseWithSchema, serializeWithSchema } from "../../src/schema"
import { landCoverSchema, type LandCoverSchema } from "../../src/schemas/landCoverSchema"
import type { LandCover } from "../../src/models/geometry/landCover"

describe("landCoverSchema", () => {
  const polygonLine1 = `${formatFixedWidth(100, 16)}${formatFixedWidth(200, 16)}${formatFixedWidth(150, 16)}${formatFixedWidth(250, 16)}`
  const polygonLine2 = `${formatFixedWidth(175, 16)}${formatFixedWidth(275, 16)}`

  const sampleLines = [
    "LCMann Time=2023-01-01 00:00",
    "LCMann Region Time=2023-01-02 00:00",
    "LCMann Table=2",
    "Open Water,0.03",
    "Forest,0.1",
    "LCMann Region Name=RegionA",
    "LCMann Region Table=1",
    "Subtype,0.05",
    "LCMann Region Polygon=3",
    polygonLine1,
    polygonLine2,
  ]

  it("parses land cover tables and regions", () => {
    const result = parseWithSchema(landCoverSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toEqual({
      lastEdited: "2023-01-01 00:00",
      lastEditedRegion: "2023-01-02 00:00",
      table: [
        ["Open Water", 0.03],
        ["Forest", 0.1],
      ],
      regions: [
        {
          name: "RegionA",
          table: [["Subtype", 0.05]],
          polygon: [
            [100, 200],
            [150, 250],
            [175, 275],
          ],
        },
      ],
    })
  })

  it("serializes land cover data back to lines", () => {
    const landCover: LandCoverSchema = {
      lastEdited: "2023-01-01 00:00",
      lastEditedRegion: "2023-01-02 00:00",
      table: [
        ["Open Water", 0.03],
        ["Forest", 0.1],
      ],
      regions: [
        {
          name: "RegionA",
          table: [["Subtype", 0.05]],
          polygon: [
            [100, 200],
            [150, 250],
            [175, 275],
          ],
        },
      ],
    }

    const lines = serializeWithSchema(landCoverSchema, landCover)

    expect(lines).toEqual([
      "LCMann Time=2023-01-01 00:00",
      "LCMann Region Time=2023-01-02 00:00",
      "LCMann Table=2",
      "Open Water,0.03",
      "Forest,0.1",
      "LCMann Region Name=RegionA",
      "LCMann Region Table=1",
      "Subtype,0.05",
      "LCMann Region Polygon=3",
      polygonLine1,
      polygonLine2,
    ])
  })

  it("remains compatible with existing LandCover model", () => {
    const schemaData: LandCoverSchema = {
      lastEdited: "2023-01-01 00:00",
      lastEditedRegion: "2023-01-02 00:00",
      table: [["Class", 0.07]],
      regions: [],
    }

    const modelData: LandCover = schemaData

    expect(modelData.table[0][1]).toBe(0.07)
    expect(modelData.regions).toEqual([])
  })
})
