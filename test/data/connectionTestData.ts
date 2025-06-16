// test/data/connectionTestData.ts
import {
  Connection,
  ConnectionType,
  StructureType,
} from "../../src/models/connection"
import type { CulvertData, CulvertBarrel } from "../../src/models/common"

// Helper function to create test connection objects
function createTestConnection(id: string): Connection {
  const connection = new Connection(id)

  // Initialize required properties
  connection.sa2dConnection = null
  connection.riverReachConnection = null
  connection.lateralStructureConnection = null
  connection.volumeDefinition = null
  connection.enhancedCulvertData = null

  return connection
}

// Expected connection data from Dingman.g01 geometry file
export const expectedConnections: Connection[] = []

// Culv_43 - Single barrel culvert with weir
const culv43 = createTestConnection("Culv_43")
culv43.flags = [0, 0]
culv43.line = [
  { x: 484553.74016, y: 4751433.1891 },
  { x: 484551.728939999, y: 4751441.22004 },
]
culv43.description = "Dimensions assumed by KGS 2024"
culv43.centerlineProfile = 0
culv43.lastEditedTime = "May-21-2025 14:53:52"
culv43.cellSizeMin = 2
culv43.nearRepeats = 1
culv43.connectionType = ConnectionType.SA_2D
culv43.structureType = StructureType.WEIR_AND_CULVERTS
culv43.upSA = "2D_Grid"
culv43.dnSA = "2D_Grid"
culv43.routingType = 1
culv43.useRCFamily = false
culv43.overflowMethod2D = true
culv43.weirWidth = 3.23
culv43.weirCoefficient = 1.4
culv43.weirIsOgee = 0
culv43.simpleSpillPosCoef = 0.05
culv43.simpleSpillNegCoef = 0.05
culv43.weirStationElevation = [
  { station: 0, elevation: 262.45 },
  { station: 8.28, elevation: 262.5 },
]
culv43.culvertData = {
  barrelCount: 1,
  diameter: 1.5,
  height: 1.5,
  length: 13.24,
  roughness: 0.024,
  entranceLoss: 0.9,
  exitLoss: 1,
  shape: 1,
  inlet: 2,
  upstreamInvert: 260.71,
  downstreamInvert: 260.64,
  ratingFlag: 1,
  description: "Culvert #1",
  unknownFlag: 0,
  coordinates: [3.56, 4.96],
}
culv43.culvertBarrels = [
  {
    id: 1,
    description: "Barrel #01",
    pointCount: 2,
    coordinates: [
      { x: 484557.98934, y: 4751436.44773 },
      { x: 484544.9229, y: 4751438.60715 },
    ],
  },
]
culv43.culvertBottomN = 0.024
culv43.outletRatingCurve = {
  flag: 0,
  isActive: false,
  value1: "",
  value2: "",
}
expectedConnections.push(culv43)

