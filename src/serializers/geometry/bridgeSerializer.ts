// Bridge serializer for HEC-RAS format
// Reverses the bridge parsing process to produce exact format output

import type {
  BridgeConnection,
  BridgeConfiguration,
  PressureWeirData,
  DeckParameters,
  DeckStationing,
  BridgeCrossSection,
  BridgeCoefficients,
  IneffectiveFlowArea,
  BankStations,
  ManningCoefficients,
} from "../../models/geometry/bridge"
import type { StationElevationPoint } from "../../models/geometry/common"
import { formatKeyValue, formatCommaSeparated, formatStationPairs } from "../atomic"

/**
 * Serialize bridge connection to HEC-RAS format
 * @param bridge Bridge connection properties
 * @returns Array of formatted lines
 */
export function serializeBridgeConnection(bridge: BridgeConnection): string[] {
  const lines: string[] = []

  // Bridge configuration
  lines.push(serializeBridgeConfiguration(bridge.bridge))

  // Pressure weir data
  lines.push(serializePressureWeir(bridge.pressureWeir))

  // Deck parameters
  lines.push(...serializeDeckParameters(bridge.deckParameters))

  // Inside cross sections
  for (const crossSection of bridge.insideCrossSections) {
    lines.push(...serializeBridgeSection(crossSection))
  }

  // Bridge coefficients
  lines.push(serializeBridgeCoefficients(bridge.bridgeCoefficients))

  // Bridge skew
  lines.push(formatKeyValue("Conn BR: BR Skew", bridge.bridgeSkew))

  // External cross sections
  for (const crossSection of bridge.externalCrossSections) {
    lines.push(...serializeCrossSection(crossSection))
  }

  // Ineffective flow areas
  lines.push(serializeIneffectiveFlowArea("Conn BR: USXS Ineff", bridge.upstreamIneffectiveFlowArea))
  lines.push(serializeIneffectiveFlowArea("Conn BR: DSXS Ineff", bridge.downstreamIneffectiveFlowArea))

  return lines
}

/**
 * Serialize bridge configuration
 */
function serializeBridgeConfiguration(config: BridgeConfiguration): string {
  const values = [
    config.momentumEquationAddFriction,
    config.momentumEquationAddWeight,
    config.pressureFlowCriteria,
    config.classBDefaults,
    config.param5,
    config.contractionCoefficient,
    config.expansionCoefficient,
  ]

  return formatKeyValue("Conn BR: Bridge", formatCommaSeparated(values))
}

/**
 * Serialize pressure weir data
 */
function serializePressureWeir(pressureWeir: PressureWeirData): string {
  const values = [
    pressureWeir.value1,
    pressureWeir.value2 ?? "",
    pressureWeir.value3,
    pressureWeir.value4 ?? "",
    pressureWeir.value5,
  ]

  return formatKeyValue("Conn BR: Pressure-Weir", formatCommaSeparated(values))
}

/**
 * Serialize deck parameters with station data
 */
function serializeDeckParameters(deck: DeckParameters): string[] {
  const lines: string[] = []

  // Header line
  lines.push("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn")

  // Parameters line
  const values = [
    deck.deckDistance,
    deck.width,
    deck.weirCoefficient,
    deck.skew,
    deck.numberOfUpstreamStations,
    deck.numberOfDownstreamStations,
    deck.minLowCoordinate ?? "",
    deck.maxHighCoordinate ?? "",
    deck.maxSubmerge,
    deck.isOgee,
  ]
  lines.push(formatCommaSeparated(values))

  // Upstream deck stations
  lines.push(...serializeDeckStationingArray(deck.upstream))

  // Downstream deck stations
  lines.push(...serializeDeckStationingArray(deck.downstream))

  return lines
}

/**
 * Serialize deck stationing array (stations, high chords, low chords)
 */
function serializeDeckStationingArray(deckStations: DeckStationing[]): string[] {
  if (deckStations.length === 0) return []

  const lines: string[] = []
  const maxPointsPerLine = 10 // 80 chars / 8 chars per point

  // Extract arrays
  const stations = deckStations.map((d) => d.station)
  const highChords = deckStations.map((d) => d.highChord)
  const lowChords = deckStations.map((d) => d.lowChord)

  // Serialize stations
  for (let i = 0; i < stations.length; i += maxPointsPerLine) {
    const stationSlice = stations.slice(i, i + maxPointsPerLine)
    lines.push(formatStationPairs(stationSlice))
  }

  // Serialize high chords
  for (let i = 0; i < highChords.length; i += maxPointsPerLine) {
    const highChordSlice = highChords.slice(i, i + maxPointsPerLine)
    lines.push(formatStationPairs(highChordSlice))
  }

  // Serialize low chords (with null support)
  for (let i = 0; i < lowChords.length; i += maxPointsPerLine) {
    const lowChordSlice = lowChords.slice(i, i + maxPointsPerLine)
    // Format low chords as integers with null support
    const formattedChords = lowChordSlice.map((chord) =>
      chord === null ? " ".repeat(8) : Math.round(chord).toString().padStart(8, " "),
    )
    lines.push(formattedChords.join(""))
  }

  return lines
}

