// test/ConnectionParsing.test.ts
import { describe, it, expect, beforeAll } from "vitest"
import { HecRasGeometryParser } from "../src/HECRASGeometryParser"
import type {
  Connection} from "../src/models/connection";
import {
  ConnectionType,
  StructureType,
} from "../src/models/connection"
import type { HECRASGeometry } from "../src/models/geometry"
import {
  expectedConnections,
  connectionTestData,
} from "./data/connectionTestData"
import { readFileSync } from "fs"
import { join } from "path"

describe("Connection Parsing", () => {
  let geometry: HECRASGeometry
  let connections: Connection[]

  beforeAll(() => {
    const testFilePath = join(__dirname, "data", "Dingman.g01")
    const fileContent = readFileSync(testFilePath, "utf-8")
    const parser = new HecRasGeometryParser()
    geometry = parser.parse(fileContent)
    connections = geometry.connections || []
  })

  describe("Basic Connection Parsing", () => {
    it("should parse the correct number of connections", () => {
      expect(connections).toBeDefined()
      expect(connections.length).toBe(connectionTestData.totalConnections)
    })

    it("should parse all expected culvert connection IDs", () => {
      const connectionIds = connections.map((c) => c.id)
      connectionTestData.expectedCulvertIds.forEach((expectedId) => {
        expect(connectionIds).toContain(expectedId)
      })
    })

    it("should parse all expected bridge connection IDs", () => {
      const connectionIds = connections.map((c) => c.id)
      connectionTestData.expectedBridgeIds.forEach((expectedId) => {
        expect(connectionIds).toContain(expectedId)
      })
    })

    it("should parse basic connection properties", () => {
      connections.forEach((connection) => {
        expect(connection.id).toBeDefined()
        expect(typeof connection.id).toBe("string")
        expect(connection.upSA).toBe("2D_Grid")
        expect(connection.dnSA).toBe("2D_Grid")
      })
    })

    it.skip("should identify connections as SA/2D type (not yet implemented)", () => {
      connections.forEach((connection) => {
        expect(connection.connectionType).toBe(ConnectionType.SA_2D)
      })
    })

    it.skip("should identify structure types correctly (not yet implemented)", () => {
      const culvertConnections = connections.filter((c) =>
        connectionTestData.expectedCulvertIds.includes(c.id as string),
      )
      culvertConnections.forEach((connection) => {
        expect(connection.structureType).toBe(StructureType.WEIR_AND_CULVERTS)
      })
    })
  })

  describe("Individual Connection Tests", () => {
    describe("Culv_43 Connection", () => {
      let culv43: Connection

      beforeAll(() => {
        culv43 = connections.find((c) => c.id === "Culv_43")!
        expect(culv43).toBeDefined()
      })

      it("should parse basic connection properties correctly", () => {
        expect(culv43.description).toBe("Dimensions assumed by KGS 2024")
        expect(culv43.lastEditedTime).toBe("May-21-2025 14:53:52")
        expect(culv43.cellSizeMin).toBe(2)
        expect(culv43.nearRepeats).toBe(1)
      })

      it("should parse connection line coordinates", () => {
        expect(culv43.line).toHaveLength(2)
        expect(culv43.line[0]).toEqual({
          x: 484553.74016,
          y: 4751433.1891,
        })
        expect(culv43.line[1]).toEqual({
          x: 484551.728939999,
          y: 4751441.22004,
        })
      })

      it("should parse storage area connections", () => {
        expect(culv43.upSA).toBe("2D_Grid")
        expect(culv43.dnSA).toBe("2D_Grid")
      })

      it("should parse routing settings", () => {
        expect(culv43.routingType).toBe(1)
        expect(culv43.useRCFamily).toBe(false)
        expect(culv43.overflowMethod2D).toBe(true)
      })

      it("should parse weir properties", () => {
        expect(culv43.weirWidth).toBe(3.23)
        expect(culv43.weirCoefficient).toBe(1.4)
        expect(culv43.weirIsOgee).toBe(0)
        expect(culv43.simpleSpillPosCoef).toBe(0.05)
        expect(culv43.simpleSpillNegCoef).toBe(0.05)
      })

      it("should parse weir station-elevation data", () => {
        expect(culv43.weirStationElevation).toHaveLength(2)
        expect(culv43.weirStationElevation[0]).toEqual({
          station: 0,
          elevation: 262.45,
        })
        expect(culv43.weirStationElevation[1]).toEqual({
          station: 8.28,
          elevation: 262.5,
        })
      })

      it.skip("should parse culvert data (not yet implemented)", () => {
        expect(culv43.culvertData).toBeDefined()
        expect(culv43.culvertData!.barrelCount).toBe(1)
        expect(culv43.culvertData!.diameter).toBe(1.5)
        expect(culv43.culvertData!.height).toBe(1.5)
        expect(culv43.culvertData!.length).toBe(13.24)
        expect(culv43.culvertData!.roughness).toBe(0.024)
        expect(culv43.culvertData!.entranceLoss).toBe(0.9)
        expect(culv43.culvertData!.exitLoss).toBe(1)
        expect(culv43.culvertData!.upstreamInvert).toBe(260.71)
        expect(culv43.culvertData!.downstreamInvert).toBe(260.64)
        expect(culv43.culvertData!.description).toBe("Culvert #1")
      })

      it.skip("should parse culvert barrel data (not yet implemented)", () => {
        expect(culv43.culvertBarrels).toHaveLength(1)
        const barrel = culv43.culvertBarrels[0]
        expect(barrel.id).toBe(1)
        expect(barrel.description).toBe("Barrel #01")
        expect(barrel.coordinates).toHaveLength(2)
        expect(barrel.coordinates[0]).toEqual({
          x: 484557.98934,
          y: 4751436.44773,
        })
        expect(barrel.coordinates[1]).toEqual({
          x: 484544.9229,
          y: 4751438.60715,
        })
      })

      it.skip("should parse outlet rating curve data (not yet implemented)", () => {
        expect(culv43.outletRatingCurve).toBeDefined()
        expect(culv43.outletRatingCurve!.flag).toBe(0)
        expect(culv43.outletRatingCurve!.isActive).toBe(false)
      })
    })

    describe("Culv_44 Connection", () => {
      let culv44: Connection

      beforeAll(() => {
        culv44 = connections.find((c) => c.id === "Culv_44")!
        expect(culv44).toBeDefined()
      })

      it("should parse multi-point connection line", () => {
        expect(culv44.line).toHaveLength(4)
        expect(culv44.line[0].x).toBeCloseTo(484447.152433929, 5)
        expect(culv44.line[3].y).toBeCloseTo(4751472.11032784, 5)
      })

      it("should parse larger weir width", () => {
        expect(culv44.weirWidth).toBe(6.6)
      })

      it("should parse extensive weir station-elevation data", () => {
        expect(culv44.weirStationElevation).toHaveLength(25)
        expect(culv44.weirStationElevation[0]).toEqual({
          station: 0,
          elevation: 267.508,
        })
        expect(culv44.weirStationElevation[24]).toEqual({
          station: 39.891,
          elevation: 262.312,
        })
      })

      it("should parse longer culvert length", () => {
        expect(culv44.culvertData!.length).toBe(57.09)
        expect(culv44.culvertData!.upstreamInvert).toBe(260.51)
        expect(culv44.culvertData!.downstreamInvert).toBe(260.2)
      })
    })

    describe("Culv_45 Connection (Double Barrel)", () => {
      let culv45: Connection

      beforeAll(() => {
        culv45 = connections.find((c) => c.id === "Culv_45")!
        expect(culv45).toBeDefined()
      })

      it("should parse double barrel culvert data", () => {
        expect(culv45.culvertData!.barrelCount).toBe(2)
        expect(culv45.culvertData!.diameter).toBe(1.05)
        expect(culv45.culvertData!.height).toBe(1.05)
      })

      it("should parse two culvert barrels", () => {
        expect(culv45.culvertBarrels).toHaveLength(2)
        expect(culv45.culvertBarrels[0].description).toBe("Barrel #01")
        expect(culv45.culvertBarrels[1].description).toBe("Barrel #02")
      })

      it("should have correct barrel coordinates", () => {
        const barrel1 = culv45.culvertBarrels[0]
        const barrel2 = culv45.culvertBarrels[1]

        expect(barrel1.coordinates[0]).toEqual({
          x: 484341.38666,
          y: 4751439.60004,
        })
        expect(barrel2.coordinates[0]).toEqual({
          x: 484341.38666,
          y: 4751440.89191,
        })
      })

      it("should parse culvert description correctly", () => {
        expect(culv45.description).toBe("1050mm City of London May 2024")
      })
    })

    describe("DB_Culvert_3 Connection", () => {
      let dbCulvert3: Connection

      beforeAll(() => {
        dbCulvert3 = connections.find((c) => c.id === "DB_Culvert_3")!
        expect(dbCulvert3).toBeDefined()
      })

      it("should parse connection with zero cell size minimum", () => {
        expect(dbCulvert3.cellSizeMin).toBe(0)
      })

      it("should parse largest weir width", () => {
        expect(dbCulvert3.weirWidth).toBe(10)
      })

      it("should parse most extensive weir station-elevation data", () => {
        expect(dbCulvert3.weirStationElevation).toHaveLength(36)
        expect(dbCulvert3.weirStationElevation[0]).toEqual({
          station: 0,
          elevation: 265.09,
        })
        expect(dbCulvert3.weirStationElevation[35]).toEqual({
          station: 35.9,
          elevation: 265.13,
        })
      })

      it("should parse culvert with different entrance loss coefficient", () => {
        expect(dbCulvert3.culvertData!.entranceLoss).toBe(0.5)
        expect(dbCulvert3.culvertData!.diameter).toBe(1.2)
        expect(dbCulvert3.culvertData!.height).toBe(1.2)
      })

      it("should parse correct description", () => {
        expect(dbCulvert3.description).toBe("Dingman Dr")
      })
    })
  })

  describe("Culvert Properties Validation", () => {
    it("should have all connections with culvert data", () => {
      connections.forEach((connection) => {
        expect(connection.culvertData).toBeDefined()
        expect(connection.culvertData!.barrelCount).toBeGreaterThan(0)
        expect(connection.culvertData!.diameter).toBeGreaterThan(0)
        expect(connection.culvertData!.length).toBeGreaterThan(0)
      })
    })

    it("should have correct culvert barrel counts", () => {
      const culv43 = connections.find((c) => c.id === "Culv_43")!
      const culv44 = connections.find((c) => c.id === "Culv_44")!
      const culv45 = connections.find((c) => c.id === "Culv_45")!
      const dbCulvert3 = connections.find((c) => c.id === "DB_Culvert_3")!

      expect(culv43.culvertBarrels).toHaveLength(1)
      expect(culv44.culvertBarrels).toHaveLength(1)
      expect(culv45.culvertBarrels).toHaveLength(2)
      expect(dbCulvert3.culvertBarrels).toHaveLength(1)
    })

    it("should have valid Manning's n values", () => {
      connections.forEach((connection) => {
        expect(connection.culvertBottomN).toBeGreaterThan(0)
        expect(connection.culvertBottomN).toBeLessThan(1)
        expect(connection.culvertData!.roughness).toBe(0.024)
      })
    })

    it("should have valid invert elevations", () => {
      connections.forEach((connection) => {
        const culvertData = connection.culvertData!
        expect(culvertData.upstreamInvert).toBeGreaterThan(0)
        expect(culvertData.downstreamInvert).toBeGreaterThan(0)
        // Upstream should typically be higher than downstream
        expect(culvertData.upstreamInvert).toBeGreaterThanOrEqual(
          culvertData.downstreamInvert,
        )
      })
    })
  })

  describe("Weir Properties Validation", () => {
    it("should have valid weir coefficients", () => {
      connections.forEach((connection) => {
        expect(connection.weirCoefficient).toBe(1.4)
        expect(connection.weirIsOgee).toBe(0)
      })
    })

    it("should have valid spillway coefficients", () => {
      connections.forEach((connection) => {
        expect(connection.simpleSpillPosCoef).toBe(0.05)
        expect(connection.simpleSpillNegCoef).toBe(0.05)
      })
    })

    it("should have station-elevation data for all weirs", () => {
      connections.forEach((connection) => {
        expect(connection.weirStationElevation).toBeDefined()
        expect(connection.weirStationElevation.length).toBeGreaterThan(0)

        // Validate station-elevation structure
        connection.weirStationElevation.forEach((point) => {
          expect(point.station).toBeGreaterThanOrEqual(0)
          expect(point.elevation).toBeGreaterThan(0)
          expect(typeof point.station).toBe("number")
          expect(typeof point.elevation).toBe("number")
        })
      })
    })

    it("should have monotonically increasing stations", () => {
      connections.forEach((connection) => {
        const stations = connection.weirStationElevation.map((p) => p.station)
        for (let i = 1; i < stations.length; i++) {
          expect(stations[i]).toBeGreaterThan(stations[i - 1])
        }
      })
    })
  })

  describe("Connection Routing and Flags", () => {
    it("should have consistent routing settings", () => {
      connections.forEach((connection) => {
        expect(connection.routingType).toBe(1)
        expect(connection.useRCFamily).toBe(false)
        expect(connection.overflowMethod2D).toBe(true)
      })
    })

    it("should have correct flag values", () => {
      connections.forEach((connection) => {
        expect(connection.flags).toEqual([0, 0])
      })
    })

    it("should connect to same storage area", () => {
      connections.forEach((connection) => {
        expect(connection.upSA).toBe("2D_Grid")
        expect(connection.dnSA).toBe("2D_Grid")
      })
    })
  })

  describe("Integration Tests", () => {
    it("should parse connections consistently with test data", () => {
      expect(connections.length).toBe(expectedConnections.length)

      expectedConnections.forEach((expectedConnection) => {
        const parsedConnection = connections.find(
          (c) => c.id === expectedConnection.id,
        )
        expect(parsedConnection).toBeDefined()

        // Compare key properties
        expect(parsedConnection!.description).toBe(
          expectedConnection.description,
        )
        expect(parsedConnection!.weirWidth).toBe(expectedConnection.weirWidth)
        expect(parsedConnection!.culvertData!.diameter).toBe(
          expectedConnection.culvertData!.diameter,
        )
        expect(parsedConnection!.culvertBarrels.length).toBe(
          expectedConnection.culvertBarrels.length,
        )
      })
    })

    it("should maintain data integrity across all connections", () => {
      connections.forEach((connection) => {
        // Basic validation
        expect(connection.id).toBeDefined()
        expect(typeof connection.id).toBe("string")

        // Geometric validation
        expect(connection.line).toBeDefined()
        expect(connection.line.length).toBeGreaterThan(0)

        // Hydraulic validation
        expect(connection.weirWidth).toBeGreaterThan(0)
        expect(connection.weirCoefficient).toBeGreaterThan(0)

        // Culvert validation
        expect(connection.culvertData).toBeDefined()
        expect(connection.culvertBarrels).toBeDefined()
        expect(connection.culvertBarrels.length).toBeGreaterThan(0)
      })
    })
  })
})
