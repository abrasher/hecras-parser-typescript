import type { Coordinate, StationElevationPoint, ManningSegment } from "./common"

export enum CrossSectionType {
  NORMAL = 1,
  BRIDGE = 2,
  CULVERT = 3,
  MULTIPLE_OPENING = 4,
  INLINE_WEIR = 5,
  LATERAL_WEIR = 6,
}

export interface IneffectiveFlowArea {
  leftStation: number
  rightStation: number
  elevation: number
}

export interface BlockedObstruction {
  leftStation: number
  rightStation: number
  elevation: number
}

export interface CrossSection {
  type: CrossSectionType
  riverMile: number
  lengthLeft: number
  lengthChannel: number
  lengthRight: number
  gisLineCount?: number
  gisLine?: Coordinate[]
  lastEditedTime?: string
  stationElevationPoints: StationElevationPoint[]
  stationElevationCount?: number
  manningValues?: ManningSegment[]
  manningCount?: number
  ineffectiveFlowAreas?: IneffectiveFlowArea[]
  ineffectiveCount?: number
  permanentIneffective?: string
  blockedObstructions?: BlockedObstruction[]
  blockedObstructionCount?: number
  skewAngle?: number
  leftBankStation?: number
  rightBankStation?: number
  ratingCurveType?: number
  ratingCurveValue?: number
  htabStartingElevation?: number
  htabIncrement?: number
  htabCount?: number
  htabHorizontalDistribution?: number[]
  expansionContractionCoefficients?: {
    expansion: number
    contraction: number
  }
}

export interface RiverReach {
  riverName: string
  reachName: string
  coordinateCount: number
  coordinates: Coordinate[]
  textPosition?: Coordinate
  reverseRiverText?: number
  crossSections: CrossSection[]
}
