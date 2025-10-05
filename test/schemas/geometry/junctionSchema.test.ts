import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { junctionSchema, type JunctionSchema } from "../../../src/schemas/geometry/junctionSchema"

describe("junctionSchema", () => {
  const sampleLines = [
    "Junct Name=1               ",
    "Junct Desc=desc, 0 , 0 ,-1 ,0",
    "Junct X Y & Text X Y=491202.53125,4753367.5,491202.53125,4753367.5",
    "Up River,Reach=DM              ,29",
    "Up River,Reach=Trib 29         ,Trib 29",
    "Dn River,Reach=DM              ,28",
    "Junc L&A=102.93,0",
    "Junc L&A=67.3,0",
  ]

  it("parses Junction geometry correctly", () => {
    const result = parseWithSchema(junctionSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toMatchObject({
      name: "1",
      description: "desc",
      steadyFlowComputationMode: false, // 0 = energy computation mode
      addWeight: false, // 0 = false
      addFriction: true, // -1 = true
      unsteadyComputationMode: false, // 0 = force equal water surface elevations
      positionX: 491202.53125,
      positionY: 4753367.5,
      textPositionX: 491202.53125,
      textPositionY: 4753367.5,
      upstreamConnections: [
        { river: "DM", reach: "29" },
        { river: "Trib 29", reach: "Trib 29" },
      ],
      downstreamRiver: "DM",
      downstreamReach: "28",
      lengthAndAngles: [
        { length: 102.93, angle: 0 },
        { length: 67.3, angle: 0 },
      ],
    })
  })

  it("handles junction with no upstream connections or length angles", () => {
    const minimalLines = [
      "Junct Name=SimpleJunction",
      "Junct Desc=Basic junction,0,0,0,0",
      "Junct X Y & Text X Y=100.0,200.0,110.0,210.0",
      "Dn River,Reach=Main,Reach1",
    ]

    const result = parseWithSchema(junctionSchema, minimalLines, 0)

    expect(result.nextIndex).toBe(minimalLines.length)
    expect(result.value).toMatchObject({
      name: "SimpleJunction",
      description: "Basic junction",
      steadyFlowComputationMode: false, // 0 = energy computation mode
      addWeight: false, // 0 = false
      addFriction: false, // 0 = false
      unsteadyComputationMode: false, // 0 = force equal water surface elevations
      positionX: 100.0,
      positionY: 200.0,
      textPositionX: 110.0,
      textPositionY: 210.0,
      upstreamConnections: [],
      downstreamRiver: "Main",
      downstreamReach: "Reach1",
      lengthAndAngles: [],
    })
  })

  it("serializes Junction geometry correctly", () => {
    const junctionData: JunctionSchema = {
      name: "1",
      description: "",
      steadyFlowComputationMode: false, // 0 = energy computation mode
      addWeight: false, // 0 = false
      addFriction: true, // -1 = true (will serialize as "1")
      unsteadyComputationMode: false, // 0 = force equal water surface elevations
      positionX: 491202.53125,
      positionY: 4753367.5,
      textPositionX: 491202.53125,
      textPositionY: 4753367.5,
      upstreamConnections: [
        { river: "DM", reach: "29" },
        { river: "Trib 29", reach: "Trib 29" },
      ],
      downstreamRiver: "DM",
      downstreamReach: "28",
      lengthAndAngles: [
        { length: 102.93, angle: 0 },
        { length: 67.3, angle: 0 },
      ],
    }

    const lines = serializeWithSchema(junctionSchema, junctionData)

    expect(lines).toEqual([
      "Junct Name=1",
      "Junct Desc=,0,0,-1,0", // Now using proper "-1,0" mode
      "Junct X Y & Text X Y=491202.53125,4753367.5,491202.53125,4753367.5",
      "Up River,Reach=DM,29",
      "Up River,Reach=Trib 29,Trib 29",
      "Dn River,Reach=DM,28",
      "Junc L&A=102.93,0",
      "Junc L&A=67.3,0",
    ])
  })
})
