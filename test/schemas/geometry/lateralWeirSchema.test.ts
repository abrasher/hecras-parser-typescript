import { describe, expect, it } from "vitest"
import { parseWithSchema, serializeWithSchema } from "../../../src/schema"
import {
  lateralWeirSchema,
  type LateralWeirSchema,
} from "../../../src/schemas/geometry/lateralWeirSchema"

describe("lateralWeirSchema", () => {
  const lines = lateralWeirBlock.split("\n")

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
LW Div RC= 0 ,False,`

const expectedLateralWeir: LateralWeirSchema = {
  position: 0,
  endRiver: "",
  endReach: "",
  endCrossSection: "",
  endStation: 150,
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
  headwaterStation: "13214.80",
  headwaterCrossSection: true,
  tailwaterStation: null,
  tailwaterCrossSection: 0,
  ratingCurveId: 0,
  useRatingCurve: false,
  ratingCurveLabel: "",
}
