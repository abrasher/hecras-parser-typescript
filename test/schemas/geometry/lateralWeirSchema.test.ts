import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import {
  lateralWeirSchema,
  type LateralWeirSchema,
} from "../../../src/schemas/geometry/lateralWeirSchema"

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
LW Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings
Gate #1     ,10,5,205,0.6,0,1,0.5, 0 ,3, 0 ,,, 12 ,0,0.8, 0 ,0.6,,0,0,0, 0 
      80     100     120     140     160     180     200     220     240     260
     280     300
LW Gate Opening=1,Opening #1,0
LW Gate Opening=2,Opening #2,0
LW Gate Opening=3,Opening #3,0
LW Gate Opening=4,Opening #4,0
LW Gate Opening=5,Opening #5,0
LW Gate Opening=6,Opening #6,0
LW Gate Opening=7,Opening #7,0
LW Gate Opening=8,Opening #8,0
LW Gate Opening=9,Opening #9,0
LW Gate Opening=10,Opening #10,0
LW Gate Opening=11,Opening #11,0
LW Gate Opening=12,Opening #12,0
LW Div RC= 0 ,False,

`

const rawLines = lateralWeirBlock.split("\n")
const canonicalLines = serializeWithSchema(
  lateralWeirSchema,
  parseWithSchema(lateralWeirSchema, rawLines, 0).value,
)

describe("lateralWeirSchema", () => {
  const lines = canonicalLines

  it("parses a lateral weir block", () => {
    const result = parseWithSchema(lateralWeirSchema, lines, 0)

    expect(result.value).toEqual(expectedLateralWeir)
  })

  it("round-trips lateral weir data", () => {
    const parsed = parseWithSchema(lateralWeirSchema, lines, 0)
    const serialized = serializeWithSchema(lateralWeirSchema, parsed.value)
    const reparsed = parseWithSchema(lateralWeirSchema, serialized, 0)

    expect(reparsed.value).toEqual(parsed.value)
    expect(serialized).toEqual(lines)
  })
})

const expectedLateralWeir: LateralWeirSchema = {
  type: 6,
  riverMile: "13214",
  lengthLeft: null,
  lengthChannel: null,
  lengthRight: null,
  lastEditedTime: "Mar/28/2013 14:17:01",
  position: 0,
  endRiver: "",
  endReach: "",
  endCrossSection: "",
  endStation: "150",
  distance: 1,
  tailwaterMultipleCrossSections: 0,
  weirWidth: 20,
  weirCoefficient: 2,
  wsCriteria: true,
  flapGateCount: 0,
  hagersEquation: 0,
  hagersCoefficient1: null,
  hagersCoefficient2: null,
  hagersCoefficient3: null,
  hagersCoefficient4: null,
  hagersCoefficient5: null,
  sideSlopeUpstream: 0.05,
  sideSlopeDownstream: 0.05,
  sideSlopeAdditional: null,
  lateralWeirType: 0,
  connectionPosition: 0,
  connectionDistance: null,
  stageElevationPairs: [
    [0, 952.2],
    [903, 952],
  ],
  centerlineOption: 0,
  headwaterConnections: [
    {
      elevation: "-1",
      station: "13214.80",
    },
  ],
  tailwaterConnections: [
    {
      elevation: "0",
      station: "",
    },
  ],
  gate: {
    gateName: "Gate #1",
    width: 10,
    height: 5,
    invert: 205,
    gCoef: 0.6,
    expT: 0,
    expO: 1,
    expH: 0.5,
    type: 0,
    wCoef: 3,
    isOgee: false,
    spillwayHeight: null,
    designHead: null,
    unknownParam1: 0,
    unknownParam2: 0.8,
    unknownParam3: 0,
    unknownParam4: 0.6,
    unknownParam5: null,
    unknownParam6: 0,
    unknownParam7: 0,
    unknownParam8: 0,
    unknownParam9: 0,
    gatePositions: [80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300],
    gateOpenings: [
      { id: 1, name: "Opening #1", gateFlag: false },
      { id: 2, name: "Opening #2", gateFlag: false },
      { id: 3, name: "Opening #3", gateFlag: false },
      { id: 4, name: "Opening #4", gateFlag: false },
      { id: 5, name: "Opening #5", gateFlag: false },
      { id: 6, name: "Opening #6", gateFlag: false },
      { id: 7, name: "Opening #7", gateFlag: false },
      { id: 8, name: "Opening #8", gateFlag: false },
      { id: 9, name: "Opening #9", gateFlag: false },
      { id: 10, name: "Opening #10", gateFlag: false },
      { id: 11, name: "Opening #11", gateFlag: false },
      { id: 12, name: "Opening #12", gateFlag: false },
    ],
  },
  ratingCurveId: 0,
  useRatingCurve: false,
  ratingCurveLabel: "",
}
