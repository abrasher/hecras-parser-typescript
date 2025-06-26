import type { Coordinate } from "./common"
import type { BridgeConnection } from "./bridge"
import type { CulvertGroupProperties } from "./culvert"

export interface Connection {
  // Basic connection properties
  name: string
  description?: string
  connectionLine: Coordinate[]
  centerlineProfile: number
  lastEditedTime?: string

  // Cell and computational settings
  cellSizeMin?: number
  nearRepeats?: number

  // Storage area connections
  upstreamStorageArea?: string
  downstreamStorageArea?: string

  // Routing and flow settings
  routingType?: number
  useRCFamily?: boolean
  overflowMethod2D?: boolean

  // Weir properties
  weirWD?: number
  weirCoefficient?: number
  weirIsOgee?: number
  weirDesignEG?: number
  weirDesignHT?: number

  // Spill coefficients
  simpleSpillPosCoef?: number
  simpleSpillNegCoef?: number
  weirSE?: number

  // Hydraulic table properties
  hTabHWMax?: number

  // Outlet rating curve
  outletRatingCurve?: {
    value: number
    flag: boolean
    param3?: string
    param4?: string
  }

  // Connection type-specific data
  bridge?: BridgeConnection
  culvert?: CulvertGroupProperties[]
}

export enum ConnectionType {
  BRIDGE = "bridge",
  CULVERT = "culvert",
  WEIR = "weir",
  GENERAL = "general",
}
