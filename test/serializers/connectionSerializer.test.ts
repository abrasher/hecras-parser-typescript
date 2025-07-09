import { describe, expect, it } from "vitest"
import { serializeConnection, serializeConnectionString } from "../../src/serializers/geometry/connectionSerializer"
import { parseConnectionData } from "../../src/parsers/geometry/connectionParser"
import type { Connection } from "../../src/models/geometry/connection"
import type { BridgeCrossSection } from "../../src/models/geometry/bridge"

describe("Connection Serializer Tests", () => {
  // Test data from Connection.test.ts
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

  const testConnectionData: Connection = {
    name: "DM22-38608",
    description: "2nd bridge downstream of Dingman Dr",
    connectionLine: [
      { x: 483888.50815, y: 4751220.0721 },
      { x: 483877.6897, y: 4751236.0422 },
    ],
    centerlineProfile: 0,
    lastEditedTime: "May-15-2025 15:58:25",
    cellSizeMin: 2,
    nearRepeats: 1,
    upstreamStorageArea: "2D_Grid",
    downstreamStorageArea: "2D_Grid",
    routingType: 32,
    useRCFamily: false,
    overflowMethod2D: true,
    weirWD: 3,
    weirCoefficient: 1.4,
    weirIsOgee: 0,
    weirDesignEG: 0,
    weirDesignHT: 0,
    simpleSpillPosCoef: 0.05,
    simpleSpillNegCoef: 0.05,
    weirSE: [], // Empty array for 0 weir station elevation points
    hTabHWMax: 267,
    outletRatingCurve: {
      value: 0,
      flag: false,
      param3: "",
      param4: "",
    },
    bridge: {
      bridge: {
        momentumEquationAddFriction: -1,
        momentumEquationAddWeight: 0,
        pressureFlowCriteria: -1,
        classBDefaults: -1,
        param5: 0,
        contractionCoefficient: 0.3,
        expansionCoefficient: 0.5,
      },
      pressureWeir: {
        value1: 0.08,
        value2: null,
        value3: 0.25,
        value4: null,
        value5: 0.016,
      },
      deckParameters: {
        deckDistance: 2,
        width: 3,
        weirCoefficient: 1.4,
        skew: 0,
        numberOfUpstreamStations: 11,
        numberOfDownstreamStations: 11,
        minLowCoordinate: null,
        maxHighCoordinate: null,
        maxSubmerge: 0.98,
        isOgee: 0,
        upstream: [
          { station: 2, highChord: 260.83, lowChord: null },
          { station: 2.61, highChord: 261.67, lowChord: null },
          { station: 3.24, highChord: 261.67, lowChord: null },
          { station: 3.24, highChord: 261.67, lowChord: 260.52 },
          { station: 6.66, highChord: 261.7, lowChord: 260.24 },
          { station: 13.09, highChord: 261.73, lowChord: 260.38 },
          { station: 16.35, highChord: 261.75, lowChord: 260.71 },
          { station: 16.87, highChord: 261.77, lowChord: 260.71 },
          { station: 16.87, highChord: 261.77, lowChord: null },
          { station: 17.33, highChord: 261.77, lowChord: null },
          { station: 17.78, highChord: 261.05, lowChord: null },
        ],
        downstream: [
          { station: 2, highChord: 260.83, lowChord: null },
          { station: 2.61, highChord: 261.67, lowChord: null },
          { station: 3.24, highChord: 261.67, lowChord: null },
          { station: 3.24, highChord: 261.67, lowChord: 260.52 },
          { station: 6.66, highChord: 261.7, lowChord: 260.24 },
          { station: 13.09, highChord: 261.73, lowChord: 260.38 },
          { station: 16.35, highChord: 261.75, lowChord: 260.71 },
          { station: 16.87, highChord: 261.77, lowChord: 260.71 },
          { station: 16.87, highChord: 261.77, lowChord: null },
          { station: 17.33, highChord: 261.77, lowChord: null },
          { station: 17.78, highChord: 261.05, lowChord: null },
        ],
      },
      insideCrossSections: [
        {
          id: 1,
          points: [
            { station: 0, elevation: 260.817 },
            { station: 0.407, elevation: 260.859 },
            { station: 0.602, elevation: 260.838 },
            { station: 1.011, elevation: 260.833 },
            { station: 1.614, elevation: 260.736 },
            { station: 2.043, elevation: 260.584 },
            { station: 2.403, elevation: 260.492 },
            { station: 2.822, elevation: 260.327 },
            { station: 3.426, elevation: 259.969 },
            { station: 3.566, elevation: 259.645 },
            { station: 3.843, elevation: 258.84 },
            { station: 4.03, elevation: 258.631 },
            { station: 4.923, elevation: 258.586 },
            { station: 5.238, elevation: 258.546 },
            { station: 6.003, elevation: 258.389 },
            { station: 6.363, elevation: 258.269 },
            { station: 6.723, elevation: 258.12 },
            { station: 7.05, elevation: 258.022 },
            { station: 8.258, elevation: 257.839 },
            { station: 8.915, elevation: 257.766 },
            { station: 9.603, elevation: 257.784 },
            { station: 11.043, elevation: 257.863 },
            { station: 11.277, elevation: 257.884 },
            { station: 11.763, elevation: 257.997 },
            { station: 12.483, elevation: 258.273 },
            { station: 12.844, elevation: 258.446 },
            { station: 13.204, elevation: 258.717 },
            { station: 13.373, elevation: 258.818 },
            { station: 13.564, elevation: 258.899 },
            { station: 13.693, elevation: 258.922 },
            { station: 14.297, elevation: 258.929 },
            { station: 14.644, elevation: 258.956 },
            { station: 15.364, elevation: 259.117 },
            { station: 15.505, elevation: 259.181 },
            { station: 15.724, elevation: 259.337 },
            { station: 17.316, elevation: 260.503 },
            { station: 17.92, elevation: 260.79 },
            { station: 18.524, elevation: 260.894 },
            { station: 18.722, elevation: 260.901 },
            { station: 19.289, elevation: 260.858 },
          ],
          bankStations: {
            sectionId: 1,
            leftBank: 2.043,
            rightBank: 17.92,
          },
          manningCoefficients: [
            { station: 0, nValue: 0.09 },
            { station: 2.043, nValue: 0.035 },
            { station: 17.92, nValue: 0.09 },
          ],
        },
        {
          id: 2,
          points: [
            { station: 0, elevation: 260.819 },
            { station: 0.386, elevation: 260.77 },
            { station: 0.746, elevation: 260.695 },
            { station: 1.466, elevation: 260.607 },
            { station: 1.835, elevation: 260.505 },
            { station: 2.439, elevation: 260.32 },
            { station: 3.266, elevation: 259.94 },
            { station: 3.647, elevation: 259.781 },
            { station: 4.251, elevation: 258.204 },
            { station: 5.458, elevation: 258.127 },
            { station: 6.062, elevation: 258.028 },
            { station: 6.666, elevation: 257.907 },
            { station: 7.161, elevation: 257.834 },
            { station: 9.082, elevation: 257.709 },
            { station: 9.686, elevation: 257.737 },
            { station: 11.907, elevation: 258.189 },
            { station: 12.102, elevation: 258.247 },
            { station: 12.267, elevation: 258.331 },
            { station: 12.706, elevation: 258.609 },
            { station: 12.987, elevation: 258.761 },
            { station: 13.309, elevation: 258.883 },
            { station: 14.517, elevation: 258.855 },
            { station: 15.121, elevation: 258.859 },
            { station: 15.507, elevation: 259.076 },
            { station: 15.725, elevation: 259.232 },
            { station: 16.227, elevation: 259.547 },
            { station: 16.587, elevation: 259.817 },
            { station: 16.968, elevation: 260.135 },
            { station: 17.307, elevation: 260.342 },
            { station: 17.859, elevation: 260.711 },
            { station: 18.027, elevation: 260.802 },
            { station: 18.141, elevation: 260.85 },
            { station: 18.745, elevation: 260.906 },
            { station: 19.107, elevation: 260.858 },
            { station: 19.289, elevation: 260.865 },
          ],
          bankStations: {
            sectionId: 2,
            leftBank: 3.647,
            rightBank: 16.968,
          },
          manningCoefficients: [
            { station: 0, nValue: 0.09 },
            { station: 3.647, nValue: 0.035 },
            { station: 16.968, nValue: 0.09 },
          ],
        },
      ] as [BridgeCrossSection, BridgeCrossSection],
      bridgeCoefficients: {
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
      },
      bridgeSkew: 0,
      externalCrossSections: [
        {
          id: 1,
          points: [
            { station: 0, elevation: 260.408 },
            { station: 0.278, elevation: 260.382 },
            { station: 0.987, elevation: 260.404 },
            { station: 1.468, elevation: 260.396 },
            { station: 2.675, elevation: 260.318 },
            { station: 3.279, elevation: 259.02 },
            { station: 4.587, elevation: 258.908 },
            { station: 4.947, elevation: 258.853 },
            { station: 5.695, elevation: 258.709 },
            { station: 6.027, elevation: 258.549 },
            { station: 6.388, elevation: 258.327 },
            { station: 6.748, elevation: 258.176 },
            { station: 7.108, elevation: 258.085 },
            { station: 8.111, elevation: 257.887 },
            { station: 8.715, elevation: 257.809 },
            { station: 10.526, elevation: 257.723 },
            { station: 11.13, elevation: 257.739 },
            { station: 11.867, elevation: 257.894 },
            { station: 12.759, elevation: 258.107 },
            { station: 13.228, elevation: 258.245 },
            { station: 13.546, elevation: 258.314 },
            { station: 14.15, elevation: 258.665 },
            { station: 14.754, elevation: 259.08 },
            { station: 15.028, elevation: 259.232 },
            { station: 15.358, elevation: 259.357 },
            { station: 16.108, elevation: 259.553 },
            { station: 16.468, elevation: 259.614 },
            { station: 16.828, elevation: 259.718 },
            { station: 17.909, elevation: 259.939 },
            { station: 18.108, elevation: 259.994 },
            { station: 18.377, elevation: 260.1 },
            { station: 19.289, elevation: 260.159 },
          ],
          bankStations: {
            sectionId: 1,
            leftBank: 2.675,
            rightBank: 17.909,
          },
          manningCoefficients: [
            { station: 0, nValue: 0.09 },
            { station: 2.675, nValue: 0.035 },
            { station: 17.909, nValue: 0.09 },
          ],
        },
        {
          id: 2,
          points: [
            { station: 0, elevation: 260.421 },
            { station: 0.774, elevation: 260.379 },
            { station: 1.081, elevation: 260.336 },
            { station: 1.441, elevation: 260.26 },
            { station: 1.982, elevation: 260.199 },
            { station: 2.521, elevation: 260.104 },
            { station: 3.241, elevation: 259.917 },
            { station: 3.961, elevation: 259.643 },
            { station: 4.398, elevation: 259.505 },
            { station: 5.001, elevation: 257.997 },
            { station: 6.121, elevation: 257.956 },
            { station: 6.842, elevation: 257.844 },
            { station: 7.202, elevation: 257.81 },
            { station: 9.229, elevation: 257.703 },
            { station: 9.558, elevation: 257.729 },
            { station: 9.833, elevation: 257.769 },
            { station: 11.882, elevation: 258.203 },
            { station: 12.249, elevation: 258.324 },
            { station: 12.852, elevation: 258.73 },
            { station: 12.962, elevation: 258.781 },
            { station: 13.456, elevation: 258.834 },
            { station: 14.762, elevation: 258.859 },
            { station: 15.268, elevation: 258.927 },
            { station: 15.482, elevation: 259.036 },
            { station: 15.798, elevation: 259.246 },
            { station: 16.476, elevation: 259.822 },
            { station: 16.69, elevation: 259.917 },
            { station: 16.922, elevation: 259.989 },
            { station: 17.282, elevation: 260.067 },
            { station: 17.581, elevation: 260.105 },
            { station: 18.003, elevation: 260.122 },
            { station: 18.363, elevation: 260.131 },
            { station: 19.289, elevation: 260.061 },
          ],
          bankStations: {
            sectionId: 2,
            leftBank: 3.961,
            rightBank: 16.476,
          },
          manningCoefficients: [
            { station: 0, nValue: 0.09 },
            { station: 3.961, nValue: 0.035 },
            { station: 16.476, nValue: 0.09 },
          ],
        },
      ] as [BridgeCrossSection, BridgeCrossSection],
      upstreamIneffectiveFlowArea: {
        leftStation: 3.24,
        leftElevation: 260.6,
        rightStation: 16.87,
        rightElevation: 260.72,
      },
      downstreamIneffectiveFlowArea: {
        leftStation: 3.24,
        leftElevation: 260.55,
        rightStation: 16.87,
        rightElevation: 260.72,
      },
    },
  }

  describe("Basic Connection Properties", () => {
    it("should serialize connection name", () => {
      const result = serializeConnection(testConnectionData)
      expect(result[0]).toBe("Connection=DM22-38608      ,0,0")
    })

    it("should serialize connection description", () => {
      const result = serializeConnection(testConnectionData)
      expect(result[1]).toBe("Connection Desc=2nd bridge downstream of Dingman Dr")
    })

    it("should serialize connection line coordinates", () => {
      const result = serializeConnection(testConnectionData)
      expect(result[2]).toBe("Connection Line=2")
      expect(result[3]).toBe("    483888.50815    4751220.0721     483877.6897    4751236.0422")
    })

    it("should serialize basic connection properties", () => {
      const result = serializeConnection(testConnectionData)
      expect(result[4]).toBe("Connection Centerline Profile=0")
      expect(result[5]).toBe("Connection Last Edited Time=May-15-2025 15:58:25")
    })
  })

  describe("Computational Settings", () => {
    it("should serialize computational settings", () => {
      const result = serializeConnection(testConnectionData)
      const lines = result.join("\n")
      expect(lines).toContain("Conn CellSize Min=2")
      expect(lines).toContain("Conn Near Repeats=1")
      expect(lines).toContain("Conn Routing Type= 32 ")
      expect(lines).toContain("Conn Use RC Family=False")
      expect(lines).toContain("Conn OverFlow Method 2D=True")
    })
  })

  describe("Storage Area Connections", () => {
    it("should serialize storage area connections", () => {
      const result = serializeConnection(testConnectionData)
      const lines = result.join("\n")
      expect(lines).toContain("Connection Up SA=2D_Grid         ")
      expect(lines).toContain("Connection Dn SA=2D_Grid         ")
    })
  })

  describe("Weir Properties", () => {
    it("should serialize weir properties", () => {
      const result = serializeConnection(testConnectionData)
      const lines = result.join("\n")
      expect(lines).toContain("Conn Weir WD=3")
      expect(lines).toContain("Conn Weir Coef=1.4")
      expect(lines).toContain("Conn Weir Is Ogee= 0 ")
      expect(lines).toContain("Conn Weir Design EG=0")
      expect(lines).toContain("Conn Weir Design HT=0")
      expect(lines).toContain("Conn Simple Spill Pos Coef=0.05")
      expect(lines).toContain("Conn Simple Spill Neg Coef=0.05")
      expect(lines).toContain("Conn Weir SE= 0 ")
      expect(lines).toContain("Conn HTab HWMax=267")
    })
  })

  describe("Outlet Rating Curve", () => {
    it("should serialize outlet rating curve", () => {
      const result = serializeConnection(testConnectionData)
      const lines = result.join("\n")
      expect(lines).toContain("Conn Outlet Rating Curve= 0 ,False,,")
    })
  })

  describe("Bridge Connection Integration", () => {
    it("should include bridge connection data", () => {
      const result = serializeConnection(testConnectionData)
      const lines = result.join("\n")
      expect(lines).toContain("Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5")
      expect(lines).toContain("Conn BR: BR SE=1,40")
      expect(lines).toContain("Conn BR: BR Coef=-1 , 0 , 0 ,,,0.8,0,1.2,0,")
    })
  })

  describe("Complete Connection Serialization", () => {
    it("should serialize complete connection", () => {
      const result = serializeConnection(testConnectionData)
      const expected = lineString.split("\n")

      expect(result).toEqual(expected)
    })
  })

  describe("serializeConnectionString", () => {
    it("should serialize connection to string", () => {
      const result = serializeConnectionString(testConnectionData)
      expect(result).toBe(lineString)
    })
  })

  describe("round-trip tests", () => {
    it("should parse and serialize back to identical format", () => {
      const lines = lineString.split("\n")
      const parsed = parseConnectionData(lines[0], lines, 0)
      const serialized = serializeConnection(parsed.data)

      expect(serialized).toEqual(lines)
    })

    it("should parse and serialize back to identical data", () => {
      const lines = lineString.split("\n")
      const parsed = parseConnectionData(lines[0], lines, 0)
      const serialized = serializeConnection(parsed.data)
      const reParsed = parseConnectionData(serialized[0], serialized, 0)

      expect(reParsed.data).toEqual(parsed.data)
    })
  })
})
