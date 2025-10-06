import { beforeAll, describe, expect, it } from "vitest"

import { parseSectionWithSchema, serializeWithSchema } from "../../../src/schema/driver"
import {
  connectionSchema,
  type ConnectionSchema,
} from "../../../src/schemas/geometry/connectionSchema"

const lineString = `Connection=DM22-38608      ,0,0
Connection Desc=2nd bridge downstream of Dingman Dr
Connection Line=2
    483888.50815    4751220.0721     483877.6897    4751236.0422
Connection Centerline Profile=0
Connection Last Edited Time=May-15-2025 15:58:25
Conn CellSize Min=2
Conn Near Repeats=1
Connection Up SA=2D_Grid         
Connection Dn SA=2D_Grid         
Conn Routing Type= 32 
Conn Use RC Family=False
Conn OverFlow Method 2D=True
Conn Weir WD=3
Conn Weir Coef=1.4
Conn Weir Is Ogee= 0 
Conn Weir Design EG=0
Conn Weir Design HT=0
Conn Simple Spill Pos Coef=0.05
Conn Simple Spill Neg Coef=0.05
Conn Weir SE= 0 
Conn HTab HWMax=267

Conn Outlet Rating Curve= 0 ,False,,
Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5
Conn BR: Pressure-Weir=0.08,,0.25,,0.016
Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee
2,3,1.4,0, 11, 11, , , 0.98, 0, 0,0,0,0
       2    2.61    3.24    3.24    6.66   13.09   16.35   16.87   16.87   17.33
   17.78
  260.83  261.67  261.67  261.67   261.7  261.73  261.75  261.77  261.77  261.77
  261.05
                          260.52  260.24  260.38  260.71  260.71                
        
       2    2.61    3.24    3.24    6.66   13.09   16.35   16.87   16.87   17.33
   17.78
  260.83  261.67  261.67  261.67   261.7  261.73  261.75  261.77  261.77  261.77
  261.05
                          260.52  260.24  260.38  260.71  260.71                
        
Conn BR: BR SE=1,40
       0 260.817    .407 260.859    .602 260.838   1.011 260.833   1.614 260.736
   2.043 260.584   2.403 260.492   2.822 260.327   3.426 259.969   3.566 259.645
   3.843  258.84    4.03 258.631   4.923 258.586   5.238 258.546   6.003 258.389
   6.363 258.269   6.723  258.12    7.05 258.022   8.258 257.839   8.915 257.766
   9.603 257.784  11.043 257.863  11.277 257.884  11.763 257.997  12.483 258.273
  12.844 258.446  13.204 258.717  13.373 258.818  13.564 258.899  13.693 258.922
  14.297 258.929  14.644 258.956  15.364 259.117  15.505 259.181  15.724 259.337
  17.316 260.503   17.92  260.79  18.524 260.894  18.722 260.901  19.289 260.858
Conn BR: BR Bank Stations=1,2.043,17.92
Conn BR: BR Mann=1,3
       0     .09   2.043    .035   17.92     .09
Conn BR: BR SE=2,35
       0 260.819    .386  260.77    .746 260.695   1.466 260.607   1.835 260.505
   2.439  260.32   3.266  259.94   3.647 259.781   4.251 258.204   5.458 258.127
   6.062 258.028   6.666 257.907   7.161 257.834   9.082 257.709   9.686 257.737
  11.907 258.189  12.102 258.247  12.267 258.331  12.706 258.609  12.987 258.761
  13.309 258.883  14.517 258.855  15.121 258.859  15.507 259.076  15.725 259.232
  16.227 259.547  16.587 259.817  16.968 260.135  17.307 260.342  17.859 260.711
  18.027 260.802  18.141  260.85  18.745 260.906  19.107 260.858  19.289 260.865
Conn BR: BR Bank Stations=2,3.647,16.968
Conn BR: BR Mann=2,3
       0     .09   3.647    .035  16.968     .09
Conn BR: BR Coef=-1 , 0 , 0 ,,,0.8,0,1.2,0,
Conn BR: BR Skew=0
Conn BR: XS SE=1,32
       0 260.408    .278 260.382    .987 260.404   1.468 260.396   2.675 260.318
   3.279  259.02   4.587 258.908   4.947 258.853   5.695 258.709   6.027 258.549
   6.388 258.327   6.748 258.176   7.108 258.085   8.111 257.887   8.715 257.809
  10.526 257.723   11.13 257.739  11.867 257.894  12.759 258.107  13.228 258.245
  13.546 258.314   14.15 258.665  14.754  259.08  15.028 259.232  15.358 259.357
  16.108 259.553  16.468 259.614  16.828 259.718  17.909 259.939  18.108 259.994
  18.377   260.1  19.289 260.159
Conn BR: XS Bank Stations=1,2.675,17.909
Conn BR: XS Mann=1,3
       0     .09   2.675    .035  17.909     .09
Conn BR: XS SE=2,33
       0 260.421    .774 260.379   1.081 260.336   1.441  260.26   1.982 260.199
   2.521 260.104   3.241 259.917   3.961 259.643   4.398 259.505   5.001 257.997
   6.121 257.956   6.842 257.844   7.202  257.81   9.229 257.703   9.558 257.729
   9.833 257.769  11.882 258.203  12.249 258.324  12.852  258.73  12.962 258.781
  13.456 258.834  14.762 258.859  15.268 258.927  15.482 259.036  15.798 259.246
  16.476 259.822   16.69 259.917  16.922 259.989  17.282 260.067  17.581 260.105
  18.003 260.122  18.363 260.131  19.289 260.061
Conn BR: XS Bank Stations=2,3.961,16.476
Conn BR: XS Mann=2,3
       0     .09   3.961    .035  16.476     .09
Conn BR: USXS Ineff=3.24,260.6,16.87,260.72
Conn BR: DSXS Ineff=3.24,260.55,16.87,260.72`