// Culv_44 - Single barrel culvert with larger weir
const culv44 = createTestConnection("Culv_44")
culv44.flags = [0, 0]
culv44.line = [
  { x: 484447.1524339294, y: 4751432.24568615 },
  { x: 484446.654315177, y: 4751446.3560192 },
  { x: 484446.795466154, y: 4751460.47111651 },
  { x: 484446.1644647034, y: 4751472.11032784 },
]
culv44.description = "Dimensions assumed by KGS 2024"
culv44.centerlineProfile = 0
culv44.lastEditedTime = "May-21-2025 14:51:24"
culv44.cellSizeMin = 2
culv44.nearRepeats = 1
culv44.connectionType = ConnectionType.SA_2D
culv44.structureType = StructureType.WEIR_AND_CULVERTS
culv44.upSA = "2D_Grid"
culv44.dnSA = "2D_Grid"
culv44.routingType = 1
culv44.useRCFamily = false
culv44.overflowMethod2D = true
culv44.weirWidth = 6.6
culv44.weirCoefficient = 1.4
culv44.weirIsOgee = 0
culv44.simpleSpillPosCoef = 0.05
culv44.simpleSpillNegCoef = 0.05
culv44.weirStationElevation = [
  { station: 0, elevation: 267.508 },
  { station: 5.508, elevation: 267.508 },
  { station: 6.008, elevation: 262.716 },
  { station: 8.009, elevation: 262.662 },
  { station: 9.01, elevation: 262.673 },
  { station: 9.51, elevation: 262.649 },
  { station: 11.011, elevation: 262.633 },
  { station: 12.512, elevation: 262.57 },
  { station: 15.513, elevation: 262.507 },
  { station: 17.013, elevation: 262.5 },
  { station: 18.966, elevation: 262.459 },
  { station: 21.013, elevation: 262.459 },
  { station: 21.513, elevation: 262.43 },
  { station: 24.514, elevation: 262.383 },
  { station: 28.235, elevation: 262.258 },
  { station: 29.015, elevation: 262.273 },
  { station: 29.516, elevation: 262.25 },
  { station: 31.018, elevation: 262.25 },
  { station: 31.519, elevation: 262.227 },
  { station: 33.021, elevation: 262.215 },
  { station: 36.143, elevation: 262.22 },
  { station: 38.028, elevation: 262.172 },
  { station: 38.529, elevation: 262.203 },
  { station: 39.53, elevation: 262.295 },
  { station: 39.891, elevation: 262.312 },
]
culv44.culvertData = {
  barrelCount: 1,
  diameter: 1.5,
  height: 1.5,
  length: 57.09,
  roughness: 0.024,
  entranceLoss: 0.9,
  exitLoss: 1,
  shape: 1,
  inlet: 2,
  upstreamInvert: 260.51,
  downstreamInvert: 260.2,
  ratingFlag: 1,
  description: "Culvert #1",
  unknownFlag: 0,
  coordinates: [12.26, 12.26],
}
culv44.culvertBarrels = [
  {
    id: 1,
    description: "Barrel #01",
    pointCount: 2,
    coordinates: [
      { x: 484473.62537, y: 4751442.48397 },
      { x: 484416.69192, y: 4751446.7396 },
    ],
  },
]
culv44.culvertBottomN = 0.024
culv44.outletRatingCurve = {
  flag: 0,
  isActive: false,
  value1: "",
  value2: "",
}
expectedConnections.push(culv44)

// Culv_45 - Double barrel culvert
const culv45 = createTestConnection("Culv_45")
culv45.flags = [0, 0]
culv45.line = [
  { x: 484334.57579, y: 4751435.784 },
  { x: 484332.77166, y: 4751445.66378 },
]
culv45.description = "1050mm City of London May 2024"
culv45.centerlineProfile = 0
culv45.lastEditedTime = "May-20-2025 15:10:22"
culv45.cellSizeMin = 2
culv45.nearRepeats = 1
culv45.connectionType = ConnectionType.SA_2D
culv45.structureType = StructureType.WEIR_AND_CULVERTS
culv45.upSA = "2D_Grid"
culv45.dnSA = "2D_Grid"
culv45.routingType = 1
culv45.useRCFamily = false
culv45.overflowMethod2D = true
culv45.weirWidth = 8.99
culv45.weirCoefficient = 1.4
culv45.weirIsOgee = 0
culv45.simpleSpillPosCoef = 0.05
culv45.simpleSpillNegCoef = 0.05
culv45.weirStationElevation = [
  { station: 0, elevation: 261.716 },
  { station: 1.54, elevation: 261.71 },
  { station: 1.999, elevation: 261.726 },
  { station: 2.507, elevation: 261.691 },
  { station: 6.573, elevation: 261.748 },
  { station: 7.127, elevation: 261.739 },
  { station: 7.589, elevation: 261.712 },
  { station: 10.04, elevation: 261.72 },
]
culv45.culvertData = {
  barrelCount: 2,
  diameter: 1.05,
  height: 1.05,
  length: 17.1,
  roughness: 0.024,
  entranceLoss: 0.9,
  exitLoss: 1,
  shape: 1,
  inlet: 2,
  upstreamInvert: 260.36,
  downstreamInvert: 259.6,
  ratingFlag: 2,
  description: "Culvert #1",
  unknownFlag: 0,
  coordinates: [2.95, 4.27, 4.26, 5.58],
}
culv45.culvertBarrels = [
  {
    id: 1,
    description: "Barrel #01",
    pointCount: 2,
    coordinates: [
      { x: 484341.38666, y: 4751439.60004 },
      { x: 484324.294289998, y: 4751439.0038 },
    ],
  },
  {
    id: 2,
    description: "Barrel #02",
    pointCount: 2,
    coordinates: [
      { x: 484341.38666, y: 4751440.89191 },
      { x: 484324.294289998, y: 4751440.29566 },
    ],
  },
]
culv45.culvertBottomN = 0.024
culv45.outletRatingCurve = {
  flag: 0,
  isActive: false,
  value1: "",
  value2: "",
}
expectedConnections.push(culv45)

