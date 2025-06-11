import { expect, it } from "vitest"
import { HECRASGeometry } from "../src/models/geometry"
import { HecRasGeometryParser } from "../src/HECRASGeometryParser"
import { Coordinate } from "../src/models/common"
import fs from "fs"
import { CrossSection } from "../src/models/crossSection"

it("HECRASGeometry should parse correct headers", () => {
  const parser = new HecRasGeometryParser()

  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
  const muncieGeometry = parser.parse(geometryString)

  expect(muncieGeometry).toHaveProperty(
    "Geom Title",
    "Muncie Base Geometry - 9 SAs",
  )
  expect(muncieGeometry).toHaveProperty("Program Version", "5.00")

  expect(muncieGeometry).toHaveProperty("Viewing Rectangle", {
    left: 404112.085287251,
    right: 413818.78591839,
    top: 1806670.07015604,
    bottom: 1799678.66049907,
  })
})

it("HECRASGeometry should parse reaches with correct coordinates", () => {
  const parser = new HecRasGeometryParser()
  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
  const muncieGeometry = parser.parse(geometryString)

  expect(muncieGeometry).toHaveProperty("reaches")
  expect(Array.isArray(muncieGeometry.reaches)).toBe(true)
  expect(muncieGeometry.reaches.length).toBeGreaterThan(0)
  const firstReach = muncieGeometry.reaches[0]
  expect(firstReach).toHaveProperty("centerline")
  expect(firstReach.centerline[0]).toEqual({
    // Point 1
    x: 413723.622186712,
    y: 1800205.14997914,
  })
  expect(firstReach.centerline[1]).toEqual({
    // Point 2
    x: 413628.76151458,
    y: 1800234.33788318,
  })
  expect(firstReach.centerline[2]).toEqual({
    // Point 3
    x: 413533.900842447,
    y: 1800248.9318032,
  })
  expect(firstReach.centerline[3]).toEqual({
    // Point 4
    x: 413402.555306264,
    y: 1800278.11970724,
  })
  expect(firstReach.centerline[4]).toEqual({
    // Point 5
    x: 413322.288554152,
    y: 1800307.30761129,
  })
  expect(firstReach.centerline[5]).toEqual({
    // Point 6
    x: 413190.943081968,
    y: 1800372.98037938,
  })
  expect(firstReach.centerline[86]).toEqual({
    // Point 87
    x: 404398.089373685,
    y: 1801686.43567721,
  })
  expect(firstReach.centerline.length).toBe(87) // Check that the first reach has 87 points
})

