import { describe, it, expect } from "vitest"
import { serializeConnection, serializeConnectionString } from "../geometry/connectionSerializer"
import type { Connection } from "../../models/geometry/connection"
import { CULVERT_SHAPE } from "../../models/geometry/culvert"

describe("ConnectionSerializer", () => {
  describe("GIVEN a connection with basic properties", () => {
    it("WHEN serialized THEN formats connection header", () => {
      const connection: Connection = {
        name: "Connection1",
        description: "Test connection",
        connectionLine: [
          { x: 100.0, y: 200.0 },
          { x: 150.0, y: 250.0 },
        ],
        centerlineProfile: 1,
        upstreamStorageArea: "StorageArea1",
        downstreamStorageArea: "StorageArea2",
      }

      const result = serializeConnection(connection)

      expect(result[0]).toBe("Connection=Connection1")
      expect(result[1]).toBe("Connection Desc=Test connection")
      expect(result[2]).toBe("Connection Line=2")
      expect(result[3]).toBe("           100.0           200.0")
      expect(result[4]).toBe("           150.0           250.0")
      expect(result[5]).toBe("Connection Centerline Profile=1")
      expect(result[6]).toBe("Connection Up SA=StorageArea1")
      expect(result[7]).toBe("Connection Dn SA=StorageArea2")
    })
  })

  describe("GIVEN a connection with culvert data", () => {
    it("WHEN serialized THEN delegates to culvert serializer", () => {
      const connection: Connection = {
        name: "CulvertConnection",
        connectionLine: [],
        centerlineProfile: 0,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
        culvert: [
          {
            shape: CULVERT_SHAPE.CIRCLE,
            rise: 3.0,
            span: 3.0,
            length: 100.0,
            nTop: 0.013,
            entranceLoss: 0.5,
            exitLoss: 1.0,
            chart: 1,
            scale: 1,
            upstreamInvert: 100.0,
            downstreamInvert: 99.0,
            numberOfBarrels: 1,
            culvertGroupName: "Culvert1",
            unknownFlag: 0,
            barrelStations: [{ upstreamStation: 100.0, downstreamStation: 200.0 }],
            barrels: [],
          },
        ],
      }

      const result = serializeConnection(connection)

      expect(result[0]).toBe("Connection=CulvertConnection")
      expect(result[1]).toBe("Connection Line=0")
      expect(result[2]).toBe("Connection Centerline Profile=0")
      expect(result[3]).toBe("Connection Up SA=SA1")
      expect(result[4]).toBe("Connection Dn SA=SA2")
      expect(result[5]).toBe("Connection Culv=1,3,3,100,0.013,0.5,1,1,1,100,99,1,Culvert1,0")
      expect(result[6]).toBe("     100     200")
    })
  })

  describe("GIVEN a connection with bridge data", () => {
    it("WHEN serialized THEN delegates to bridge serializer", () => {
      const connection: Connection = {
        name: "BridgeConnection",
        connectionLine: [],
        centerlineProfile: 0,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
        bridge: {
          bridge: {
            momentumEquationAddFriction: -1,
            momentumEquationAddWeight: 0,
            pressureFlowCriteria: 0,
            classBDefaults: 0,
            param5: 0,
            contractionCoefficient: 0.8,
            expansionCoefficient: 1.2,
          },
          pressureWeir: {
            value1: 1.0,
            value2: null,
            value3: 2.0,
            value4: null,
            value5: 3.0,
          },
          deckParameters: {
            deckDistance: 10.0,
            width: 50.0,
            weirCoefficient: 0.5,
            skew: 0.0,
            numberOfUpstreamStations: 0,
            numberOfDownstreamStations: 0,
            minLowCoordinate: null,
            maxHighCoordinate: null,
            maxSubmerge: 1.0,
            isOgee: 0,
            upstream: [],
            downstream: [],
          },
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
          insideCrossSections: [],
          externalCrossSections: [],
          upstreamIneffectiveFlowArea: {
            leftStation: 50,
            leftElevation: 100,
            rightStation: 150,
            rightElevation: 110,
          },
          downstreamIneffectiveFlowArea: {
            leftStation: 60,
            leftElevation: 105,
            rightStation: 160,
            rightElevation: 115,
          },
        },
      }

      const result = serializeConnection(connection)

      expect(result[0]).toBe("Connection=BridgeConnection")
      expect(result[1]).toBe("Connection Line=0")
      expect(result[2]).toBe("Connection Centerline Profile=0")
      expect(result[3]).toBe("Connection Up SA=SA1")
      expect(result[4]).toBe("Connection Dn SA=SA2")
      expect(result[5]).toBe("Conn BR: Bridge=-1,0,0,0,0,0.8,1.2")
      expect(result[6]).toBe("Conn BR: Pressure-Weir=1,,2,,3")
    })
  })

  describe("GIVEN a connection with storage area links", () => {
    it("WHEN serialized THEN formats storage area references", () => {
      const connection: Connection = {
        name: "StorageConnection",
        connectionLine: [],
        centerlineProfile: 0,
        upstreamStorageArea: "UpstreamSA",
        downstreamStorageArea: "DownstreamSA",
        routingType: 1,
        useRCFamily: true,
        overflowMethod2D: false,
      }

      const result = serializeConnection(connection)

      expect(result[0]).toBe("Connection=StorageConnection")
      expect(result[1]).toBe("Connection Line=0")
      expect(result[2]).toBe("Connection Centerline Profile=0")
      expect(result[3]).toBe("Connection Up SA=UpstreamSA")
      expect(result[4]).toBe("Connection Dn SA=DownstreamSA")
      expect(result[5]).toBe("Conn Routing Type=1")
      expect(result[6]).toBe("Conn Use RC Family=true")
      expect(result[7]).toBe("Conn OverFlow Method 2D=false")
    })
  })

  describe("GIVEN a connection with weir properties", () => {
    it("WHEN serialized THEN formats weir parameters", () => {
      const connection: Connection = {
        name: "WeirConnection",
        connectionLine: [],
        centerlineProfile: 0,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
        weirWD: 10,
        weirCoefficient: 0.62,
        weirIsOgee: 1,
        weirDesignEG: 100,
        weirDesignHT: 5,
        simpleSpillPosCoef: 0.8,
        simpleSpillNegCoef: 0.7,
        weirSE: [
          { station: 0, elevation: 100 },
          { station: 50, elevation: 102 },
          { station: 100, elevation: 104 },
        ],
      }

      const result = serializeConnection(connection)

      expect(result[0]).toBe("Connection=WeirConnection")
      expect(result[1]).toBe("Connection Line=0")
      expect(result[2]).toBe("Connection Centerline Profile=0")
      expect(result[3]).toBe("Connection Up SA=SA1")
      expect(result[4]).toBe("Connection Dn SA=SA2")
      expect(result[5]).toBe("Conn Weir WD=10")
      expect(result[6]).toBe("Conn Weir Coef=0.62")
      expect(result[7]).toBe("Conn Weir Is Ogee=1")
      expect(result[8]).toBe("Conn Weir Design EG=100")
      expect(result[9]).toBe("Conn Weir Design HT=5")
      expect(result[10]).toBe("Conn Simple Spill Pos Coef=0.8")
      expect(result[11]).toBe("Conn Simple Spill Neg Coef=0.7")
      expect(result[12]).toBe("Conn Weir SE=3")
      expect(result[13]).toBe("       0     100      50     102     100     104")
    })
  })

  describe("GIVEN a connection with optional properties", () => {
    it("WHEN serialized THEN includes optional property lines", () => {
      const connection: Connection = {
        name: "FullConnection",
        description: "Full connection with all properties",
        connectionLine: [{ x: 0, y: 0 }],
        centerlineProfile: 1,
        lastEditedTime: "2023-01-01 12:00:00",
        cellSizeMin: 5,
        nearRepeats: 2,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
        hTabHWMax: 10,
        outletRatingCurve: {
          value: 100,
          flag: true,
          param3: "param3",
          param4: "param4",
        },
      }

      const result = serializeConnection(connection)

      expect(result).toContain("Connection=FullConnection")
      expect(result).toContain("Connection Desc=Full connection with all properties")
      expect(result).toContain("Connection Line=1")
      expect(result).toContain("Connection Centerline Profile=1")
      expect(result).toContain("Connection Last Edited Time=2023-01-01 12:00:00")
      expect(result).toContain("Conn CellSize Min=5")
      expect(result).toContain("Conn Near Repeats=2")
      expect(result).toContain("Connection Up SA=SA1")
      expect(result).toContain("Connection Dn SA=SA2")
      expect(result).toContain("Conn HTab HWMax=10")
      expect(result).toContain("Conn Outlet Rating Curve=100,true,param3,param4")
    })
  })

  describe("GIVEN a connection with undefined optional fields", () => {
    it("WHEN serialized THEN omits those lines", () => {
      const connection: Connection = {
        name: "MinimalConnection",
        connectionLine: [],
        centerlineProfile: 0,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
        // All optional fields are undefined
      }

      const result = serializeConnection(connection)

      expect(result).toHaveLength(5)
      expect(result[0]).toBe("Connection=MinimalConnection")
      expect(result[1]).toBe("Connection Line=0")
      expect(result[2]).toBe("Connection Centerline Profile=0")
      expect(result[3]).toBe("Connection Up SA=SA1")
      expect(result[4]).toBe("Connection Dn SA=SA2")
    })
  })

  describe("GIVEN a complete connection", () => {
    it("WHEN serialized THEN produces valid connection string", () => {
      const connection: Connection = {
        name: "TestConnection",
        description: "Test connection",
        connectionLine: [{ x: 100, y: 200 }],
        centerlineProfile: 1,
        upstreamStorageArea: "SA1",
        downstreamStorageArea: "SA2",
      }

      const result = serializeConnectionString(connection)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Connection=TestConnection")
      expect(lines[1]).toBe("Connection Desc=Test connection")
      expect(lines[2]).toBe("Connection Line=1")
      expect(lines[3]).toBe("           100.0           200.0")
      expect(lines[4]).toBe("Connection Centerline Profile=1")
      expect(lines[5]).toBe("Connection Up SA=SA1")
      expect(lines[6]).toBe("Connection Dn SA=SA2")
    })
  })
})
