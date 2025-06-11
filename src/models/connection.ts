// models/connection.ts
import type { Coordinate, StationElevationPoint, CulvertData, CulvertBarrel, BridgeData } from "./common"

export class Connection {
  // Basic info and metadata
  id: string | number
  flags: number[] = []
  line: Coordinate[] = []
  description: string | null = null
  centerlineProfile: number = 0
  lastEditedTime: string | null = null
  cellSizeMin: number = 0
  nearRepeats: number = 0
  
  // Storage area connections
  upSA: string | null = null
  dnSA: string | null = null
  
  // Routing settings
  routingType: number = 0
  useRCFamily: boolean = false
  overflowMethod2D: boolean = false
  
  // Basic weir properties
  weirWidth: number = 0
  weirCoefficient: number = 0
  weirIsOgee: number = 0
  simpleSpillPosCoef: number = 0
  simpleSpillNegCoef: number = 0
  weirStationElevation: StationElevationPoint[] = []
  
  // Advanced weir properties
  weirDesignEG: number = 0
  weirDesignHT: number = 0
  hTabHWMax: number = 0
  
  // Culvert data
  culvertData: CulvertData | null = null
  culvertBarrels: CulvertBarrel[] = []
  culvertBottomN: number = 0
  
  // Rating curve parameters
  outletRatingCurve: {
    flag: number
    isActive: boolean
    value1: string
    value2: string
  } | null = null
  
  // Bridge data
  bridgeData: BridgeData | null = null
  bridgePressureWeir: {
    value1: number
    value2: string
    value3: number
    value4: string
    value5: number
  } | null = null
  bridgeDeck: {
    deckDist: number
    width: number
    weirC: number
    skew: number
    numUp: number
    numDn: number
    minLoCord: number | null
    maxHiCord: number | null
    maxSubmerge: number
    isOgee: number
    unknownValues: (number | string)[]
    stationElevation: StationElevationPoint[]
  } | null = null
  bridgeStations: { [key: string]: StationElevationPoint[] } = {}
  bridgeBankStations: { [key: string]: { left: number; right: number } } = {}
  bridgeMannings: { [key: string]: StationElevationPoint[] } = {}
  bridgeCoef: {
    value1: number
    value2: number
    value3: number
    value4: string
    value5: string
    value6: number
    value7: number
    value8: number
    value9: number
  } | null = null
  bridgeSkew: number = 0
  bridgeIneffectiveAreas: { [key: string]: any } = {}
  crossSectionData: { [key: string]: any } = {}

  constructor(id: string | number) {
    this.id = id
  }
}

// Legacy alias for backward compatibility
export const SAConnection = Connection
