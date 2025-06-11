// models/common.ts
export interface Coordinate {
  x: number
  y: number
}

export interface StationElevationPoint {
  station: number
  elevation: number
}

export interface ManningSegment {
  station: number
  nValue: number
  unknownParameter: number // For the parameter after nValue
}

export interface VolumeElevationPoint {
  elevation: number
  volume: number // Or area, depending on context
}

export interface CulvertData {
  barrelCount: number
  diameter: number
  height: number
  length: number
  roughness: number
  entranceLoss: number
  exitLoss: number
  shape: number
  inlet: number
  upstreamInvert: number
  downstreamInvert: number
  ratingFlag: number
  description: string
  unknownFlag: number
  coordinates: number[]
}

export interface CulvertBarrel {
  id: number
  description: string
  pointCount: number
  coordinates: Coordinate[]
}

export interface BridgeData {
  id: number
  flag1: number
  flag2: number
  flag3: number
  flag4: number
  weirCoeff: number
  skew: number
}
