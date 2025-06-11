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
