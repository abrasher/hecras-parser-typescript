import { expect, it, beforeAll, describe } from "vitest"
import { HECRASGeometry } from "../src/models/geometry"
import { HecRasGeometryParser } from "../src/HECRASGeometryParser"
import { Connection } from "../src/models/connection"
import { 
  connectionTestData, 
  expectedCulv43Connection, 
  expectedDM2238608Connection,
  connectionAttributeCategories 
} from "./data/connectionTestData"
import fs from "fs"


describe("Comprehensive Connection Parsing (TDD)", () => {
  let parser: HecRasGeometryParser
  let testGeometry: HECRASGeometry
  let culv43Connection: Connection
  let dm2238608Connection: Connection

  beforeAll(() => {
    parser = new HecRasGeometryParser()
    const geometryString = fs.readFileSync("test/data/Dingman.g01", "utf-8")
    testGeometry = parser.parse(geometryString)
    
    console.log("Parsed connections:", testGeometry.connections.length)
    console.log("Connection IDs:", testGeometry.connections.map(c => c.id))
    
    // Find specific connections by ID
    culv43Connection = testGeometry.connections.find(c => c.id === "Culv_43")!
    dm2238608Connection = testGeometry.connections.find(c => c.id === "DM22-38608")!
  })

  describe("Basic Info and Metadata", () => {
    it("should parse connection ID correctly", () => {
      expect(culv43Connection.id).toBe(expectedCulv43Connection.id)
      expect(dm2238608Connection.id).toBe(expectedDM2238608Connection.id)
    })

    it("should parse connection description", () => {
      expect(culv43Connection.description).toBe(expectedCulv43Connection.description)
      expect(dm2238608Connection.description).toBe(expectedDM2238608Connection.description)
    })

    it("should parse centerline profile", () => {
      expect(culv43Connection.centerlineProfile).toBe(expectedCulv43Connection.centerlineProfile)
      expect(dm2238608Connection.centerlineProfile).toBe(expectedDM2238608Connection.centerlineProfile)
    })

    it("should parse last edited time", () => {
      expect(culv43Connection.lastEditedTime).toBe(expectedCulv43Connection.lastEditedTime)
      expect(dm2238608Connection.lastEditedTime).toBe(expectedDM2238608Connection.lastEditedTime)
    })

    it("should parse cell size minimum", () => {
      expect(culv43Connection.cellSizeMin).toBe(expectedCulv43Connection.cellSizeMin)
      expect(dm2238608Connection.cellSizeMin).toBe(expectedDM2238608Connection.cellSizeMin)
    })

    it("should parse near repeats", () => {
      expect(culv43Connection.nearRepeats).toBe(expectedCulv43Connection.nearRepeats)
      expect(dm2238608Connection.nearRepeats).toBe(expectedDM2238608Connection.nearRepeats)
    })

    it("should parse connection line coordinates", () => {
      expect(culv43Connection.line).toEqual(expectedCulv43Connection.line)
      expect(dm2238608Connection.line).toEqual(expectedDM2238608Connection.line)
    })
  })

  describe("Storage Area Connections", () => {
    it("should parse upstream storage area", () => {
      expect(culv43Connection.upSA).toBe(expectedCulv43Connection.upSA)
      expect(dm2238608Connection.upSA).toBe(expectedDM2238608Connection.upSA)
    })

    it("should parse downstream storage area", () => {
      expect(culv43Connection.dnSA).toBe(expectedCulv43Connection.dnSA)
      expect(dm2238608Connection.dnSA).toBe(expectedDM2238608Connection.dnSA)
    })
  })

  describe("Routing Settings", () => {
    it("should parse routing type", () => {
      expect(culv43Connection.routingType).toBe(expectedCulv43Connection.routingType)
      expect(dm2238608Connection.routingType).toBe(expectedDM2238608Connection.routingType)
    })

    it("should parse RC family usage", () => {
      expect(culv43Connection.useRCFamily).toBe(expectedCulv43Connection.useRCFamily)
      expect(dm2238608Connection.useRCFamily).toBe(expectedDM2238608Connection.useRCFamily)
    })

    it("should parse 2D overflow method", () => {
      expect(culv43Connection.overflowMethod2D).toBe(expectedCulv43Connection.overflowMethod2D)
      expect(dm2238608Connection.overflowMethod2D).toBe(expectedDM2238608Connection.overflowMethod2D)
    })
  })

  describe("Basic Weir Properties", () => {
    it("should parse weir width", () => {
      expect(culv43Connection.weirWidth).toBe(expectedCulv43Connection.weirWidth)
      expect(dm2238608Connection.weirWidth).toBe(expectedDM2238608Connection.weirWidth)
    })

    it("should parse weir coefficient", () => {
      expect(culv43Connection.weirCoefficient).toBe(expectedCulv43Connection.weirCoefficient)
      expect(dm2238608Connection.weirCoefficient).toBe(expectedDM2238608Connection.weirCoefficient)
    })

    it("should parse weir Ogee type", () => {
      expect(culv43Connection.weirIsOgee).toBe(expectedCulv43Connection.weirIsOgee)
      expect(dm2238608Connection.weirIsOgee).toBe(expectedDM2238608Connection.weirIsOgee)
    })

    it("should parse spillway coefficients", () => {
      expect(culv43Connection.simpleSpillPosCoef).toBe(expectedCulv43Connection.simpleSpillPosCoef)
      expect(culv43Connection.simpleSpillNegCoef).toBe(expectedCulv43Connection.simpleSpillNegCoef)
      expect(dm2238608Connection.simpleSpillPosCoef).toBe(expectedDM2238608Connection.simpleSpillPosCoef)
      expect(dm2238608Connection.simpleSpillNegCoef).toBe(expectedDM2238608Connection.simpleSpillNegCoef)
    })

    it("should parse weir station-elevation data", () => {
      expect(culv43Connection.weirStationElevation).toEqual(expectedCulv43Connection.weirStationElevation)
      expect(dm2238608Connection.weirStationElevation).toEqual(expectedDM2238608Connection.weirStationElevation)
    })
  })

  describe("Advanced Weir Properties", () => {
    it("should parse weir design parameters", () => {
      // Only DM22-38608 has these advanced properties
      expect(dm2238608Connection.weirDesignEG).toBe(expectedDM2238608Connection.weirDesignEG)
      expect(dm2238608Connection.weirDesignHT).toBe(expectedDM2238608Connection.weirDesignHT)
    })

    it("should parse HTab settings", () => {
      expect(dm2238608Connection.hTabHWMax).toBe(expectedDM2238608Connection.hTabHWMax)
    })
  })

  describe("Culvert Data", () => {
    it("should parse culvert specifications", () => {
      expect(culv43Connection.culvertData).toEqual(expectedCulv43Connection.culvertData)
    })

    it("should parse culvert barrels", () => {
      expect(culv43Connection.culvertBarrels).toEqual(expectedCulv43Connection.culvertBarrels)
    })

    it("should parse culvert bottom Manning's n", () => {
      expect(culv43Connection.culvertBottomN).toBe(expectedCulv43Connection.culvertBottomN)
    })
  })

  describe("Bridge Data", () => {
    it("should parse bridge basic properties", () => {
      expect(culv43Connection.bridgeData).toEqual(expectedCulv43Connection.bridgeData)
      expect(dm2238608Connection.bridgeData).toEqual(expectedDM2238608Connection.bridgeData)
    })

    it("should parse bridge pressure-weir settings", () => {
      expect(culv43Connection.bridgePressureWeir).toEqual(expectedCulv43Connection.bridgePressureWeir)
      expect(dm2238608Connection.bridgePressureWeir).toEqual(expectedDM2238608Connection.bridgePressureWeir)
    })

    it("should parse bridge deck properties", () => {
      expect(culv43Connection.bridgeDeck).toEqual(expectedCulv43Connection.bridgeDeck)
      expect(dm2238608Connection.bridgeDeck).toEqual(expectedDM2238608Connection.bridgeDeck)
    })

    it("should parse bridge cross-section data", () => {
      expect(dm2238608Connection.bridgeStations).toEqual(expectedDM2238608Connection.bridgeStations)
    })

    it("should parse bridge bank stations", () => {
      expect(dm2238608Connection.bridgeBankStations).toEqual(expectedDM2238608Connection.bridgeBankStations)
    })

    it("should parse bridge Manning's n values", () => {
      expect(dm2238608Connection.bridgeMannings).toEqual(expectedDM2238608Connection.bridgeMannings)
    })

    it("should parse bridge skew", () => {
      expect(culv43Connection.bridgeSkew).toBe(expectedCulv43Connection.bridgeSkew)
      expect(dm2238608Connection.bridgeSkew).toBe(expectedDM2238608Connection.bridgeSkew)
    })
  })

  describe("Rating Curve Parameters", () => {
    it("should parse outlet rating curve", () => {
      expect(culv43Connection.outletRatingCurve).toEqual(expectedCulv43Connection.outletRatingCurve)
      expect(dm2238608Connection.outletRatingCurve).toEqual(expectedDM2238608Connection.outletRatingCurve)
    })
  })

  describe("Attribute Category Coverage", () => {
    it("should parse all basic info attributes", () => {
      connectionAttributeCategories.basicInfo.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })

    it("should parse all routing setting attributes", () => {
      connectionAttributeCategories.routingSettings.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })

    it("should parse all weir property attributes", () => {
      connectionAttributeCategories.weirProperties.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })

    it("should parse all advanced weir property attributes", () => {
      connectionAttributeCategories.advancedWeirProperties.forEach(attr => {
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })

    it("should parse all culvert data attributes", () => {
      connectionAttributeCategories.culvertData.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
      })
    })

    it("should parse all bridge data attributes", () => {
      connectionAttributeCategories.bridgeData.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })

    it("should parse all rating curve attributes", () => {
      connectionAttributeCategories.ratingCurve.forEach(attr => {
        expect(culv43Connection).toHaveProperty(attr)
        expect(dm2238608Connection).toHaveProperty(attr)
      })
    })
  })

  describe("Parser Coverage Validation", () => {
    it("should find both test connections", () => {
      expect(culv43Connection).toBeDefined()
      expect(dm2238608Connection).toBeDefined()
    })

    it("should parse exactly 2 connections from test data", () => {
      expect(testGeometry.connections).toHaveLength(2)
    })

    it("should handle different connection types", () => {
      // Culv_43 is a culvert connection
      expect(culv43Connection.culvertData).not.toBeNull()
      
      // DM22-38608 is a bridge connection with advanced routing
      expect(dm2238608Connection.routingType).toBe(32)
      expect(dm2238608Connection.bridgeStations["BR SE 1"]).toBeDefined()
    })
  })

  describe("Data Integrity", () => {
    it("should maintain coordinate precision", () => {
      // Test that floating point coordinates are preserved accurately
      expect(culv43Connection.line[0].x).toBe(484553.74016)
      expect(culv43Connection.line[0].y).toBe(4751433.1891)
    })

    it("should handle empty and null values correctly", () => {
      // Test that empty station-elevation data is handled
      expect(dm2238608Connection.weirStationElevation).toEqual([])
      
      // Test that null values are preserved
      expect(culv43Connection.bridgeDeck?.minLoCord).toBeNull()
      expect(culv43Connection.bridgeDeck?.maxHiCord).toBeNull()
    })

    it("should preserve boolean values correctly", () => {
      expect(culv43Connection.useRCFamily).toBe(false)
      expect(culv43Connection.overflowMethod2D).toBe(true)
      expect(dm2238608Connection.useRCFamily).toBe(false)
      expect(dm2238608Connection.overflowMethod2D).toBe(true)
    })
  })
})