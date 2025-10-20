import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import { crossSectionSchema } from "../../../src/schemas/geometry/crossSectionSchema"
import { lateralWeirSchema } from "../../../src/schemas/geometry/lateralWeirSchema"
import {
  type RiverReachSchema,
  riverReachSchema,
} from "../../../src/schemas/geometry/riverReachSchema"

const sampleLines = [
  "River Reach=Trib 21 EE      ,Trib 21 EE      ",
  "Reach XY= 2 ",
  "     483651.1529    4753544.9142      483651.771    4753544.1374",
  "Rch Text X Y=483651.1529,4753544.9142",
  "Reverse River Text= 0 ",
  "",
]

describe("riverReachSchema", () => {
  const sampleCoordinates: RiverReachSchema["coordinates"] = [
    [483651.1529, 4753544.9142],
    [483651.771, 4753544.1374],
  ]

  it("parses a River Reach block with coordinates, text position, and reverse flag", () => {
    const result = parseWithSchema(riverReachSchema, sampleLines, 0)

    expect(result.nextIndex).toBe(sampleLines.length)
    expect(result.value).toMatchObject({
      riverName: "Trib 21 EE",
      reachName: "Trib 21 EE",
      coordinates: sampleCoordinates,
      textPosition: [483651.1529, 4753544.9142],
      reversedText: false,
    })
  })

  it("serializes a River Reach block with padded names and coordinate data", () => {
    const riverReach: RiverReachSchema = {
      riverName: "Trib 21 EE",
      reachName: "Trib 21 EE",
      coordinates: sampleCoordinates,
      textPosition: [483651.1529, 4753544.9142],
      reversedText: false,
    }

    const lines = serializeWithSchema(riverReachSchema, riverReach)

    expect(lines).toEqual(sampleLines)
  })

  it("throws if coordinates contain tuples with the wrong length", () => {
    const riverReach: RiverReachSchema = {
      riverName: "River",
      reachName: "Reach",
      // @ts-expect-error – deliberately provide malformed data for the test
      coordinates: [[1, 2, 3]],
    }

    expect(() => serializeWithSchema(riverReachSchema, riverReach)).toThrow(
      /Tuple for key "coordinates" must have length 2/,
    )
  })

  it("round-trips parse → serialize → parse without data loss", () => {
    const parsed = parseWithSchema(riverReachSchema, sampleLines, 0)
    const serialized = serializeWithSchema(riverReachSchema, parsed.value)
    const reparsed = parseWithSchema(riverReachSchema, serialized, 0)

    expect(reparsed.value).toEqual(parsed.value)
  })

  it("parses and serializes river station entries while preserving order", () => {
    const { value } = parseWithSchema(riverReachSchema, linesWithEntries, 0)

    expect(value.riverStationEntries).toHaveLength(2)
    expect(value.riverStationEntries?.[0]).toEqual(expectedCrossSectionEntry)
    expect(value.riverStationEntries?.[1]).toEqual(expectedLateralWeirEntry)

    const serialized = serializeWithSchema(riverReachSchema, value)

    expect(serialized).toEqual(linesWithEntries)
  })
})

const crossSectionBlock = `Type RM Length L Ch R = 1 ,1134    ,77.18,77.66,78.93
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

const lateralWeirBlock = `Type RM Length L Ch R = 6 ,13214   ,,,
Node Last Edited Time=Mar/28/2013 14:17:01
Lateral Weir Pos= 0 
Lateral Weir End=                ,                ,        ,150             
Lateral Weir Distance=1
Lateral Weir TW Multiple XS=0
Lateral Weir WD=20
Lateral Weir Coef=2
Lateral Weir WSCriteria=-1 
Lateral Weir Flap Gates= 0 
Lateral Weir Hagers EQN= 0 ,,,,,
Lateral Weir SS=0.05,0.05,
Lateral Weir Type= 0 
Lateral Weir Connection Pos and Dist= 0 ,
Lateral Weir SE= 2 
       0   952.2     903     952
Lateral Weir Centerline= 0 
Lateral Weir HW RS Station=13214.80,-1
Lateral Weir TW RS Station=,0
LW Div RC= 0 ,False,

`

const crossSectionBlockLines = crossSectionBlock.split("\n")
const expectedCrossSectionEntry = parseWithSchema(
  crossSectionSchema,
  crossSectionBlockLines,
  0,
).value
const canonicalCrossSectionLines = serializeWithSchema(
  crossSectionSchema,
  expectedCrossSectionEntry,
)

const lateralWeirBlockLines = lateralWeirBlock.split("\n")
const expectedLateralWeirEntry = parseWithSchema(lateralWeirSchema, lateralWeirBlockLines, 0).value
const canonicalLateralWeirLines = serializeWithSchema(lateralWeirSchema, expectedLateralWeirEntry)

const linesWithEntries = [
  ...sampleLines,
  ...canonicalCrossSectionLines,
  ...canonicalLateralWeirLines,
]
