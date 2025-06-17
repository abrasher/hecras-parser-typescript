#!/usr/bin/env tsx

import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { HECRASParser } from "../src/HECRASParser"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  console.log("🚀 Parsing Dingman.g01 with HECRASParser")
  console.log("=".repeat(50))

  // Initialize the parser
  const parser = new HECRASParser()

  // Read the test file
  const filePath = join(__dirname, "..", "test", "data", "Dingman.g01")
  console.log(`📁 Reading file: ${filePath}`)

  try {
    const fileContent = readFileSync(filePath, "utf-8")
    console.log(`📊 File size: ${fileContent.length} characters`)

    // Parse the geometry file
    console.log("\n🔍 Parsing geometry file...")
    const startTime = Date.now()
    const geometry = await parser.parseGeometry(fileContent)
    const endTime = Date.now()

    console.log(`⏱️  Parsing completed in ${endTime - startTime}ms`)

    // Print basic file information
    console.log("\n📋 Basic Information:")
    console.log(`   Title: ${geometry["Geom Title"]}`)
    console.log(`   Version: ${geometry["Program Version"]}`)
    console.log(
      `   Viewing Rectangle: ${JSON.stringify(geometry["Viewing Rectangle"])}`,
    )

    // Print summary statistics
    console.log("\n📈 Summary Statistics:")
    console.log(`   Reaches: ${geometry.reaches.length}`)
    console.log(`   Storage Areas: ${geometry.storageAreas.length}`)
    console.log(`   Connections: ${geometry.connections.length}`)

    // Print detailed storage area information
    console.log("\n🏊 Storage Areas Details:")
    console.log("=".repeat(50))

    if (geometry.storageAreas.length === 0) {
      console.log("   No storage areas found")
    } else {
      geometry.storageAreas.forEach((storageArea, index) => {
        console.log(`\n   Storage Area #${index + 1}:`)
        console.log(`   ├─ ID: ${storageArea.id}`)
        console.log(`   ├─ Type: ${storageArea.type || "N/A"}`)
        console.log(
          `   ├─ Position: ${storageArea.centroid ? `(${storageArea.centroid.x}, ${storageArea.centroid.y})` : "N/A"}`,
        )
        console.log(`   ├─ Manning's n: ${storageArea.mannings}`)
        console.log(`   ├─ Area: ${storageArea.area || "N/A"} sq ft`)
        console.log(
          `   ├─ Min Elevation: ${storageArea.minElevation || "N/A"} ft`,
        )
        console.log(`   ├─ Is 2D: ${storageArea.is2D ? "Yes" : "No"}`)

        // Print surface line coordinates
        if (storageArea.surfaceLine && storageArea.surfaceLine.length > 0) {
          console.log(
            `   ├─ Surface Line Points: ${storageArea.surfaceLine.length}`,
          )
          console.log(
            `   │  First: (${storageArea.surfaceLine[0].x}, ${storageArea.surfaceLine[0].y})`,
          )
          if (storageArea.surfaceLine.length > 1) {
            const last =
              storageArea.surfaceLine[storageArea.surfaceLine.length - 1]
            console.log(`   │  Last: (${last.x}, ${last.y})`)
          }
        } else {
          console.log(`   ├─ Surface Line Points: 0`)
        }

        // Print volume-elevation data
        if (
          storageArea.volumeElevationData &&
          storageArea.volumeElevationData.length > 0
        ) {
          console.log(
            `   ├─ Volume-Elevation Points: ${storageArea.volumeElevationData.length}`,
          )
          const firstVE = storageArea.volumeElevationData[0]
          console.log(
            `   │  First: Elev ${firstVE.elevation} ft → Vol ${firstVE.volume} cu ft`,
          )
          if (storageArea.volumeElevationData.length > 1) {
            const lastVE =
              storageArea.volumeElevationData[
                storageArea.volumeElevationData.length - 1
              ]
            console.log(
              `   │  Last: Elev ${lastVE.elevation} ft → Vol ${lastVE.volume} cu ft`,
            )
          }
        } else {
          console.log(`   ├─ Volume-Elevation Points: 0`)
        }

        // Print GeoJSON if available
        if (typeof storageArea.toGeoJSON === "function") {
          try {
            const geoJson = storageArea.toGeoJSON()
            console.log(
              `   └─ GeoJSON: ${geoJson.type} with ${geoJson.geometry?.coordinates?.length || 0} coordinate groups`,
            )
          } catch (error) {
            console.log(
              `   └─ GeoJSON: Error generating (${error instanceof Error ? error.message : String(error)})`,
            )
          }
        } else {
          console.log(`   └─ GeoJSON: Not available`)
        }
      })
    }

    // Print connection information if any
    if (geometry.connections.length > 0) {
      console.log("\n🔗 Connections Summary:")
      console.log("=".repeat(50))
      geometry.connections.forEach((connection, index) => {
        console.log(`   Connection #${index + 1}: ${connection.id}`)
        console.log(`   ├─ Up SA: ${connection.upSA || "N/A"}`)
        console.log(`   ├─ Dn SA: ${connection.dnSA || "N/A"}`)
        console.log(`   ├─ Line Points: ${connection.line?.length || 0}`)
        console.log(`   └─ Description: ${connection.description || "None"}`)
      })
    }

    // Print reach information if any
    if (geometry.reaches.length > 0) {
      console.log("\n🏞️  Reaches Summary:")
      console.log("=".repeat(50))
      geometry.reaches.forEach((reach, index) => {
        console.log(
          `   Reach #${index + 1}: ${reach.riverName} - ${reach.reachName}`,
        )
        console.log(`   ├─ Centerline Points: ${reach.centerline?.length || 0}`)
        console.log(`   ├─ Cross Sections: ${reach.crossSections?.length || 0}`)
        console.log(
          `   └─ Lateral Structures: ${reach.lateralStructures?.length || 0}`,
        )
      })
    }
  } catch (error) {
    console.error("\n❌ Error parsing file:")
    console.error(error instanceof Error ? error.message : String(error))

    if (error instanceof Error && error.stack) {
      console.error("\n📋 Stack trace:")
      console.error(error.stack)
    }

    process.exit(1)
  }
}

// Run the example
main().catch(console.error)

export { main }
