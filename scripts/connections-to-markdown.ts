#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"
import type { Connection } from "../src/models/geometry/connection"
import { CULVERT_SHAPE } from "../src/models/geometry/culvert"

function generateConnectionsMarkdown(geometryFilePath: string, outputPath?: string): void {
  console.log(`Parsing geometry file: ${geometryFilePath}`)

  const content = readFileSync(geometryFilePath, "utf-8")
  const geometry = parseGeometry(content)

  const markdown = buildMarkdown(geometry.connections)

  if (outputPath) {
    writeFileSync(outputPath, markdown)
    console.log(`Markdown written to: ${outputPath}`)
  } else {
    console.log(markdown)
  }
}

function buildMarkdown(connections: Connection[]): string {
  const lines: string[] = []

  lines.push("# HEC-RAS Geometry Connections Report")
  lines.push("")
  lines.push(`Generated on: ${new Date().toISOString()}`)
  lines.push("")

  const bridges = connections.filter((conn) => conn.routingType === 32)
  const culverts = connections.filter((conn) => conn.routingType === 1)
  const weirs = connections.filter(
    (conn) =>
      conn.routingType !== 32 && conn.routingType !== 1 && conn.weirCoefficient !== undefined,
  )
  const other = connections.filter(
    (conn) =>
      conn.routingType !== 32 && conn.routingType !== 1 && conn.weirCoefficient === undefined,
  )

  lines.push("## Summary")
  lines.push("")
  lines.push(`- **Total Connections**: ${connections.length}`)
  lines.push(`- **Bridges**: ${bridges.length}`)
  lines.push(`- **Culverts**: ${culverts.length}`)
  lines.push(`- **Weirs**: ${weirs.length}`)
  lines.push(`- **Other**: ${other.length}`)
  lines.push("")

  if (bridges.length > 0) {
    lines.push("## Bridges")
    lines.push("")
    bridges.forEach((connection, index) => {
      lines.push(`### ${index + 1}. ${connection.name}`)
      lines.push("")
      if (connection.description) {
        lines.push(`**Description**: ${connection.description}`)
        lines.push("")
      }
      lines.push(
        `- **Location**: (${connection.centroidX?.toFixed(2)}, ${connection.centroidY?.toFixed(2)})`,
      )
      lines.push(`- **Upstream Storage Area**: ${connection.upstreamStorageArea}`)
      lines.push(`- **Downstream Storage Area**: ${connection.downstreamStorageArea}`)
      if (connection.lastEditedTime) {
        lines.push(`- **Last Edited**: ${connection.lastEditedTime}`)
      }

      // Bridge-specific properties
      if (connection.weirCoefficient !== undefined) {
        lines.push("")
        lines.push("**Bridge/Weir Properties:**")
        lines.push(`- **Weir Coefficient**: ${connection.weirCoefficient}`)
        if (connection.weirWD !== undefined) {
          lines.push(`- **Weir WD**: ${connection.weirWD}`)
        }
        if (connection.weirIsOgee !== undefined) {
          lines.push(`- **Is Ogee**: ${connection.weirIsOgee ? "Yes" : "No"}`)
        }
      }

      if (connection.bridge) {
        const bridge = connection.bridge
        lines.push("")
        lines.push("**Bridge Configuration:**")
        if (bridge.bridge) {
          lines.push(`- Momentum equation (friction): ${bridge.bridge.momentumEquationAddFriction}`)
          lines.push(`- Momentum equation (weight): ${bridge.bridge.momentumEquationAddWeight}`)
          lines.push(`- Pressure flow criteria: ${bridge.bridge.pressureFlowCriteria}`)
        }

        if (bridge.deckParameters) {
          lines.push("")
          lines.push("**Deck Parameters:**")
          lines.push(`- Deck distance: ${bridge.deckParameters.deckDistance}`)
          lines.push(`- Width: ${bridge.deckParameters.width}`)
          lines.push(`- Weir coefficient: ${bridge.deckParameters.weirCoefficient}`)
          lines.push(`- Skew: ${bridge.deckParameters.skew}°`)
          lines.push(`- Upstream stations: ${bridge.deckParameters.numberOfUpstreamStations}`)
          lines.push(`- Downstream stations: ${bridge.deckParameters.numberOfDownstreamStations}`)
        }

        if (bridge.piers && bridge.piers.length > 0) {
          lines.push("")
          lines.push("**Piers:**")
          bridge.piers.forEach((pier, pierIndex) => {
            lines.push(
              `- Pier ${pierIndex + 1}: Skew ${pier.skew}°, US Center: ${pier.centerlineStationUpstream}, DS Center: ${pier.centerlineStationDownstream}`,
            )
          })
        }
      }
      lines.push("")
    })
  }

  if (culverts.length > 0) {
    lines.push("## Culverts")
    lines.push("")
    culverts.forEach((connection, index) => {
      lines.push(`### ${index + 1}. ${connection.name}`)
      lines.push("")
      if (connection.description) {
        lines.push(`**Description**: ${connection.description}`)
        lines.push("")
      }
      lines.push(
        `- **Location**: (${connection.centroidX?.toFixed(2)}, ${connection.centroidY?.toFixed(2)})`,
      )
      lines.push(`- **Upstream Storage Area**: ${connection.upstreamStorageArea}`)
      lines.push(`- **Downstream Storage Area**: ${connection.downstreamStorageArea}`)
      if (connection.lastEditedTime) {
        lines.push(`- **Last Edited**: ${connection.lastEditedTime}`)
      }

      if (connection.culvert && connection.culvert.length > 0) {
        lines.push("")
        lines.push("**Culvert Groups:**")
        connection.culvert.forEach((culvertGroup, groupIndex) => {
          const shapeNames = {
            [CULVERT_SHAPE.CIRCLE]: "Circular",
            [CULVERT_SHAPE.BOX]: "Box",
            [CULVERT_SHAPE.PIPE_ARCH]: "Pipe Arch",
            [CULVERT_SHAPE.ARCH]: "Arch",
            [CULVERT_SHAPE.SEMI_CIRCLE]: "Semi-Circle",
            [CULVERT_SHAPE.LOW_ARCH]: "Low Arch",
            [CULVERT_SHAPE.HIGH_ARCH]: "High Arch",
            [CULVERT_SHAPE.CONSPAN_ARCH]: "Conspan Arch",
          }

          const shapeName = shapeNames[culvertGroup.shape] || `Shape ${culvertGroup.shape}`

          lines.push("")
          lines.push(`**Group ${groupIndex + 1}**: ${culvertGroup.culvertGroupName}`)
          lines.push(`- **Shape**: ${shapeName}`)
          lines.push(
            `- **Dimensions**: ${culvertGroup.rise}ft (rise) × ${culvertGroup.span}ft (span)`,
          )
          lines.push(`- **Length**: ${culvertGroup.length}ft`)
          lines.push(
            `- **Manning's n**: ${culvertGroup.nTop}${culvertGroup.nBottom ? ` (top), ${culvertGroup.nBottom} (bottom)` : ""}`,
          )
          lines.push(`- **Entrance Loss**: ${culvertGroup.entranceLoss}`)
          lines.push(`- **Exit Loss**: ${culvertGroup.exitLoss}`)
          lines.push(`- **Number of Barrels**: ${culvertGroup.numberOfBarrels}`)
          lines.push(`- **Upstream Invert**: ${culvertGroup.upstreamInvert}ft`)
          lines.push(`- **Downstream Invert**: ${culvertGroup.downstreamInvert}ft`)

          if (culvertGroup.depthBlocked !== undefined) {
            lines.push(`- **Depth Blocked**: ${culvertGroup.depthBlocked}ft`)
          }

          if (culvertGroup.barrels && culvertGroup.barrels.length > 0) {
            lines.push("")
            lines.push("**Barrels:**")
            culvertGroup.barrels.forEach((barrel, barrelIndex) => {
              lines.push(
                `- Barrel ${barrelIndex + 1}: ${barrel.name} (${barrel.coordinates.length} coordinates)`,
              )
            })
          }
        })
      }
      lines.push("")
    })
  }

  if (weirs.length > 0) {
    lines.push("## Weirs")
    lines.push("")
    weirs.forEach((connection, index) => {
      lines.push(`### ${index + 1}. ${connection.name}`)
      lines.push("")
      if (connection.description) {
        lines.push(`**Description**: ${connection.description}`)
        lines.push("")
      }
      lines.push(
        `- **Location**: (${connection.centroidX?.toFixed(2)}, ${connection.centroidY?.toFixed(2)})`,
      )
      lines.push(`- **Upstream Storage Area**: ${connection.upstreamStorageArea}`)
      lines.push(`- **Downstream Storage Area**: ${connection.downstreamStorageArea}`)
      if (connection.lastEditedTime) {
        lines.push(`- **Last Edited**: ${connection.lastEditedTime}`)
      }

      if (connection.weirCoefficient !== undefined) {
        lines.push("")
        lines.push("**Weir Properties:**")
        lines.push(`- **Weir Coefficient**: ${connection.weirCoefficient}`)
        if (connection.weirWD !== undefined) {
          lines.push(`- **Weir WD**: ${connection.weirWD}`)
        }
        if (connection.weirIsOgee !== undefined) {
          lines.push(`- **Is Ogee**: ${connection.weirIsOgee ? "Yes" : "No"}`)
        }

        if (connection.weirSE && connection.weirSE.length > 0) {
          lines.push("")
          lines.push("**Station-Elevation Points:**")
          connection.weirSE.forEach((point, pointIndex) => {
            lines.push(
              `- Point ${pointIndex + 1}: Station ${point.station}, Elevation ${point.elevation}`,
            )
          })
        }
      }
      lines.push("")
    })
  }

  if (other.length > 0) {
    lines.push("## Other Connections")
    lines.push("")
    other.forEach((connection, index) => {
      lines.push(`### ${index + 1}. ${connection.name}`)
      lines.push("")
      if (connection.description) {
        lines.push(`**Description**: ${connection.description}`)
        lines.push("")
      }
      lines.push(
        `- **Location**: (${connection.centroidX?.toFixed(2)}, ${connection.centroidY?.toFixed(2)})`,
      )
      lines.push(`- **Upstream Storage Area**: ${connection.upstreamStorageArea}`)
      lines.push(`- **Downstream Storage Area**: ${connection.downstreamStorageArea}`)
      if (connection.lastEditedTime) {
        lines.push(`- **Last Edited**: ${connection.lastEditedTime}`)
      }
      lines.push("")
    })
  }

  return lines.join("\n")
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error("Usage: tsx connections-to-markdown.ts <geometry-file-path> [output-path]")
    process.exit(1)
  }

  const geometryFilePath = args[0]
  const outputPath = args[1]

  try {
    generateConnectionsMarkdown(geometryFilePath, outputPath)
  } catch (error) {
    console.error("Error generating connections markdown:", error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateConnectionsMarkdown }
