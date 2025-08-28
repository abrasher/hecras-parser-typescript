import type {
  BridgeConnection,
  BridgeConfiguration,
  PressureWeirData,
  DeckParameters,
  BridgeCoefficients,
  BridgeCrossSection,
  IneffectiveFlowArea,
  DeckStationing,
  BridgePier,
} from "../../models/geometry/bridge"
import { formatFixedWidth, formatMaybeNullorUndefined } from "../atomic"
import { formatHECRASStationNumber, toFixedWidthString } from "../utils"
import { chunk } from "es-toolkit"

/**
 * Serialize bridge connection to HEC-RAS format
 * @param bridge Bridge connection properties
 * @returns Array of formatted lines
 */
export function serializeBridgeConnection(bridge: BridgeConnection): string[] {
  const lines: string[] = []

  console.log("Serializing bridge connection:", bridge)

  // 1. Bridge configuration
  lines.push(...serializeBridgeConfiguration(bridge.bridge))

  // 2. Pressure weir data (only if defined)
  if (bridge.pressureWeir) {
    lines.push(...serializePressureWeirData(bridge.pressureWeir))
  }

  // 3. Deck parameters
  lines.push(...serializeDeckParameters(bridge.deckParameters))

  // 4. Bridge sections
  lines.push(...serializeBridgeCrossSection(bridge.insideUpstreamCrossSection, "BR"))
  lines.push(...serializeBridgeCrossSection(bridge.insideDownstreamCrossSection, "BR"))

  // 5. Piers (if any)
  if (bridge.piers && bridge.piers.length > 0) {
    for (const pier of bridge.piers) {
      lines.push(...serializeBridgePier(pier))
    }
  }

  // 6. Bridge coefficients
  lines.push(...serializeBridgeCoefficients(bridge.bridgeCoefficients))

  // 7. Bridge skew (only if not default value of 0)
  if (bridge.bridgeSkew !== undefined) {
    lines.push(`Conn BR: BR Skew=${formatMaybeNullorUndefined(bridge.bridgeSkew)}`)
  }

  // 8. External cross sections
  lines.push(...serializeBridgeCrossSection(bridge.externalUpstreamCrossSection, "XS"))
  lines.push(...serializeBridgeCrossSection(bridge.externalDownstreamCrossSection, "XS"))

  // 9. Ineffective flow areas (only if they have valid data)
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
    config.contractionCoefficient ?? "",
    config.expansionCoefficient ?? "",
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
  lines.push(
    "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee",
  )

  // Parameters line
  const params = [
    Number.isNaN(deck.deckDistance) ? "" : deck.deckDistance,
    deck.width,
    deck.weirCoefficient,
    deck.skew,
    ` ${deck.numberOfUpstreamStations}`, // Add space like in test data
    ` ${deck.numberOfDownstreamStations}`, // Add space like in test data
    ` ${deck.minLowCoordinate ?? ""}`, // null becomes empty string with space
    ` ${deck.maxHighCoordinate ?? ""}`, // null becomes empty string with space
    ` ${deck.maxSubmerge}`, // Add space like in test data
    ` ${deck.isOgee}`, // Add space like in test data
    ` ${deck.upstreamEmbankmentSideSlope ?? 0}`, // Use 0 instead of empty string
    `${deck.downstreamEmbankmentSideSlope ?? 0}`, // Use 0 instead of empty string
    `${deck.spillwayApproachHeight ?? ""}`,
    `${deck.spillwayDesignHead ?? ""}`,
  ]

  lines.push(params.join(","))

  // Station data blocks
  lines.push(...serializeDeckStationData(deck.upstream, deck.downstream))

  return lines
}

/**
 * Serialize deck station data to HEC-RAS format
 */
