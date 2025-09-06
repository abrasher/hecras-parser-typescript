import { describe, expect, it, beforeAll } from "vitest"
import type { Connection } from "../../../src/models/geometry/connection"
import { parseConnectionData } from "../../../src/parsers/geometry/connectionParser"

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

describe("Connection parsing tests", () => {
  const lines = lineString.split("\n")
  let connectionData: Connection

  beforeAll(() => {
    // This would be implemented with actual connection parser
    const result = parseConnectionData(lines[0], lines, 0)
    connectionData = result.data
  })

  describe("Basic Connection Properties", () => {
    it("should parse connection name", () => {
      expect(connectionData.name).toBe("DM22-38608")
    })

    it("should parse connection description", () => {
      expect(connectionData.description).toBe("2nd bridge downstream of Dingman Dr")
    })

    it("should parse connection line coordinates", () => {
      expect(connectionData.connectionLine).toEqual([
        [483888.50815, 4751220.0721],
        [483877.6897, 4751236.0422],
      ])
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
      expect(connectionData.weirSE?.length).toBe(0)
    })

    it("should parse hydraulic table max", () => {
      expect(connectionData.hTabHWMax).toBe(267)
    })
  })

  describe("Outlet Rating Curve", () => {
    it("should parse outlet rating curve parameters", () => {
      expect(connectionData.outletRatingCurve).toEqual({
        value: 0,
        flag: false,
        param3: "",
        param4: "",
      })
    })
  })

  describe("Bridge Connection", () => {
    it("should have bridge data", () => {
      expect(connectionData.bridge).toBeDefined()
    })

    it("should parse bridge configuration", () => {
      expect(connectionData.bridge!.bridge).toEqual({
        momentumEquationAddFriction: -1,
        momentumEquationAddWeight: 0,
        pressureFlowCriteria: -1,
        classBDefaults: -1,
        param5: 0,
        contractionCoefficient: 0.3,
        expansionCoefficient: 0.5,
      })
    })

    it("should parse pressure weir data", () => {
      expect(connectionData.bridge!.pressureWeir).toEqual({
        value1: 0.08,
        value2: null,
        value3: 0.25,
        value4: null,
        value5: 0.016,
      })
    })

    it("should parse deck parameters", () => {
      const deckParams = connectionData.bridge!.deckParameters
      expect(deckParams.deckDistance).toBe(2)
      expect(deckParams.width).toBe(3)
      expect(deckParams.weirCoefficient).toBe(1.4)
      expect(deckParams.skew).toBe(0)
      expect(deckParams.numberOfUpstreamStations).toBe(11)
      expect(deckParams.numberOfDownstreamStations).toBe(11)
      expect(deckParams.maxSubmerge).toBe(0.98)
      expect(deckParams.isOgee).toBe(0)
    })

    it("should parse bridge sections", () => {
      expect(connectionData.bridge!.insideUpstreamCrossSection).toBeDefined()
      expect(connectionData.bridge!.insideDownstreamCrossSection).toBeDefined()

      const section1 = connectionData.bridge!.insideUpstreamCrossSection
      expect(section1.id).toBe(1)
      expect(section1.points).toHaveLength(40)
      expect(section1.points[0]).toEqual([0, 260.817])
      expect(section1.bankStations.leftBank).toBe(2.043)
      expect(section1.bankStations.rightBank).toBe(17.92)
    })

    it("should parse bridge coefficients", () => {
      expect(connectionData.bridge!.bridgeCoefficients).toEqual({
        coef1: -1,
        coef2: 0,
        coef3: 0,
        coef4: null,
        coef5: null,
        coef6: null,
        coef7: 0.8,
        coef8: 0,
        coef9: 1.2,
        coef10: 0,
        coef11: null,
      })
    })

    it("should parse bridge skew", () => {
      expect(connectionData.bridge!.bridgeSkew).toBe(0)
    })

    it("should parse cross sections", () => {
      expect(connectionData.bridge!.externalUpstreamCrossSection).toBeDefined()
      expect(connectionData.bridge!.externalDownstreamCrossSection).toBeDefined()

      const xs1 = connectionData.bridge!.externalUpstreamCrossSection
      expect(xs1.id).toBe(1)
      expect(xs1.points).toHaveLength(32)
      expect(xs1.points[0]).toEqual([0, 260.408])
    })

    it("should parse ineffective flow areas", () => {
      expect(connectionData.bridge!.upstreamIneffectiveFlowArea).toEqual({
        leftStation: 3.24,
        leftElevation: 260.6,
        rightStation: 16.87,
        rightElevation: 260.72,
      })

      expect(connectionData.bridge!.downstreamIneffectiveFlowArea).toEqual({
        leftStation: 3.24,
        leftElevation: 260.55,
        rightStation: 16.87,
        rightElevation: 260.72,
      })
    })
  })

  describe("Complete Object Validation", () => {
    it("should have correct bridge structure with individual cross sections", () => {
      expect(connectionData.bridge).toBeDefined()
      expect(connectionData.bridge!.insideUpstreamCrossSection).toBeDefined()
      expect(connectionData.bridge!.insideDownstreamCrossSection).toBeDefined()
      expect(connectionData.bridge!.externalUpstreamCrossSection).toBeDefined()
      expect(connectionData.bridge!.externalDownstreamCrossSection).toBeDefined()

      expect(connectionData.bridge!.insideUpstreamCrossSection.id).toBe(1)
      expect(connectionData.bridge!.insideDownstreamCrossSection.id).toBe(2)
      expect(connectionData.bridge!.externalUpstreamCrossSection.id).toBe(1)
      expect(connectionData.bridge!.externalDownstreamCrossSection.id).toBe(2)
    })
  })
})
