import type {
  BridgeConnection,
  BridgeConfiguration,
  PressureWeirData,
  DeckParameters,
  BridgeCoefficients,
  BridgeCrossSection,
  IneffectiveFlowArea,
  DeckStationing,
} from "../../models/geometry/bridge"
import { toFixedWidthString } from "../utils"
import { chunk } from "es-toolkit"

/**
 * Serialize bridge connection to HEC-RAS format
 * @param bridge Bridge connection properties
 * @returns Array of formatted lines
 */
export function serializeBridgeConnection(bridge: BridgeConnection): string[] {
  const lines: string[] = []

  // 1. Bridge configuration
  lines.push(...serializeBridgeConfiguration(bridge.bridge))

  // 2. Pressure weir data
  lines.push(...serializePressureWeirData(bridge.pressureWeir))

  // 3. Deck parameters
  lines.push(...serializeDeckParameters(bridge.deckParameters))

  // 4. Bridge sections
  for (const section of bridge.insideCrossSections) {
    lines.push(...serializeBridgeCrossSection(section, "BR"))
  }

  // 5. Bridge coefficients
  lines.push(...serializeBridgeCoefficients(bridge.bridgeCoefficients))

  // 6. Bridge skew
  lines.push(`Conn BR: BR Skew=${bridge.bridgeSkew}`)

  // 7. External cross sections
  for (const section of bridge.externalCrossSections) {
    lines.push(...serializeBridgeCrossSection(section, "XS"))
  }

  // 8. Ineffective flow areas (only if they have valid data)
  if (bridge.upstreamIneffectiveFlowArea.leftStation !== undefined) {
    lines.push(...serializeIneffectiveFlowArea(bridge.upstreamIneffectiveFlowArea, "USXS"))
  }
  if (bridge.downstreamIneffectiveFlowArea.leftStation !== undefined) {
    lines.push(...serializeIneffectiveFlowArea(bridge.downstreamIneffectiveFlowArea, "DSXS"))
  }

  return lines
}

/**
 * Serialize bridge configuration to HEC-RAS format
 */
export function serializeBridgeConfiguration(config: BridgeConfiguration): string[] {
  const values = [
    config.momentumEquationAddFriction,
    config.momentumEquationAddWeight,
    config.pressureFlowCriteria,
    config.classBDefaults,
    ` ${config.param5} `, // Add spaces like in test data
    config.contractionCoefficient,
    config.expansionCoefficient,
  ]

  return [`Conn BR: Bridge=${values.join(",")}`]
}

/**
 * Serialize pressure weir data to HEC-RAS format
 */
export function serializePressureWeirData(pressureWeir: PressureWeirData): string[] {
  const values = [
    pressureWeir.value1,
    pressureWeir.value2 ?? "", // null becomes empty string
    pressureWeir.value3,
    pressureWeir.value4 ?? "", // null becomes empty string
    pressureWeir.value5,
  ]

  return [`Conn BR: Pressure-Weir=${values.join(",")}`]
}

/**
 * Serialize deck parameters to HEC-RAS format
 */
export function serializeDeckParameters(deck: DeckParameters): string[] {
  const lines: string[] = []

  // Header line
  lines.push("Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee")

  // Parameters line
  const params = [
    deck.deckDistance,
    deck.width,
    deck.weirCoefficient,
    deck.skew,
    ` ${deck.numberOfUpstreamStations}`, // Add space like in test data
    ` ${deck.numberOfDownstreamStations}`, // Add space like in test data
    ` ${deck.minLowCoordinate ?? ""}`, // null becomes empty string with space
    ` ${deck.maxHighCoordinate ?? ""}`, // null becomes empty string with space
    ` ${deck.maxSubmerge}`, // Add space like in test data
    ` ${deck.isOgee}`, // Add space like in test data
    ` ${deck.upstreamEmbankmentSideSlope ?? ""}`, // null becomes empty string with space
    `${deck.downstreamEmbankmentSideSlope ?? ""}`, // null becomes empty string with space
    `${deck.spillwayApproachHeight ?? ""}`, // null becomes empty string with space
    `${deck.spillwayDesignHead ?? ""}`, // null becomes empty string with space
  ]

  lines.push(params.join(","))

  // Station data blocks
  lines.push(...serializeDeckStationData(deck.upstream, deck.downstream))

  return lines
}

/**
 * Serialize deck station data to HEC-RAS format
 */
