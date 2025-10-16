import type { Coordinate } from "./common"
import type { UpstreamDownstreamValue } from "./general"

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
  // River mile is a string to preserve formatting (e.g., "12.34", "12", "12.0")
  riverMile: string
  lengthLeft: number
  lengthChannel: number
  lengthRight: number
  gisLine: Coordinate[]
  lastEditedTime?: string
  stationElevation: number[][]
  manningValues?: number[][]
  ineffectiveFlowAreas?: [upstreamStn: number, downstreamStn: number, elevation: number][]
  permanentIneffective?: boolean[]
  blockedObstructions?: UpstreamDownstreamValue[]
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
