import { describe, expect, it } from "vitest"
import { parseWithSchema, schema, serializeWithSchema } from "../../../src/schema"
import { userCurveSetContextual } from "../../../src/schemas/geometry/gate/userCurveSetSchema"

const lineString = `Connection Gate User Curve Set=Curve Set#1
Connection Gate User Curve Set Headwater=3
       1       2       3
Connection Gate User Curve Set Gate Opening=2
     100     102
Connection Gate User Curve Set Flows
     200     300
     201     301
     202     302
Connection Gate User Curve Set=Curve Set#2
Connection Gate User Curve Set Headwater=2
       1       2
Connection Gate User Curve Set Gate Opening=2
     100     102
Connection Gate User Curve Set Flows
     200     300
     201     301`

const expectedCurveSet = [
  {
    name: "Curve Set#1",
    headwaters: [1, 2, 3],
    curves: [
      { openingHeight: 100, flows: [200, 201, 202] },
      { openingHeight: 102, flows: [300, 301, 302] },
    ],
  },
  {
    name: "Curve Set#2",
    headwaters: [1, 2],
    curves: [
      { openingHeight: 100, flows: [200, 201] },
      { openingHeight: 102, flows: [300, 301] },
    ],
  },
]

const curveSchema = schema([userCurveSetContextual])

describe("gateSchema", () => {
  it("parses Gate geometry correctly", () => {
    const result = parseWithSchema(curveSchema, lineString.split("\n"), 0)

    console.log("Parsed result:", JSON.stringify(result.value, null, 2))
    expect(result.value.userDefinedGateCurves).toMatchObject(expectedCurveSet)
  })
  it("serializes Gate geometry correctly", () => {
    const result = parseWithSchema(curveSchema, lineString.split("\n"), 0)
    const serialized = serializeWithSchema(curveSchema, result.value)
    expect(serialized.join("\n")).toEqual(lineString)
  })
})

const linesForGates = `Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings
Emergency   ,7.01,4.4,94.64,0.6,0,1,0.5, 4 ,1.7, 0 ,,, 3 ,0,0.8, 0 ,0.6,RC Flood-Emerg,0,0,0, 0 
   500.4   510.1   519.3
Conn Gate Opening=1,Emergency Spillway #1,2
394456.4031553515030287.30551731394453.7530245725030300.37340357
Conn Gate Opening=2,Emergency Spillway #2,2
394465.769996896   5030290.00134394463.1198661175030303.06922625
Conn Gate Opening=3,Emergency Spillway #3,2
394474.7256112515030292.10316786394472.0754804725030305.17105411
Conn Gate Name Wd,H,Inv,GCoef,Exp_T,Exp_O,Exp_H,Type,WCoef,Is_Ogee,SpillHt,DesHd,#Openings
Sluiceway   ,6.86,10.74,89.916,0.6,0,1,0.5, 4 ,2.05, 0 ,,, 3 ,0,0.8, 0 ,0.6,RC Flood,0,0,0, 0 
  562.77  570.72  578.69
Conn Gate Opening=1,Opening #1,2
394517.9291573055030299.61122206394513.4155731325030317.61660411
Conn Gate Opening=2,Opening #2,2
394525.875128423 5030301.4293693394520.7439176575030319.74356464
Conn Gate Opening=3,Opening #3,2
394533.5722419855030303.19513503394528.5954378685030321.50933036`

const gateData = [
  {
    name: "Emergency",
    width: 7.01,
    height: 4.4,
    invert: 94.64,
    gateCoefficient: 0.6,
    expT: 0,
    expO: 1,
    expH: 0.5,
    type: 4,
    weirCoefficient: 1.7,
    isOgee: 0,
    spillHeight: null,
    designHead: null,
    numberOfOpenings: 3,
    param15: 0,
    param16: 0,
    param17: 0,
    param18: null,
    ratingCurveName: 'RC Flood-Emerg',
    param20: 0,
    param21: 0,
    param22: 0,
    param23: 0,
    openingStations: [394456.4031553515030287.30551731, 394465.769996896, 394474.725611251503029],
  },
]
