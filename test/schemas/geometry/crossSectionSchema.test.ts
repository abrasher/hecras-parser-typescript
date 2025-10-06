import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import {
  crossSectionSchema,
  type CrossSectionSchema,
} from "../../../src/schemas/geometry/crossSectionSchema"

describe("crossSectionSchema", () => {
  const sampleLines = lineString.split("\n")
  it("parses example cross section block", () => {
    const result = parseWithSchema(crossSectionSchema, lineString.split("\n"), 0)

    expect(result.value).toEqual(expectedCrossSection)
  })

  it("round-trips cross section data", () => {
    const parsed = parseWithSchema(crossSectionSchema, sampleLines, 0)
    const serialized = serializeWithSchema(crossSectionSchema, parsed.value)
    const reparsed = parseWithSchema(crossSectionSchema, serialized, 0)

    expect(reparsed.value).toEqual(parsed.value)
    expect(serialized).toEqual(sampleLines)
  })
})

const lineString = `Type RM Length L Ch R = 1 ,1134    ,77.18,77.66,78.93
XS GIS Cut Line=2
     476590.3082    4751715.0149     476227.6561    4751346.9532
Node Last Edited Time=May-28-2024 10:56:01
#Sta/Elev= 10 
       0  263.29       2  263.25       3  263.27       4  263.27       5  263.31
       6  263.33       7  263.34       8  263.34    8.99  263.36    9.99  263.37
#Mann= 6 ,-1,0
       0     .05       0   67.13     .18       0  289.27     .05       0
  305.19    .035       0  308.78     .05       0  312.79     .18       0
#XS Ineff= 2 ,-1 
       0     290     262     320  516.71     262
Permanent Ineff=
       F       F
Bank Sta=305.19,308.78
XS Rating Curve= 0 ,0
XS HTab Starting El and Incr=258.5,0.24, 20 
XS HTab Horizontal Distribution= 5 , 5 , 5 
Exp/Cntr=0.3,0.1`

const expectedCrossSection: CrossSectionSchema = {
  type: 1,
  riverMile: "1134",
  lengthLeft: 77.18,
  lengthChannel: 77.66,
  lengthRight: 78.93,
  gisCutLine: [
    [476590.3082, 4751715.0149],
    [476227.6561, 4751346.9532],
  ],
  lastEditedTime: "May-28-2024 10:56:01",
  stationElevation: [
    [0, 263.29],
    [2, 263.25],
    [3, 263.27],
    [4, 263.27],
    [5, 263.31],
    [6, 263.33],
    [7, 263.34],
    [8, 263.34],
    [8.99, 263.36],
    [9.99, 263.37],
  ],
  mannings: [
    [0, 0.05, 0],
    [67.13, 0.18, 0],
    [289.27, 0.05, 0],
    [305.19, 0.035, 0],
    [308.78, 0.05, 0],
    [312.79, 0.18, 0],
  ],
  horizontalManning: true,
  horizontalK: false,
  ineffectiveFlowAreas: [
    [0, 290, 262],
    [320, 516.71, 262],
  ],
  ratingCurve: [],
  multipleBlocks: true,
  permanentIneffective: [false, false],
  leftBankStation: 305.19,
  rightBankStation: 308.78,
  checkHeadwaters: false,
  htabStartingElevation: 258.5,
  htabIncrement: 0.24,
  htabCount: 20,
  horizontalHTabLeftBank: 5,
  horizontalHTabChannel: 5,
  horizontalHTabRightBank: 5,
  expansionCoefficient: 0.3,
  contractionCoefficient: 0.1,
  lateralWeirs: [],
}
