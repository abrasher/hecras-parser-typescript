import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { culvertSchema, type CulvertSchema } from "../../../src/schemas/geometry/culvertSchema"

describe("culvertSchema", () => {
  const parserLines = testCulvertStrings.split("\n")

  it("input data should be correct", () => {
    expect(parserLines.length).toBe(10)
  })

  it("parses parser fixture data", () => {
    const culvertData: CulvertSchema[] = []
    let index = 0

    while (index < parserLines.length && parserLines[index]?.startsWith("Connection Culv=")) {
      const { value, nextIndex } = parseWithSchema(culvertSchema, parserLines, index)
      culvertData.push(value)
      index = nextIndex
    }

    expect(culvertData).toEqual(testCulvertData)
  })

  it("serializes parser fixture data", () => {
    const serialized = testCulvertData.flatMap((group) =>
      serializeWithSchema(culvertSchema, group as unknown as CulvertSchema),
    )

    expect(serialized).toEqual(testCulvertStrings.split("\n"))
  })

  it("serializes a zero-count barrel station block when stations are undefined", () => {
    const zeroStations = {
      ...testCulvertData[1],
      barrelStations: undefined,
      barrels: [],
    }

    const serialized = serializeWithSchema(culvertSchema, zeroStations as unknown as CulvertSchema)

    expect(serialized).toHaveLength(1)
    const segments = serialized[0].split(",")
    expect(segments[11]?.trim()).toBe("0")
  })
})

const testCulvertStrings = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 2 ,Group #1    , 0 ,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culvert Barrel=2,Barrel #02,3
    414557.989346744151436.44773     434544.9229   4351438.60715
     424544.9229   4251438.60715
Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Group #2    , 0 ,
    3.56    4.96
Conn Culvert Barrel=1,Barrel #01,0`

const testCulvertData: CulvertSchema[] = [
  {
    shape: 1,
    rise: 1.5,
    span: 1.5,
    length: 13.24,
    nTop: 0.024,
    entranceLoss: 0.9,
    exitLoss: 1,
    chart: 2,
    scale: 3,
    upstreamInvert: 260.71,
    downstreamInvert: 260.64,
    culvertGroupName: "Group #1",
    unknownFlag: false,
    unknownParameter: null,
    barrelStations: [
      [3.56, 4.96],
      [6.56, 9.96],
    ],
    barrels: [
      {
        index: 1,
        name: "Barrel #01",
        coordinates: [
          [484557.98934, 4751436.44773],
          [484544.9229, 4751438.60715],
        ],
      },
      {
        index: 2,
        name: "Barrel #02",
        coordinates: [
          [414557.98934, 6744151436.44773],
          [434544.9229, 4351438.60715],
          [424544.9229, 4251438.60715],
        ],
      },
    ],
  },
  {
    shape: 1,
    rise: 1.5,
    span: 1.5,
    length: 13.24,
    nTop: 0.024,
    entranceLoss: 0.9,
    exitLoss: 1,
    chart: 2,
    scale: 3,
    upstreamInvert: 260.71,
    downstreamInvert: 260.64,
    culvertGroupName: "Group #2",
    unknownFlag: false,
    unknownParameter: null,
    barrelStations: [[3.56, 4.96]],
    barrels: [
      {
        index: 1,
        name: "Barrel #01",
        coordinates: [],
      },
    ],
  },
]