/**
 * Serialize bridge cross section
 */
function serializeBridgeSection(crossSection: BridgeCrossSection): string[] {
  const lines: string[] = []

  // Header line
  const values = [crossSection.id, crossSection.points.length]
  lines.push(formatKeyValue("Conn BR: BR SE", formatCommaSeparated(values)))

  // Station-elevation points (5 pairs per line)
  lines.push(...serializeStationElevationPoints(crossSection.points))

  // Bank stations
  lines.push(serializeBankStations(crossSection.bankStations))

  // Manning coefficients
  lines.push(...serializeManningCoefficients(crossSection.manningCoefficients))

  return lines
}

/**
 * Serialize external cross section
 */
function serializeCrossSection(crossSection: BridgeCrossSection): string[] {
  const lines: string[] = []

  // Header line
  const values = [crossSection.id, crossSection.points.length]
  lines.push(formatKeyValue("Conn BR: XS SE", formatCommaSeparated(values)))

  // Station-elevation points (5 pairs per line)
  lines.push(...serializeStationElevationPoints(crossSection.points))

  // Bank stations
  lines.push(serializeBankStations(crossSection.bankStations))

  // Manning coefficients
  lines.push(...serializeManningCoefficients(crossSection.manningCoefficients))

  return lines
}

/**
 * Serialize station-elevation points (5 pairs per line)
 */
function serializeStationElevationPoints(points: StationElevationPoint[]): string[] {
  const lines: string[] = []
  const maxPairsPerLine = 5

  for (let i = 0; i < points.length; i += maxPairsPerLine) {
    const pointSlice = points.slice(i, i + maxPairsPerLine)
    const numbers: number[] = []

    for (const point of pointSlice) {
      numbers.push(point.station, point.elevation)
    }

    lines.push(formatStationPairs(numbers))
  }

  return lines
}

/**
 * Serialize bank stations
 */
function serializeBankStations(bankStations: BankStations): string {
  const values = [bankStations.sectionId, bankStations.leftBank, bankStations.rightBank]

  return formatKeyValue("Conn BR: BR Bank Sta", formatCommaSeparated(values))
}

/**
 * Serialize Manning coefficients
 */
function serializeManningCoefficients(coefficients: ManningCoefficients[]): string[] {
  const lines: string[] = []

  // Header line
  lines.push("Conn BR: BR Manning=")

  // Manning coefficient data - stations as integers, nValues with decimals
  const formattedNumbers: string[] = []
  for (const coeff of coefficients) {
    formattedNumbers.push(Math.round(coeff.station).toString().padStart(8, " "))
    formattedNumbers.push(coeff.nValue.toString().padStart(8, " "))
  }

  lines.push(formattedNumbers.join(""))

  return lines
}

/**
 * Serialize bridge coefficients
 */
function serializeBridgeCoefficients(coefficients: BridgeCoefficients): string {
  const values = [
    coefficients.coef1,
    coefficients.coef2,
    coefficients.coef3,
    coefficients.coef4 ?? "",
    coefficients.coef5 ?? "",
    // coef6 is always null/omitted
    coefficients.coef7,
    coefficients.coef8,
    coefficients.coef9 ?? "",
    coefficients.coef10,
    coefficients.coef11 ?? "",
  ]

  return formatKeyValue("Conn BR: BR Coef", formatCommaSeparated(values))
}

/**
 * Serialize ineffective flow area
 */
function serializeIneffectiveFlowArea(prefix: string, area: IneffectiveFlowArea): string {
  const values = [area.leftStation, area.leftElevation, area.rightStation, area.rightElevation]

  return formatKeyValue(prefix, formatCommaSeparated(values))
}

/**
 * Serialize a bridge connection to a complete HEC-RAS string
 * @param bridge Bridge connection properties
 * @returns Formatted HEC-RAS string
 */
export function serializeBridge(bridge: BridgeConnection): string {
  return serializeBridgeConnection(bridge).join("\n")
}
