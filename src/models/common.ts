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

export interface BridgeData {
  id: number
  flag1: number
  flag2: number
  flag3: number
  flag4: number
  weirCoeff: number
  skew: number
}

export interface UpstreamDownstreamPair {
  upstreamStation: number
  downstreamStation: number
}
