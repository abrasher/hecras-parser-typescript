import { expect, it, beforeAll, describe } from "vitest"
import { HECRASGeometry } from "../src/models/geometry"
import { HecRasGeometryParser } from "../src/HECRASGeometryParser"
import { Coordinate, ManningSegment } from "../src/models/common"
import fs from "fs"
import { CrossSection } from "../src/models/crossSection"
import {
  expectedHeaders,
  expectedFirstReachPoints,
  expectedFirstCrossSection,
  expectedFirstStorageArea,
} from "./data/muncieGeometryData"
import { StorageArea } from "../src/models/storageArea"
import util from "util"
import { Connection, SAConnection } from "../src/models/connection"

describe("HECRASGeometry Parser", () => {
  let parser: HecRasGeometryParser
  let muncieGeometry: HECRASGeometry

  beforeAll(() => {
    parser = new HecRasGeometryParser()
    const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
    muncieGeometry = parser.parse(geometryString)
  })

  describe("Headers", () => {
    it("should parse correct headers", () => {
      expect(muncieGeometry).toHaveProperty(
        "Geom Title",
        expectedHeaders["Geom Title"],
      )
      expect(muncieGeometry).toHaveProperty(
        "Program Version",
        expectedHeaders["Program Version"],
      )
      expect(muncieGeometry).toHaveProperty(
        "Viewing Rectangle",
        expectedHeaders["Viewing Rectangle"],
      )
    })
  })

  describe("Reaches", () => {
    it("should parse reaches with correct structure", () => {
      expect(muncieGeometry).toHaveProperty("reaches")
      expect(Array.isArray(muncieGeometry.reaches)).toBe(true)
      expect(muncieGeometry.reaches.length).toBeGreaterThan(0)
    })

    it("should parse first reach coordinates correctly", () => {
      const firstReach = muncieGeometry.reaches[0]
      expect(firstReach).toHaveProperty("centerline")

      // Verify total number of points
      expect(firstReach.centerline.length).toBe(
        expectedFirstReachPoints.totalPoints,
      )

      // Verify only the key points we care about
      expectedFirstReachPoints.keyPoints.forEach(({ index, point }) => {
        expect(firstReach.centerline[index]).toEqual(point)
      })
    })
  })

  describe("Cross Sections", () => {
    let firstCrossSection: CrossSection

    beforeAll(() => {
      firstCrossSection = muncieGeometry.reaches[0].crossSections[0]
    })

    it("should have correct basic properties", () => {
      expect(firstCrossSection.riverStation).toBe(
        expectedFirstCrossSection.riverStation,
      )
      expect(firstCrossSection.lengthL).toBe(expectedFirstCrossSection.lengthL)
      expect(firstCrossSection.lengthCh).toBe(
        expectedFirstCrossSection.lengthCh,
      )
      expect(firstCrossSection.lengthR).toBe(expectedFirstCrossSection.lengthR)
      expect(firstCrossSection.lastEditedTime).toBe(
        expectedFirstCrossSection.lastEditedTime,
      )
    })

    it("should have correct GIS cut line coordinates", () => {
      expect(firstCrossSection.gisCutLine).toEqual(
        expectedFirstCrossSection.gisCutLine,
      )
    })

    it("should have correct station/elevation data", () => {
      expect(firstCrossSection.staElevData).toBeDefined()
      expect(Array.isArray(firstCrossSection.staElevData)).toBe(true)

      // Verify total number of points
      expect(firstCrossSection.staElevData.length).toBe(
        expectedFirstCrossSection.staElevData.totalPoints,
      )

      // Verify only the key points we care about
      expectedFirstCrossSection.staElevData.keyPoints.forEach(
        ({ index, point }) => {
          expect(firstCrossSection.staElevData[index]).toEqual(point)
        },
      )
    })

    it("should have correct Manning segments", () => {
      expect(firstCrossSection.manningSegments).toEqual(
        expectedFirstCrossSection.manningSegments,
      )
    })

    it("should have correct bank stations and coefficients", () => {
      expect(firstCrossSection.bankStations).toEqual(
        expectedFirstCrossSection.bankStations,
      )
      expect(firstCrossSection.expansionCoefficient).toBe(
        expectedFirstCrossSection.expansionCoefficient,
      )
      expect(firstCrossSection.contractionCoefficient).toBe(
        expectedFirstCrossSection.contractionCoefficient,
      )
    })
  })

  describe("Storage Areas", () => {
    let firstStorageArea: StorageArea
    let allStorageAreas: StorageArea[]

    beforeAll(() => {
      firstStorageArea = muncieGeometry.storageAreas[0]
      allStorageAreas = muncieGeometry.storageAreas
    })

    it("should have correct basic properties", () => {
      expect(firstStorageArea.id).toBe(expectedFirstStorageArea.id)
      expect(firstStorageArea.type).toBe(expectedFirstStorageArea.type)
      expect(firstStorageArea.is2D).toBe(expectedFirstStorageArea.is2D)
      expect(firstStorageArea.mannings).toBe(expectedFirstStorageArea.mannings)
      expect(firstStorageArea.area).toBe(expectedFirstStorageArea.area)
      expect(firstStorageArea.minElevation).toBe(
        expectedFirstStorageArea.minElevation,
      )
    })

    it("should have correct centroid coordinates", () => {
      expect(firstStorageArea.centroid).toEqual(
        expectedFirstStorageArea.centroid,
      )
    })

    it("should have correct surface line coordinates", () => {
      expect(firstStorageArea.surfaceLine).toEqual(
        expectedFirstStorageArea.surfaceLine,
      )
    })

    it("should have correct volume-elevation data", () => {
      expect(firstStorageArea.volumeElevationData).toEqual(
        expectedFirstStorageArea.volumeElevationData,
      )
    })

    it("should have correct GeoJSON", () => {
      const geoJson = firstStorageArea.toGeoJSON()
      console.log(JSON.stringify(geoJson, null, 2))
      expect(geoJson).toBeDefined()
    })

    it("should have correct coordinates", () => {
      const geoJson = {
        type: "FeatureCollection",
        features: allStorageAreas.map((storageArea) => storageArea.toGeoJSON()),
      }
      console.log(JSON.stringify(geoJson, null, 2))
      require("child_process")
        .spawn("clip")
        .stdin.end(JSON.stringify(geoJson, null, 2))
      expect(geoJson).toBeDefined()
    })
  })

  describe("Storage Area Connections", () => {
    let firstConnection: Connection
    let allConnections: Connection[]

    beforeAll(() => {
      firstConnection = muncieGeometry.connections[0]
      allConnections = muncieGeometry.connections
    })

    it("should have correct basic properties", () => {
      // Basic test for existing connection parsing (will be expanded with TDD)
      expect(firstConnection).toBeDefined()
      expect(firstConnection.id).toBeDefined()
      expect(firstConnection.upSA).toBeDefined()
      expect(firstConnection.dnSA).toBeDefined()
    })
  })
})
