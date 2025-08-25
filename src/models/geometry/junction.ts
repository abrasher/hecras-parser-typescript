import type { Coordinate } from "./common"

export interface RiverReachConnection {
  river: string
  reach: string
}

export interface JunctionCoordinates {
  position: Coordinate
  textPosition: Coordinate
}

export interface LengthAreaPair {
  length: number
  area: number
}

export interface JunctionProperties {
  name: string
  description: string
  coordinates: JunctionCoordinates
  upstreamConnections: RiverReachConnection[]
  downstreamConnection: RiverReachConnection
  lengthAndAreas: LengthAreaPair[]
}