const connectionLines = lineString.split("\n")

const expectedConnectionLine = [
  [483888.50815, 4751220.0721],
  [483877.6897, 4751236.0422],
]

const expectedDeckUpstream = [
  [2, 260.83, null],
  [2.61, 261.67, null],
  [3.24, 261.67, null],
  [3.24, 261.67, 260.52],
  [6.66, 261.7, 260.24],
  [13.09, 261.73, 260.38],
  [16.35, 261.75, 260.71],
  [16.87, 261.77, 260.71],
  [16.87, 261.77, null],
  [17.33, 261.77, null],
  [17.78, 261.05, null],
]

const expectedDeckDownstream = [
  [2, 260.83, null],
  [2.61, 261.67, null],
  [3.24, 261.67, null],
  [3.24, 261.67, 260.52],
  [6.66, 261.7, 260.24],
  [13.09, 261.73, 260.38],
  [16.35, 261.75, 260.71],
  [16.87, 261.77, 260.71],
  [16.87, 261.77, null],
  [17.33, 261.77, null],
  [17.78, 261.05, null],
]

describe("connectionSchema", () => {
  let connectionData: ConnectionSchema
  let serializedLines: string[]

  beforeAll(() => {
    const parsed = parseSectionWithSchema(connectionSchema, connectionLines, 0)
    connectionData = parsed.value
    serializedLines = serializeWithSchema(connectionSchema, connectionData)
  })

  describe("Parsing", () => {
    describe("Basic Connection Properties", () => {
      it("should parse connection name", () => {
        expect(connectionData.name).toBe("DM22-38608")
      })

      it("should parse connection description", () => {
        expect(connectionData.description).toBe("2nd bridge downstream of Dingman Dr")
      })

      it("should parse connection line coordinates", () => {
        expect(connectionData.connectionLine).toEqual(expectedConnectionLine)
      })

      it("should parse centerline profile", () => {
        expect(connectionData.centerlineProfile).toEqual([])
      })

      it("should parse last edited time", () => {
        expect(connectionData.lastEditedTime).toBe("May-15-2025 15:58:25")
      })
    })

    describe("Computational Settings", () => {
      it("should parse cell size minimum", () => {
        expect(connectionData.cellSizeMin).toBe(2)
      })

      it("should parse near repeats", () => {
        expect(connectionData.nearRepeats).toBe(1)
      })

      it("should parse routing type", () => {
        expect(connectionData.routingType).toBe(32)
      })

      it("should parse use RC family flag", () => {
        expect(connectionData.useRCFamily).toBe(false)
      })

      it("should parse overflow method 2D flag", () => {
        expect(connectionData.overflowMethod2D).toBe(true)
      })
    })

    describe("Storage Area Connections", () => {
      it("should parse upstream storage area", () => {
        expect(connectionData.upstreamStorageArea).toBe("2D_Grid")
      })

      it("should parse downstream storage area", () => {
        expect(connectionData.downstreamStorageArea).toBe("2D_Grid")
      })
    })

    describe("Weir Properties", () => {
      it("should parse weir width", () => {
        expect(connectionData.weirWD).toBe(3)
      })

      it("should parse weir coefficient", () => {
        expect(connectionData.weirCoefficient).toBe(1.4)
      })

      it("should parse weir is ogee flag", () => {
        expect(connectionData.weirIsOgee).toBe(0)
      })

      it("should parse weir design parameters", () => {
        expect(connectionData.weirDesignEG).toBe(0)
        expect(connectionData.weirDesignHT).toBe(0)
      })

      it("should parse spill coefficients", () => {
        expect(connectionData.simpleSpillPosCoef).toBe(0.05)
        expect(connectionData.simpleSpillNegCoef).toBe(0.05)
      })

      it("should parse weir SE", () => {
        expect(connectionData.weirSE).toEqual([])
      })

      it("should parse hydraulic table max", () => {
        expect(connectionData.hTabHWMax).toBe(267)
      })
    })

    describe("Outlet Rating Curve", () => {
      it("should parse outlet rating curve parameters", () => {
        expect(connectionData.param1).toBe(false)
        expect(connectionData.param2).toBe(null)
        expect(connectionData.param3).toBe(null)
        expect(connectionData.outletRatingCurve).toEqual([])
      })
    })

    describe("Bridge Connection", () => {
      it("should have bridge data", () => {
        expect(connectionData.bridge).toBeDefined()
      })

      it("should parse bridge configuration", () => {
        expect(connectionData.bridge).toMatchObject({
          momentumEquationAddFriction: true,
          momentumEquationAddWeight: false,
          pressureFlowCriteria: true,
          classBDefaults: true,
          param5: false,
          contractionCoefficient: 0.3,
          expansionCoefficient: 0.5,
        })
      })

      it("should parse pressure weir data", () => {
        expect(connectionData.bridge).toMatchObject({
          weirValue1: 0.08,
          weirValue2: null,
          weirValue3: 0.25,
          weirValue4: null,
          weirValue5: 0.016,
        })
      })

      it("should parse deck parameters", () => {
        const deck = connectionData.bridge?.deck
        expect(deck).toBeDefined()
        expect(deck?.deckDistance).toBe(2)
        expect(deck?.width).toBe(3)
        expect(deck?.weirCoefficient).toBe(1.4)
        expect(deck?.skew).toBe(0)
        expect(deck?.numberOfUpstreamStations).toBe(11)
        expect(deck?.numberOfDownstreamStations).toBe(11)
        expect(deck?.maxSubmerge).toBe(0.98)
        expect(deck?.isOgee).toBe(0)
        expect(deck?.upstream).toEqual(expectedDeckUpstream)
        expect(deck?.downstream).toEqual(expectedDeckDownstream)
      })

      it("should parse bridge sections", () => {
        const upstream = connectionData.bridge?.upstreamInside
        expect(upstream).toBeDefined()
        expect(upstream?.id).toBe(1)
        expect(upstream?.stationElevation).toHaveLength(40)
        expect(upstream?.stationElevation[0]).toEqual([0, 260.817])
        expect(upstream?.leftBank).toBe(2.043)
        expect(upstream?.rightBank).toBe(17.92)

        const downstream = connectionData.bridge?.downstreamInside
        expect(downstream).toBeDefined()
        expect(downstream?.id).toBe(2)
        expect(downstream?.stationElevation).toHaveLength(35)
        expect(downstream?.stationElevation[0]).toEqual([0, 260.819])
      })

      it("should parse bridge coefficients", () => {
        expect(connectionData.bridge).toMatchObject({
          bridgeCoefficient1: "-1 ",
          bridgeCoefficient2: false,
          bridgeCoefficient3: false,
          bridgeCoefficient4: null,
          bridgeCoefficient5: null,
          bridgeCoefficient6: 0.8,
          bridgeCoefficient7: false,
          bridgeCoefficient8: 1.2,
          bridgeCoefficient9: false,
          bridgeCoefficient10: null,
        })
      })

      it("should parse bridge skew", () => {
        expect(connectionData.bridge?.skew).toBe(0)
      })

      it("should parse cross sections", () => {
        const xs1 = connectionData.bridge?.upstreamExternal
        expect(xs1).toBeDefined()
        expect(xs1?.id).toBe(1)
        expect(xs1?.stationElevation).toHaveLength(32)
        expect(xs1?.stationElevation[0]).toEqual([0, 260.408])

        const xs2 = connectionData.bridge?.downstreamExternal
        expect(xs2).toBeDefined()
        expect(xs2?.id).toBe(2)
        expect(xs2?.stationElevation).toHaveLength(33)
        expect(xs2?.stationElevation[0]).toEqual([0, 260.421])
      })

      it("should parse ineffective flow areas", () => {
        expect(connectionData.bridge?.upstreamIneffectiveFlowArea).toEqual([
          3.24, 260.6, 16.87, 260.72,
        ])

        expect(connectionData.bridge?.downstreamIneffectiveFlowArea).toEqual([
          3.24, 260.55, 16.87, 260.72,
        ])
      })
    })

    describe("Complete Object Validation", () => {
      it("should have correct bridge structure with individual cross sections", () => {
        expect(connectionData.bridge).toBeDefined()
        expect(connectionData.bridge?.upstreamInside?.id).toBe(1)
        expect(connectionData.bridge?.downstreamInside?.id).toBe(2)
        expect(connectionData.bridge?.upstreamExternal?.id).toBe(1)
        expect(connectionData.bridge?.downstreamExternal?.id).toBe(2)
      })
    })
  })

  describe("Serialization", () => {
    describe("Basic Connection Properties", () => {
      it("should serialize connection name", () => {
        expect(serializedLines[0]).toBe("Connection=DM22-38608      ,0,0")
      })

      it("should serialize connection description", () => {
        expect(serializedLines[1]).toBe("Connection Desc=2nd bridge downstream of Dingman Dr")
      })

      it("should serialize connection line coordinates", () => {
        expect(serializedLines[2]).toBe("Connection Line=2")
        expect(serializedLines[3]).toBe(
          "    483888.50815    4751220.0721     483877.6897    4751236.0422",
        )
      })

      it("should serialize basic connection properties", () => {
        expect(serializedLines[4]).toBe("Connection Centerline Profile=0")
        expect(serializedLines[5]).toBe("Connection Last Edited Time=May-15-2025 15:58:25")
      })
    })

    describe("Computational Settings", () => {
      it("should serialize computational settings", () => {
        const joined = serializedLines.join("\n")
        expect(joined).toContain("Conn CellSize Min=2")
        expect(joined).toContain("Conn Near Repeats=1")
        expect(joined).toContain("Conn Routing Type= 32 ")
        expect(joined).toContain("Conn Use RC Family=False")
        expect(joined).toContain("Conn OverFlow Method 2D=True")
      })
    })

    describe("Storage Area Connections", () => {
      it("should serialize storage area connections", () => {
        const joined = serializedLines.join("\n")
        expect(joined).toContain("Connection Up SA=2D_Grid         ")
        expect(joined).toContain("Connection Dn SA=2D_Grid         ")
      })
    })

    describe("Weir Properties", () => {
      it("should serialize weir properties", () => {
        const joined = serializedLines.join("\n")
        expect(joined).toContain("Conn Weir WD=3")
        expect(joined).toContain("Conn Weir Coef=1.4")
        expect(joined).toContain("Conn Weir Is Ogee= 0 ")
        expect(joined).toContain("Conn Weir Design EG=0")
        expect(joined).toContain("Conn Weir Design HT=0")
        expect(joined).toContain("Conn Simple Spill Pos Coef=0.05")
        expect(joined).toContain("Conn Simple Spill Neg Coef=0.05")
        expect(joined).toContain("Conn Weir SE= 0 ")
        expect(joined).toContain("Conn HTab HWMax=267")
      })
    })

    describe("Outlet Rating Curve", () => {
      it("should serialize outlet rating curve", () => {
        const joined = serializedLines.join("\n")
        expect(joined).toContain("Conn Outlet Rating Curve= 0 ,False,,")
      })
    })

    describe("Bridge Connection Integration", () => {
      it("should include bridge connection data", () => {
        const joined = serializedLines.join("\n")
        expect(joined).toContain("Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5")
        expect(joined).toContain("Conn BR: BR SE=1,40")
        expect(joined).toContain("Conn BR: BR Coef=-1 , 0 , 0 ,,,0.8,0,1.2,0,")
      })
    })

    describe("Complete Connection Serialization", () => {
      it("should serialize complete connection", () => {
        expect(serializedLines).toEqual(connectionLines)
      })
    })

    describe("Modified Connection Serialization", () => {
      it("should serialize updates made to connection data", () => {
        const parsed = parseSectionWithSchema(connectionSchema, connectionLines, 0)
        const modifiedConnection = parsed.value
        const updatedDescription = "Updated connection description"

        modifiedConnection.description = updatedDescription
        modifiedConnection.weirWD = 6
        modifiedConnection.useRCFamily = true

        const updatedLines = serializeWithSchema(connectionSchema, modifiedConnection)
        const joinedLines = updatedLines.join("\n")

        expect(joinedLines).toContain(`Connection Desc=${updatedDescription}`)
        expect(joinedLines).toContain("Conn Weir WD=6")
        expect(joinedLines).toContain("Conn Use RC Family=True")
      })
    })

    describe("serializeWithSchema", () => {
      it("should serialize connection to string", () => {
        expect(serializedLines.join("\n")).toBe(lineString)
      })
    })
  })

  describe("Round-trip tests", () => {
    it("should parse and serialize back to identical format", () => {
      const parsed = parseSectionWithSchema(connectionSchema, connectionLines, 0)
      const serialized = serializeWithSchema(connectionSchema, parsed.value)
      expect(serialized).toEqual(connectionLines)
    })

    it("should parse and serialize back to identical data", () => {
      const parsed = parseSectionWithSchema(connectionSchema, connectionLines, 0)
      const serialized = serializeWithSchema(connectionSchema, parsed.value)
      const reparsed = parseSectionWithSchema(connectionSchema, serialized, 0)
      expect(reparsed.value).toEqual(parsed.value)
    })
  })
})
