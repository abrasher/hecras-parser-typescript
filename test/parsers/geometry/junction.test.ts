import { describe, expect, it } from "vitest"
import { parseJunctionData } from "../../../src/parsers/geometry/junctionParser"
import type { JunctionProperties } from "../../../src/models/geometry/junction"

describe("Junction Unit Tests", () => {
  const lines = lineString.split("\n")

  it("input data should be correct", () => {
    expect(lines.length).toBe(8)
  })

  it("should equal the object", () => {
    const junctionData = parseJunctionData(lines[0], lines, 0)
    expect(junctionData.data).toEqual(testJunctionData)
  })
})

const lineString = `Junct Name=1               
Junct Desc=, 0 , 0 ,-1 ,0
Junct X Y & Text X Y=491202.53125,4753367.5,491202.53125,4753367.5
Up River,Reach=DM              ,29
Up River,Reach=Trib 29         ,Trib 29
Dn River,Reach=DM              ,28
Junc L&A=102.93,0
Junc L&A=67.3,0`

const testJunctionData: JunctionProperties = {
  name: "1",
  description: ", 0 , 0 ,-1 ,0",
  coordinates: {
    position: {
      x: 491202.53125,
      y: 4753367.5,
    },
    textPosition: {
      x: 491202.53125,
      y: 4753367.5,
    },
  },
  upstreamConnections: [
    {
      river: "DM",
      reach: "29",
    },
    {
      river: "Trib 29",
      reach: "Trib 29",
    },
  ],
  downstreamConnection: {
    river: "DM",
    reach: "28",
  },
  lengthAndAreas: [
    {
      length: 102.93,
      area: 0,
    },
    {
      length: 67.3,
      area: 0,
    },
  ],
}