it("HECRASGeometry should parse cross sections with complete data", () => {
  const parser = new HecRasGeometryParser()
  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
  const muncieGeometry = parser.parse(geometryString)

  expect(muncieGeometry.reaches).toBeDefined()
  expect(Array.isArray(muncieGeometry.reaches)).toBe(true)
  expect(muncieGeometry.reaches.length).toBeGreaterThan(0)

  const firstReach = muncieGeometry.reaches[0]
  expect(firstReach.crossSections).toBeDefined()
  expect(Array.isArray(firstReach.crossSections)).toBe(true)
  expect(firstReach.crossSections.length).toBeGreaterThan(0)

  // Test the first cross section with complete data
  const firstCrossSection = firstReach.crossSections[0]
  
  // Basic properties from "Type RM Length L Ch R = 1 ,15696.24,228.66,210.73,167.84"
  expect(firstCrossSection.riverStation).toBe(15696.24)
  expect(firstCrossSection.lengthL).toBe(228.66)
  expect(firstCrossSection.lengthCh).toBe(210.73)
  expect(firstCrossSection.lengthR).toBe(167.84)
  expect(firstCrossSection.lastEditedTime).toBe("Jul/13/2007 10:50:07")

  // GIS Cut Line coordinates (4 points from the test data)
  expect(firstCrossSection.gisCutLine).toEqual([
    { x: 413443.23844232, y: 1799937.56405877 },
    { x: 413545.895786464, y: 1800177.0978191 },
    { x: 413561.864682486, y: 1800361.88105136 },
    { x: 413662.240746626, y: 1800708.63471585 },
  ])

  // Station/Elevation data (134 points)
  expect(firstCrossSection.staElevData).toBeDefined()
  expect(Array.isArray(firstCrossSection.staElevData)).toBe(true)
  expect(firstCrossSection.staElevData.length).toBe(134)

  // Test first few station/elevation points
  expect(firstCrossSection.staElevData[0]).toEqual({ station: 0, elevation: 963.04 })
  expect(firstCrossSection.staElevData[1]).toEqual({ station: 27.2, elevation: 963.04 })
  expect(firstCrossSection.staElevData[2]).toEqual({ station: 32.64, elevation: 963.02 })
  expect(firstCrossSection.staElevData[3]).toEqual({ station: 38.08, elevation: 962.85 })

  // Test some middle points
  expect(firstCrossSection.staElevData[10]).toEqual({ station: 81.6, elevation: 961.29 })
  expect(firstCrossSection.staElevData[20]).toEqual({ station: 168.63, elevation: 951.83 })

  // Test last station/elevation point
  const lastPoint = firstCrossSection.staElevData[133]
  expect(lastPoint).toEqual({ station: 807.07, elevation: 958.77 })

  // Manning's n values (3 segments from "#Mann= 3 , 0 , 0")
  expect(firstCrossSection.manningSegments).toBeDefined()
  expect(Array.isArray(firstCrossSection.manningSegments)).toBe(true)
  expect(firstCrossSection.manningSegments.length).toBe(3)
  expect(firstCrossSection.manningSegments).toEqual([
    { station: 0, n: 0.07, leftBank: 0 },
    { station: 250.23, n: 0.04, leftBank: 0 },
    { station: 401.13, n: 0.07, leftBank: 0 },
  ])

  // Bank stations from "Bank Sta=250.23,401.13"
  expect(firstCrossSection.bankStations).toEqual({
    left: 250.23,
    right: 401.13,
  })

  // Expansion/contraction coefficients from "Exp/Cntr=0.3,0.1"
  expect(firstCrossSection.expansionCoefficient).toBe(0.3)
  expect(firstCrossSection.contractionCoefficient).toBe(0.1)
})

it("HECRASGeometry should parse multiple cross sections correctly", () => {
  const parser = new HecRasGeometryParser()
  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
  const muncieGeometry = parser.parse(geometryString)

  const firstReach = muncieGeometry.reaches[0]
  
  // Should have multiple cross sections
  expect(firstReach.crossSections.length).toBeGreaterThan(1)
  
  // Test second cross section exists and has different river station
  if (firstReach.crossSections.length > 1) {
    const secondCrossSection = firstReach.crossSections[1]
    expect(secondCrossSection.riverStation).toBe(15485.51)
    expect(secondCrossSection.lengthL).toBe(121.23)
    expect(secondCrossSection.lengthCh).toBe(115.09)
    expect(secondCrossSection.lengthR).toBe(103.79)
    expect(secondCrossSection.lastEditedTime).toBe("Jul/13/2007 11:09:22")
    
    // Should have different number of station/elevation points (93 vs 134)
    expect(secondCrossSection.staElevData.length).toBe(93)
  }
})

it("HECRASGeometry should handle cross section station/elevation data parsing correctly", () => {
  const parser = new HecRasGeometryParser()
  const geometryString = fs.readFileSync("test/data/Muncie.g01", "utf-8")
  const muncieGeometry = parser.parse(geometryString)

  const firstCrossSection = muncieGeometry.reaches[0].crossSections[0]
  
  // Test that station values are in ascending order (as they should be)
  for (let i = 1; i < firstCrossSection.staElevData.length; i++) {
    expect(firstCrossSection.staElevData[i].station).toBeGreaterThanOrEqual(
      firstCrossSection.staElevData[i - 1].station
    )
  }
  
  // Test specific elevation values that correspond to channel bottom and banks
  const channelBottom = Math.min(...firstCrossSection.staElevData.map(p => p.elevation))
  expect(channelBottom).toBeLessThan(940) // Should be around 937 based on the data
  
  const maxElevation = Math.max(...firstCrossSection.staElevData.map(p => p.elevation))
  expect(maxElevation).toBeGreaterThan(960) // Should be around 963 based on the data
})
