import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { landCoverSchema, type LandCoverSchema } from "../../src/schemas/landCoverSchema"

describe("landCoverSchema", () => {
  const sampleLines = [
    "LCMann Time=2023-01-01 00:00",
    "LCMann Region Time=2023-01-02 00:00",
    "LCMann Table=2",
    "Open Water,0.03",
    "Forest,0.1",
    "LCMann Region Name=RegionA",
    "LCMann Region Table=1",
    "Subtype,0.05",
    "LCMann Region Polygon=4",
    "        1966056.  291992.6868694 1968654.8925079  290155.9159294",
    " 1969035.4842834   289973.894329 1969647.7412634   289642.944037",
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
            [1966056, 291992.6868694],
            [1968654.8925079, 290155.9159294],
            [1969035.4842834, 289973.894329],
            [1969647.7412634, 289642.944037],
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
            [1966056, 291992.6868694],
            [1968654.8925079, 290155.9159294],
            [1969035.4842834, 289973.894329],
            [1969647.7412634, 289642.944037],
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
      "LCMann Region Polygon=4",
      "        1966056.  291992.6868694 1968654.8925079  290155.9159294",
      " 1969035.4842834   289973.894329 1969647.7412634   289642.944037",
    ])
  })
})