export function serializeDeckStationData(
  upstream: DeckStationing[],
  downstream: DeckStationing[],
): string[] {
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
    const formattedLine = valueGroup
      .map((value) => formatFixedWidth(formatHECRASStationNumber(value), 8))
      .join("")
    lines.push(formattedLine)
  })

  return lines
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
export function serializeBridgeCrossSection(
  section: BridgeCrossSection,
  prefix: "BR" | "XS",
): string[] {
  const lines: string[] = []

  // Section header
  lines.push(`Conn BR: ${prefix} SE=${section.id},${section.points?.length}`)

  // Station-elevation points (8 chars each, 5 pairs per line)
  const stationElevationData: number[] = []
  for (const [x, y] of section.points) {
    stationElevationData.push(x, y)
  }

  chunk(stationElevationData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup
      .map((value) => formatFixedWidth(formatHECRASStationNumber(value), 8))
      .join("")
    lines.push(formattedLine)
  })

  // Bank stations
  const leftBank = isNaN(section.bankStations.leftBank) ? "" : section.bankStations.leftBank
  const rightBank = isNaN(section.bankStations.rightBank) ? "" : section.bankStations.rightBank
  lines.push(
    `Conn BR: ${prefix} Bank Stations=${section.bankStations.sectionId},${leftBank},${rightBank}`,
  )

  // Manning coefficients
  lines.push(`Conn BR: ${prefix} Mann=${section.id},${section.manningCoefficients.length}`)

  const manningData: number[] = []
  for (const manning of section.manningCoefficients) {
    manningData.push(manning.station, manning.nValue)
  }

  chunk(manningData, 10).forEach((dataGroup) => {
    const formattedLine = dataGroup
      .map((value) => formatFixedWidth(formatHECRASStationNumber(value), 8))
      .join("")
    lines.push(formattedLine)
  })

  return lines
}

/**
 * Serialize bridge coefficients to HEC-RAS format
 */
export function serializeBridgeCoefficients(coefficients: BridgeCoefficients): string[] {
  const coef1 = coefficients.coef1 === 1 ? " 1 " : "-1 "
  const values = [
    coef1, // Add space after first coefficient
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
export function serializeIneffectiveFlowArea(
  area: IneffectiveFlowArea,
  prefix: "USXS" | "DSXS",
): string[] {
  const values = [area.leftStation, area.leftElevation, area.rightStation, area.rightElevation]

  return [`Conn BR: ${prefix} Ineff=${values.join(",")}`]
}

/**
 * Serialize bridge pier to HEC-RAS format
 */
export function serializeBridgePier(pier: BridgePier): string[] {
  const lines: string[] = []

  // Pier header line with skew, centerline stations, number of upstream/downstream points, and debris parameters
  const skew = pier.skew === "" ? "  " : pier.skew
  const upstreamCount = pier.upstream.length
  const downstreamCount = pier.downstream.length
  const debrisWidth = pier.debrisWidth ?? ""
  const debrisHeight = pier.debrisHeight ?? ""

  lines.push(
    `Conn BR: Pier Skew, UpSta & Num, DnSta & Num=${skew},${pier.centerlineStationUpstream}, ${upstreamCount} ,${pier.centerlineStationDownstream}, ${downstreamCount} , 0 , 0 , ${pier.applyFloatingDebris} ,${debrisWidth},${debrisHeight}`,
  )

  // Upstream width-elevation pairs
  lines.push(...formatStationValues(pier.upstream.map((pair) => pair.width)))
  lines.push(...formatStationValues(pier.upstream.map((pair) => pair.elevation)))
  lines.push(...formatStationValues(pier.downstream.map((pair) => pair.width)))
  lines.push(...formatStationValues(pier.downstream.map((pair) => pair.elevation)))

  return lines
}

/**
 * Serialize bridge connection to a complete HEC-RAS string
 * @param bridge Bridge connection properties
 * @returns Formatted HEC-RAS string
 */
export function serializeBridgeConnectionString(bridge: BridgeConnection): string {
  return serializeBridgeConnection(bridge).join("\n")
}
