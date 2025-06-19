import { describe, expect } from "vitest"
import { parseCulvertData } from "../../src/parsers/culvertParser"
import type { CulvertGroupProperties } from "../../src/models/culvert"

describe("Culvert Unit Tests", () => {
  const lines = lineString2.split("\n")

  console.log(lines)
  const culvertData = parseCulvertData(lines[0], lines, 0)
  console.log(JSON.stringify(culvertData.data, null, 2))
  expect(culvertData.data).toEqual(testCulvertData)
})

const lineString = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culvert Barrel=2,Barrel #02,3
    414557.989346744151436.44773     434544.9229   4351438.60715
     424544.9229   4251438.60715`
const lineString2 = `Connection Culv=1,1.5,1.5,13.24,0.024,0.9,1,2,3,260.71,260.64, 1 ,Culvert #1  , 0 ,
    3.56    4.96    6.56    9.96
Conn Culvert Barrel=1,Barrel #01,2
    484557.98934   4751436.44773     484544.9229   4751438.60715
Conn Culvert Barrel=2,Barrel #02,3
    414557.989346744151436.44773     434544.9229   4351438.60715
     424544.9229   4251438.60715
NotString=`

const testCulvertData: CulvertGroupProperties[] = [
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
    numberOfBarrels: 1,
    culvertGroupName: "Culvert #1",
    unknownFlag: 0,
    barrelStations: [
      {
        upstreamStation: 3.56,
        downstreamStation: 4.96,
      },
      {
        upstreamStation: 6.56,
        downstreamStation: 9.96,
      },
    ],
    barrels: [
      {
        index: 1,
        name: "Barrel #01",
        coordinates: [
          {
            x: 484557.98934,
            y: 4751436.44773,
          },
          {
            x: 484544.9229,
            y: 4751438.60715,
          },
        ],
      },
      {
        index: 2,
        name: "Barrel #02",
        coordinates: [
          {
            x: 414557.98934,
            y: 6744151436.44773,
          },
          {
            x: 434544.9229,
            y: 4351438.60715,
          },
          {
            x: 424544.9229,
            y: 4251438.60715,
          },
        ],
      },
    ],
  },
]
