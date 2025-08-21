import type { StationElevationPoint } from "./common"

export interface DeckStationing {
  station: number
  highChord: number
  lowChord: number | null
}

export interface BridgeConnection {
  bridge: BridgeConfiguration
  pressureWeir?: PressureWeirData
  deckParameters: DeckParameters
  bridgeCoefficients: BridgeCoefficients
  bridgeSkew: number
  insideCrossSections: [BridgeCrossSection, BridgeCrossSection]
  externalCrossSections: [BridgeCrossSection, BridgeCrossSection]
  upstreamIneffectiveFlowArea: IneffectiveFlowArea
  downstreamIneffectiveFlowArea: IneffectiveFlowArea
  piers: BridgePier[]
}

export interface BridgePier {
  skew?: string | null
  centerlineStationUpstream: number
  centerlineStationDownstream: number
  upstream: WidthElevationPair[]
  downstream: WidthElevationPair[]
  applyFloatingDebris: number
  debrisWidth?: number | null
  debrisHeight?: number | null
}

interface WidthElevationPair {
  width: number
  elevation: number
}

export interface PierWidthElevation {
  upstreamWidth: number
  upstreamElevation: number
  downstreamWidth: number
  downstreamElevation: number
}

export interface BridgeConfiguration {
  // -1 means enabled, 0 means disabled
  momentumEquationAddFriction: number
  // -1 means enabled, 0 means disabled
  momentumEquationAddWeight: number
  // -1 means Upstream Energy Gradeline, 0 means Upstream water surface
  pressureFlowCriteria: number
  // -1 means Inside Bridge at Upstream End, 0 means Inside Bridge at Downstream End
  classBDefaults: number
  param5: number
  contractionCoefficient: number
  expansionCoefficient: number
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
  numberOfUpstreamStations: number
  numberOfDownstreamStations: number
  minLowCoordinate: number | null
  maxHighCoordinate: number | null
  maxSubmerge: number
  isOgee: number
  upstreamEmbankmentSideSlope: number | null
  downstreamEmbankmentSideSlope: number | null
  spillwayApproachHeight: number | null
  spillwayDesignHead: number | null
  upstream: DeckStationing[]
  downstream: DeckStationing[]
}

export interface BankStations {
  sectionId: number
  leftBank: number
  rightBank: number
}

export interface ManningCoefficients {
  station: number
  nValue: number
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

export interface BridgeCrossSection {
  // id of 1 is upstream, 2 is downstream
  id: number
  points: StationElevationPoint[]
  bankStations: BankStations
  manningCoefficients: ManningCoefficients[]
}

export interface IneffectiveFlowArea {
  leftStation: number
  leftElevation: number
  rightStation: number
  rightElevation: number
}