// DB_Culvert_3 - Single barrel culvert
const dbCulvert3 = createTestConnection("DB_Culvert_3")
dbCulvert3.flags = [0, 0]
dbCulvert3.line = [
  { x: 485594.4553931384, y: 4751612.90089524 },
  { x: 485630.124233531, y: 4751617.106293 },
]
dbCulvert3.description = "Dingman Dr"
dbCulvert3.centerlineProfile = 0
dbCulvert3.lastEditedTime = "May-20-2025 15:29:54"
dbCulvert3.cellSizeMin = 0
dbCulvert3.nearRepeats = 1
dbCulvert3.connectionType = ConnectionType.SA_2D
dbCulvert3.structureType = StructureType.WEIR_AND_CULVERTS
dbCulvert3.upSA = "2D_Grid"
dbCulvert3.dnSA = "2D_Grid"
dbCulvert3.routingType = 1
dbCulvert3.useRCFamily = false
dbCulvert3.overflowMethod2D = true
dbCulvert3.weirWidth = 10
dbCulvert3.weirCoefficient = 1.4
dbCulvert3.weirIsOgee = 0
dbCulvert3.simpleSpillPosCoef = 0.05
dbCulvert3.simpleSpillNegCoef = 0.05
dbCulvert3.weirStationElevation = [
  { station: 0, elevation: 265.09 },
  { station: 0.3, elevation: 265.08 },
  { station: 1.3, elevation: 265.09 },
  { station: 2.3, elevation: 265.07 },
  { station: 6.8, elevation: 265.07 },
  { station: 7.8, elevation: 265.04 },
  { station: 9.9, elevation: 265.06 },
  { station: 10.9, elevation: 265.03 },
  { station: 11.4, elevation: 265.06 },
  { station: 11.9, elevation: 265.05 },
  { station: 13.4, elevation: 265.06 },
  { station: 13.9, elevation: 265.04 },
  { station: 14.9, elevation: 265.04 },
  { station: 15.4, elevation: 265.01 },
  { station: 16.4, elevation: 265.06 },
  { station: 17.4, elevation: 265.03 },
  { station: 17.9, elevation: 265.05 },
  { station: 19.4, elevation: 265.03 },
  { station: 21.4, elevation: 265.08 },
  { station: 21.9, elevation: 265.05 },
  { station: 23, elevation: 265.08 },
  { station: 25.5, elevation: 265.06 },
  { station: 26.5, elevation: 265.09 },
  { station: 27, elevation: 265.07 },
  { station: 27.5, elevation: 265.09 },
  { station: 28, elevation: 265.07 },
  { station: 28.5, elevation: 265.07 },
  { station: 29, elevation: 265.09 },
  { station: 29.5, elevation: 265.07 },
  { station: 30.5, elevation: 265.1 },
  { station: 31.5, elevation: 265.08 },
  { station: 32, elevation: 265.1 },
  { station: 33.9, elevation: 265.11 },
  { station: 34.5, elevation: 265.1 },
  { station: 35, elevation: 265.13 },
  { station: 35.9, elevation: 265.13 },
]
dbCulvert3.culvertData = {
  barrelCount: 1,
  diameter: 1.2,
  height: 1.2,
  length: 12.51,
  roughness: 0.024,
  entranceLoss: 0.5,
  exitLoss: 1,
  shape: 1,
  inlet: 56,
  upstreamInvert: 263.65,
  downstreamInvert: 263.38,
  ratingFlag: 1,
  description: "Culvert #1",
  unknownFlag: 0,
  coordinates: [4.1, 4.1],
}
dbCulvert3.culvertBarrels = [
  {
    id: 1,
    description: "Barrel #01",
    pointCount: 2,
    coordinates: [
      { x: 485609.47, y: 4751603.67 },
      { x: 485609.84, y: 4751624.58 },
    ],
  },
]
dbCulvert3.culvertBottomN = 0.024
dbCulvert3.outletRatingCurve = {
  flag: 0,
  isActive: false,
  value1: "",
  value2: "",
}
expectedConnections.push(dbCulvert3)

// Export connection test data for parser validation
export const connectionTestData = {
  expectedConnections,
  totalConnections: 7, // 4 culverts + 3 bridges from actual file
  culvertConnections: 4, // Culv_43, Culv_44, Culv_45, DB_Culvert_3
  bridgeConnections: 3, // DM22-38608, DM22-38896, DM24-39114
  expectedCulvertIds: ["Culv_43", "Culv_44", "Culv_45", "DB_Culvert_3"],
  expectedBridgeIds: ["DM22-38608", "DM22-38896", "DM24-39114"],
}
