#!/usr/bin/env tsx

import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { createCanvas } from "canvas"
import { parseGeometry } from "../src/parseGeometry"
import type { StationElevationPoint } from "../src/models/geometry/common"

/**
 * Example script demonstrating how to parse a HEC-RAS geometry file
 * This script parses the Dingman.g01 test file, displays the results,
 * and generates cross-section plots saved as PNG files
 */

/**
 * Plot cross-section data and save as PNG file
 */
function plotCrossSection(points: StationElevationPoint[], title: string, filename: string, outputDir: string): void {
  if (points.length === 0) {
    console.log(`  No data points for ${title}`)
    return
  }

  // Create canvas for plotting
  const width = 800
  const height = 600
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Set background
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, width, height)

  // Calculate bounds
  const stations = points.map((p) => p.station)
  const elevations = points.map((p) => p.elevation)
  const minStation = Math.min(...stations)
  const maxStation = Math.max(...stations)
  const minElevation = Math.min(...elevations)
  const maxElevation = Math.max(...elevations)

  // Add padding
  const padding = 60
  const plotWidth = width - 2 * padding
  const plotHeight = height - 2 * padding

  // Scale functions
  const scaleX = (station: number) => padding + ((station - minStation) / (maxStation - minStation)) * plotWidth
  const scaleY = (elevation: number) =>
    height - padding - ((elevation - minElevation) / (maxElevation - minElevation)) * plotHeight

  // Draw axes
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw grid lines
  ctx.strokeStyle = "lightgray"
  ctx.lineWidth = 1
  for (let i = 1; i < 10; i++) {
    const x = padding + (i * plotWidth) / 10
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()

    const y = padding + (i * plotHeight) / 10
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Draw cross-section line
  ctx.strokeStyle = "blue"
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    const x = scaleX(points[i].station)
    const y = scaleY(points[i].elevation)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  // Add title
  ctx.fillStyle = "black"
  ctx.font = "16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(title, width / 2, 30)

  // Add axis labels
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Station (ft)", width / 2, height - 15)

  ctx.save()
  ctx.translate(20, height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText("Elevation (ft)", 0, 0)
  ctx.restore()

  // Add axis values
  ctx.font = "10px Arial"
  ctx.textAlign = "center"
  for (let i = 0; i <= 10; i++) {
    const station = minStation + (i * (maxStation - minStation)) / 10
    const x = padding + (i * plotWidth) / 10
    ctx.fillText(station.toFixed(1), x, height - padding + 15)
  }

  ctx.textAlign = "right"
  for (let i = 0; i <= 10; i++) {
    const elevation = minElevation + (i * (maxElevation - minElevation)) / 10
    const y = height - padding - (i * plotHeight) / 10
    ctx.fillText(elevation.toFixed(1), padding - 5, y + 3)
  }

  // Save as PNG
  const buffer = canvas.toBuffer("image/png")
  const filepath = join(outputDir, filename)
  writeFileSync(filepath, buffer)
  console.log(`  Saved: ${filepath}`)
}
async function main() {
  try {
    // Read the Dingman.g01 geometry file
    const filePath = "test/data/Dingman.g01"
    console.log(`Reading HEC-RAS geometry file: ${filePath}`)

    const fileContent = readFileSync(filePath, "utf-8")
    console.log(`File size: ${fileContent.length} characters`)
    console.log(`Lines: ${fileContent.split("\n").length}`)

    // Parse the geometry data
    console.log("\nParsing geometry data...")
    const geometryData = parseGeometry(fileContent)

    // Display parsing results summary
    console.log("\n=== PARSING RESULTS ===")
    console.log(`Geometry Title: ${geometryData.geomTitle || "Not specified"}`)
    console.log(`Program Version: ${geometryData.programVersion || "Not specified"}`)

    // Display parsed components
    console.log("\n=== PARSED COMPONENTS ===")

    if (geometryData.storageAreas) {
      console.log(`Storage Areas: ${geometryData.storageAreas.length}`)
      geometryData.storageAreas.forEach((sa, index) => {
        console.log(`  ${index + 1}. ${sa.id} (${sa.surfaceLine?.length || 0} coordinates)`)
      })
    }

    if (geometryData.connections) {
      console.log(`Connections: ${geometryData.connections.length}`)
      geometryData.connections.forEach((conn, index) => {
        const type = conn.bridge
          ? "Bridge"
          : conn.culvert
            ? "Culvert"
            : conn.weirCoefficient !== undefined
              ? "Weir"
              : "Unknown"
        console.log(`  ${index + 1}. ${conn.name} (${type})`)

        if (conn.bridge) {
          console.log(`     - Bridge: ${conn.bridge.deckParameters?.upstream?.length || 0} deck stations`)
        }
        if (conn.culvert) {
          console.log(`     - Culvert: ${conn.culvert.length} culvert groups`)
        }
        if (conn.connectionLine) {
          console.log(`     - Connection line: ${conn.connectionLine.length} coordinates`)
        }
      })
    }

    // Display any additional parsed data
    if (geometryData.boundaryConditions) {
      console.log(`Boundary Conditions: ${geometryData.boundaryConditions.length}`)
    }

    // Save parsed geometry object to a JSON file
    const outputJsonPath = "./parsed-geometry.json"
    try {
      writeFileSync(outputJsonPath, JSON.stringify(geometryData, null, 2), "utf-8")
      console.log(`\nSaved parsed geometry to: ${outputJsonPath}`)
    } catch (err) {
      console.error(`Failed to save parsed geometry:`, err)
    }

    console.log("\n=== PARSING COMPLETE ===")
    console.log("Use this parsed data structure in your application!")

    // Create output directory for plots
    const outputDir = "./cross-section-plots"
    try {
      mkdirSync(outputDir, { recursive: true })
    } catch {
      // Directory already exists, ignore error
    }

    // Plot bridge cross-sections
    console.log("\n=== GENERATING CROSS-SECTION PLOTS ===")
    let plotCount = 0

    if (geometryData.connections) {
      geometryData.connections.forEach((conn, connIndex) => {
        if (conn.bridge) {
          console.log(`\nPlotting bridge cross-sections for: ${conn.name}`)

          // Plot upstream cross-section
          if (conn.bridge.insideUpstreamCrossSection?.points) {
            const upstreamPoints = conn.bridge.insideUpstreamCrossSection.points
            const title = `${conn.name} - Upstream Cross-Section`
            const filename = `bridge_${connIndex + 1}_upstream.png`
            plotCrossSection(upstreamPoints, title, filename, outputDir)
            plotCount++
          }

          // Plot downstream cross-section
          if (conn.bridge.insideDownstreamCrossSection?.points) {
            const downstreamPoints = conn.bridge.insideDownstreamCrossSection.points
            const title = `${conn.name} - Downstream Cross-Section`
            const filename = `bridge_${connIndex + 1}_downstream.png`
            plotCrossSection(downstreamPoints, title, filename, outputDir)
            plotCount++
          }

          // Plot external cross-sections if available
          if (conn.bridge.externalUpstreamCrossSection?.points) {
            const externalUpstreamPoints = conn.bridge.externalUpstreamCrossSection.points
            const title = `${conn.name} - External Upstream Cross-Section`
            const filename = `bridge_${connIndex + 1}_external_upstream.png`
            plotCrossSection(externalUpstreamPoints, title, filename, outputDir)
            plotCount++
          }

          if (conn.bridge.externalDownstreamCrossSection?.points) {
            const externalDownstreamPoints = conn.bridge.externalDownstreamCrossSection.points
            const title = `${conn.name} - External Downstream Cross-Section`
            const filename = `bridge_${connIndex + 1}_external_downstream.png`
            plotCrossSection(externalDownstreamPoints, title, filename, outputDir)
            plotCount++
          }
        }

        // Plot weir connections
        if (conn.weirCoefficient !== undefined) {
          console.log(`\nFound weir connection: ${conn.name} (coefficient: ${conn.weirCoefficient})`)

          // Plot weir station-elevation data if available
          if (conn.weirSE && conn.weirSE.length > 0) {
            const title = `${conn.name} - Weir Station-Elevation Profile`
            const filename = `weir_${connIndex + 1}_profile.png`
            plotCrossSection(conn.weirSE, title, filename, outputDir)
            plotCount++
          } else {
            console.log("  Note: No weir station-elevation data available")
          }
        }
      })
    }

    console.log(`\n=== PLOTTING SUMMARY ===`)
    console.log(`Generated ${plotCount} cross-section plots in: ${outputDir}`)
    if (plotCount === 0) {
      console.log("No cross-section data found to plot.")
    }

    // Example: Access specific connection data
    if (geometryData.connections && geometryData.connections.length > 0) {
      console.log("\n=== EXAMPLE: First Connection Details ===")
      const firstConnection = geometryData.connections.at(-1)
      console.log(JSON.stringify(firstConnection, null, 2))
    }
  } catch (error) {
    console.error("Error parsing geometry file:", error)
    process.exit(1)
  }
}

main()

export { main }
