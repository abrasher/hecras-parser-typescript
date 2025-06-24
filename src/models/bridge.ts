import type { Coordinate, StationElevationPoint } from "./geometry/common"

export interface BridgeConnection {
  bridge: BridgeConfiguration
  pressureWeir: PressureWeirData
  deckParameters: DeckParameters
  bridgeSections: BridgeSection[]
  bridgeCoefficients: BridgeCoefficients
  bridgeSkew: number
  crossSections: CrossSection[]
  ineffectiveFlowAreas: IneffectiveFlowArea[]
}

export interface BridgeConfiguration {
  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
  param6: number
  param7: number
}

export interface PressureWeirData {
  value1: number
  value2: number | null
  value3: number
  value4: number | null
  value5: number
}

export interface DeckParameters {
  deckDistance: number
  width: number
  weirCoefficient: number
  skew: number
  numUp: number
  numDown: number
  minLowCoordinate: number | null
  maxHighCoordinate: number | null
  maxSubmerge: number
  isOgee: number
  coordinates: number[]
  elevations: number[]
  bottomElevations: number[]
}

export interface BridgeSection {
  id: number
  points: StationElevationPoint[]
  bankStations: BankStations
  manningCoefficients: ManningCoefficients
}

export interface BankStations {
  sectionId: number
  leftBank: number
  rightBank: number
}

export interface ManningCoefficients {
  sectionId: number
  segments: number
  values: Array<{
    station: number
    nValue: number
  }>
}

export interface BridgeCoefficients {
  coef1: number
  coef2: number
  coef3: number
  coef4: number | null
  coef5: number | null
  coef6: number | null
  coef7: number
  coef8: number
  coef9: number | null
  coef10: number
  coef11: number | null
}

export interface CrossSection {
  id: number
  points: StationElevationPoint[]
  bankStations: BankStations
  manningCoefficients: ManningCoefficients
}

export interface IneffectiveFlowArea {
  type: 'USXS' | 'DSXS'
  leftStation: number
  leftElevation: number
  rightStation: number
  rightElevation: number
}