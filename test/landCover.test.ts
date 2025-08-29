import { it, describe, expect } from "vitest"
import { parseLandCoverData } from "../src/parsers/geometry/landCoverParser"
import { serializeLandCover } from "../src/serializers/geometry/landCoverSerializer"

const lineString = `LCMann Time=Dec-30-1899 00:00:00
LCMann Region Time=Dec-30-1899 00:00:00
LCMann Table=9
NoData,0.05
Developed - High Intensity,0.05
Developed - Low Intensity,0.05
Unclassified,0.05
Developed - Medium Intensity,0.05
Pasture-Hay,0.05
Cultivated Crops,0.05
Developed - Open Space,0.05
Grassland-Herbaceous,0.05
LCMann Region Name=Manning's Region 1
LCMann Region Table=9
NoData,0.05
Developed - High Intensity,0.05
Developed - Low Intensity,0.05
Unclassified,0.05
Developed - Medium Intensity,0.05
Pasture-Hay,0.05
Cultivated Crops,0.05
Developed - Open Space,0.05
Grassland-Herbaceous,0.05
LCMann Region Polygon=11
277387.661780033 5274662.1779326277387.661780033 5274657.1779326
277386.661780033 5274657.1779326277386.661780033 5274656.1779326
277333.661780033 5274578.1779326277333.661780033 5274576.1779326
277332.661780033 5274576.1779326277332.661780033 5274575.1779326
277316.661780033 5274565.1779326277316.661780033 5274564.1779326
277387.661780033 5274662.1779326
LCMann Region Name=Manning's Region 2
LCMann Region Table=9
NoData,0.05
Developed - High Intensity,0.05
Developed - Low Intensity,0.05
Unclassified,0.05
Developed - Medium Intensity,0.05
Pasture-Hay,0.05
Cultivated Crops,0.05
Developed - Open Space,0.05
Grassland-Herbaceous,0.05
LCMann Region Polygon=6
277504.661780033 5274275.1779326277503.661780033 5274275.1779326
277503.661780033 5274277.1779326277502.661780033 5274277.1779326
277502.661780033 5274276.1779326277501.661780033 5274276.1779326`.split("\n")

describe("Land Cover", () => {
  it("should parse land cover data correctly", () => {
    const { data } = parseLandCoverData(lineString, 0)

    expect(data.lastEdited).toEqual("Dec-30-1899 00:00:00")
    expect(data.regions).toHaveLength(2)
    expect(data.regions[0].name).toEqual("Manning's Region 1")
    expect(data.regions[1].name).toEqual("Manning's Region 2")
    expect(data.table.length).toEqual(9)
    expect(data.regions[0].polygon).toHaveLength(11)
  })

  it("should serialize land cover correctly", () => {
    const { data } = parseLandCoverData(lineString, 0)
    const serialized = serializeLandCover(data)
    expect(serialized).toEqual(lineString)
  })

  it("should match snapshots", () => {
    const { data } = parseLandCoverData(lineString, 0)
    const serialized = serializeLandCover(data)
    expect(data).toMatchSnapshot()
    expect(serialized).toMatchSnapshot()
  })
})
