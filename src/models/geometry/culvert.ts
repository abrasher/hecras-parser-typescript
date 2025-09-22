import type { Coordinate, UpstreamDownstreamPair } from "./common"

export enum CULVERT_SHAPE {
  CIRCLE = 1,
  BOX = 2,
  PIPE_ARCH = 3,
  ARCH = 4,
  SEMI_CIRCLE = 5,
  LOW_ARCH = 6,
  HIGH_ARCH = 7,
  CONSPAN_ARCH = 8,
}

export interface CulvertGroupProperties {
  shape: CULVERT_SHAPE
  rise: number // ft or m
  span: number // ft or m
  length: number // ft or m
  nTop: number
  nBottom?: number
  nBottomDepth?: number
  entranceLoss: number
  exitLoss: number
  chart: number
  scale: number
  upstreamInvert: number // ft or m
  downstreamInvert: number // ft or m
  numberOfBarrels: number
  culvertGroupName: string
  unknownFlag: number
  barrelStations: UpstreamDownstreamPair[]
  barrels: CulvertBarrelProperties[]
  depthBlocked?: number
}

export interface CulvertBarrelProperties {
  index: number
  name: string
  coordinates: Coordinate[]
}
