#!/usr/bin/env tsx

import { readFileSync } from "fs"
import { parseGeometry } from "../src/parseGeometry"

/**
 * Example script demonstrating how to parse a HEC-RAS geometry file
 * This script parses the Dingman.g01 test file and displays the results
 */
async function main() {
  try {
    // Read the Dingman.g01 geometry file
    const filePath = "./test/data/Dingman.g01"
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

    console.log("\n=== PARSING COMPLETE ===")
    console.log("Use this parsed data structure in your application!")

    // Example: Access specific connection data
    if (geometryData.connections && geometryData.connections.length > 0) {
      console.log("\n=== EXAMPLE: First Connection Details ===")
      const firstConnection = geometryData.connections[0]
      console.log(JSON.stringify(firstConnection, null, 2))
    }
  } catch (error) {
    console.error("Error parsing geometry file:", error)
    process.exit(1)
  }
}

main()

export { main }