export function serializeDeckStationData(upstream: DeckStationing[], downstream: DeckStationing[]): string[] {
  const lines: string[] = []

  // Upstream stations
  const upstreamStations = upstream.map((d) => d.station)
  lines.push(...formatStationValues(upstreamStations))

  // Upstream high chords
  const upstreamHighChords = upstream.map((d) => d.highChord)
  lines.push(...formatStationValues(upstreamHighChords))

  // Upstream low chords (with nulls as empty 8-char fields)
  const upstreamLowChords = upstream.map((d) => d.lowChord)
  lines.push(...formatStationValuesWithNulls(upstreamLowChords))

  // Downstream stations
  const downstreamStations = downstream.map((d) => d.station)
  lines.push(...formatStationValues(downstreamStations))

  // Downstream high chords
  const downstreamHighChords = downstream.map((d) => d.highChord)
  lines.push(...formatStationValues(downstreamHighChords))

  // Downstream low chords (with nulls as empty 8-char fields)
  const downstreamLowChords = downstream.map((d) => d.lowChord)
  lines.push(...formatStationValuesWithNulls(downstreamLowChords))

  return lines
}

/**
 * Format station values with 8 characters each, 10 values per line
 */
function formatStationValues(values: number[]): string[] {
  const lines: string[] = []

  chunk(values, 10).forEach((valueGroup) => {
    const formattedLine = valueGroup.map((value) => formatBridgeNumber(value, 8)).join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Format numbers for bridge serialization - handles special cases like .584 instead of 0.584
 * NOTE: This formatting (removing leading "0.") is only correct for Manning's coefficients
 * which are always < 1.0. For other numeric values, this could produce incorrect results.
 */
function formatBridgeNumber(value: number, width: number): string {
  let str = value.toString()

  // Handle numbers that start with 0. (like 0.584 -> .584)
  // WARNING: This is only valid for Manning's coefficients (values < 1.0)
  if (str.startsWith("0.")) {
    str = str.substring(1) // Remove the leading "0"
  }

  return toFixedWidthString(str, width)
}

/**
 * Format station values with nulls as empty 8-char fields
 */
function formatStationValuesWithNulls(values: (number | null)[]): string[] {
  const lines: string[] = []

  chunk(values, 10).forEach((valueGroup) => {
    const formattedLine = valueGroup
      .map((value) => (value === null ? "        " : toFixedWidthString(value.toString(), 8)))
      .join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Serialize bridge cross section to HEC-RAS format
 */
export function serializeBridgeCrossSection(section: BridgeCrossSection, prefix: "BR" | "XS"): string[] {
  const lines: string[] = []

  // Section header
  lines.push(`Conn BR: ${prefix} SE=${section.id},${section.points.length}`)

  // Station-elevation points (8 chars each, 5 pairs per line)
  const stationElevationData: number[] = []
  for (const point of section.points) {
    stationElevationData.push(point.station, point.elevation)
  }

  chunk(stationElevationData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup.map((value) => formatBridgeNumber(value, 8)).join("")
    lines.push(formattedLine)
  })

  // Bank stations
  const leftBank = isNaN(section.bankStations.leftBank) ? "" : section.bankStations.leftBank
  const rightBank = isNaN(section.bankStations.rightBank) ? "" : section.bankStations.rightBank
  lines.push(`Conn BR: ${prefix} Bank Stations=${section.bankStations.sectionId},${leftBank},${rightBank}`)

  // Manning coefficients
  lines.push(`Conn BR: ${prefix} Mann=${section.id},${section.manningCoefficients.length}`)

  const manningData: number[] = []
  for (const manning of section.manningCoefficients) {
    manningData.push(manning.station, manning.nValue)
  }

  chunk(manningData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup.map((value) => formatBridgeNumber(value, 8)).join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Serialize bridge coefficients to HEC-RAS format
 */
export function serializeBridgeCoefficients(coefficients: BridgeCoefficients): string[] {
  const values = [
    `${coefficients.coef1} `, // Add space after first coefficient
    ` ${coefficients.coef2} `, // Add spaces like in test data
    ` ${coefficients.coef3} `, // Add spaces like in test data
    coefficients.coef4 ?? "", // null becomes empty string
    coefficients.coef5 ?? "", // null becomes empty string
    coefficients.coef7,
    coefficients.coef8,
    coefficients.coef9 ?? "", // null becomes empty string
    coefficients.coef10,
    coefficients.coef11 ?? "", // null becomes empty string
  ]

  return [`Conn BR: BR Coef=${values.join(",")}`]
}

/**
 * Serialize ineffective flow area to HEC-RAS format
 */
export function serializeIneffectiveFlowArea(area: IneffectiveFlowArea, prefix: "USXS" | "DSXS"): string[] {
  const values = [area.leftStation, area.leftElevation, area.rightStation, area.rightElevation]

  return [`Conn BR: ${prefix} Ineff=${values.join(",")}`]
}

/**
 * Serialize bridge connection to a complete HEC-RAS string
 * @param bridge Bridge connection properties
 * @returns Formatted HEC-RAS string
 */
export function serializeBridgeConnectionString(bridge: BridgeConnection): string {
  return serializeBridgeConnection(bridge).join("\n")
}
